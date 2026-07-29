import { HUE } from '@/theme/hue'
import type { Hue } from '@/theme/hue'

export function IconChip({ tone, Icon }: { tone: Hue; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${HUE[tone].iconBg}`}>
      <Icon className={`w-[18px] h-[18px] ${HUE[tone].iconText}`} />
    </div>
  )
}
