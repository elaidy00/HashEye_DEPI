import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - in production this would query the database
  const mockScans = [
    {
      id: "1",
      file_name: "document.pdf",
      file_hash: "ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa",
      verdict: "CLEAN",
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: "2",
      file_name: "image.jpg",
      file_hash: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
      verdict: "SUSPICIOUS",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ]

  return NextResponse.json({ scans: mockScans })
}
