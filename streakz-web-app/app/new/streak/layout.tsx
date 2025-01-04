import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create New Streak'
}

export default function NewStreakLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}