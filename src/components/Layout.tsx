import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import ProfileModal from './ProfileModal'
import type { CurrentUserProfile, NotificationItem } from '@/types'
import { getCurrentUserProfile, getNotificationCenter, saveCurrentUserProfile, saveNotificationCenter, subscribeShellState } from '@/utils/shellState'
import { showToast } from '@/utils/toast'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profile, setProfile] = useState<CurrentUserProfile>(() => getCurrentUserProfile())
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getNotificationCenter())
  const navigate = useNavigate()

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
    [notifications],
  )

  useEffect(() => subscribeShellState((nextProfile) => setProfile(nextProfile)), [])

  const closeNotificationPanel = useCallback(() => setNotificationPanelOpen(false), [])

  const updateNotifications = useCallback((updater: (current: NotificationItem[]) => NotificationItem[]) => {
    setNotifications((current) => {
      const next = updater(current)
      saveNotificationCenter(next)
      return next
    })
  }, [])

  const handleMarkNotificationRead = useCallback((id: string) => {
    updateNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    )
  }, [updateNotifications])

  const handleMarkAllNotificationsRead = useCallback(() => {
    updateNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }, [updateNotifications])

  const handleNavigateFromNotification = useCallback((item: NotificationItem) => {
    handleMarkNotificationRead(item.id)
    closeNotificationPanel()
    navigate(item.targetPath)
  }, [closeNotificationPanel, handleMarkNotificationRead, navigate])

  const handleProfileSave = useCallback((nextProfile: CurrentUserProfile) => {
    const normalizedProfile = {
      ...nextProfile,
      displayName: nextProfile.displayName.trim() || nextProfile.accountName,
      email: nextProfile.email.trim(),
      phone: nextProfile.phone.trim(),
      department: nextProfile.department.trim(),
    }
    setProfile(normalizedProfile)
    saveCurrentUserProfile(normalizedProfile)
    setProfileModalOpen(false)
    showToast('success', '个人中心已保存')
  }, [])

  const openSettings = useCallback(() => {
    setProfileModalOpen(false)
    setNotificationPanelOpen(false)
    navigate('/system/settings')
  }, [navigate])

  return (
    <div className="flex h-screen bg-[#f6f5f2] text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        profile={profile}
        onOpenProfile={() => setProfileModalOpen(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          notifications={notifications}
          unreadCount={unreadCount}
          notificationsEnabled={profile.notificationsEnabled}
          notificationPanelOpen={notificationPanelOpen}
          onToggleNotificationPanel={() => setNotificationPanelOpen((current) => !current)}
          onCloseNotificationPanel={closeNotificationPanel}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onNavigateFromNotification={handleNavigateFromNotification}
          onOpenSettings={openSettings}
        />
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
      <ProfileModal
        isOpen={profileModalOpen}
        profile={profile}
        onClose={() => setProfileModalOpen(false)}
        onSave={handleProfileSave}
        onOpenSettings={openSettings}
      />
    </div>
  )
}
