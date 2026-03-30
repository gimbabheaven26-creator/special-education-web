export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">오프라인</h1>
        <p className="text-muted-foreground">
          인터넷에 연결되어 있지 않습니다.
        </p>
        <p className="text-sm text-muted-foreground">
          연결이 복구되면 자동으로 다시 시도합니다.
        </p>
      </div>
    </main>
  )
}
