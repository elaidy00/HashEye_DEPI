"use client"

import type React from "react"
import { useState } from "react"
import { FileUploadZone } from "@/components/file-upload-zone"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [searchHash, setSearchHash] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

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
        window.location.href = `/results/${data.scan.id}`
      } else if (response.status === 404) {
        setSearchError("Hash not found. Try uploading the file instead.")
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold">File Scanner</h1>
            <p className="text-muted-foreground">Upload files or search by hash to check for threats</p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={() => setShowUpload(true)} variant={showUpload ? "default" : "outline"} className="px-6">
              Upload File
            </Button>
            <Button onClick={() => setShowUpload(false)} variant={!showUpload ? "default" : "outline"} className="px-6">
              Search Hash
            </Button>
          </div>

          {showUpload ? (
            <FileUploadZone />
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleSearchHash} className="space-y-4">
                <Input
                  placeholder="Enter MD5, SHA1, or SHA256 hash..."
                  value={searchHash}
                  onChange={(e) => {
                    setSearchHash(e.target.value)
                    setSearchError(null)
                  }}
                  disabled={isSearching}
                  className="p-3"
                />
                <Button type="submit" disabled={isSearching} className="w-full">
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </form>
              {searchError && (
                <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm border border-destructive/20">
                  {searchError}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
