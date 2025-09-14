import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertBookingSchema, insertBusLocationSchema } from "@shared/schema";
import { z } from "zod";

// Session user type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        isAdmin: boolean;
      };
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Helper function to broadcast to all connected clients
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Simulate GPS updates every 30 seconds
  setInterval(async () => {
    const buses = await storage.getBusesWithLocations();
    const updates = buses.map(bus => {
      if (bus.location) {
        // Simulate movement
        const newLat = parseFloat(bus.location.latitude) + (Math.random() - 0.5) * 0.001;
        const newLng = parseFloat(bus.location.longitude) + (Math.random() - 0.5) * 0.001;
        const newOccupancy = Math.max(0, Math.min(bus.capacity, bus.location.occupancy + Math.floor(Math.random() * 10 - 5)));
        
        return {
          busId: bus.id,
          latitude: newLat.toString(),
          longitude: newLng.toString(),
          occupancy: newOccupancy,
          currentStop: bus.location.currentStop,
          delay: bus.location.delay,
        };
      }
      return null;
    }).filter(Boolean);

    // Update locations in storage and broadcast
    for (const update of updates) {
      if (update) {
        await storage.updateBusLocation(update);
      }
    }

    broadcast({
      type: 'bus_locations_update',
      data: updates,
    });
  }, 30000);

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // Mock session for demo (in production, use proper session middleware)
  app.use((req, res, next) => {
    // Mock authenticated user for demo - temporarily admin for testing
    req.user = {
      id: 'demo-user-1',
      email: 'demo@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: true, // Set to true for admin dashboard testing
    };
    next();
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin } });
    } catch (error) {
      res.status(400).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    res.json({ user: req.user });
  });

  // Routes
  app.get('/api/routes', async (req, res) => {
    try {
      const routes = await storage.getAllRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch routes' });
    }
  });

  app.get('/api/routes/search', async (req, res) => {
    try {
      const { from, to } = req.query;
      if (!from || !to) {
        return res.status(400).json({ message: 'From and to locations are required' });
      }
      
      const routes = await storage.searchRoutes(from as string, to as string);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to search routes' });
    }
  });

  // Schedules
  app.get('/api/schedules', async (req, res) => {
    try {
      const schedules = await storage.getAllSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch schedules' });
    }
  });

  app.get('/api/schedules/search', async (req, res) => {
    try {
      const { routeId, date } = req.query;
      if (!routeId || !date) {
        return res.status(400).json({ message: 'Route ID and date are required' });
      }
      
      const searchDate = new Date(date as string);
      const schedules = await storage.searchSchedules(routeId as string, searchDate);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to search schedules' });
    }
  });

  // Bookings
  app.post('/api/bookings', requireAuth, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const booking = await storage.createBooking(bookingData);
      
      // Broadcast booking update
      broadcast({
        type: 'booking_created',
        data: { bookingId: booking.id, scheduleId: booking.scheduleId },
      });
      
      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create booking' });
    }
  });

  app.get('/api/bookings/user', requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getUserBookings(req.user!.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user bookings' });
    }
  });

  app.get('/api/bookings/:id', requireAuth, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Check if user owns booking or is admin
      if (booking.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch booking' });
    }
  });

  // Bus tracking
  app.get('/api/buses/locations', async (req, res) => {
    try {
      const buses = await storage.getBusesWithLocations();
      res.json(buses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bus locations' });
    }
  });

  app.get('/api/buses/:id/location', async (req, res) => {
    try {
      const location = await storage.getBusLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ message: 'Bus location not found' });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bus location' });
    }
  });

  // Payment simulation
  app.post('/api/payment/process', requireAuth, async (req, res) => {
    try {
      const { bookingId, amount } = req.body;
      
      // Simulate payment processing with random success/failure
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      setTimeout(() => {
        if (isSuccess) {
          res.json({ 
            success: true, 
            transactionId: `txn_${Date.now()}`,
            message: 'Payment processed successfully' 
          });
        } else {
          res.status(400).json({ 
            success: false, 
            message: 'Payment failed. Please try again.' 
          });
        }
      }, 2000); // Simulate 2-second processing time
      
    } catch (error) {
      res.status(500).json({ message: 'Payment processing error' });
    }
  });

  // Admin routes
  app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
    try {
      const schedules = await storage.getAllSchedules();
      const busLocations = await storage.getAllBusLocations();
      
      const analytics = {
        activeBuses: busLocations.length,
        todayPassengers: Math.floor(Math.random() * 2000) + 1000, // Mock data
        todayRevenue: (Math.random() * 50000 + 20000).toFixed(2),
        routeEfficiency: (Math.random() * 20 + 80).toFixed(0),
        ridershipData: {
          labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
          forecasted: [45, 120, 85, 95, 140, 70],
          actual: [52, 115, 90, 88, 135, 75],
        },
        scheduleData: {
          labels: ['Route 1', 'Route 2', 'Route 3', 'Route 4', 'Route 5'],
          original: [24, 18, 32, 28, 22],
          optimized: [28, 22, 35, 31, 26],
        },
      };
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/admin/alerts', requireAdmin, async (req, res) => {
    try {
      const alerts = [
        {
          id: '1',
          title: 'Route 5 Delayed',
          description: 'Bus experiencing 15-minute delay due to traffic. Auto-rescheduling initiated.',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          type: 'warning',
        },
        {
          id: '2',
          title: 'Schedule Optimization Complete',
          description: 'Route 12 schedule updated successfully. 8% efficiency improvement achieved.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          type: 'success',
        },
        {
          id: '3',
          title: 'High Demand Detected',
          description: 'Route 3 showing 120% capacity. Additional bus deployed for peak hours.',
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          type: 'info',
        },
      ];
      
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  });

  return httpServer;
}
