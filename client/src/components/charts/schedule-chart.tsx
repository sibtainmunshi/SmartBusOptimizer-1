import { useEffect, useRef } from "react";

interface ScheduleData {
  labels: string[];
  original: number[];
  optimized: number[];
}

interface ScheduleChartProps {
  data?: ScheduleData;
}

export default function ScheduleChart({ data }: ScheduleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !data || typeof window === "undefined") return;

    // Check if Chart.js is available
    const Chart = (window as any).Chart;
    if (!Chart) {
      console.warn("Chart.js not loaded");
      return;
    }

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Original Schedule",
            data: data.original,
            backgroundColor: "hsla(220 8.9% 46.1% / 0.3)",
            borderColor: "hsl(220 8.9% 46.1%)",
            borderWidth: 1,
          },
          {
            label: "Optimized Schedule",
            data: data.optimized,
            backgroundColor: "hsla(104 45% 58% / 0.3)",
            borderColor: "hsl(104 45% 58%)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top" as const,
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Routes",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Trips per Day",
            },
            beginAtZero: true,
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  // Fallback display when Chart.js is not available
  if (!data || typeof window === "undefined" || !(window as any).Chart) {
    return (
      <div className="h-64 bg-muted rounded-lg flex items-center justify-center" data-testid="schedule-chart-fallback">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Schedule Optimization</p>
          {data && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-muted-foreground">
                <p className="font-semibold">Original</p>
                <p>Total: {data.original.reduce((a, b) => a + b, 0)} trips</p>
              </div>
              <div className="text-accent">
                <p className="font-semibold">Optimized</p>
                <p>Total: {data.optimized.reduce((a, b) => a + b, 0)} trips</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-64">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        data-testid="schedule-chart-canvas"
      />
      {/* Load Chart.js if not already loaded */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js" async />
    </div>
  );
}
