import { useEffect, useRef } from "react";
import { type BusWithLocation } from "@shared/schema";

interface BusMapProps {
  buses: BusWithLocation[];
}

export default function BusMap({ buses }: BusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Check if Leaflet is available
    if (typeof window !== "undefined" && (window as any).L && mapRef.current && !mapInstanceRef.current) {
      const L = (window as any).L;
      
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([40.7128, -74.0060], 12);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && buses.length > 0) {
      const L = (window as any).L;
      
      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Add bus markers
      buses.forEach((bus) => {
        if (bus.location) {
          const marker = L.marker([
            parseFloat(bus.location.latitude),
            parseFloat(bus.location.longitude)
          ]).addTo(mapInstanceRef.current);

          const statusColor = bus.location.delay > 0 ? "red" : "green";
          const occupancyPercent = Math.round((bus.location.occupancy / bus.capacity) * 100);

          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">Route ${bus.number}</h3>
              <p class="text-sm">Operator: ${bus.operator}</p>
              <p class="text-sm">Current Stop: ${bus.location.currentStop || "En Route"}</p>
              <p class="text-sm">Occupancy: ${occupancyPercent}%</p>
              <p class="text-sm" style="color: ${statusColor}">
                Status: ${bus.location.delay > 0 ? `Delayed ${bus.location.delay}min` : "On Time"}
              </p>
            </div>
          `);

          markersRef.current.push(marker);
        }
      });
    }
  }, [buses]);

  // Fallback if Leaflet is not available
  if (typeof window === "undefined" || !(window as any).L) {
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center" data-testid="map-fallback">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading map...</p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {buses.slice(0, 4).map((bus, index) => (
              <div key={bus.id} className="bg-card p-3 rounded border border-border" data-testid={`bus-card-${index}`}>
                <p className="font-medium text-foreground">Route {bus.number}</p>
                <p className="text-sm text-muted-foreground">{bus.operator}</p>
                {bus.location && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {bus.location.currentStop || "En Route"}
                    </p>
                    <p className="text-xs text-accent">
                      {bus.location.delay > 0 ? `Delayed ${bus.location.delay}min` : "On Time"}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-96 w-full rounded-lg" data-testid="leaflet-map" />
      {/* Load Leaflet CSS and JS dynamically */}
      <style jsx>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      `}</style>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" async />
    </div>
  );
}
