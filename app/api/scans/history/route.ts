import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get("page") || "1"
    const limit = request.nextUrl.searchParams.get("limit") || "20"

    // TODO: Query database with pagination
    // For now, return mock data
    const mockScans = [
      {
        id: "1",
        file_name: "document.pdf",
        file_hash: "ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa",
        verdict: "CLEAN",
        positives: 0,
        total: 71,
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: "2",
        file_name: "image.jpg",
        file_hash: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
        verdict: "SUSPICIOUS",
        positives: 2,
        total: 71,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "3",
        file_name: "software.exe",
        file_hash: "bb01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa",
        verdict: "MALICIOUS",
        positives: 45,
        total: 71,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
      {
        id: "4",
        file_name: "archive.zip",
        file_hash: "cc01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa",
        verdict: "CLEAN",
        positives: 0,
        total: 71,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ]

    return NextResponse.json({
      scans: mockScans,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      total: mockScans.length,
    })
  } catch (error) {
    console.error("History fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch scan history" }, { status: 500 })
  }
}
