-- Insert sample file records
INSERT INTO files (file_name, file_hash, md5_hash, sha1_hash, sha256_hash, file_type, file_size)
VALUES
  (
    'clean-document.pdf',
    'ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa',
    '5d41402abc4b2a76b9719d911017c592',
    'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
    'ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa',
    'PDF',
    1024000
  ),
  (
    'suspicious-archive.zip',
    'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    '6d41402abc4b2a76b9719d911017c593',
    'baf4c61ddcc5e8a2dabede0f3b482cd9aea9434e',
    'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    'ZIP',
    5120000
  ),
  (
    'malicious-software.exe',
    'bb01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa',
    '7d41402abc4b2a76b9719d911017c594',
    'caf4c61ddcc5e8a2dabede0f3b482cd9aea9434f',
    'bb01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa',
    'PE executable',
    2048000
  )
ON CONFLICT (file_hash) DO NOTHING;

-- Insert sample scan results
INSERT INTO scan_results (file_id, verdict, positives, total, detection_rate)
SELECT id, 'CLEAN', 0, 71, 0.00 FROM files WHERE file_name = 'clean-document.pdf' LIMIT 1;

INSERT INTO scan_results (file_id, verdict, positives, total, detection_rate)
SELECT id, 'SUSPICIOUS', 2, 71, 2.82 FROM files WHERE file_name = 'suspicious-archive.zip' LIMIT 1;

INSERT INTO scan_results (file_id, verdict, positives, total, detection_rate)
SELECT id, 'MALICIOUS', 45, 71, 63.38 FROM files WHERE file_name = 'malicious-software.exe' LIMIT 1;
