import { NextResponse } from "next/server"

const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    if (!VT_API_KEY) {
      return NextResponse.json({ error: "VirusTotal API key not configured" }, { status: 500 })
    }

    const hash = id

    const hashRegex = /^([a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/
    if (!hashRegex.test(hash.toLowerCase())) {
      return NextResponse.json({ error: "Invalid hash format" }, { status: 400 })
    }

    const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
      method: "GET",
      headers: {
        "x-apikey": VT_API_KEY,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "File pending scan",
            status: "pending",
          },
          { status: 404 },
        )
      }
      throw new Error(`VirusTotal API error: ${response.statusText}`)
    }

    const data = await response.json()
    const attributes = data.data.attributes

    if (!attributes.last_analysis_date) {
      return NextResponse.json(
        {
          error: "File pending scan",
          status: "pending",
        },
        { status: 404 },
      )
    }

    const engines = Object.entries(attributes.last_analysis_results || {}).map(([engine, result]: [string, any]) => ({
      engine,
      detected: result.detected,
      result: result.category,
    }))

    const totalDetections =
      (attributes.last_analysis_stats.malicious || 0) + (attributes.last_analysis_stats.suspicious || 0)

    const scanResult = {
      id: hash,
      file_name: attributes.meaningful_name || "Unknown",
      file_hash: attributes.sha256 || hash,
      md5_hash: attributes.md5,
      sha1_hash: attributes.sha1,
      file_size: attributes.size,
      file_type: attributes.type_description || "Unknown",
      verdict:
        attributes.last_analysis_stats.malicious > 0
          ? "MALICIOUS"
          : attributes.last_analysis_stats.suspicious > 0
            ? "SUSPICIOUS"
            : "CLEAN",
      positives: totalDetections,
      total: Object.keys(attributes.last_analysis_results || {}).length,
      created_at: new Date(attributes.last_analysis_date * 1000).toISOString(),
      engines,
    }

    return NextResponse.json({ scan: scanResult })
  } catch (error) {
    console.error("[v0] Scan fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch scan results" }, { status: 500 })
  }
}
