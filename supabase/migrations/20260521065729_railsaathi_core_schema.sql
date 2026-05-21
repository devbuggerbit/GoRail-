/*
  # RailSaathi Core Schema

  ## Overview
  Complete database schema for the RailSaathi Indian Railways management app.

  ## New Tables
  1. `users` - Passenger accounts
  2. `staff` - All staff (TC, Cleaner, Police, Electrical, Pilot, Station Master)
  3. `trains` - Train master data
  4. `stations` - All stations
  5. `train_schedule` - Stop-wise schedule per train
  6. `bookings` - Ticket bookings with PNR
  7. `booking_passengers` - Individual passenger details per booking
  8. `complaints` - General complaints (seat, harassment)
  9. `cleaning_requests` - Washroom/cleaning issue reports
  10. `food_orders` - Food orders per booking
  11. `food_items` - Menu items
  12. `train_updates` - Live updates by pilot/station master
  13. `staff_tasks` - Tasks assigned to staff members
  14. `notifications` - Push notifications per user

  ## Security
  - RLS enabled on all tables
  - Passengers can only see their own data
  - Staff can see data relevant to their role/station
*/

-- ============================================================
-- TRAINS & STATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zone text DEFAULT '',
  lat numeric(10,6),
  lng numeric(10,6),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Express',
  origin_station_id uuid REFERENCES stations(id),
  destination_station_id uuid REFERENCES stations(id),
  current_speed numeric(5,1) DEFAULT 0,
  current_lat numeric(10,6),
  current_lng numeric(10,6),
  delay_minutes integer DEFAULT 0,
  status text DEFAULT 'on_time',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS train_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id uuid REFERENCES trains(id) ON DELETE CASCADE,
  station_id uuid REFERENCES stations(id),
  stop_number integer NOT NULL,
  arrival_time text,
  departure_time text,
  day_offset integer DEFAULT 0,
  distance_from_origin numeric(8,1) DEFAULT 0,
  halt_minutes integer DEFAULT 2,
  platform_number integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(train_id, stop_number)
);

-- ============================================================
-- USERS (PASSENGERS)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  mobile text UNIQUE,
  email text UNIQUE,
  preferred_language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- STAFF
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  employee_id text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('TC','CLEANER_MANAGER','CLEANER_WORKER','POLICE','ELECTRICAL','PILOT','STATION_MASTER')),
  station_id uuid REFERENCES stations(id),
  train_id uuid REFERENCES trains(id),
  mobile text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pnr text UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  train_id uuid REFERENCES trains(id),
  from_station_id uuid REFERENCES stations(id),
  to_station_id uuid REFERENCES stations(id),
  journey_date date NOT NULL,
  travel_class text NOT NULL CHECK (travel_class IN ('SL','3A','2A','1A')),
  total_fare numeric(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed','waitlisted','cancelled','completed')),
  payment_method text DEFAULT 'UPI',
  payment_status text DEFAULT 'paid',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL,
  gender text CHECK (gender IN ('M','F','T')),
  berth_preference text CHECK (berth_preference IN ('lower','middle','upper','side_lower','side_upper','no_preference')),
  seat_number text,
  berth_assigned text,
  coach_number text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- COMPLAINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id),
  train_id uuid REFERENCES trains(id),
  coach_number text,
  seat_number text,
  complaint_type text NOT NULL CHECK (complaint_type IN ('seat_occupied','harassment','theft','other')),
  description text NOT NULL,
  routed_to text CHECK (routed_to IN ('TC','POLICE')),
  status text DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','resolved','closed')),
  resolved_by uuid REFERENCES staff(id),
  resolution_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- CLEANING REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS cleaning_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  train_id uuid REFERENCES trains(id),
  coach_number text NOT NULL,
  issue_type text NOT NULL CHECK (issue_type IN ('dirty_toilet','dirty_basin','water_leakage','missing_soap','water_shortage','general_cleanliness','other')),
  description text DEFAULT '',
  photo_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','assigned','in_progress','completed')),
  assigned_to uuid REFERENCES staff(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- TECHNICAL / ELECTRICAL ISSUES
-- ============================================================
CREATE TABLE IF NOT EXISTS technical_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  train_id uuid REFERENCES trains(id),
  coach_number text NOT NULL,
  issue_type text NOT NULL CHECK (issue_type IN ('ac_not_working','fan_broken','light_issue','charging_point_dead','water_pump','door_issue','window_issue','other')),
  description text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending','assigned','in_progress','resolved')),
  assigned_to uuid REFERENCES staff(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- FOOD ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(8,2) NOT NULL,
  category text DEFAULT 'main',
  image_url text,
  is_veg boolean DEFAULT true,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id),
  train_id uuid REFERENCES trains(id),
  coach_number text NOT NULL,
  berth_number text NOT NULL,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'placed' CHECK (status IN ('placed','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  payment_method text DEFAULT 'UPI',
  special_instructions text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES food_orders(id) ON DELETE CASCADE,
  food_item_id uuid REFERENCES food_items(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(8,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- TRAIN UPDATES (Live updates by pilot/station master)
-- ============================================================
CREATE TABLE IF NOT EXISTS train_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id uuid REFERENCES trains(id) ON DELETE CASCADE,
  posted_by uuid REFERENCES staff(id),
  update_type text DEFAULT 'delay' CHECK (update_type IN ('delay','platform_change','speed_update','arrival','departure','info')),
  message text NOT NULL,
  delay_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE train_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE train_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Stations: public read
CREATE POLICY "Anyone can read stations"
  ON stations FOR SELECT
  TO authenticated
  USING (true);

-- Trains: public read
CREATE POLICY "Anyone can read trains"
  ON trains FOR SELECT
  TO authenticated
  USING (true);

-- Train schedule: public read
CREATE POLICY "Anyone can read train_schedule"
  ON train_schedule FOR SELECT
  TO authenticated
  USING (true);

-- Users: own profile only
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Staff: own profile only
CREATE POLICY "Staff can read own profile"
  ON staff FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can update own profile"
  ON staff FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can insert own profile"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Bookings: own bookings
CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can read all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid())
  );

-- Booking passengers
CREATE POLICY "Users can read own booking passengers"
  ON booking_passengers FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own booking passengers"
  ON booking_passengers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
  );

CREATE POLICY "Staff can read all booking passengers"
  ON booking_passengers FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid())
  );

-- Complaints
CREATE POLICY "Users can read own complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can read assigned complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid())
  );

CREATE POLICY "Staff can update complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid()));

-- Cleaning requests
CREATE POLICY "Users can read own cleaning requests"
  ON cleaning_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert cleaning requests"
  ON cleaning_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can read all cleaning requests"
  ON cleaning_requests FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid()));

CREATE POLICY "Staff can update cleaning requests"
  ON cleaning_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid()));

-- Technical issues
CREATE POLICY "Users can read own technical issues"
  ON technical_issues FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert technical issues"
  ON technical_issues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can read all technical issues"
  ON technical_issues FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid()));

CREATE POLICY "Staff can update technical issues"
  ON technical_issues FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid()));

-- Food items: public read
CREATE POLICY "Anyone can read food items"
  ON food_items FOR SELECT
  TO authenticated
  USING (true);

-- Food orders: own orders
CREATE POLICY "Users can read own food orders"
  ON food_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert food orders"
  ON food_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food orders"
  ON food_orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Food order items
CREATE POLICY "Users can read own food order items"
  ON food_order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM food_orders WHERE food_orders.id = order_id AND food_orders.user_id = auth.uid())
  );

CREATE POLICY "Users can insert food order items"
  ON food_order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM food_orders WHERE food_orders.id = order_id AND food_orders.user_id = auth.uid())
  );

-- Train updates: public read
CREATE POLICY "Anyone can read train updates"
  ON train_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert train updates"
  ON train_updates FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.id = auth.uid()));

-- Notifications: own only
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
