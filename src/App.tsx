import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import Overview from './pages/dashboard/Overview'
import Generation from './pages/dashboard/Generation'
import DashboardAssets from './pages/dashboard/DashboardAssets'
import DashboardTasks from './pages/dashboard/DashboardTasks'
import KeyFrames from './pages/content/KeyFrames'
import Shots from './pages/content/Shots'
import ShotDetail from './pages/content/ShotDetail'
import Assets from './pages/content/Assets'
import VideoGeneration from './pages/content/VideoGeneration'
import TaskDetail from './pages/content/TaskDetail'
import ImageGeneration from './pages/content/ImageGeneration'
import ImageDetail from './pages/content/ImageDetail'
import VideoDetail from './pages/content/VideoDetail'
import Customers from './pages/projects/Customers'
import Brands from './pages/projects/Brands'
import Projects from './pages/projects/Projects'
import ProjectDetail from './pages/projects/ProjectDetail'
import Briefs from './pages/projects/Briefs'
import Tasks from './pages/projects/Tasks'
import Reviews from './pages/projects/Reviews'
import Roles from './pages/system/Roles'
import Settings from './pages/system/Settings'
import AIConfigPanel from './pages/system/AIConfigPanel'
import SystemLogs from './pages/system/SystemLogs'
import Members from './pages/system/Members'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/content/image-generation" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/overview" element={<Overview />} />
        <Route path="dashboard/generation" element={<Generation />} />
        <Route path="dashboard/assets" element={<DashboardAssets />} />
        <Route path="dashboard/tasks" element={<DashboardTasks />} />
        <Route path="content/keyframes" element={<KeyFrames />} />
        <Route path="content/shots" element={<Shots />} />
        <Route path="content/shots/:id" element={<ShotDetail />} />
        <Route path="content/assets" element={<Assets />} />
        <Route path="content/video-generation" element={<VideoGeneration />} />
        <Route path="content/task/:id" element={<TaskDetail />} />
        <Route path="content/image-generation" element={<ImageGeneration />} />
        <Route path="content/image-detail/:taskId/:resultIndex" element={<ImageDetail />} />
        <Route path="content/video-detail/:id" element={<VideoDetail />} />
        <Route path="projects/customers" element={<Customers />} />
        <Route path="projects/brands" element={<Brands />} />
        <Route path="projects/projects" element={<Projects />} />
        <Route path="projects/projects/:id" element={<ProjectDetail />} />
        <Route path="projects/briefs" element={<Briefs />} />
        <Route path="projects/tasks" element={<Tasks />} />
        <Route path="projects/reviews" element={<Reviews />} />
        <Route path="system/members" element={<Members />} />
        <Route path="system/roles" element={<Roles />} />
        <Route path="system/settings" element={<Settings />} />
        <Route path="system/ai-config" element={<AIConfigPanel />} />
        <Route path="system/logs" element={<SystemLogs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
