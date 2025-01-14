import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { format, subDays, startOfYear, endOfYear, parseISO, isAfter, isSameDay, addDays } from 'date-fns'
import type { Goal } from '@/types/streak'

export type TimeRange = 'ytd' | 'week' | 'month' | '90days' | 'year'

interface GoalLineChartProps {
  goal: Goal
  color?: string
  timeRange?: TimeRange
  showTarget?: boolean
}

export function GoalLineChart({ 
  goal,
  color = '#16a34a', // green-600
  timeRange = 'ytd',
  showTarget = false
}: GoalLineChartProps) {
  const data = useMemo(() => {
    // Get the start date based on the time range
    const now = new Date()
    let startDate: Date
    let endDate: Date = now
    
    switch (timeRange) {
      case 'week':
        startDate = subDays(now, 7)
        break
      case 'month':
        startDate = subDays(now, 30)
        break
      case '90days':
        startDate = subDays(now, 90)
        break
      case 'year':
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case 'ytd':
      default:
        startDate = startOfYear(now)
    }

    // Convert progress object to sorted array of dates and values
    const progressEntries = Object.entries(goal.progress)
      .map(([date, value]) => ({
        date: parseISO(date),
        value
      }))
      .filter(entry => isAfter(entry.date, startDate))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Add starting point if there isn't one on the start date
    const hasStartPoint = progressEntries.some(entry => isSameDay(entry.date, startDate))
    const initialDataPoints = hasStartPoint ? progressEntries : [
      { date: startDate, value: 0 },
      ...progressEntries
    ]

    // For year view, add future dates up to end of year
    const dataPoints = timeRange === 'year' && initialDataPoints.length > 0
      ? [...initialDataPoints, ...generateFutureDates(initialDataPoints, endDate)]
      : initialDataPoints

    // Calculate cumulative values
    let cumulative = 0
    return dataPoints.map(entry => {
      cumulative += entry.value
      return {
        date: format(entry.date, 'MMM d'),
        value: cumulative,
        target: goal.targetValue
      }
    })
  }, [goal.progress, goal.targetValue, timeRange])

  // Helper function to generate future dates
  function generateFutureDates(dataPoints: { date: Date; value: number }[], endDate: Date) {
    const lastDate = dataPoints[dataPoints.length - 1].date
    if (lastDate >= endDate) return []

    const futureDates: { date: Date; value: number }[] = []
    let currentDate = addDays(lastDate, 1)

    while (currentDate <= endDate) {
      futureDates.push({
        date: currentDate,
        value: 0 // No new progress for future dates
      })
      currentDate = addDays(currentDate, 1)
    }

    return futureDates
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 50,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, showTarget ? Math.max(goal.targetValue, ...data.map(d => d.value)) : Math.max(...data.map(d => d.value))]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
            formatter={(value: number) => [value.toFixed(2), 'Progress']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
          {showTarget && (
            <ReferenceLine
              y={goal.targetValue}
              stroke={color}
              strokeDasharray="3 3"
              label={{
                value: 'Target',
                fill: color,
                fontSize: 12,
                position: 'right'
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 