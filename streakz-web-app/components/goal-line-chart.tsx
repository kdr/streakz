import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format, subDays, startOfYear, parseISO, isAfter, isSameDay } from 'date-fns'
import type { Goal } from '@/types/streak'

type TimeRange = 'ytd' | 'week' | 'month' | '90days'

interface GoalLineChartProps {
  goal: Goal
  color?: string
  timeRange?: TimeRange
}

export function GoalLineChart({ 
  goal,
  color = '#16a34a', // green-600
  timeRange = 'ytd'
}: GoalLineChartProps) {
  const data = useMemo(() => {
    // Get the start date based on the time range
    const now = new Date()
    let startDate: Date
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
    const dataPoints = hasStartPoint ? progressEntries : [
      { date: startDate, value: 0 },
      ...progressEntries
    ]

    // Calculate cumulative values
    let cumulative = 0
    return dataPoints.map(entry => {
      cumulative += entry.value
      return {
        date: format(entry.date, 'MMM d'),
        value: cumulative
      }
    })
  }, [goal.progress, timeRange])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
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
            domain={[0, 'auto']}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 