"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ThreatIndicator } from "@/components/threat-indicator"
import { EngineResults } from "@/components/engine-results"
import { Button } from "@/components/ui/button"

export function ResultsDetail({ scanId }: { scanId: string }) {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const getApiUrl = (path: string) => {
    if (typeof window === "undefined") return path
    return `${window.location.origin}${path}`
  }

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const url = getApiUrl(`/api/scans/${scanId}`)
        console.log("[v0] Fetching scan results from:", url)
        const response = await fetch(url)

        if (response.ok) {
          const data = await response.json()
          setResult(data.scan)
        } else if (response.status === 404) {
          const errorData = await response.json()
          if (errorData.status === "pending") {
            setIsPending(true)
            setError("File is being scanned by VirusTotal. Please check back in a few moments.")
          } else {
            setError("File not found in VirusTotal. Try uploading the file or checking the hash.")
          }
        } else {
          const errorData = await response.json()
          console.error("[v0] API error:", errorData)
          setError(errorData.error || "Failed to load scan results")
        }
      } catch (err) {
        console.error("[v0] Fetch error:", err)
        setError("Failed to load scan results. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResult()
  }, [scanId])

  useEffect(() => {
    if (!isPending) return

    const interval = setInterval(() => {
      const url = getApiUrl(`/api/scans/${scanId}`)
      fetch(url)
        .then((response) => {
          if (response.ok) {
            return response.json()
          }
        })
        .then((data) => {
          if (data?.scan) {
            setResult(data.scan)
            setIsPending(false)
            setError(null)
          }
        })
        .catch((err) => {
          console.error("[v0] Polling error:", err)
        })
    }, 3000)

    return () => clearInterval(interval)
  }, [isPending, scanId])

  if (error) {
    return (
      <div className="space-y-4">
        <div
          className={`rounded-lg p-4 ${isPending ? "bg-blue-500/10 text-blue-600" : "bg-destructive/10 text-destructive"}`}
        >
          <p className="font-medium">{error}</p>
          {isPending && <p className="text-sm mt-2">Refreshing...</p>}
        </div>
        {!isPending && (
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Back to Scanner
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">No scan data available</p>
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Back to Scanner
        </Button>
      </div>
    )
  }

  const threatLevel = result.positives === 0 ? "clean" : result.positives <= 2 ? "suspicious" : "malicious"

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card
        className="p-6 border-l-4"
        style={{
          borderLeftColor: threatLevel === "clean" ? "#48bb78" : threatLevel === "suspicious" ? "#ecc94b" : "#f56565",
        }}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold break-all">{result.file_name}</h1>
              <p className="text-sm text-muted-foreground mt-1 font-mono break-all">SHA256: {result.file_hash}</p>
            </div>
            <ThreatIndicator level={threatLevel} />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Detections</p>
              <p className="text-2xl font-bold">{result.positives}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Engines</p>
              <p className="text-2xl font-bold">{result.total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Detection Rate</p>
              <p className="text-2xl font-bold">
                {result.total > 0 ? Math.round((result.positives / result.total) * 100) : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Scanned</p>
              <p className="text-sm font-medium">{new Date(result.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* File Info Card */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">File Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">File Type</p>
              <p className="font-medium">{result.file_type || "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">File Size</p>
              <p className="font-medium">{result.file_size ? formatBytes(result.file_size) : "Unknown"}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">MD5</p>
              <p className="font-mono text-sm break-all">{result.md5_hash || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SHA1</p>
              <p className="font-mono text-sm break-all">{result.sha1_hash || "N/A"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Engine Results */}
      <EngineResults engines={result.engines || []} />

      {/* Back Button */}
      <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
        Back to Scanner
      </Button>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
