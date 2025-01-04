import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create New Collection'
}

export default function NewCollectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 