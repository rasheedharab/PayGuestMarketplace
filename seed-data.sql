-- Sample data for testing the PG accommodation marketplace
-- This will create sample properties, rooms, beds, and bookings

-- Insert sample properties
INSERT INTO properties (name, description, address, city, state, pincode, property_type, total_rooms, amenities, rent_per_bed, security_deposit, rules, images, contact_phone, contact_email, owner_id, is_active) VALUES
('Green Valley PG', 'Modern and comfortable PG accommodation for working professionals', '123 Main Street, Sector 15', 'Noida', 'Uttar Pradesh', '201301', 'pg', 10, '["WiFi", "AC", "Food", "Laundry", "Parking"]', 8000, 16000, '["No smoking", "No pets", "Visitors allowed till 8 PM"]', '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500"]', '+91-9876543210', 'owner1@example.com', 'test_owner_1', true),

('Students Paradise', 'Affordable accommodation near universities with all basic amenities', '456 College Road, Rajouri Garden', 'Delhi', 'Delhi', '110027', 'pg', 8, '["WiFi", "Food", "Laundry", "Study Room"]', 6500, 13000, '["No smoking", "Quiet hours after 10 PM"]', '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"]', '+91-9876543211', 'owner2@example.com', 'test_owner_2', true),

('Executive Stay', 'Premium accommodation for executives with luxury amenities', '789 Business District, Gurgaon', 'Gurgaon', 'Haryana', '122001', 'pg', 12, '["WiFi", "AC", "Gym", "Swimming Pool", "Food", "Parking"]', 12000, 24000, '["No smoking", "Professional environment"]', '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"]', '+91-9876543212', 'owner3@example.com', 'test_owner_3', true),

('Comfort Inn PG', 'Family-style accommodation with home-cooked meals', '321 Residential Area, Koramangala', 'Bangalore', 'Karnataka', '560034', 'pg', 6, '["WiFi", "Food", "Laundry", "TV Room"]', 7500, 15000, '["No smoking", "No loud music", "Respect timings"]', '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500"]', '+91-9876543213', 'owner4@example.com', 'test_owner_4', true);

-- Insert sample rooms for the first property (Green Valley PG)
INSERT INTO rooms (property_id, name, room_type, capacity, amenities, rent_per_bed, is_active) VALUES
(1, 'Room 101', 'shared', 3, '["AC", "Attached Bathroom", "Study Table"]', 8000, true),
(1, 'Room 102', 'shared', 2, '["AC", "Attached Bathroom", "Study Table", "Balcony"]', 8500, true),
(1, 'Room 103', 'private', 1, '["AC", "Attached Bathroom", "Study Table", "Wardrobe"]', 12000, true),
(1, 'Room 104', 'shared', 3, '["AC", "Attached Bathroom", "Study Table"]', 8000, true);

-- Insert sample beds for the rooms
INSERT INTO beds (room_id, bed_number, is_occupied, monthly_rent) VALUES
-- Room 101 (3 beds)
(1, 1, false, 8000),
(1, 2, true, 8000),
(1, 3, false, 8000),
-- Room 102 (2 beds)
(2, 1, false, 8500),
(2, 2, false, 8500),
-- Room 103 (1 bed)
(3, 1, false, 12000),
-- Room 104 (3 beds)
(4, 1, true, 8000),
(4, 2, false, 8000),
(4, 3, false, 8000);

-- Insert sample bookings
INSERT INTO bookings (customer_id, property_id, bed_id, check_in_date, check_out_date, monthly_rent, security_deposit, status, booking_notes) VALUES
('test_customer_1', 1, 2, '2024-01-15', '2024-07-15', 8000, 16000, 'confirmed', 'Student from Delhi University'),
('test_customer_2', 1, 7, '2024-02-01', '2024-08-01', 8000, 16000, 'confirmed', 'Working professional at nearby IT park');

-- Insert sample messages
INSERT INTO messages (booking_id, sender_id, sender_type, message, sent_at) VALUES
(1, 'test_customer_1', 'customer', 'Hi, I would like to know about the food timings.', '2024-01-16 10:30:00'),
(1, 'test_owner_1', 'owner', 'Hello! Breakfast is served from 7-9 AM, lunch from 12-2 PM, and dinner from 7-9 PM.', '2024-01-16 11:00:00'),
(2, 'test_customer_2', 'customer', 'Is parking available for two-wheelers?', '2024-02-02 14:20:00'),
(2, 'test_owner_1', 'owner', 'Yes, we have dedicated parking space for two-wheelers. Its included in the rent.', '2024-02-02 14:45:00');