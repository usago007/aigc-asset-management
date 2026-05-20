import type { CurrentUserProfile, NotificationItem } from '@/types'
import { storageGet, storageSet } from '@/utils/storage'

const SHELL_STATE_EVENT = 'shell-state-updated'

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notice-task-complete',
    title: '图片生成任务已完成',
    summary: '「夏季新品主视觉」第 3 轮出图已完成，可前往图片创作查看结果。',
    level: 'success',
    createdAt: '2026-05-20T09:28:00+08:00',
    read: false,
    targetPath: '/content/image-generation',
    targetLabel: '图片创作',
  },
  {
    id: 'notice-review-feedback',
    title: '审核意见待处理',
    summary: '「春季护肤 Campaign」收到新的客户反馈，建议尽快补充修订说明。',
    level: 'warning',
    createdAt: '2026-05-20T08:46:00+08:00',
    read: false,
    targetPath: '/projects/reviews',
    targetLabel: '审核管理',
  },
  {
    id: 'notice-asset-ingest',
    title: '资产已同步入库',
    summary: '最新视频成片与封面素材已同步到资产库，建议核对归档标签。',
    level: 'info',
    createdAt: '2026-05-19T19:12:00+08:00',
    read: true,
    targetPath: '/content/assets',
    targetLabel: '资产库',
  },
  {
    id: 'notice-member-update',
    title: '成员状态已变更',
    summary: '成员「李华」已完成激活，当前可参与项目与审核协作。',
    level: 'info',
    createdAt: '2026-05-19T15:35:00+08:00',
    read: true,
    targetPath: '/system/members',
    targetLabel: '成员管理',
  },
  {
    id: 'notice-ai-config',
    title: 'AI 配置已更新',
    summary: '文生视频预设已切换到新的稳定参数组，请关注后续生成成功率。',
    level: 'error',
    createdAt: '2026-05-19T10:08:00+08:00',
    read: false,
    targetPath: '/system/ai-config',
    targetLabel: 'AI 能力配置',
  },
]

const DEFAULT_PROFILE: CurrentUserProfile = {
  accountName: 'admin',
  displayName: 'admin',
  roleLabel: '管理员账号',
  email: 'admin@fatmug.local',
  phone: '13800138000',
  department: '系统管理部',
  avatarUrl: '',
  lastLoginAt: '2026-05-20T09:32:00+08:00',
  notificationsEnabled: true,
}

function dispatchShellStateUpdate(profile: CurrentUserProfile) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SHELL_STATE_EVENT, { detail: profile }))
}

export function getNotificationCenter(): NotificationItem[] {
  return storageGet<NotificationItem[]>('notificationCenter', DEFAULT_NOTIFICATIONS)
}

export function saveNotificationCenter(items: NotificationItem[]): void {
  storageSet('notificationCenter', items)
}

export function getCurrentUserProfile(): CurrentUserProfile {
  const notificationsEnabled = storageGet('notifications', DEFAULT_PROFILE.notificationsEnabled)
  const profile = storageGet<CurrentUserProfile>('currentUserProfile', {
    ...DEFAULT_PROFILE,
    notificationsEnabled,
  })

  if (profile.notificationsEnabled !== notificationsEnabled) {
    const synced = { ...profile, notificationsEnabled }
    storageSet('currentUserProfile', synced)
    return synced
  }

  return profile
}

export function saveCurrentUserProfile(profile: CurrentUserProfile): void {
  storageSet('currentUserProfile', profile)
  storageSet('notifications', profile.notificationsEnabled)
  dispatchShellStateUpdate(profile)
}

export function syncNotificationsEnabled(enabled: boolean): void {
  storageSet('notifications', enabled)
  const currentProfile = storageGet<CurrentUserProfile>('currentUserProfile', {
    ...DEFAULT_PROFILE,
    notificationsEnabled: enabled,
  })
  const nextProfile = { ...currentProfile, notificationsEnabled: enabled }
  storageSet('currentUserProfile', nextProfile)
  dispatchShellStateUpdate(nextProfile)
}

export function subscribeShellState(callback: (profile: CurrentUserProfile) => void): () => void {
  if (typeof window === 'undefined') return () => undefined

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CurrentUserProfile>
    callback(customEvent.detail)
  }

  window.addEventListener(SHELL_STATE_EVENT, handler)
  return () => window.removeEventListener(SHELL_STATE_EVENT, handler)
}
