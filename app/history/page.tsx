import { Header } from "@/components/header"
import { HistoryTable } from "@/components/history-table"

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Scan History</h1>
            <p className="text-muted-foreground mt-2">
              View all files you've scanned and their threat analysis results
            </p>
          </div>
          <HistoryTable />
        </div>
      </main>
    </div>
  )
}
