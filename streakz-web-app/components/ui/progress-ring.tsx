import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number
  max: number
  color?: string
  size?: number
  strokeWidth?: number
}

export function ProgressRing({ 
  value, 
  max, 
  color = 'stroke-green-600', 
  size = 100,
  strokeWidth = 10 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min(100, (value / max) * 100)
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle
          className="stroke-muted fill-none"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress ring */}
        <circle
          className={cn("fill-none transition-all", color)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset
          }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
} 