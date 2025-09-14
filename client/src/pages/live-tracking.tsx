import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BusMap from "@/components/map/bus-map";
import { useWebSocket } from "@/hooks/use-websocket";
import { Clock, MapPin, Users, TrendingUp } from "lucide-react";
import { type BusWithLocation } from "@shared/schema";

export default function LiveTracking() {
  const { data: buses, isLoading } = useQuery<BusWithLocation[]>({
    queryKey: ["/api/buses/locations"],
  });

  // WebSocket for real-time updates
  useWebSocket("/ws", {
    onMessage: (data: any) => {
      if (data.type === "bus_locations_update") {
        // Handle real-time bus location updates
        console.log("Bus locations updated:", data.data);
      }
    },
  });

  const activeBuses = buses?.filter((bus: BusWithLocation) => bus.location) || [];
  const featuredBus = activeBuses[0]; // First bus as featured

  if (isLoading) {
    return (
      <div className="py-16 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading live bus tracking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12" data-testid="text-page-title">
          Live Bus Tracking
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg" data-testid="card-bus-map">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Real-Time Bus Locations</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track all active buses on your route
                </p>
              </CardHeader>
              <CardContent>
                <BusMap buses={activeBuses} />
              </CardContent>
            </Card>
          </div>

          {/* Bus Status Sidebar */}
          <div className="space-y-4">
            {/* Featured Bus Status */}
            {featuredBus && featuredBus.location && (
              <Card className="shadow-lg" data-testid={`card-featured-bus-${featuredBus.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Your Bus - Route {featuredBus.number}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="secondary" className="bg-accent/10 text-accent" data-testid="badge-bus-status">
                      {featuredBus.location.delay > 0 ? "Delayed" : "On Time"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Stop</span>
                    <span className="font-medium text-foreground" data-testid="text-current-stop">
                      {featuredBus.location.currentStop || "En Route"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ETA</span>
                    <span className="font-medium text-foreground" data-testid="text-eta">
                      {featuredBus.location.delay > 0 ? `${8 + featuredBus.location.delay} mins` : "8 mins"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium text-foreground" data-testid="text-occupancy">
                      {Math.round((featuredBus.location.occupancy / featuredBus.capacity) * 100)}%
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Progress 
                      value={45} 
                      className="w-full" 
                      data-testid="progress-journey"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      45% of journey completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nearby Buses */}
            <Card className="shadow-lg" data-testid="card-nearby-buses">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-secondary" />
                  <span>Nearby Buses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeBuses.slice(1, 3).map((bus: BusWithLocation, index) => (
                    <div 
                      key={bus.id} 
                      className="flex items-center justify-between p-2 bg-muted rounded"
                      data-testid={`item-nearby-bus-${index}`}
                    >
                      <div>
                        <p className="font-medium text-foreground">Route {bus.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {bus.location?.currentStop || "En Route"}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {12 + index * 8} mins
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Journey Details */}
            <Card className="shadow-lg" data-testid="card-journey-details">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span>Journey Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Departure: 09:30 AM</p>
                      <p className="text-xs text-muted-foreground">Downtown Terminal</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-muted border-2 border-primary rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Current: 10:15 AM</p>
                      <p className="text-xs text-muted-foreground">Central Plaza</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-muted border-2 border-muted-foreground rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Arrival: 11:15 AM</p>
                      <p className="text-xs text-muted-foreground">Airport Terminal</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
