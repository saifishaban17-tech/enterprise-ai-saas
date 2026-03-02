# Specification

## Summary
**Goal:** Build a full-stack Enterprise AI SaaS mobile-first web app with a Motoko backend and a React frontend, supporting multi-tenant workspaces, role-based access, project/lead management, social post scheduling, simulated AI text generation, and image vision analysis.

**Planned changes:**

### Backend (Motoko — single actor)
- Multi-tenant workspace management with users storing email, hashed password, role (admin/company/user), and workspaceId
- `registerUser`, `loginUser` (returns session token), `getMe` functions
- Project management: `createProject` (admin/company only), `listProjects` (workspace-scoped)
- Lead management: `createLead`, `listLeads` (workspace-scoped, any authenticated user)
- Social post scheduling: `schedulePost` (admin only), `listScheduledPosts` (workspace-scoped); platforms: Instagram, Facebook, LinkedIn
- AI text generation: `generateAIText` (authenticated only, simulated response, logged per workspace)
- Image vision analysis: `analyzeImage` (authenticated only, accepts base64 string, returns simulated description, stored per workspace)
- Admin dashboard stats: `getDashboardStats` (admin only) returning totalProjects, totalLeads, totalScheduledPosts, totalAIGenerations per workspace

### Frontend (React, mobile-first)
- Dark mode enterprise theme: deep charcoal backgrounds, electric teal accents, card-based layouts with rounded corners and subtle shadows
- Bottom navigation bar linking all main screens
- **Login/Register screen**: email, password, role selector, workspace ID fields; inline validation; session token persisted in state; logo and splash background displayed
- **Dashboard screen**: 4 stat cards (admin only); non-admins see access denied
- **Projects screen**: card list with status badges; floating action button (admin/company) opens create form
- **Leads screen**: card list with status badges; capture form accessible to all authenticated users
- **Post Scheduler screen**: compose form (platform selector, content textarea, datetime picker) for admins; read-only list for non-admins; scheduled posts shown as cards with platform badge and status
- **AI Generator screen**: prompt textarea, Generate button, loading spinner, response result card
- **Vision Analyzer screen**: image file picker, preview, Analyze button, loading state, analysis result card
- Static assets (logo, splash background) served from `frontend/public/assets/generated`

**User-visible outcome:** Users can register/login into a workspace, manage projects and leads, schedule social media posts, generate simulated AI text, and analyze images — all within a sleek dark-mode mobile-first web app with role-based access control.
