"use client";

import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatCost } from "@/lib/ai/pricing";
import { getCostSummary } from "@/lib/storage/cost-store";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: React.ReactNode;
}

function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <Card className="border-[#2a2836] bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            {icon}
            <span>{title}</span>
          </div>
          <div className="mt-2 font-semibold text-2xl">{value}</div>
          {subtitle && (
            <div className="mt-1 text-muted-foreground text-xs">{subtitle}</div>
          )}
        </div>
        {trend && <div className="ml-2">{trend}</div>}
      </div>
    </Card>
  );
}

function MiniChart({ positive = true }: { positive?: boolean }) {
  const points = positive
    ? "0,20 10,18 20,15 30,17 40,12 50,10 60,8 70,5 80,3 90,0"
    : "0,0 10,2 20,5 30,3 40,8 50,10 60,12 70,15 80,17 90,20";

  return (
    <svg className="size-16" viewBox="0 0 90 20">
      <polyline
        className={positive ? "stroke-green-500" : "stroke-red-500"}
        fill="none"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function MetricsSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [metrics, setMetrics] = useState({
    totalCost: 0,
    sessionCost: 0,
    totalMessages: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    averageCostPerMessage: 0,
  });

  const loadMetrics = async () => {
    try {
      const summary = await getCostSummary();
      setMetrics(summary);
    } catch (error) {
      console.error("Failed to load metrics:", error);
    }
  };

  useEffect(() => {
    loadMetrics();

    // Refresh metrics every 5 seconds
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative flex h-dvh flex-col border-[#2a2836] border-l bg-background transition-all duration-300 ${isCollapsed ? "w-12" : "w-80"}`}
    >
      {/* Collapse/Expand Button */}
      <Button
        className="absolute left-0 top-1/2 z-10 h-16 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background p-0 shadow-md hover:bg-muted"
        onClick={() => setIsCollapsed(!isCollapsed)}
        size="sm"
        variant="outline"
      >
        {isCollapsed ? (
          <ChevronLeft className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </Button>

      {/* Metrics Content */}
      {!isCollapsed && (
        <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
          <MetricCard
            icon={<DollarSign className="size-3.5" />}
            subtitle="Total cost"
            title="Lifetime"
            trend={<MiniChart positive />}
            value={formatCost(metrics.totalCost)}
          />

          <MetricCard
            icon={<Activity className="size-3.5" />}
            subtitle="Messages sent"
            title="Activity"
            trend={<MiniChart positive />}
            value={metrics.totalMessages.toString()}
          />

          <MetricCard
            icon={<Wallet className="size-3.5" />}
            subtitle="Current session"
            title="Session Cost"
            trend={
              <MiniChart
                positive={metrics.sessionCost < metrics.totalCost * 0.1}
              />
            }
            value={formatCost(metrics.sessionCost)}
          />

          <MetricCard
            icon={<TrendingUp className="size-3.5" />}
            subtitle="Per message average"
            title="Efficiency"
            value={formatCost(metrics.averageCostPerMessage)}
          />

          <MetricCard
            icon={<Zap className="size-3.5" />}
            subtitle="Input tokens"
            title="Token Usage"
            value={
              Math.round(metrics.totalInputTokens / 1000).toLocaleString() + "K"
            }
          />

          <MetricCard
            icon={<BarChart3 className="size-3.5" />}
            subtitle="Output tokens"
            title="Generation"
            value={
              Math.round(metrics.totalOutputTokens / 1000).toLocaleString() +
              "K"
            }
          />
        </div>
      )}
    </div>
  );
}
