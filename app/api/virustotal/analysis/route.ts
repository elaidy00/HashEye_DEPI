import { NextResponse } from "next/server"

const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY

export async function GET(request: Request) {
  try {
    if (!VT_API_KEY) {
      return NextResponse.json({ error: "VirusTotal API key not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get("analysis_id")

    if (!analysisId) {
      return NextResponse.json({ error: "No analysis ID provided" }, { status: 400 })
    }

    const response = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      method: "GET",
      headers: {
        "x-apikey": VT_API_KEY,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch analysis status" }, { status: response.status })
    }

    const data = await response.json()
    const status = data.data.attributes.status // queued, in-progress, or completed

    return NextResponse.json({
      status,
      data: data.data.attributes,
    })
  } catch (error) {
    console.error("Analysis fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 })
  }
}
