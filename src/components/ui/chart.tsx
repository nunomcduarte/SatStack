"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  // Create CSS variables from config
  const style = React.useMemo(() => {
    return Object.entries(config).reduce((acc, [key, value]) => {
      acc[`--color-${key}`] = value.color
      return acc
    }, {} as Record<string, string>)
  }, [config])

  return (
    <div className={cn("w-full", className)} style={style} {...props}>
      {children}
    </div>
  )
}

export function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-1 flex flex-col gap-0.5">
        {payload.map((item: any) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">
                {item.name}:
              </span>
            </div>
            <span className="text-xs font-medium">
              {typeof item.value === "number"
                ? item.dataKey.includes("btc") || item.name.includes("BTC")
                  ? `₿ ${item.value.toFixed(2)}`
                  : `$${item.value.toLocaleString()}`
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Tooltip as ChartTooltip } from "recharts" 