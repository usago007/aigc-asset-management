# AIGC Asset Management

> AIGC digital asset management platform for content production workflows — covering content creation, shot-level workbench, project orchestration, and system administration.

## Features

- **Shot-Level Workbench** — Create & manage images/videos within a shot context; assign key frames, start/end frames, and final video
- **Image & Video Generation** — AIGC-powered generation with prompt input, parameter tuning, and result tracing
- **Shot Orchestration** — Organize shots within projects; track generation status and outcomes
- **Asset Management** — Browse, filter, and manage generated images, videos, and media assets
- **Dashboard** — Overview of recent generation tasks, assets, and activity
- **Project Management** — Customer → Brand → Project → Brief → Task hierarchy with review workflows
- **System Administration** — Members, roles/permissions, system logs, and settings
- **Dark Mode** — Full theme support with persistent preference

## Pages

| Module | Page | Description |
|---|---|---|
| Dashboard | Overview | KPI summary and activity feed |
| Dashboard | Generation | Recent generation tasks |
| Dashboard | Assets | Quick asset browser |
| Dashboard | Tasks | Task overview |
| Content | Image Generation | AI image creation workspace |
| Content | Video Generation | AI video creation workspace |
| Content | Shots | Shot management with grid view |
| Content | Shot Detail | Shot-level workbench with context |
| Content | Assets | Full asset library |
| Projects | Customers | Client management |
| Projects | Brands | Brand management |
| Projects | Projects | Project list |
| Projects | Briefs | Creative brief management |
| Projects | Tasks | Task tracking |
| Projects | Reviews | Review & approval workflow |
| System | Members | Team members |
| System | Roles | Role-based permissions |
| System | Settings | Application settings |
| System | System Logs | Audit trail |

## Tech Stack

| Category | Tech |
|---|---|
| Framework | React 18 + TypeScript |
| Routing | React Router (HashRouter) |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| UI Components | Radix UI + custom component library |
| Deployment | GitHub Pages via Actions |

## Project Structure

```
src/
├── components/        Shared components (Layout, Sidebar, Header, workspaces, media cards, …)
│   └── ui/            Radix-based UI primitives (Button, Dialog, Tabs, Select, Toast, …)
├── pages/
│   ├── content/       Image/Video generation, Shots, Assets, KeyFrames
│   ├── dashboard/     Overview, Generation, Assets, Tasks
│   ├── projects/      Customers, Brands, Projects, Briefs, Tasks, Reviews
│   └── system/        Members, Roles, Settings, Logs, AI Config
├── store/             Zustand stores (appStore, generationStore, aiConfigStore)
├── context/           ThemeContext
├── constants/         App constants
├── data/              Mock data
├── lib/               Utility libraries
├── services/          Service layer
├── types/             TypeScript type definitions
└── utils/             Helper functions
```

## Getting Started

```bash
git clone https://github.com/usago007/aigc-asset-management.git
cd aigc-asset-management
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## License

[MIT](./LICENSE)