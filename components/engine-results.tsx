"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

export function EngineResults({ engines }: { engines: any[] }) {
  const [expandedEngine, setExpandedEngine] = useState<string | null>(null)

  const maliciousEngines = engines.filter((e) => e.detected)
  const cleanEngines = engines.filter((e) => !e.detected)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Antivirus Scan Results</h2>

      {maliciousEngines.length > 0 && (
        <Card className="p-4 border-l-4 border-destructive overflow-hidden">
          <h3 className="font-semibold text-destructive mb-3">
            Detected by {maliciousEngines.length} Engine{maliciousEngines.length !== 1 ? "s" : ""}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {maliciousEngines.map((engine, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2 hover:bg-card/50 rounded">
                <div className="text-destructive font-bold mt-0.5">×</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-destructive">{engine.engine}</p>
                  {engine.result && <p className="text-xs text-muted-foreground break-words">{engine.result}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 border-l-4 border-secondary">
        <h3 className="font-semibold text-secondary-foreground mb-3">
          Clean from {cleanEngines.length} Engine{cleanEngines.length !== 1 ? "s" : ""}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {cleanEngines.map((engine, idx) => (
            <div key={idx} className="text-xs p-2 bg-card rounded hover:bg-muted/50 transition-colors">
              <p className="text-muted-foreground">{engine.engine}</p>
              <p className="text-secondary-foreground font-medium">Clean</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
