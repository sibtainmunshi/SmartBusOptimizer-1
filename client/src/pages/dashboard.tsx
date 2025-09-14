import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RidershipChart from "@/components/charts/ridership-chart";
import ScheduleChart from "@/components/charts/schedule-chart";
import { useWebSocket } from "@/hooks/use-websocket";
import { 
  Ticket, 
  DollarSign, 
  Shield, 
  Star, 
  Bus, 
  Users, 
  TrendingUp, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { type BookingWithDetails } from "@shared/schema";

interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "warning" | "success" | "info";
}

interface Analytics {
  activeBuses: number;
  todayPassengers: number;
  todayRevenue: string;
  routeEfficiency: string;
  ridershipData: {
    labels: string[];
    forecasted: number[];
    actual: number[];
  };
  scheduleData: {
    labels: string[];
    original: number[];
    optimized: number[];
  };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("passenger");

  // Fetch user bookings for passenger view
  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings/user"],
    enabled: activeTab === "passenger",
  });

  // Fetch admin analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
    enabled: activeTab === "admin",
  });

  // Fetch admin alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/admin/alerts"],
    enabled: activeTab === "admin",
  });

  // WebSocket for real-time updates
  useWebSocket("/ws", {
    onMessage: (data: any) => {
      if (data.type === "booking_created") {
        console.log("New booking created:", data.data);
      }
    },
  });

  const passengerStats = bookings ? {
    totalTrips: bookings.length,
    totalSpent: bookings.reduce((sum: number, booking: BookingWithDetails) => 
      sum + parseFloat(booking.totalAmount), 0
    ).toFixed(2),
    activeBookings: bookings.filter((booking: BookingWithDetails) => 
      booking.status === "confirmed"
    ).length,
    loyaltyPoints: Math.floor(parseFloat(bookings.reduce((sum: number, booking: BookingWithDetails) => 
      sum + parseFloat(booking.totalAmount), 0
    ).toFixed(2)) * 50), // 50 points per dollar
  } : { totalTrips: 0, totalSpent: "0.00", activeBookings: 0, loyaltyPoints: 0 };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <div className="py-16 bg-muted min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
            Dashboard
          </h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="passenger" data-testid="tab-passenger">
                Passenger View
              </TabsTrigger>
              <TabsTrigger value="admin" data-testid="tab-admin">
                Admin View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <TabsContent value="passenger" className="space-y-8">
          {/* Passenger Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg" data-testid="card-total-trips">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Total Trips</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-trips">
                      {passengerStats.totalTrips}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-total-spent">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-spent">
                      ${passengerStats.totalSpent}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-active-bookings">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Active Bookings</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-active-bookings">
                      {passengerStats.activeBookings}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-loyalty-points">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Loyalty Points</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-loyalty-points">
                      {passengerStats.loyaltyPoints.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card className="shadow-lg" data-testid="card-recent-bookings">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="mt-2 text-muted-foreground">Loading bookings...</p>
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking: BookingWithDetails) => {
                    const { date, time } = formatDateTime(booking.schedule.departureTime);
                    return (
                      <div 
                        key={booking.id} 
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        data-testid={`booking-item-${booking.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Bus className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground" data-testid={`text-booking-route-${booking.id}`}>
                              {booking.schedule.route.fromLocation} → {booking.schedule.route.toLocation}
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-booking-datetime-${booking.id}`}>
                              {date} - {time}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Seats: {booking.seatNumbers.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground" data-testid={`text-booking-amount-${booking.id}`}>
                            ${booking.totalAmount}
                          </p>
                          <Badge 
                            variant={booking.status === "confirmed" ? "default" : "secondary"}
                            data-testid={`badge-booking-status-${booking.id}`}
                          >
                            {booking.status === "confirmed" ? "Confirmed" : booking.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="empty-bookings">
                  <p className="text-muted-foreground">No bookings found. Start booking your first trip!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-8">
          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg" data-testid="card-active-buses">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bus className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Active Buses</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-admin-active-buses">
                      {analytics?.activeBuses || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-today-passengers">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Today's Passengers</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-admin-today-passengers">
                      {analytics?.todayPassengers?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-today-revenue">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-admin-today-revenue">
                      ${analytics?.todayRevenue || "0.00"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-route-efficiency">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Route Efficiency</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-admin-route-efficiency">
                      {analytics?.routeEfficiency || "0"}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-lg" data-testid="card-ridership-chart">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Ridership Analytics</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Forecasted vs Actual passenger demand
                </p>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <RidershipChart data={analytics?.ridershipData} />
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="card-schedule-chart">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span>Schedule Optimization</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Original vs Optimized schedules
                </p>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <ScheduleChart data={analytics?.scheduleData} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Real-time Alerts */}
          <Card className="shadow-lg" data-testid="card-admin-alerts">
            <CardHeader>
              <CardTitle>Real-time Alerts</CardTitle>
              <p className="text-sm text-muted-foreground">
                System notifications and updates
              </p>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="mt-2 text-muted-foreground">Loading alerts...</p>
                </div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert: Alert) => (
                    <div 
                      key={alert.id} 
                      className={`flex items-start space-x-4 p-4 border rounded-lg ${getAlertBgColor(alert.type)}`}
                      data-testid={`alert-item-${alert.id}`}
                    >
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground" data-testid={`text-alert-title-${alert.id}`}>
                          {alert.title}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-alert-description-${alert.id}`}>
                          {alert.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`text-alert-timestamp-${alert.id}`}>
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="empty-alerts">
                  <p className="text-muted-foreground">No alerts at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
}
