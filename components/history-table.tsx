"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ScanRecord {
  id: string
  file_name: string
  file_hash: string
  verdict: string
  positives: number
  total: number
  created_at: string
}

export function HistoryTable() {
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch(`/api/scans/history?page=${page}&limit=${itemsPerPage}`)
        if (response.ok) {
          const data = await response.json()
          setScans(data.scans || [])
        } else {
          setError("Failed to load scan history")
        }
      } catch (err) {
        setError("Failed to fetch scan history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchScans()
  }, [page])

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "CLEAN":
        return "bg-secondary/20 text-secondary-foreground"
      case "MALICIOUS":
        return "bg-destructive/20 text-destructive"
      case "SUSPICIOUS":
        return "bg-yellow-500/20 text-yellow-400"
      default:
        return "bg-muted/50 text-muted-foreground"
    }
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-destructive font-medium">{error}</p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-0 overflow-hidden">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </Card>
    )
  }

  if (scans.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">No scan history yet</p>
        <Link href="/">
          <Button>Start Scanning</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">File Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Hash</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Verdict</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Detection Rate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Scanned</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan.id} className="border-b border-border hover:bg-card/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium truncate max-w-xs">{scan.file_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-muted-foreground truncate max-w-xs">
                      {scan.file_hash.substring(0, 16)}...
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getVerdictColor(scan.verdict)}`}
                    >
                      {scan.verdict}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">
                      <span className="font-semibold text-destructive">{scan.positives}</span>
                      <span className="text-muted-foreground">/{scan.total}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/results/${scan.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, scans.length)} scans
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={scans.length < itemsPerPage}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
