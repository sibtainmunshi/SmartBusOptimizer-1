import { 
  type User, type InsertUser,
  type Route, type InsertRoute,
  type Bus, type InsertBus,
  type Schedule, type InsertSchedule, type ScheduleWithDetails,
  type Booking, type InsertBooking, type BookingWithDetails,
  type BusLocation, type InsertBusLocation,
  type DemandPrediction, type InsertDemandPrediction,
  type BusWithLocation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Routes
  getAllRoutes(): Promise<Route[]>;
  getRoute(id: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  searchRoutes(from: string, to: string): Promise<Route[]>;

  // Buses
  getAllBuses(): Promise<Bus[]>;
  getBus(id: string): Promise<Bus | undefined>;
  createBus(bus: InsertBus): Promise<Bus>;
  getBusesWithLocations(): Promise<BusWithLocation[]>;

  // Schedules
  getAllSchedules(): Promise<ScheduleWithDetails[]>;
  getSchedule(id: string): Promise<ScheduleWithDetails | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: string, updates: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  searchSchedules(routeId: string, date: Date): Promise<ScheduleWithDetails[]>;

  // Bookings
  getBooking(id: string): Promise<BookingWithDetails | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<BookingWithDetails[]>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;

  // Bus Locations
  getBusLocation(busId: string): Promise<BusLocation | undefined>;
  updateBusLocation(location: InsertBusLocation): Promise<BusLocation>;
  getAllBusLocations(): Promise<BusLocation[]>;

  // Demand Predictions
  getDemandPredictions(routeId: string, date: Date): Promise<DemandPrediction[]>;
  createDemandPrediction(prediction: InsertDemandPrediction): Promise<DemandPrediction>;
  updateDemandPrediction(id: string, actualDemand: number): Promise<DemandPrediction | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private routes: Map<string, Route> = new Map();
  private buses: Map<string, Bus> = new Map();
  private schedules: Map<string, Schedule> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private busLocations: Map<string, BusLocation> = new Map();
  private demandPredictions: Map<string, DemandPrediction> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create sample routes
    const route1: Route = {
      id: randomUUID(),
      name: "Downtown Express",
      fromLocation: "Downtown Terminal",
      toLocation: "Airport Terminal",
      distance: "25.5",
      estimatedDuration: 105,
      stops: ["Central Plaza", "Business District", "University Campus"],
      isActive: true,
    };

    const route2: Route = {
      id: randomUUID(),
      name: "University Loop",
      fromLocation: "University Campus",
      toLocation: "Shopping Mall",
      distance: "12.3",
      estimatedDuration: 45,
      stops: ["Library", "Student Center", "Medical Center"],
      isActive: true,
    };

    this.routes.set(route1.id, route1);
    this.routes.set(route2.id, route2);

    // Create sample buses
    const bus1: Bus = {
      id: randomUUID(),
      number: "101",
      operator: "Metro Transit Authority",
      capacity: 45,
      amenities: ["WiFi", "AC", "Charging Ports"],
      isActive: true,
    };

    const bus2: Bus = {
      id: randomUUID(),
      number: "205",
      operator: "City Bus Lines",
      capacity: 38,
      amenities: ["WiFi", "AC", "Reclining Seats"],
      isActive: true,
    };

    this.buses.set(bus1.id, bus1);
    this.buses.set(bus2.id, bus2);

    // Create sample schedules
    const schedule1: Schedule = {
      id: randomUUID(),
      busId: bus1.id,
      routeId: route1.id,
      departureTime: new Date("2024-01-15T09:30:00"),
      arrivalTime: new Date("2024-01-15T11:15:00"),
      price: "24.99",
      availableSeats: 23,
      status: "scheduled",
      isOptimized: false,
    };

    const schedule2: Schedule = {
      id: randomUUID(),
      busId: bus2.id,
      routeId: route1.id,
      departureTime: new Date("2024-01-15T12:00:00"),
      arrivalTime: new Date("2024-01-15T14:30:00"),
      price: "18.99",
      availableSeats: 18,
      status: "scheduled",
      isOptimized: false,
    };

    this.schedules.set(schedule1.id, schedule1);
    this.schedules.set(schedule2.id, schedule2);

    // Create sample bus locations
    const location1: BusLocation = {
      id: randomUUID(),
      busId: bus1.id,
      scheduleId: schedule1.id,
      latitude: "40.7589",
      longitude: "-73.9851",
      currentStop: "Central Plaza",
      occupancy: 31,
      delay: 0,
      updatedAt: new Date(),
    };

    const location2: BusLocation = {
      id: randomUUID(),
      busId: bus2.id,
      scheduleId: schedule2.id,
      latitude: "40.7282",
      longitude: "-74.0776",
      currentStop: "Business District",
      occupancy: 25,
      delay: 5,
      updatedAt: new Date(),
    };

    this.busLocations.set(bus1.id, location1);
    this.busLocations.set(bus2.id, location2);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      isAdmin: insertUser.isAdmin || false,
      phone: insertUser.phone || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Routes
  async getAllRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const route: Route = { 
      ...insertRoute, 
      id,
      isActive: insertRoute.isActive ?? true,
      stops: insertRoute.stops || []
    };
    this.routes.set(id, route);
    return route;
  }

  async searchRoutes(from: string, to: string): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(
      route => route.fromLocation === from && route.toLocation === to && route.isActive
    );
  }

  // Buses
  async getAllBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values());
  }

  async getBus(id: string): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async createBus(insertBus: InsertBus): Promise<Bus> {
    const id = randomUUID();
    const bus: Bus = { 
      ...insertBus, 
      id,
      isActive: insertBus.isActive ?? true,
      amenities: insertBus.amenities || []
    };
    this.buses.set(id, bus);
    return bus;
  }

  async getBusesWithLocations(): Promise<BusWithLocation[]> {
    const buses = Array.from(this.buses.values());
    return buses.map(bus => ({
      ...bus,
      location: this.busLocations.get(bus.id)
    }));
  }

  // Schedules
  async getAllSchedules(): Promise<ScheduleWithDetails[]> {
    const schedules = Array.from(this.schedules.values());
    return schedules.map(schedule => ({
      ...schedule,
      bus: this.buses.get(schedule.busId)!,
      route: this.routes.get(schedule.routeId)!,
    }));
  }

  async getSchedule(id: string): Promise<ScheduleWithDetails | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;

    return {
      ...schedule,
      bus: this.buses.get(schedule.busId)!,
      route: this.routes.get(schedule.routeId)!,
    };
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = randomUUID();
    const schedule: Schedule = { 
      ...insertSchedule, 
      id,
      status: insertSchedule.status || "scheduled",
      isOptimized: insertSchedule.isOptimized ?? false
    };
    this.schedules.set(id, schedule);
    return schedule;
  }

  async updateSchedule(id: string, updates: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;

    const updatedSchedule = { ...schedule, ...updates };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async searchSchedules(routeId: string, date: Date): Promise<ScheduleWithDetails[]> {
    const schedules = Array.from(this.schedules.values()).filter(
      schedule => schedule.routeId === routeId && 
      schedule.departureTime.toDateString() === date.toDateString()
    );

    return schedules.map(schedule => ({
      ...schedule,
      bus: this.buses.get(schedule.busId)!,
      route: this.routes.get(schedule.routeId)!,
    }));
  }

  // Bookings
  async getBooking(id: string): Promise<BookingWithDetails | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const schedule = await this.getSchedule(booking.scheduleId);
    if (!schedule) return undefined;

    return {
      ...booking,
      schedule,
    };
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      bookedAt: new Date(),
      status: insertBooking.status || "confirmed",
      paymentStatus: insertBooking.paymentStatus || "completed"
    };
    this.bookings.set(id, booking);

    // Update available seats
    const schedule = this.schedules.get(insertBooking.scheduleId);
    if (schedule) {
      schedule.availableSeats -= insertBooking.seatNumbers.length;
      this.schedules.set(schedule.id, schedule);
    }

    return booking;
  }

  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const userBookings = Array.from(this.bookings.values()).filter(
      booking => booking.userId === userId
    );

    const bookingsWithDetails = await Promise.all(
      userBookings.map(async booking => {
        const schedule = await this.getSchedule(booking.scheduleId);
        return {
          ...booking,
          schedule: schedule!,
        };
      })
    );

    return bookingsWithDetails;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Bus Locations
  async getBusLocation(busId: string): Promise<BusLocation | undefined> {
    return this.busLocations.get(busId);
  }

  async updateBusLocation(insertLocation: InsertBusLocation): Promise<BusLocation> {
    const existingLocation = this.busLocations.get(insertLocation.busId);
    
    if (existingLocation) {
      const updatedLocation: BusLocation = {
        ...existingLocation,
        ...insertLocation,
        updatedAt: new Date(),
      };
      this.busLocations.set(insertLocation.busId, updatedLocation);
      return updatedLocation;
    } else {
      const id = randomUUID();
      const location: BusLocation = {
        ...insertLocation,
        id,
        updatedAt: new Date(),
        scheduleId: insertLocation.scheduleId || null,
        currentStop: insertLocation.currentStop || null,
        occupancy: insertLocation.occupancy || 0,
        delay: insertLocation.delay || 0
      };
      this.busLocations.set(insertLocation.busId, location);
      return location;
    }
  }

  async getAllBusLocations(): Promise<BusLocation[]> {
    return Array.from(this.busLocations.values());
  }

  // Demand Predictions
  async getDemandPredictions(routeId: string, date: Date): Promise<DemandPrediction[]> {
    return Array.from(this.demandPredictions.values()).filter(
      prediction => prediction.routeId === routeId &&
      prediction.date.toDateString() === date.toDateString()
    );
  }

  async createDemandPrediction(insertPrediction: InsertDemandPrediction): Promise<DemandPrediction> {
    const id = randomUUID();
    const prediction: DemandPrediction = {
      ...insertPrediction,
      id,
      createdAt: new Date(),
      actualDemand: insertPrediction.actualDemand || null,
      accuracy: insertPrediction.accuracy || null
    };
    this.demandPredictions.set(id, prediction);
    return prediction;
  }

  async updateDemandPrediction(id: string, actualDemand: number): Promise<DemandPrediction | undefined> {
    const prediction = this.demandPredictions.get(id);
    if (!prediction) return undefined;

    const accuracy = Math.abs(prediction.predictedDemand - actualDemand) / prediction.predictedDemand * 100;
    const updatedPrediction = {
      ...prediction,
      actualDemand,
      accuracy: (100 - accuracy).toFixed(2),
    };
    
    this.demandPredictions.set(id, updatedPrediction);
    return updatedPrediction;
  }
}

export const storage = new MemStorage();
