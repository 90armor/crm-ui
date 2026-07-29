import type { ReactNode } from 'react'
import {
  SidebarToggleIcon, DashboardGridIcon, MailIcon, PencilIcon, CalendarIcon, FileTextIcon, PillIcon,
  LifeBuoyIcon, UsersIcon, UserGearIcon, ClockIcon, ActivityPulseIcon, ActivityLogIcon,
} from '@/icons'
import type { PageName } from '@/types/domain'

const ADMIN_NAV: { label: string; icon: ReactNode }[] = [
  { label: 'Members', icon: <UsersIcon className="w-[18px] h-[18px]" /> },
  { label: 'User Mgmt', icon: <UserGearIcon className="w-[18px] h-[18px]" /> },
  { label: 'Scheduled Tasks', icon: <ClockIcon className="w-[18px] h-[18px]" /> },
  { label: 'Pulse', icon: <ActivityPulseIcon className="w-[18px] h-[18px]" /> },
]

export function Sidebar({
  page,
  onNavigate,
  isSidebarOpen,
  onToggleSidebar,
  userRole,
  onChangeRole,
}: {
  page: PageName
  onNavigate: (page: PageName) => void
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  userRole: 'Staff' | 'IT Staff'
  onChangeRole: (role: 'Staff' | 'IT Staff') => void
}) {
  return (
    <aside className={`${isSidebarOpen ? 'w-56' : 'w-16'} bg-[#111827] text-white flex flex-col shrink-0 transition-[width] duration-200 overflow-hidden`}>
      <div className={`flex items-center border-b border-white/10 py-[18px] ${isSidebarOpen ? 'justify-between px-4' : 'justify-center px-2'}`}>
        {isSidebarOpen && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0">C</div>
            <span className="font-semibold text-[13px] tracking-tight truncate">CRM System</span>
          </div>
        )}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="text-white/50 hover:text-white transition-colors shrink-0"
        >
          <SidebarToggleIcon className="w-4 h-4" />
        </button>
      </div>
      <nav className="flex-1 px-2.5 py-4 overflow-y-auto overflow-x-hidden space-y-0.5">
        {[
          { label: 'Dashboard', icon: <DashboardGridIcon className="w-[18px] h-[18px]" /> },
          { label: 'Inbox', icon: <MailIcon className="w-[18px] h-[18px]" />, badge: 3 },
          { label: 'Manual', icon: <PencilIcon className="w-[18px] h-[18px]" /> },
          { label: 'Reservations', icon: <CalendarIcon className="w-[18px] h-[18px]" />, badge: 3 },
          { label: 'Documents', icon: <FileTextIcon className="w-[18px] h-[18px]" /> },
          { label: 'Medicines', icon: <PillIcon className="w-[18px] h-[18px]" /> },
          { label: 'Support', icon: <LifeBuoyIcon className="w-[18px] h-[18px]" />, badge: 2 },
        ].map(item => {
          const isNavigable = item.label === 'Inbox' || item.label === 'Manual' || item.label === 'Reservations' || item.label === 'Documents' || item.label === 'Medicines' || item.label === 'Support'
          const isActive = isNavigable && item.label === page
          return (
            <button
              key={item.label}
              title={!isSidebarOpen ? item.label : undefined}
              onClick={() => { if (isNavigable) onNavigate(item.label as PageName) }}
              className={`w-full flex items-center py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap ${isSidebarOpen ? 'justify-between px-3' : 'justify-center px-0'} ${isActive ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'}`}
            >
              <span className={`flex items-center ${isSidebarOpen ? 'gap-2.5' : ''}`}>
                <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px]">{item.icon}</span>
                {isSidebarOpen && item.label}
              </span>
              {isSidebarOpen && item.badge != null && <span className="bg-blue-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shrink-0">{item.badge}</span>}
            </button>
          )
        })}
        {isSidebarOpen ? (
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Admin</span>
          </div>
        ) : (
          <div className="my-3 mx-3 border-t border-white/10" />
        )}
        {ADMIN_NAV.map(item => (
          <button
            key={item.label}
            title={!isSidebarOpen ? item.label : undefined}
            className={`w-full flex items-center py-2 rounded-lg text-[13px] text-white/60 hover:bg-white/8 hover:text-white transition-colors whitespace-nowrap ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'}`}
          >
            <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px]">{item.icon}</span>
            {isSidebarOpen && item.label}
          </button>
        ))}
        {userRole === 'IT Staff' && (
          <>
            {isSidebarOpen ? (
              <div className="pt-5 pb-1.5 px-3">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">IT Staff</span>
              </div>
            ) : (
              <div className="my-3 mx-3 border-t border-white/10" />
            )}
            {[{ label: 'Activity Logs' as const, icon: <ActivityLogIcon className="w-[18px] h-[18px]" /> }].map(item => {
              const isActive = item.label === page
              return (
                <button
                  key={item.label}
                  title={!isSidebarOpen ? item.label : undefined}
                  onClick={() => onNavigate('Activity Logs')}
                  className={`w-full flex items-center py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} ${isActive ? 'bg-blue-600 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'}`}
                >
                  <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px]">{item.icon}</span>
                  {isSidebarOpen && item.label}
                </button>
              )
            })}
          </>
        )}
      </nav>

      {/* Demo-only role switcher — simulates IT Staff vs regular Staff since
          there's no real auth/permission system in this app yet. */}
      <div className={`border-t border-white/10 py-3 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
        {isSidebarOpen && <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Demo role</p>}
        <div className={`flex items-center gap-1 bg-white/5 rounded-lg p-1 ${isSidebarOpen ? '' : 'flex-col'}`}>
          {(['Staff', 'IT Staff'] as const).map(role => (
            <button
              key={role}
              title={!isSidebarOpen ? role : undefined}
              onClick={() => onChangeRole(role)}
              className={`flex-1 w-full text-[11px] font-semibold py-1.5 rounded-md transition-colors whitespace-nowrap ${userRole === role ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
            >
              {isSidebarOpen ? role : role === 'IT Staff' ? 'IT' : 'ST'}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
