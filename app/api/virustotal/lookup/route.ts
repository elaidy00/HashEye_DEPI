import { type NextRequest, NextResponse } from "next/server"

const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!VT_API_KEY) {
      return NextResponse.json({ error: "VirusTotal API key not configured" }, { status: 500 })
    }

    const { hash } = await request.json()

    if (!hash) {
      return NextResponse.json({ error: "Hash is required" }, { status: 400 })
    }

    const cleanHash = hash.trim().toLowerCase()

    const hashRegex = /^([a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/
    if (!hashRegex.test(cleanHash)) {
      return NextResponse.json(
        { error: "Invalid hash format. Use MD5 (32), SHA1 (40), or SHA256 (64) characters." },
        { status: 400 },
      )
    }

    return NextResponse.json({ scan: { id: cleanHash } })
  } catch (error) {
    console.error("VirusTotal lookup error:", error)
    return NextResponse.json({ error: "Failed to lookup file in VirusTotal" }, { status: 500 })
  }
}
