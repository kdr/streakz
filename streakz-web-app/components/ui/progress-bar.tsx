import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  color?: string
  className?: string
}

export function ProgressBar({ value, max, color = 'bg-green-600', className }: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100)
  
  return (
    <div className={cn("w-full h-4 bg-muted rounded-full overflow-hidden", className)}>
      <div
        className={cn("h-full transition-all", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
} 