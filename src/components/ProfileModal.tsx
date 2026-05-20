import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import Modal from '@/components/Modal'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CurrentUserProfile } from '@/types'

interface ProfileModalProps {
  isOpen: boolean
  profile: CurrentUserProfile
  onClose: () => void
  onSave: (profile: CurrentUserProfile) => void
  onOpenSettings: () => void
}

export default function ProfileModal({ isOpen, profile, onClose, onSave, onOpenSettings }: ProfileModalProps) {
  const [draft, setDraft] = useState(profile)

  useEffect(() => {
    setDraft(profile)
  }, [profile, isOpen])

  const initials = draft.displayName.trim().slice(0, 2).toUpperCase() || draft.accountName.slice(0, 2).toUpperCase()

  return (
    <Modal title="个人中心" isOpen={isOpen} onClose={onClose} onSave={() => onSave(draft)} width="max-w-3xl">
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-gray-200 dark:border-gray-800">
                <AvatarImage src={draft.avatarUrl} alt={draft.displayName} />
                <AvatarFallback className="text-base">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="page-title-compact">{draft.displayName}</p>
                <p className="body-muted mt-1">
                  {draft.accountName} · {draft.roleLabel}
                </p>
              </div>
            </div>
            <Button type="button" variant="secondary" className="gap-2 self-start md:self-auto" onClick={onOpenSettings}>
              <Settings size={16} />
              前往系统设置
            </Button>
          </div>
        </section>

        <ReadOnlySection title="账号信息">
          <ReadOnlyField label="账号标识" value={draft.accountName} />
          <ReadOnlyField label="账号角色" value={draft.roleLabel} />
          <ReadOnlyField label="最后登录" value={new Date(draft.lastLoginAt).toLocaleString('zh-CN')} />
          <ReadOnlyField label="当前通知状态" value={draft.notificationsEnabled ? '已启用' : '已关闭'} />
        </ReadOnlySection>

        <section className="space-y-4">
          <h3 className="section-title">基础资料</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">显示名称</label>
              <Input
                value={draft.displayName}
                onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
                placeholder="请输入显示名称"
              />
            </div>
            <div>
              <label className="label-field">邮箱</label>
              <Input
                value={draft.email}
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                placeholder="请输入邮箱"
              />
            </div>
            <div>
              <label className="label-field">手机号</label>
              <Input
                value={draft.phone}
                onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <label className="label-field">部门</label>
              <Input
                value={draft.department}
                onChange={(event) => setDraft({ ...draft, department: event.target.value })}
                placeholder="请输入部门"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="section-title">偏好设置</h3>
          <div className="surface-panel flex items-center justify-between gap-6">
            <div>
              <p className="panel-title">接收系统通知</p>
              <p className="body-muted mt-1">控制工作台右上角通知提醒、未读提示与任务进度提醒展示。</p>
            </div>
            <Switch
              checked={draft.notificationsEnabled}
              onCheckedChange={(checked) => setDraft({ ...draft, notificationsEnabled: checked })}
            />
          </div>
        </section>
      </div>
    </Modal>
  )
}
