"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ScanHistory() {
  const [scans, setScans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch("/api/scans/recent")
        if (response.ok) {
          const data = await response.json()
          setScans(data.scans || [])
        }
      } catch (error) {
        console.error("Failed to fetch scans:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScans()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    )
  }

  if (scans.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No scans yet. Upload a file to get started.</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {scans.map((scan) => (
        <a key={scan.id} href={`/results/${scan.id}`} className="group">
          <Card className="p-4 hover:border-primary/50 hover:bg-card/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="font-medium truncate text-sm text-foreground group-hover:text-primary transition-colors">
                  {scan.file_name}
                </p>
                <p className="text-xs text-muted-foreground truncate font-mono">{scan.file_hash.substring(0, 16)}...</p>
              </div>
              <div
                className={`ml-2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                  scan.verdict === "CLEAN"
                    ? "bg-secondary/20 text-secondary-foreground"
                    : scan.verdict === "MALICIOUS"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {scan.verdict || "PENDING"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{new Date(scan.created_at).toLocaleDateString()}</p>
          </Card>
        </a>
      ))}
    </div>
  )
}
