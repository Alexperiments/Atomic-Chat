import { createFileRoute } from '@tanstack/react-router'
import { route } from '@/constants/routes'
import HeaderPage from '@/containers/HeaderPage'
import SettingsMenu from '@/containers/SettingsMenu'
import { useTranslation } from '@/i18n/react-i18next-compat'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Route = createFileRoute(route.settings.index as any)({
  component: SettingsIndex,
})

function SettingsIndex() {
  const { t } = useTranslation()

  return (
    <div className="flex h-svh w-full flex-col">
      <HeaderPage>
        <span className="font-studio text-base font-medium">
          {t('common:settings')}
        </span>
      </HeaderPage>
      <main className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <SettingsMenu standalone />
      </main>
    </div>
  )
}
