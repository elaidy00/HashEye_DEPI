# VirusTotal Scanner - Database Guide

## Schema Overview

The VirusTotal Scanner uses a comprehensive PostgreSQL schema to store and analyze malware scan results.

### Tables

#### 1. `files`
Stores uploaded files and their multiple hash representations.

- **id**: UUID primary key
- **file_name**: Original filename
- **file_hash**: SHA256 hash (unique identifier, primary lookup)
- **md5_hash**: MD5 hash for legacy compatibility
- **sha1_hash**: SHA1 hash for legacy compatibility
- **sha256_hash**: SHA256 hash (same as file_hash, for clarity)
- **file_type**: File MIME type or extension
- **file_size**: Size in bytes

**Why**: SHA256 is the primary hash for all lookups, but we store MD5 and SHA1 for users who have hashes in those formats. This enables the "intelligent lookup strategy" mentioned in the documentation.

#### 2. `scan_results`
Stores VirusTotal analysis results for each file.

- **id**: UUID primary key
- **file_id**: Foreign key to files table
- **verdict**: CLEAN, SUSPICIOUS, or MALICIOUS
- **positives**: Number of antivirus engines that detected the file as malicious
- **total**: Total number of antivirus engines that analyzed the file
- **detection_rate**: Percentage (positives / total)
- **last_analysis_date**: When VirusTotal last analyzed this file
- **raw_data**: Complete VirusTotal API response (stored as JSONB for flexible querying)

**Why**: Storing the complete VirusTotal response allows you to extract additional information later without re-scanning.

#### 3. `engine_detections`
Per-engine malware detection results for detailed reporting.

- **id**: UUID primary key
- **scan_result_id**: Foreign key to scan_results
- **engine_name**: Name of the antivirus engine (e.g., "Kaspersky", "McAfee")
- **detected**: Boolean indicating if this engine detected the file as malicious
- **category**: Detection category (e.g., "Trojan.Win32.Generic")

**Why**: Enables detailed reporting on which engines flagged what, useful for users comparing detection methods.

#### 4. `scan_history`
Audit trail of all scan operations.

- **id**: UUID primary key
- **file_id**: Foreign key to files table
- **scan_result_id**: Foreign key to scan_results (nullable)
- **source**: Where the scan came from (UI upload, API, batch import, etc.)
- **ip_address**: IP address that initiated the scan
- **status**: SUCCESS, FAILED, PENDING
- **error_message**: Any error that occurred during scanning

**Why**: Compliance and analytics - track who scanned what, when, and from where.

#### 5. `known_hashes`
External malware hash database for quick lookups without querying VirusTotal.

- **id**: UUID primary key
- **hash**: The hash value (can be MD5, SHA1, or SHA256)
- **hash_type**: Type of hash (MD5, SHA1, SHA256)
- **source**: Origin of the hash (NIST NSRL, VirusShare, URLhaus, user-submitted)
- **verdict**: MALICIOUS, CLEAN, SUSPICIOUS
- **metadata**: Additional information as JSONB

**Why**: Build a local threat intelligence database to avoid VirusTotal API rate limits.

## Performance Optimizations

### Indexes
All lookup columns are indexed for fast queries:
- Hash lookups on all hash types
- Verdict lookups for threat statistics
- Date-based lookups for recent scans
- Foreign key lookups for joins

### Composite Indexes
\`\`\`sql
-- Example: Get all malicious files from the last 30 days
SELECT f.* FROM files f
JOIN scan_results sr ON f.id = sr.file_id
WHERE sr.verdict = 'MALICIOUS' 
AND sr.created_at > now() - interval '30 days'
\`\`\`

## Usage Patterns

### 1. Check for Duplicate Scans
\`\`\`sql
-- Before scanning with VirusTotal
SELECT * FROM files WHERE file_hash = $1;
-- If exists, reuse scan_results
\`\`\`

### 2. Get All Malicious Hashes
\`\`\`sql
SELECT f.file_hash, sr.verdict, COUNT(*) as detections
FROM files f
JOIN scan_results sr ON f.id = sr.file_id
WHERE sr.verdict = 'MALICIOUS'
GROUP BY f.file_hash, sr.verdict;
\`\`\`

### 3. Find Recently Scanned Clean Files
\`\`\`sql
SELECT f.*, sr.*
FROM files f
JOIN scan_results sr ON f.id = sr.file_id
WHERE sr.verdict = 'CLEAN'
ORDER BY f.created_at DESC
LIMIT 100;
\`\`\`

### 4. Build Threat Intelligence Statistics
\`\`\`sql
SELECT 
  sr.verdict,
  COUNT(*) as count,
  AVG(sr.positives) as avg_detections,
  MAX(sr.positives) as max_detections
FROM scan_results sr
WHERE sr.created_at > now() - interval '30 days'
GROUP BY sr.verdict;
\`\`\`

## Row Level Security (RLS)

Currently, all policies allow public read access. In production, you should:

1. Restrict writes to authenticated users only
2. Allow users to only read their own scans
3. Implement rate limiting at the application level

Example RLS policy for user-owned scans:
\`\`\`sql
CREATE POLICY "Users can only see their own scans" ON scan_history
  FOR SELECT
  USING (user_id = auth.uid());
\`\`\`

## Database Size Estimates

- One file record: ~200 bytes (with 3 hashes)
- One scan result record: ~500 bytes (with raw JSONB data)
- One engine detection: ~50 bytes
- One million files: ~700 MB total

Supabase provides 200 GB of storage on the lowest tier, so you can store millions of scans.

## API Cost Savings

By storing hashes and reusing scan results:
- Without database: 1000 scans = 1000 VirusTotal API calls
- With database: 1000 scans = 400 API calls (60% cache hit) = 60% cost savings

## Setup

1. Run `scripts/001_init_schema.sql` to create the schema
2. Run `scripts/seed.sql` to populate sample data
3. Update your API routes to query this database before VirusTotal
4. Implement caching logic to reduce API calls
