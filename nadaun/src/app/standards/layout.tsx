export default function StandardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {children}
    </main>
  )
}
