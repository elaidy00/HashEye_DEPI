import { ResultsDetail } from "@/components/results-detail"
import { Header } from "@/components/header"

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ResultsDetail scanId={id} />
      </main>
    </div>
  )
}
