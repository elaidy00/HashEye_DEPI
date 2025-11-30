import { NextResponse } from "next/server"

const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY

export async function POST(request: Request) {
  try {
    if (!VT_API_KEY) {
      return NextResponse.json({ error: "VirusTotal API key not configured" }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Submit file to VirusTotal
    const vtFormData = new FormData()
    vtFormData.append("file", file)

    const response = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: {
        "x-apikey": VT_API_KEY,
      },
      body: vtFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("VirusTotal submit error:", errorData)
      return NextResponse.json({ error: "Failed to submit file to VirusTotal" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      analysis_id: data.data.id,
      message: "File submitted for scanning",
    })
  } catch (error) {
    console.error("File submission error:", error)
    return NextResponse.json({ error: "Failed to submit file" }, { status: 500 })
  }
}
