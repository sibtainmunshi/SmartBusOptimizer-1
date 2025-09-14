import { useEffect, useRef } from "react";

interface RidershipData {
  labels: string[];
  forecasted: number[];
  actual: number[];
}

interface RidershipChartProps {
  data?: RidershipData;
}

export default function RidershipChart({ data }: RidershipChartProps) {
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
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Forecasted",
            data: data.forecasted,
            borderColor: "hsl(207 90% 54%)",
            backgroundColor: "hsla(207 90% 54% / 0.1)",
            tension: 0.4,
            fill: false,
          },
          {
            label: "Actual",
            data: data.actual,
            borderColor: "hsl(174 56% 47%)",
            backgroundColor: "hsla(174 56% 47% / 0.1)",
            tension: 0.4,
            fill: false,
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
              text: "Time",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Passengers",
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
      <div className="h-64 bg-muted rounded-lg flex items-center justify-center" data-testid="ridership-chart-fallback">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Ridership Analytics</p>
          {data && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-primary">
                <p className="font-semibold">Forecasted</p>
                <p>Avg: {Math.round(data.forecasted.reduce((a, b) => a + b, 0) / data.forecasted.length)}</p>
              </div>
              <div className="text-secondary">
                <p className="font-semibold">Actual</p>
                <p>Avg: {Math.round(data.actual.reduce((a, b) => a + b, 0) / data.actual.length)}</p>
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
        data-testid="ridership-chart-canvas"
      />
      {/* Load Chart.js if not already loaded */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js" async />
    </div>
  );
}
