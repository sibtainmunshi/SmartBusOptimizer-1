import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, CheckCircle, Shield } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
  });

  const handleSearch = () => {
    // Store search params and navigate to booking page
    sessionStorage.setItem("searchParams", JSON.stringify(searchData));
    setLocation("/book");
  };

  const features = [
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description: "Track your bus live on the map with accurate GPS updates and estimated arrival times.",
      color: "primary",
    },
    {
      icon: CheckCircle,
      title: "Smart Scheduling",
      description: "AI-powered scheduling reduces wait times and optimizes routes based on demand patterns.",
      color: "secondary",
    },
    {
      icon: Shield,
      title: "Secure Booking",
      description: "Safe and secure payment processing with instant confirmation and digital tickets.",
      color: "accent",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-bg py-20">
        <div className="absolute inset-0 bg-primary/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6" data-testid="text-hero-title">
              Smart Bus Booking
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Book tickets, track buses in real-time, and experience the future of public transportation.
            </p>

            {/* Search Card */}
            <Card className="max-w-4xl mx-auto shadow-2xl" data-testid="card-search">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from" className="text-sm font-medium text-muted-foreground">
                      From
                    </Label>
                    <Select
                      value={searchData.from}
                      onValueChange={(value) => setSearchData({ ...searchData, from: value })}
                    >
                      <SelectTrigger id="from" data-testid="select-from">
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
                    <Label htmlFor="to" className="text-sm font-medium text-muted-foreground">
                      To
                    </Label>
                    <Select
                      value={searchData.to}
                      onValueChange={(value) => setSearchData({ ...searchData, to: value })}
                    >
                      <SelectTrigger id="to" data-testid="select-to">
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
                    <Label htmlFor="date" className="text-sm font-medium text-muted-foreground">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                      data-testid="input-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passengers" className="text-sm font-medium text-muted-foreground">
                      Passengers
                    </Label>
                    <Select
                      value={searchData.passengers}
                      onValueChange={(value) => setSearchData({ ...searchData, passengers: value })}
                    >
                      <SelectTrigger id="passengers" data-testid="select-passengers">
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

                <Button
                  onClick={handleSearch}
                  className="w-full md:w-auto mt-6 px-8 py-3"
                  size="lg"
                  data-testid="button-search-buses"
                >
                  Search Buses
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12" data-testid="text-features-title">
            Why Choose TransitFlow?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-lg" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3" data-testid={`text-feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
