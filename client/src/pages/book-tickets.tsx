import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BusCard from "@/components/bus/bus-card";
import SeatSelectionModal from "@/components/bus/seat-selection-modal";
import { Clock, MapPin, Users, Wifi, Zap, Plane } from "lucide-react";
import { type ScheduleWithDetails } from "@shared/schema";

export default function BookTickets() {
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
  });
  const [selectedBus, setSelectedBus] = useState<ScheduleWithDetails | null>(null);
  const [showSeatModal, setShowSeatModal] = useState(false);

  // Load search params from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("searchParams");
    if (saved) {
      setSearchParams(JSON.parse(saved));
    }
  }, []);

  const { data: schedules, isLoading } = useQuery<ScheduleWithDetails[]>({
    queryKey: ["/api/schedules"],
    enabled: !!searchParams.from && !!searchParams.to,
  });

  const handleSelectSeats = (schedule: ScheduleWithDetails) => {
    setSelectedBus(schedule);
    setShowSeatModal(true);
  };

  const handleSearch = () => {
    // Trigger refetch with new search params
    sessionStorage.setItem("searchParams", JSON.stringify(searchParams));
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4" />;
      case "charging ports":
        return <Zap className="w-4 h-4" />;
      case "ac":
        return <Plane className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-16 bg-muted min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-foreground mb-8" data-testid="text-page-title">
          Book Your Bus Tickets
        </h2>

        {/* Search Form */}
        <Card className="mb-8" data-testid="card-search-form">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search-from">From</Label>
                <Select
                  value={searchParams.from}
                  onValueChange={(value) => setSearchParams({ ...searchParams, from: value })}
                >
                  <SelectTrigger id="search-from" data-testid="select-search-from">
                    <SelectValue placeholder="Select departure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Downtown Terminal">Downtown Terminal</SelectItem>
                    <SelectItem value="Airport">Airport</SelectItem>
                    <SelectItem value="University Campus">University Campus</SelectItem>
                    <SelectItem value="Shopping Mall">Shopping Mall</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-to">To</Label>
                <Select
                  value={searchParams.to}
                  onValueChange={(value) => setSearchParams({ ...searchParams, to: value })}
                >
                  <SelectTrigger id="search-to" data-testid="select-search-to">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Airport Terminal">Airport Terminal</SelectItem>
                    <SelectItem value="Downtown Terminal">Downtown Terminal</SelectItem>
                    <SelectItem value="Business District">Business District</SelectItem>
                    <SelectItem value="Residential Area">Residential Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-date">Date</Label>
                <Input
                  id="search-date"
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                  data-testid="input-search-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-passengers">Passengers</Label>
                <Select
                  value={searchParams.passengers}
                  onValueChange={(value) => setSearchParams({ ...searchParams, passengers: value })}
                >
                  <SelectTrigger id="search-passengers" data-testid="select-search-passengers">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Passenger</SelectItem>
                    <SelectItem value="2">2 Passengers</SelectItem>
                    <SelectItem value="3">3 Passengers</SelectItem>
                    <SelectItem value="4">4+ Passengers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSearch} className="mt-4" data-testid="button-search-update">
              Update Search
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" data-testid="loading-spinner"></div>
            <p className="mt-4 text-muted-foreground">Searching for available buses...</p>
          </div>
        ) : schedules && schedules.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground" data-testid="text-results-title">
              Available Buses ({schedules.length} found)
            </h3>
            {schedules.map((schedule: ScheduleWithDetails) => (
              <BusCard
                key={schedule.id}
                schedule={schedule}
                onSelectSeats={handleSelectSeats}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12" data-testid="card-no-results">
            <CardContent>
              <p className="text-muted-foreground text-lg">
                {searchParams.from && searchParams.to
                  ? "No buses found for your search criteria. Please try different dates or routes."
                  : "Please select your departure and destination to search for available buses."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Seat Selection Modal */}
        {selectedBus && (
          <SeatSelectionModal
            isOpen={showSeatModal}
            onClose={() => setShowSeatModal(false)}
            schedule={selectedBus}
          />
        )}
      </div>
    </div>
  );
}
