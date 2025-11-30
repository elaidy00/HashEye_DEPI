"use client"

import type React from "react"

import { useState } from "react"
import { FileUploadZone } from "@/components/file-upload-zone"
import { Header } from "@/components/header"
import { ScanHistory } from "@/components/scan-history"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [searchHash, setSearchHash] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const handleSearchHash = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchHash.trim()) {
      setSearchError("Please enter a hash")
      return
    }

    const hash = searchHash.trim().toLowerCase()

    const hashRegex = /^([a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/
    if (!hashRegex.test(hash)) {
      setSearchError("Invalid hash format. Use MD5 (32), SHA1 (40), or SHA256 (64) characters.")
      return
    }

    setSearchError(null)
    setIsSearching(true)

    try {
      const response = await fetch("/api/virustotal/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to results with hash-based results
        window.location.href = `/results/${data.scan.id}`
      } else if (response.status === 404) {
        setSearchError("Hash not found in VirusTotal database. Try uploading the file instead.")
      } else {
        const error = await response.json()
        setSearchError(error.error || "Failed to search hash")
      }
    } catch (err) {
      setSearchError("Failed to search hash. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-3xl space-y-12">
          {/* Hero Section */}
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold tracking-tight">File Security Analysis</h1>
              <p className="text-lg text-muted-foreground">
                Scan files for malware and threats using VirusTotal's comprehensive threat detection
              </p>
            </div>
          </div>

          {/* Hash Search Section */}
          <Card className="p-6 bg-card/50 border-border/50">
            <form onSubmit={handleSearchHash} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Search by Hash</label>
                <p className="text-xs text-muted-foreground mt-1">
                  MD5 (32 chars), SHA1 (40 chars), or SHA256 (64 chars)
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste MD5, SHA1, or SHA256 hash..."
                  value={searchHash}
                  onChange={(e) => {
                    setSearchHash(e.target.value)
                    setSearchError(null)
                  }}
                  disabled={isSearching}
                  className="flex-1 font-mono text-sm"
                />
                <Button type="submit" disabled={isSearching} className="whitespace-nowrap">
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
              {searchError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm">{searchError}</div>
              )}
            </form>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-2 text-sm text-muted-foreground">or</span>
            </div>
          </div>

          {/* File Upload Zone */}
          <FileUploadZone />

          {/* Recent Scans */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Scans</h2>
            <ScanHistory />
          </div>
        </div>
      </main>
    </div>
  )
}
