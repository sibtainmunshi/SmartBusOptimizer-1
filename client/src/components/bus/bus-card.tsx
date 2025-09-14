import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, Wifi, Zap, Plane } from "lucide-react";
import { type ScheduleWithDetails } from "@shared/schema";

interface BusCardProps {
  schedule: ScheduleWithDetails;
  onSelectSeats: (schedule: ScheduleWithDetails) => void;
}

export default function BusCard({ schedule, onSelectSeats }: BusCardProps) {
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

  const getAmenityColor = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return "accent";
      case "ac":
        return "secondary";
      case "charging ports":
        return "primary";
      default:
        return "muted";
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateDuration = () => {
    const departure = new Date(schedule.departureTime);
    const arrival = new Date(schedule.arrivalTime);
    const diffMs = arrival.getTime() - departure.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="shadow-lg border border-border" data-testid={`card-bus-${schedule.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground" data-testid={`text-bus-name-${schedule.id}`}>
                  {schedule.route.name} - Bus {schedule.bus.number}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-bus-operator-${schedule.id}`}>
                  {schedule.bus.operator}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Departure</p>
                <p className="font-semibold text-foreground" data-testid={`text-departure-time-${schedule.id}`}>
                  {formatTime(schedule.departureTime)}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-departure-location-${schedule.id}`}>
                  {schedule.route.fromLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arrival</p>
                <p className="font-semibold text-foreground" data-testid={`text-arrival-time-${schedule.id}`}>
                  {formatTime(schedule.arrivalTime)}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-arrival-location-${schedule.id}`}>
                  {schedule.route.toLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold text-foreground" data-testid={`text-duration-${schedule.id}`}>
                  {calculateDuration()}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-available-seats-${schedule.id}`}>
                  {schedule.availableSeats} seats available
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {schedule.bus.amenities.map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`inline-flex items-center space-x-1 bg-${getAmenityColor(amenity)}/10 text-${getAmenityColor(amenity)}`}
                  data-testid={`badge-amenity-${schedule.id}-${index}`}
                >
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4 lg:mt-0 lg:ml-6 text-right">
            <p className="text-2xl font-bold text-foreground" data-testid={`text-price-${schedule.id}`}>
              ${schedule.price}
            </p>
            <Button
              onClick={() => onSelectSeats(schedule)}
              className="mt-2"
              data-testid={`button-select-seats-${schedule.id}`}
            >
              Select Seats
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
