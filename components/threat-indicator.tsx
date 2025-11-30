export function ThreatIndicator({ level }: { level: "clean" | "suspicious" | "malicious" }) {
  const config = {
    clean: {
      bg: "bg-secondary/20",
      text: "text-secondary-foreground",
      label: "Clean",
      icon: "✓",
    },
    suspicious: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      label: "Suspicious",
      icon: "!",
    },
    malicious: {
      bg: "bg-destructive/20",
      text: "text-destructive",
      label: "Malicious",
      icon: "✕",
    },
  }

  const { bg, text, label, icon } = config[level]

  return (
    <div className={`${bg} px-4 py-3 rounded-lg text-center min-w-max`}>
      <div className={`text-2xl font-bold ${text} mb-1`}>{icon}</div>
      <p className={`text-sm font-semibold ${text}`}>{label}</p>
    </div>
  )
}
