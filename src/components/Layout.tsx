import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import ProfileModal from './ProfileModal'
import type { CurrentUserProfile, NotificationItem } from '@/types'
import { getCurrentUserProfile, getNotificationCenter, saveCurrentUserProfile, saveNotificationCenter, subscribeShellState } from '@/utils/shellState'
import { showToast } from '@/utils/toast'
import { ConfirmProvider } from './ConfirmProvider'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
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
    <ConfirmProvider>
    <div className="app-shell">
      <a href="#main-content" className="skip-link">跳到主要内容</a>
      <Sidebar
        className="hidden lg:flex"
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        profile={profile}
        onOpenProfile={() => setProfileModalOpen(true)}
      />
      {mobileNavigationOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="移动端导航">
          <button className="absolute inset-0 bg-gray-950/35 backdrop-blur-sm" aria-label="关闭导航" onClick={() => setMobileNavigationOpen(false)} />
          <Sidebar
            className="relative h-full w-[min(86vw,300px)] shadow-[24px_0_80px_rgba(15,23,42,.18)]"
            collapsed={false}
            onToggle={() => setMobileNavigationOpen(false)}
            profile={profile}
            onOpenProfile={() => { setMobileNavigationOpen(false); setProfileModalOpen(true) }}
          />
        </div>
      ) : null}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onOpenNavigation={() => setMobileNavigationOpen(true)}
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
        <main id="main-content" tabIndex={-1} className="app-main">
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
    </ConfirmProvider>
  )
}
