import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lead {
    id: string;
    status: string;
    source: string;
    name: string;
    workspaceId: string;
    phone: string;
}
export interface Workspace {
    id: string;
    owner: Principal;
    name: string;
}
export interface Project {
    id: string;
    status: string;
    clientId: string;
    name: string;
    workspaceId: string;
}
export interface DashboardStats {
    totalProjects: bigint;
    totalLeads: bigint;
    totalAIGenerations: bigint;
    totalScheduledPosts: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
    workspaceId: string;
}
export interface ScheduledPost {
    id: string;
    status: string;
    content: string;
    platform: string;
    workspaceId: string;
    scheduledAt: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    analyzeImage(base64Image: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createLead(name: string, phone: string, source: string): Promise<string>;
    createProject(name: string, clientId: string, status: string): Promise<string>;
    createWorkspace(name: string): Promise<string>;
    generateAIText(prompt: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getMe(): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkspace(workspaceId: string): Promise<Workspace | null>;
    isCallerAdmin(): Promise<boolean>;
    listLeads(): Promise<Array<Lead>>;
    listProjects(): Promise<Array<Project>>;
    listScheduledPosts(): Promise<Array<ScheduledPost>>;
    loginUser(_email: string, _hashedPassword: string): Promise<string>;
    registerUser(email: string, _hashedPassword: string, role: string, workspaceId: string, name: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    schedulePost(platform: string, content: string, scheduledAt: bigint): Promise<string>;
}
