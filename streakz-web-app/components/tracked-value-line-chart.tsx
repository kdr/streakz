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
import { format, subDays, startOfYear, endOfYear, parseISO, isAfter, isBefore, isSameDay } from 'date-fns'
import type { TrackedValue } from '@/types/streak'

type TimeRange = 'ytd' | 'week' | 'month' | '90days' | 'year'

interface TrackedValueLineChartProps {
  trackedValue: TrackedValue
  color?: string
  timeRange?: TimeRange
  showTarget?: boolean
}

export function TrackedValueLineChart({ 
  trackedValue,
  color = '#16a34a', // green-600
  timeRange = 'ytd',
  showTarget = false
}: TrackedValueLineChartProps) {
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

    // Convert values object to sorted array of dates and values
    const valueEntries = Object.entries(trackedValue.values)
      .map(([date, value]) => ({
        date: parseISO(date),
        value
      }))
      .filter(entry => 
        isAfter(entry.date, startDate) && 
        (timeRange === 'year' ? isBefore(entry.date, endDate) || isSameDay(entry.date, endDate) : true)
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Add starting point if there isn't one on the start date
    const hasStartPoint = valueEntries.some(entry => isSameDay(entry.date, startDate))
    const dataPoints = hasStartPoint ? valueEntries : [
      { date: startDate, value: trackedValue.startValue },
      ...valueEntries
    ]

    return dataPoints.map(entry => ({
      date: format(entry.date, 'MMM d'),
      value: entry.value,
      target: trackedValue.targetValue
    }))
  }, [trackedValue.values, trackedValue.targetValue, trackedValue.startValue, timeRange])

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
            domain={[
              Math.min(...data.map(d => d.value), showTarget ? trackedValue.targetValue : Infinity),
              Math.max(...data.map(d => d.value), showTarget ? trackedValue.targetValue : -Infinity)
            ]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
            formatter={(value: number) => [value.toFixed(2), 'Value']}
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
              y={trackedValue.targetValue}
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