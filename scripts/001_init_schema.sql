-- Create the files table to store uploaded files and their hashes
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_hash TEXT UNIQUE NOT NULL,
  md5_hash TEXT,
  sha1_hash TEXT,
  sha256_hash TEXT,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for fast hash lookups
CREATE INDEX IF NOT EXISTS idx_files_hash ON files(file_hash);
CREATE INDEX IF NOT EXISTS idx_files_md5 ON files(md5_hash);
CREATE INDEX IF NOT EXISTS idx_files_sha1 ON files(sha1_hash);
CREATE INDEX IF NOT EXISTS idx_files_sha256 ON files(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_files_created ON files(created_at DESC);

-- Create the scan_results table to store VirusTotal results
CREATE TABLE IF NOT EXISTS scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL,
  positives INT,
  total INT,
  detection_rate DECIMAL(5,2),
  last_analysis_date TIMESTAMP WITH TIME ZONE,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_results_file_id ON scan_results(file_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_verdict ON scan_results(verdict);
CREATE INDEX IF NOT EXISTS idx_scan_results_created ON scan_results(created_at DESC);

-- Create the engine_detections table to store per-engine results
CREATE TABLE IF NOT EXISTS engine_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_result_id UUID NOT NULL REFERENCES scan_results(id) ON DELETE CASCADE,
  engine_name TEXT NOT NULL,
  detected BOOLEAN NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engine_detections_scan ON engine_detections(scan_result_id);
CREATE INDEX IF NOT EXISTS idx_engine_detections_engine ON engine_detections(engine_name);

-- Create the scan_history table for audit trail
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  scan_result_id UUID REFERENCES scan_results(id) ON DELETE SET NULL,
  source TEXT,
  ip_address INET,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_history_file ON scan_history(file_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_created ON scan_history(created_at DESC);

-- Create the known_hashes table for external hash databases
CREATE TABLE IF NOT EXISTS known_hashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash TEXT UNIQUE NOT NULL,
  hash_type TEXT,
  source TEXT,
  verdict TEXT,
  metadata JSONB,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_known_hashes_hash ON known_hashes(hash);
CREATE INDEX IF NOT EXISTS idx_known_hashes_verdict ON known_hashes(verdict);

-- Enable Row Level Security (RLS) for security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_hashes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read for now, can restrict later)
CREATE POLICY "Enable read access for all users" ON files FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON scan_results FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON engine_detections FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON scan_history FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON known_hashes FOR SELECT USING (true);
