export async function calculateHashes(buffer: ArrayBuffer) {
  const hashAlgorithms = {
    md5: "MD5",
    sha1: "SHA-1",
    sha256: "SHA-256",
  }

  const hashes: { md5?: string; sha1?: string; sha256: string } = {
    sha256: "", // sha256 is required, others are optional
  }

  try {
    // Calculate SHA256 (supported by SubtleCrypto)
    const sha256Buffer = await crypto.subtle.digest("SHA-256", buffer)
    hashes.sha256 = Array.from(new Uint8Array(sha256Buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // Note: MD5 and SHA1 are not supported by SubtleCrypto for security reasons
    // For full compatibility, these would require a library like crypto-js
  } catch (error) {
    console.error("Error calculating hashes:", error)
    throw new Error("Failed to calculate file hash")
  }

  return hashes
}

export async function hashFile(file: File) {
  const buffer = await file.arrayBuffer()
  return calculateHashes(buffer)
}
