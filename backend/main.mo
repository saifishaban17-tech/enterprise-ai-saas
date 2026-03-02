import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Bool "mo:core/Bool";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Types ──────────────────────────────────────────────────────────────────

  public type UserProfile = {
    email : Text;
    role : Text; // "admin" | "company" | "user"
    workspaceId : Text;
    name : Text;
  };

  public type Workspace = {
    id : Text;
    name : Text;
    owner : Principal;
  };

  public type Project = {
    id : Text;
    name : Text;
    clientId : Text;
    status : Text; // "pending" | "active" | "completed"
    workspaceId : Text;
  };

  public type Lead = {
    id : Text;
    name : Text;
    phone : Text;
    source : Text;
    status : Text; // "new" | "contacted" | "converted"
    workspaceId : Text;
  };

  public type ScheduledPost = {
    id : Text;
    platform : Text; // "Instagram" | "Facebook" | "LinkedIn"
    content : Text;
    scheduledAt : Int;
    status : Text; // "pending" | "sent"
    workspaceId : Text;
  };

  public type DashboardStats = {
    totalProjects : Nat;
    totalLeads : Nat;
    totalScheduledPosts : Nat;
    totalAIGenerations : Nat;
  };

  // ── State ──────────────────────────────────────────────────────────────────

  let userProfiles = Map.empty<Principal, UserProfile>();
  let sessions = Map.empty<Text, Principal>(); // token -> principal
  let workspaces = Map.empty<Text, Workspace>();
  let projects = Map.empty<Text, Project>();
  let leads = Map.empty<Text, Lead>();
  let scheduledPosts = Map.empty<Text, ScheduledPost>();
  let aiGenerationCounts = Map.empty<Text, Nat>(); // workspaceId -> count

  var nextId : Nat = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────

  func generateId() : Text {
    nextId += 1;
    "id-" # nextId.toText() # "-" # Time.now().toText();
  };

  func generateToken(caller : Principal) : Text {
    "tok-" # caller.toText() # "-" # Time.now().toText();
  };

  func getCallerWorkspaceId(caller : Principal) : ?Text {
    switch (userProfiles.get(caller)) {
      case (?profile) { ?profile.workspaceId };
      case (null) { null };
    };
  };

  func isAdminOrCompany(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        profile.role == "admin" or profile.role == "company";
      };
      case (null) { false };
    };
  };

  func incrementAICount(workspaceId : Text) {
    let current = switch (aiGenerationCounts.get(workspaceId)) {
      case (?n) { n };
      case (null) { 0 };
    };
    aiGenerationCounts.add(workspaceId, current + 1);
  };

  // ── User Profile (required by instructions) ────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ── Auth: Register & Login ─────────────────────────────────────────────────

  // registerUser is public — no authentication required
  public shared ({ caller }) func registerUser(
    email : Text,
    _hashedPassword : Text,
    role : Text,
    workspaceId : Text,
    name : Text,
  ) : async Text {
    // Validate role
    if (role != "admin" and role != "company" and role != "user") {
      Runtime.trap("Invalid role: must be admin, company, or user");
    };

    let profile : UserProfile = {
      email;
      role;
      workspaceId;
      name;
    };
    userProfiles.add(caller, profile);

    // Assign AccessControl role
    let acRole : AccessControl.UserRole = if (role == "admin") { #admin } else { #user };
    AccessControl.assignRole(accessControlState, caller, caller, acRole);

    let token = generateToken(caller);
    sessions.add(token, caller);
    token;
  };

  // loginUser is public — no authentication required
  public shared ({ caller }) func loginUser(_email : Text, _hashedPassword : Text) : async Text {
    // In a real system, verify credentials; here we issue a session token for the caller
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User not found: please register first");
      };
      case (?_profile) {
        let token = generateToken(caller);
        sessions.add(token, caller);
        token;
      };
    };
  };

  // getMe requires authentication
  public query ({ caller }) func getMe() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to call getMe");
    };
    userProfiles.get(caller);
  };

  // ── Workspace Management ───────────────────────────────────────────────────

  // Creating a workspace requires admin
  public shared ({ caller }) func createWorkspace(name : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create workspaces");
    };
    let id = generateId();
    let workspace : Workspace = { id; name; owner = caller };
    workspaces.add(id, workspace);
    id;
  };

  public query ({ caller }) func getWorkspace(workspaceId : Text) : async ?Workspace {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view workspaces");
    };
    workspaces.get(workspaceId);
  };

  // ── Project Management ─────────────────────────────────────────────────────

  // createProject: admin or company only
  public shared ({ caller }) func createProject(name : Text, clientId : Text, status : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    if (not isAdminOrCompany(caller)) {
      Runtime.trap("Unauthorized: Only admin or company users can create projects");
    };
    let workspaceId = switch (getCallerWorkspaceId(caller)) {
      case (?wid) { wid };
      case (null) { Runtime.trap("No workspace associated with caller") };
    };
    let id = generateId();
    let project : Project = { id; name; clientId; status; workspaceId };
    projects.add(id, project);
    id;
  };

  // listProjects: all authenticated users, scoped to their workspace
  public query ({ caller }) func listProjects() : async [Project] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to list projects");
    };
    let workspaceId = switch (getCallerWorkspaceId(caller)) {
      case (?wid) { wid };
      case (null) { Runtime.trap("No workspace associated with caller") };
    };
    var result : [Project] = [];
    for ((_id, project) in projects.entries()) {
      if (project.workspaceId == workspaceId) {
        result := result.concat([project]);
      };
    };
    result;
  };

  // ── Lead Management ────────────────────────────────────────────────────────

  // createLead: authenticated users
  public shared ({ caller }) func createLead(name : Text, phone : Text, source : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to create leads");
    };
    let workspaceId = switch (getCallerWorkspaceId(caller)) {
      case (?wid) { wid };
      case (null) { Runtime.trap("No workspace associated with caller") };
    };
    let id = generateId();
    let lead : Lead = { id; name; phone; source; status = "new"; workspaceId };
    leads.add(id, lead);
    id;
  };

  // listLeads: authenticated users, scoped to workspace
  public query ({ caller }) func listLeads() : async [Lead] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to list leads");
    };
    let workspaceId = switch (getCallerWorkspaceId(caller)) {
      case (?wid) { wid };
      case (null) { Runtime.trap("No workspace associated with caller") };
    };
    var result : [Lead] = [];
    for ((_id, lead) in leads.entries()) {
      if (lead.workspaceId == workspaceId) {
        result := result.concat([lead]);
      };
    };
    result;
  };

  // ── Social Media Post Scheduling ───────────────────────────────────────────

  // schedulePost: admin only
  public shared ({ caller }) func schedulePost(
    platform : Text,
    content : Text,
    scheduledAt : Int,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can schedule posts");
    };
    let workspaceId = switch (getCallerWorkspaceId(caller)) {
      case (?wid) { wid };
      case (null) { Runtime.trap("No workspace associated with caller") };
    };
    let id = generateId();
    let post : ScheduledPost = {
      id;
      platform;
      content;
      scheduledAt;
      status = "pending";
      workspaceId;
    };
    scheduledPosts.add(id, post);
    id;
  };

  // listScheduledPosts: authenticated users, scoped to workspace
  public query ({ caller }) func listScheduledPosts() : async [ScheduledPost] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to list scheduled posts");
    };
    let workspaceId = switch (getCallerWorkspaceId(caller)) {
      case (?wid) { wid };
      case (null) { Runtime.trap("No workspace associated with caller") };
    };
    var result : [ScheduledPost] = [];
    for ((_id, post) in scheduledPosts.entries()) {
      if (post.workspaceId == workspaceId) {
        result := result.concat([post]);
      };
    };
    result;
  };

  // ── AI Text Generation ─────────────────────────────────────────────────────

  // generateAIText: authenticated users only
  public shared ({ caller }) func generateAIText(prompt : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to use AI text generation");
    };
    let workspaceId = switch (getCallerWorkspaceId(caller)) {
      case (?wid) { wid };
      case (null) { "" };
    };
    if (workspaceId != "") {
      incrementAICount(workspaceId);
    };
    "AI Generated Response for prompt: \"" # prompt # "\". This is a simulated AI response demonstrating text generation capabilities for your workspace.";
  };

  // ── Image / Vision Analysis ────────────────────────────────────────────────

  // analyzeImage: authenticated users only
  public shared ({ caller }) func analyzeImage(base64Image : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to use image analysis");
    };
    let workspaceId = switch (getCallerWorkspaceId(caller)) {
      case (?wid) { wid };
      case (null) { "" };
    };
    if (workspaceId != "") {
      incrementAICount(workspaceId);
    };
    let imageLen = base64Image.size();
    "Image Analysis Result: Detected objects include [person, background, text]. Image size (base64 chars): " # imageLen.toText() # ". Confidence: 94.7%. This is a simulated vision analysis result.";
  };

  // ── Admin Dashboard Analytics ──────────────────────────────────────────────

  // getDashboardStats: admin only
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };
    let workspaceId = switch (getCallerWorkspaceId(caller)) {
      case (?wid) { wid };
      case (null) { Runtime.trap("No workspace associated with caller") };
    };

    var totalProjects : Nat = 0;
    var totalLeads : Nat = 0;
    var totalScheduledPosts : Nat = 0;

    for ((_id, project) in projects.entries()) {
      if (project.workspaceId == workspaceId) {
        totalProjects += 1;
      };
    };

    for ((_id, lead) in leads.entries()) {
      if (lead.workspaceId == workspaceId) {
        totalLeads += 1;
      };
    };

    for ((_id, post) in scheduledPosts.entries()) {
      if (post.workspaceId == workspaceId) {
        totalScheduledPosts += 1;
      };
    };

    let totalAIGenerations = switch (aiGenerationCounts.get(workspaceId)) {
      case (?n) { n };
      case (null) { 0 };
    };

    {
      totalProjects;
      totalLeads;
      totalScheduledPosts;
      totalAIGenerations;
    };
  };
};
