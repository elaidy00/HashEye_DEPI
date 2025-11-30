"use server"

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return {
        id: null,
        error: "No file provided",
      }
    }

    // Calculate SHA256 hash using Web Crypto API
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const sha256 = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const submitFormData = new FormData()
    submitFormData.append("file", file)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const submitResponse = await fetch(`${baseUrl}/api/virustotal/submit`, {
      method: "POST",
      body: submitFormData,
    })

    if (submitResponse.ok) {
      const submitData = await submitResponse.json()
      console.log("[v0] File submitted to VirusTotal with analysis ID:", submitData.analysis_id)
    } else {
      console.warn("[v0] Failed to submit file to VirusTotal for initial scan")
    }

    // Return the SHA256 hash as ID
    return {
      id: sha256,
      error: null,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      id: null,
      error: "Failed to process file",
    }
  }
}
