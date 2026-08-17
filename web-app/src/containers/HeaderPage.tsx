import { useLeftPanel } from '@/hooks/useLeftPanel'
import { cn } from '@/lib/utils'
import {
  IconArrowLeft,
  IconLayoutSidebar,
  IconSettings,
} from '@tabler/icons-react'
import { ReactNode, memo } from 'react'
import { Button } from '@/components/ui/button'
import { DownloadManagement } from '@/containers/DownloadManegement'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Link, useLocation } from '@tanstack/react-router'
import { route } from '@/constants/routes'

type HeaderPageProps = {
  children?: ReactNode
  // Onboarding has no sidebar to toggle, so it hides the download + toggle cluster.
  hideControls?: boolean
}
const HeaderPage = memo(function HeaderPage({
  children,
  hideControls,
}: HeaderPageProps) {
  const open = useLeftPanel((state) => state.open)
  const setLeftPanel = useLeftPanel((state) => state.setLeftPanel)
  const { isMobile } = useSidebar()
  const { pathname } = useLocation()
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const isSettingsIndex = normalizedPathname === route.settings.index
  const isSettingsDetail = normalizedPathname.startsWith(
    `${route.settings.index}/`
  )

  return (
    <div
      className={cn(
        'h-15 flex items-center shrink-0',
        IS_MACOS && !open ? 'pl-24' : 'pl-2 sm:pl-4',
        children === undefined && 'border-none'
      )}
      // On macOS the element-based drag region approach is used: this div sits
      // inside the SidebarInset which is in normal document flow, so it is
      // always at its natural z-level and can receive mousedown events.
      // Tauri's drag handler excludes clicks on <button>, <input>, <a>,
      // <select>, and <textarea> elements automatically, so interactive
      // children remain clickable. For div-based triggers (like the model
      // selector) we suppress mousedown propagation on those elements directly.
      {...(IS_MACOS ? { 'data-tauri-drag-region': true } : {})}
    >
      <div className={cn('flex items-center w-full gap-1')}>
        {isMobile && !hideControls && (
          <>
            {isSettingsDetail ? (
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                className="rounded-full relative z-50"
              >
                <Link to={route.settings.index} aria-label="Back to settings">
                  <IconArrowLeft className="text-muted-foreground relative size-5" />
                </Link>
              </Button>
            ) : (
              <SidebarTrigger className="rounded-full relative z-50" />
            )}
            {!isSettingsIndex && !isSettingsDetail && (
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                className="rounded-full relative z-50"
              >
                <Link to={route.settings.index} aria-label="Open settings">
                  <IconSettings className="text-muted-foreground relative size-4.5" />
                </Link>
              </Button>
            )}
          </>
        )}
        {!isMobile && !open && !hideControls && (
          <>
            <DownloadManagement />
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full relative z-50"
              onClick={() => setLeftPanel(!open)}
              aria-label="Toggle sidebar"
            >
              <IconLayoutSidebar className="text-muted-foreground relative size-4.5" />
            </Button>
          </>
        )}
        <div className={cn('flex-1 min-w-0')}>{children}</div>
      </div>
    </div>
  )
})

export default HeaderPage
