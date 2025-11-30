"use client"

import type React from "react"

import { useState, useRef } from "react"
import { uploadFile } from "@/app/actions/upload"

export function FileUploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    try {
      setError(null)
      setIsLoading(true)

      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadFile(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.id) {
        window.location.href = `/results/${result.id}`
      }
    } catch (err) {
      setError("Failed to upload file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          disabled={isLoading}
          className="hidden"
          accept="*/*"
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div>
            <p className="text-lg font-semibold">{isLoading ? "Uploading..." : "Drag and drop your file here"}</p>
            <p className="text-sm text-muted-foreground">or click to select a file</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}
