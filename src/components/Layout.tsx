import { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard, Image, Video, FolderOpen, History,
  Users, Tags, FolderTree, FileText, CheckSquare, ClipboardCheck,
  Shield, Settings, ChevronLeft, ChevronRight, Menu
} from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-primary-950 transition-colors duration-300">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
