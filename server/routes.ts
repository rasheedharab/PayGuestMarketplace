import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPropertySchema, insertRoomSchema, insertBedSchema, insertBookingSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Test endpoint to verify server is working
  app.get('/api/health', async (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Property routes
  app.get('/api/properties', async (req, res) => {
    try {
      const { city, propertyType, minPrice, maxPrice, amenities, search } = req.query;
      const filters = {
        city: city as string,
        propertyType: propertyType as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        amenities: amenities ? (amenities as string).split(',') : undefined,
        search: search as string,
      };
      
      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.get('/api/my-properties', isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.user.claims.sub;
      const properties = await storage.getPropertiesByOwner(ownerId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching owner properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.post('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.user.claims.sub;
      const propertyData = insertPropertySchema.parse({ ...req.body, ownerId });
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const ownerId = req.user.claims.sub;
      
      // Verify ownership
      const property = await storage.getProperty(id);
      if (!property || property.ownerId !== ownerId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const propertyData = insertPropertySchema.partial().parse(req.body);
      const updatedProperty = await storage.updateProperty(id, propertyData);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const ownerId = req.user.claims.sub;
      
      // Verify ownership
      const property = await storage.getProperty(id);
      if (!property || property.ownerId !== ownerId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const success = await storage.deleteProperty(id);
      if (success) {
        res.json({ message: "Property deleted successfully" });
      } else {
        res.status(404).json({ message: "Property not found" });
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Room routes
  app.get('/api/properties/:propertyId/rooms', async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const rooms = await storage.getRoomsByProperty(propertyId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post('/api/properties/:propertyId/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const ownerId = req.user.claims.sub;
      
      // Verify ownership
      const property = await storage.getProperty(propertyId);
      if (!property || property.ownerId !== ownerId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const roomData = insertRoomSchema.parse({ ...req.body, propertyId });
      const room = await storage.createRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  // Bed routes
  app.get('/api/rooms/:roomId/beds', async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const beds = await storage.getBedsByRoom(roomId);
      res.json(beds);
    } catch (error) {
      console.error("Error fetching beds:", error);
      res.status(500).json({ message: "Failed to fetch beds" });
    }
  });

  app.get('/api/rooms/:roomId/available-beds', async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const beds = await storage.getAvailableBeds(roomId);
      res.json(beds);
    } catch (error) {
      console.error("Error fetching available beds:", error);
      res.status(500).json({ message: "Failed to fetch available beds" });
    }
  });

  app.post('/api/rooms/:roomId/beds', isAuthenticated, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const ownerId = req.user.claims.sub;
      
      // Verify ownership through room -> property
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      const property = await storage.getProperty(room.propertyId);
      if (!property || property.ownerId !== ownerId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const bedData = insertBedSchema.parse({ ...req.body, roomId });
      const bed = await storage.createBed(bedData);
      res.status(201).json(bed);
    } catch (error) {
      console.error("Error creating bed:", error);
      res.status(500).json({ message: "Failed to create bed" });
    }
  });

  // Booking routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const filters = user?.userType === 'owner' 
        ? { ownerId: userId }
        : { customerId: userId };
      
      const bookings = await storage.getBookings(filters);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({ ...req.body, customerId });
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify booking exists and user has permission
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = await storage.getUser(userId);
      const isOwner = user?.userType === 'owner';
      const isCustomer = booking.customerId === userId;
      
      if (!isOwner && !isCustomer) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // If owner, verify they own the property
      if (isOwner) {
        const property = await storage.getProperty(booking.propertyId);
        if (!property || property.ownerId !== userId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }
      
      const bookingData = insertBookingSchema.partial().parse(req.body);
      const updatedBooking = await storage.updateBooking(id, bookingData);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Message routes
  app.get('/api/bookings/:bookingId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = req.user.claims.sub;
      
      // Verify user has access to this booking
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = await storage.getUser(userId);
      const isOwner = user?.userType === 'owner';
      const isCustomer = booking.customerId === userId;
      
      if (!isOwner && !isCustomer) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      if (isOwner) {
        const property = await storage.getProperty(booking.propertyId);
        if (!property || property.ownerId !== userId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }
      
      const messages = await storage.getMessagesByBooking(bookingId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/bookings/:bookingId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const senderId = req.user.claims.sub;
      
      // Verify user has access to this booking
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = await storage.getUser(senderId);
      const isOwner = user?.userType === 'owner';
      const isCustomer = booking.customerId === senderId;
      
      if (!isOwner && !isCustomer) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      if (isOwner) {
        const property = await storage.getProperty(booking.propertyId);
        if (!property || property.ownerId !== senderId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }
      
      const messageData = insertMessageSchema.parse({ ...req.body, bookingId, senderId });
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/owner-stats', isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.user.claims.sub;
      const user = await storage.getUser(ownerId);
      
      if (user?.userType !== 'owner') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const stats = await storage.getOwnerStats(ownerId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching owner stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
