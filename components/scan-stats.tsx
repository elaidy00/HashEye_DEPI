"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

export function ScanStats() {
  const [stats, setStats] = useState({
    total: 0,
    finished: 0,
    pending: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/scans/recent")
        if (response.ok) {
          const data = await response.json()
          const scans = data.scans || []
          const total = scans.length
          const finished = scans.filter((s: any) => s.verdict && s.verdict !== "PENDING").length
          const pending = scans.filter((s: any) => !s.verdict || s.verdict === "PENDING").length

          setStats({ total, finished, pending })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <Card className="p-8 bg-card/40 border-border/30">
      <div className="grid grid-cols-3 gap-8 text-center">
        <div className="space-y-2">
          <p className="text-3xl font-bold text-primary">{stats.total}</p>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Total Scans</p>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-primary">{stats.finished}</p>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Finished Scans</p>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-accent">{stats.pending}</p>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Pending Scans</p>
        </div>
      </div>
    </Card>
  )
}
