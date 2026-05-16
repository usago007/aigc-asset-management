import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import KeyFrames from './pages/content/KeyFrames'
import Shots from './pages/content/Shots'
import Assets from './pages/content/Assets'
import VideoGeneration from './pages/content/VideoGeneration'
import GenerationHistory from './pages/content/GenerationHistory'
import TaskDetail from './pages/content/TaskDetail'
import ImageGeneration from './pages/content/ImageGeneration'
import ImageGenerationHistory from './pages/content/ImageGenerationHistory'
import Customers from './pages/projects/Customers'
import Brands from './pages/projects/Brands'
import Projects from './pages/projects/Projects'
import Briefs from './pages/projects/Briefs'
import Tasks from './pages/projects/Tasks'
import Reviews from './pages/projects/Reviews'
import Roles from './pages/system/Roles'
import Settings from './pages/system/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="content/keyframes" element={<KeyFrames />} />
        <Route path="content/shots" element={<Shots />} />
        <Route path="content/assets" element={<Assets />} />
        <Route path="content/video-generation" element={<VideoGeneration />} />
        <Route path="content/generation-history" element={<GenerationHistory />} />
        <Route path="content/task/:id" element={<TaskDetail />} />
        <Route path="content/image-generation" element={<ImageGeneration />} />
        <Route path="content/image-generation-history" element={<ImageGenerationHistory />} />
        <Route path="projects/customers" element={<Customers />} />
        <Route path="projects/brands" element={<Brands />} />
        <Route path="projects/projects" element={<Projects />} />
        <Route path="projects/briefs" element={<Briefs />} />
        <Route path="projects/tasks" element={<Tasks />} />
        <Route path="projects/reviews" element={<Reviews />} />
        <Route path="system/roles" element={<Roles />} />
        <Route path="system/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
