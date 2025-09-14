/**
 * Simple time-series prediction utilities for bus demand forecasting
 */

export interface DemandData {
  timestamp: Date;
  passengers: number;
  routeId: string;
}

export interface PredictionResult {
  predictedDemand: number;
  confidence: number;
  trend: "increasing" | "decreasing" | "stable";
}

/**
 * Simple moving average prediction
 */
export function movingAveragePrediction(
  historicalData: DemandData[],
  windowSize: number = 7
): PredictionResult {
  if (historicalData.length < windowSize) {
    return {
      predictedDemand: 0,
      confidence: 0,
      trend: "stable",
    };
  }

  // Sort data by timestamp
  const sortedData = [...historicalData].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Calculate moving average for the last windowSize periods
  const recentData = sortedData.slice(-windowSize);
  const average = recentData.reduce((sum, data) => sum + data.passengers, 0) / windowSize;

  // Calculate trend
  const firstHalf = recentData.slice(0, Math.floor(windowSize / 2));
  const secondHalf = recentData.slice(Math.floor(windowSize / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, data) => sum + data.passengers, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, data) => sum + data.passengers, 0) / secondHalf.length;
  
  let trend: "increasing" | "decreasing" | "stable" = "stable";
  const trendThreshold = 0.1; // 10% change threshold
  
  if (secondHalfAvg > firstHalfAvg * (1 + trendThreshold)) {
    trend = "increasing";
  } else if (secondHalfAvg < firstHalfAvg * (1 - trendThreshold)) {
    trend = "decreasing";
  }

  // Calculate confidence based on data consistency
  const variance = recentData.reduce((sum, data) => 
    sum + Math.pow(data.passengers - average, 2), 0
  ) / windowSize;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / average;
  
  // Lower variation = higher confidence
  const confidence = Math.max(0, Math.min(1, 1 - coefficientOfVariation));

  return {
    predictedDemand: Math.round(average),
    confidence,
    trend,
  };
}

/**
 * Seasonal prediction considering day of week and hour patterns
 */
export function seasonalPrediction(
  historicalData: DemandData[],
  targetDate: Date
): PredictionResult {
  const targetDayOfWeek = targetDate.getDay();
  const targetHour = targetDate.getHours();

  // Filter data for same day of week and hour
  const relevantData = historicalData.filter(data => {
    const dayOfWeek = data.timestamp.getDay();
    const hour = data.timestamp.getHours();
    return dayOfWeek === targetDayOfWeek && hour === targetHour;
  });

  if (relevantData.length === 0) {
    return {
      predictedDemand: 0,
      confidence: 0,
      trend: "stable",
    };
  }

  // Use moving average on seasonal data
  return movingAveragePrediction(relevantData, Math.min(4, relevantData.length));
}

/**
 * Peak hour detection
 */
export function detectPeakHours(historicalData: DemandData[]): number[] {
  const hourlyAverages = new Map<number, number[]>();

  // Group data by hour
  historicalData.forEach(data => {
    const hour = data.timestamp.getHours();
    if (!hourlyAverages.has(hour)) {
      hourlyAverages.set(hour, []);
    }
    hourlyAverages.get(hour)!.push(data.passengers);
  });

  // Calculate average for each hour
  const averages = new Map<number, number>();
  hourlyAverages.forEach((passengers, hour) => {
    const avg = passengers.reduce((sum, p) => sum + p, 0) / passengers.length;
    averages.set(hour, avg);
  });

  // Find hours with above-average demand
  const overallAverage = Array.from(averages.values()).reduce((sum, avg) => sum + avg, 0) / averages.size;
  const peakThreshold = overallAverage * 1.2; // 20% above average

  return Array.from(averages.entries())
    .filter(([, avg]) => avg > peakThreshold)
    .map(([hour]) => hour)
    .sort((a, b) => a - b);
}

/**
 * Route optimization suggestion based on demand patterns
 */
export function suggestRouteOptimization(
  routeData: Map<string, DemandData[]>
): Array<{
  routeId: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
  expectedImprovement: number;
}> {
  const suggestions: Array<{
    routeId: string;
    suggestion: string;
    priority: "high" | "medium" | "low";
    expectedImprovement: number;
  }> = [];

  routeData.forEach((data, routeId) => {
    const prediction = movingAveragePrediction(data);
    const peakHours = detectPeakHours(data);

    // Low utilization suggestion
    if (prediction.predictedDemand < 20) {
      suggestions.push({
        routeId,
        suggestion: "Consider reducing frequency during off-peak hours",
        priority: "medium",
        expectedImprovement: 15,
      });
    }

    // High demand suggestion
    if (prediction.predictedDemand > 80 && prediction.confidence > 0.7) {
      suggestions.push({
        routeId,
        suggestion: "Add additional buses during peak hours",
        priority: "high",
        expectedImprovement: 25,
      });
    }

    // Peak hour optimization
    if (peakHours.length > 0) {
      suggestions.push({
        routeId,
        suggestion: `Optimize schedule for peak hours: ${peakHours.join(", ")}:00`,
        priority: "medium",
        expectedImprovement: 18,
      });
    }

    // Trend-based suggestions
    if (prediction.trend === "increasing" && prediction.confidence > 0.6) {
      suggestions.push({
        routeId,
        suggestion: "Prepare for increasing demand - consider capacity expansion",
        priority: "high",
        expectedImprovement: 20,
      });
    } else if (prediction.trend === "decreasing" && prediction.confidence > 0.6) {
      suggestions.push({
        routeId,
        suggestion: "Declining demand detected - review route efficiency",
        priority: "low",
        expectedImprovement: 10,
      });
    }
  });

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Generate mock historical data for testing
 */
export function generateMockDemandData(
  routeId: string,
  days: number = 30
): DemandData[] {
  const data: DemandData[] = [];
  const now = new Date();

  for (let day = 0; day < days; day++) {
    for (let hour = 6; hour < 22; hour++) {
      const timestamp = new Date(now);
      timestamp.setDate(now.getDate() - day);
      timestamp.setHours(hour, 0, 0, 0);

      // Simulate demand patterns
      let basePassengers = 30;

      // Peak hours (8-9 AM, 5-6 PM)
      if ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 18)) {
        basePassengers = 60;
      }

      // Weekend reduction
      const dayOfWeek = timestamp.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        basePassengers *= 0.7;
      }

      // Add some randomness
      const passengers = Math.max(
        0,
        Math.round(basePassengers + (Math.random() - 0.5) * 20)
      );

      data.push({
        timestamp,
        passengers,
        routeId,
      });
    }
  }

  return data.reverse(); // Most recent first
}
