import {
  users,
  properties,
  rooms,
  beds,
  bookings,
  messages,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Room,
  type InsertRoom,
  type Bed,
  type InsertBed,
  type Booking,
  type InsertBooking,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Property operations
  getProperties(filters?: {
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    search?: string;
  }): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByOwner(ownerId: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Room operations
  getRoomsByProperty(propertyId: number): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room>;
  deleteRoom(id: number): Promise<boolean>;
  
  // Bed operations
  getBedsByRoom(roomId: number): Promise<Bed[]>;
  getAvailableBeds(roomId: number): Promise<Bed[]>;
  createBed(bed: InsertBed): Promise<Bed>;
  updateBed(id: number, bed: Partial<InsertBed>): Promise<Bed>;
  
  // Booking operations
  getBookings(filters?: {
    customerId?: string;
    ownerId?: string;
    propertyId?: number;
    status?: string;
  }): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;
  
  // Message operations
  getMessagesByBooking(bookingId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Analytics operations
  getOwnerStats(ownerId: string): Promise<{
    totalProperties: number;
    totalRooms: number;
    occupiedBeds: number;
    totalBeds: number;
    monthlyRevenue: number;
    pendingBookings: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property operations
  async getProperties(filters?: {
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    search?: string;
  }): Promise<Property[]> {
    let query = db.select().from(properties).where(eq(properties.isActive, true));
    
    if (filters?.city) {
      query = query.where(ilike(properties.city, `%${filters.city}%`));
    }
    
    if (filters?.propertyType) {
      query = query.where(eq(properties.propertyType, filters.propertyType as any));
    }
    
    if (filters?.search) {
      query = query.where(
        or(
          ilike(properties.name, `%${filters.search}%`),
          ilike(properties.address, `%${filters.search}%`),
          ilike(properties.city, `%${filters.search}%`)
        )
      );
    }
    
    const result = await query.orderBy(desc(properties.createdAt));
    return result;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id));
    return property;
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(eq(properties.ownerId, ownerId))
      .orderBy(desc(properties.createdAt));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db
      .insert(properties)
      .values(property)
      .returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db
      .update(properties)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(properties.id, id));
    return result.rowCount > 0;
  }

  // Room operations
  async getRoomsByProperty(propertyId: number): Promise<Room[]> {
    return await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.propertyId, propertyId), eq(rooms.isActive, true)))
      .orderBy(rooms.name);
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, id));
    return room;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db
      .insert(rooms)
      .values(room)
      .returning();
    return newRoom;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room> {
    const [updatedRoom] = await db
      .update(rooms)
      .set({ ...room, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const result = await db
      .update(rooms)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(rooms.id, id));
    return result.rowCount > 0;
  }

  // Bed operations
  async getBedsByRoom(roomId: number): Promise<Bed[]> {
    return await db
      .select()
      .from(beds)
      .where(eq(beds.roomId, roomId))
      .orderBy(beds.bedNumber);
  }

  async getAvailableBeds(roomId: number): Promise<Bed[]> {
    return await db
      .select()
      .from(beds)
      .where(and(eq(beds.roomId, roomId), eq(beds.isOccupied, false)))
      .orderBy(beds.bedNumber);
  }

  async createBed(bed: InsertBed): Promise<Bed> {
    const [newBed] = await db
      .insert(beds)
      .values(bed)
      .returning();
    return newBed;
  }

  async updateBed(id: number, bed: Partial<InsertBed>): Promise<Bed> {
    const [updatedBed] = await db
      .update(beds)
      .set({ ...bed, updatedAt: new Date() })
      .where(eq(beds.id, id))
      .returning();
    return updatedBed;
  }

  // Booking operations
  async getBookings(filters?: {
    customerId?: string;
    ownerId?: string;
    propertyId?: number;
    status?: string;
  }): Promise<Booking[]> {
    let query = db.select().from(bookings);
    
    if (filters?.customerId) {
      query = query.where(eq(bookings.customerId, filters.customerId));
    }
    
    if (filters?.propertyId) {
      query = query.where(eq(bookings.propertyId, filters.propertyId));
    }
    
    if (filters?.status) {
      query = query.where(eq(bookings.status, filters.status as any));
    }
    
    if (filters?.ownerId) {
      query = query
        .leftJoin(properties, eq(bookings.propertyId, properties.id))
        .where(eq(properties.ownerId, filters.ownerId));
    }
    
    const result = await query.orderBy(desc(bookings.createdAt));
    return result;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Message operations
  async getMessagesByBooking(bookingId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Analytics operations
  async getOwnerStats(ownerId: string): Promise<{
    totalProperties: number;
    totalRooms: number;
    occupiedBeds: number;
    totalBeds: number;
    monthlyRevenue: number;
    pendingBookings: number;
  }> {
    const [propertiesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(and(eq(properties.ownerId, ownerId), eq(properties.isActive, true)));

    const [roomsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rooms)
      .leftJoin(properties, eq(rooms.propertyId, properties.id))
      .where(and(eq(properties.ownerId, ownerId), eq(rooms.isActive, true)));

    const [bedsStats] = await db
      .select({ 
        totalBeds: sql<number>`count(*)`,
        occupiedBeds: sql<number>`count(case when ${beds.isOccupied} = true then 1 end)`
      })
      .from(beds)
      .leftJoin(rooms, eq(beds.roomId, rooms.id))
      .leftJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(properties.ownerId, ownerId));

    const [revenueStats] = await db
      .select({ 
        revenue: sql<number>`sum(${bookings.monthlyRent})` 
      })
      .from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .where(and(
        eq(properties.ownerId, ownerId),
        eq(bookings.status, "active")
      ));

    const [pendingBookingsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .where(and(
        eq(properties.ownerId, ownerId),
        eq(bookings.status, "pending")
      ));

    return {
      totalProperties: propertiesCount.count || 0,
      totalRooms: roomsCount.count || 0,
      occupiedBeds: bedsStats.occupiedBeds || 0,
      totalBeds: bedsStats.totalBeds || 0,
      monthlyRevenue: revenueStats.revenue || 0,
      pendingBookings: pendingBookingsCount.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
