import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type ScheduleWithDetails } from "@shared/schema";
import { X } from "lucide-react";

interface SeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleWithDetails;
}

export default function SeatSelectionModal({ isOpen, onClose, schedule }: SeatSelectionModalProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerDetails, setPassengerDetails] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate seat layout (4 rows, 2x2 configuration)
  const generateSeats = () => {
    const seats = [];
    const occupiedSeats = ["1C", "2D", "3B"]; // Mock occupied seats
    
    for (let row = 1; row <= Math.ceil(schedule.bus.capacity / 4); row++) {
      const rowSeats = [`${row}A`, `${row}B`, `${row}C`, `${row}D`];
      seats.push(rowSeats);
    }
    
    return { seats, occupiedSeats };
  };

  const { seats, occupiedSeats } = generateSeats();

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getSeatClass = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return "seat occupied";
    if (selectedSeats.includes(seatId)) return "seat selected";
    return "seat available";
  };

  const totalAmount = selectedSeats.length * parseFloat(schedule.price);

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/bookings", {
        scheduleId: schedule.id,
        seatNumbers: selectedSeats,
        totalAmount: totalAmount.toFixed(2),
        passengerDetails,
        paymentStatus: "completed",
        status: "confirmed",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: `Your seats ${selectedSeats.join(", ")} have been booked successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/user"] });
      onClose();
      setSelectedSeats([]);
      setPassengerDetails({ name: "", phone: "", email: "" });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to complete your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/payment/process", {
        amount: totalAmount.toFixed(2),
        bookingId: "temp", // Would be actual booking ID in real implementation
      });
      return res.json();
    },
    onSuccess: () => {
      bookingMutation.mutate();
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Payment could not be processed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No Seats Selected",
        description: "Please select at least one seat to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!passengerDetails.name || !passengerDetails.phone || !passengerDetails.email) {
      toast({
        title: "Missing Details",
        description: "Please fill in all passenger details.",
        variant: "destructive",
      });
      return;
    }

    paymentMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-seat-selection">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="text-modal-title">Select Your Seats</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seat Map */}
          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="text-bus-layout-title">
              Bus Layout - {schedule.bus.number}
            </h4>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-center mb-4">
                <Badge variant="outline" data-testid="badge-driver">Driver</Badge>
              </div>

              <div className="space-y-3">
                {seats.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <div
                        className={getSeatClass(row[0])}
                        onClick={() => toggleSeat(row[0])}
                        data-testid={`seat-${row[0]}`}
                      />
                      <div
                        className={getSeatClass(row[1])}
                        onClick={() => toggleSeat(row[1])}
                        data-testid={`seat-${row[1]}`}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground" data-testid={`text-row-${rowIndex + 1}`}>
                      Row {rowIndex + 1}
                    </span>
                    <div className="flex space-x-2">
                      <div
                        className={getSeatClass(row[2])}
                        onClick={() => toggleSeat(row[2])}
                        data-testid={`seat-${row[2]}`}
                      />
                      <div
                        className={getSeatClass(row[3])}
                        onClick={() => toggleSeat(row[3])}
                        data-testid={`seat-${row[3]}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center space-x-6 mt-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="seat available" />
                  <span className="text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="seat occupied" />
                  <span className="text-muted-foreground">Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="seat selected" />
                  <span className="text-muted-foreground">Selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="text-booking-summary-title">
              Booking Summary
            </h4>
            <div className="bg-muted rounded-lg p-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Route</p>
                <p className="font-medium text-foreground" data-testid="text-route-summary">
                  {schedule.route.fromLocation} → {schedule.route.toLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium text-foreground" data-testid="text-datetime-summary">
                  {new Date(schedule.departureTime).toLocaleDateString()} - {new Date(schedule.departureTime).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Seats</p>
                <p className="font-medium text-foreground" data-testid="text-selected-seats">
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None selected"}
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Total Amount</span>
                  <span className="font-bold text-foreground" data-testid="text-total-amount">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h5 className="font-medium text-foreground">Passenger Details</h5>
                <div>
                  <Label htmlFor="passenger-name">Full Name</Label>
                  <Input
                    id="passenger-name"
                    placeholder="Enter passenger name"
                    value={passengerDetails.name}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, name: e.target.value })}
                    data-testid="input-passenger-name"
                  />
                </div>
                <div>
                  <Label htmlFor="passenger-phone">Phone Number</Label>
                  <Input
                    id="passenger-phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={passengerDetails.phone}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, phone: e.target.value })}
                    data-testid="input-passenger-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="passenger-email">Email</Label>
                  <Input
                    id="passenger-email"
                    type="email"
                    placeholder="Enter email address"
                    value={passengerDetails.email}
                    onChange={(e) => setPassengerDetails({ ...passengerDetails, email: e.target.value })}
                    data-testid="input-passenger-email"
                  />
                </div>
              </div>

              <Button
                onClick={handleProceedToPayment}
                className="w-full"
                disabled={paymentMutation.isPending || bookingMutation.isPending}
                data-testid="button-proceed-payment"
              >
                {paymentMutation.isPending || bookingMutation.isPending
                  ? "Processing..."
                  : "Proceed to Payment"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
