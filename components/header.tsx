export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold">VirusTotal Scanner</h1>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Scan
            </a>
            <a href="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              History
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
