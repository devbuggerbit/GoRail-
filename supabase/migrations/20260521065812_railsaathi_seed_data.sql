/*
  # RailSaathi Seed Data

  ## Overview
  Seeds demo data for stations, trains, schedules, and food items.

  ## Contents
  - 15 major Indian railway stations
  - 5 popular trains (Rajdhani, Shatabdi, Vande Bharat, Duronto, Garib Rath)
  - Train schedules for each
  - Food menu items
*/

-- Stations
INSERT INTO stations (code, name, city, state, zone, lat, lng) VALUES
  ('NDLS', 'New Delhi', 'New Delhi', 'Delhi', 'NR', 28.6139, 77.2090),
  ('MMCT', 'Mumbai Central', 'Mumbai', 'Maharashtra', 'WR', 18.9696, 72.8193),
  ('MAS', 'Chennai Central', 'Chennai', 'Tamil Nadu', 'SR', 13.0827, 80.2707),
  ('HWH', 'Howrah Junction', 'Kolkata', 'West Bengal', 'ER', 22.5839, 88.3424),
  ('SBC', 'KSR Bengaluru', 'Bengaluru', 'Karnataka', 'SWR', 12.9762, 77.5674),
  ('PUNE', 'Pune Junction', 'Pune', 'Maharashtra', 'CR', 18.5286, 73.8746),
  ('ADI', 'Ahmedabad Junction', 'Ahmedabad', 'Gujarat', 'WR', 23.0225, 72.5714),
  ('HYB', 'Hyderabad Deccan', 'Hyderabad', 'Telangana', 'SCR', 17.3850, 78.4867),
  ('LKO', 'Lucknow Charbagh', 'Lucknow', 'Uttar Pradesh', 'NR', 26.8467, 80.9462),
  ('PNBE', 'Patna Junction', 'Patna', 'Bihar', 'ECR', 25.5941, 85.1376),
  ('CNB', 'Kanpur Central', 'Kanpur', 'Uttar Pradesh', 'NCR', 26.4499, 80.3319),
  ('AGC', 'Agra Cantt', 'Agra', 'Uttar Pradesh', 'NCR', 27.1767, 78.0081),
  ('JU', 'Jodhpur Junction', 'Jodhpur', 'Rajasthan', 'NWR', 26.2938, 73.0243),
  ('BPL', 'Bhopal Junction', 'Bhopal', 'Madhya Pradesh', 'WCR', 23.2599, 77.4126),
  ('NGP', 'Nagpur Junction', 'Nagpur', 'Maharashtra', 'CR', 21.1458, 79.0882)
ON CONFLICT (code) DO NOTHING;

-- Trains
INSERT INTO trains (number, name, type, current_speed, delay_minutes, status) VALUES
  ('12301', 'Howrah Rajdhani Express', 'Rajdhani', 120.5, 0, 'on_time'),
  ('12009', 'Mumbai Shatabdi Express', 'Shatabdi', 110.0, 15, 'delayed'),
  ('22439', 'Vande Bharat Express', 'Vande Bharat', 160.0, 0, 'on_time'),
  ('12213', 'Duronto Express', 'Duronto', 130.0, 5, 'delayed'),
  ('12216', 'Garib Rath Express', 'Garib Rath', 95.0, 0, 'on_time')
ON CONFLICT (number) DO NOTHING;

-- Link train origins/destinations
DO $$
DECLARE
  ndls_id uuid;
  hwh_id uuid;
  mmct_id uuid;
  mas_id uuid;
  sbc_id uuid;
BEGIN
  SELECT id INTO ndls_id FROM stations WHERE code='NDLS';
  SELECT id INTO hwh_id FROM stations WHERE code='HWH';
  SELECT id INTO mmct_id FROM stations WHERE code='MMCT';
  SELECT id INTO mas_id FROM stations WHERE code='MAS';
  SELECT id INTO sbc_id FROM stations WHERE code='SBC';

  UPDATE trains SET origin_station_id=ndls_id, destination_station_id=hwh_id WHERE number='12301';
  UPDATE trains SET origin_station_id=ndls_id, destination_station_id=mmct_id WHERE number='12009';
  UPDATE trains SET origin_station_id=ndls_id, destination_station_id=mas_id WHERE number='22439';
  UPDATE trains SET origin_station_id=ndls_id, destination_station_id=hwh_id WHERE number='12213';
  UPDATE trains SET origin_station_id=ndls_id, destination_station_id=sbc_id WHERE number='12216';
END $$;

-- Train Schedule for 12301 Howrah Rajdhani
DO $$
DECLARE
  t_id uuid;
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid;
BEGIN
  SELECT id INTO t_id FROM trains WHERE number='12301';
  SELECT id INTO s1 FROM stations WHERE code='NDLS';
  SELECT id INTO s2 FROM stations WHERE code='CNB';
  SELECT id INTO s3 FROM stations WHERE code='PNBE';
  SELECT id INTO s4 FROM stations WHERE code='LKO';
  SELECT id INTO s5 FROM stations WHERE code='HWH';

  INSERT INTO train_schedule (train_id, station_id, stop_number, arrival_time, departure_time, day_offset, distance_from_origin, platform_number) VALUES
    (t_id, s1, 1, NULL, '17:00', 0, 0, 1),
    (t_id, s2, 2, '21:40', '21:45', 0, 440, 3),
    (t_id, s4, 3, '00:10', '00:15', 1, 512, 2),
    (t_id, s3, 4, '04:30', '04:35', 1, 994, 1),
    (t_id, s5, 5, '10:05', NULL, 1, 1451, 8)
  ON CONFLICT (train_id, stop_number) DO NOTHING;
END $$;

-- Train Schedule for 22439 Vande Bharat
DO $$
DECLARE
  t_id uuid;
  s1 uuid; s2 uuid; s3 uuid; s4 uuid;
BEGIN
  SELECT id INTO t_id FROM trains WHERE number='22439';
  SELECT id INTO s1 FROM stations WHERE code='NDLS';
  SELECT id INTO s2 FROM stations WHERE code='AGC';
  SELECT id INTO s3 FROM stations WHERE code='BPL';
  SELECT id INTO s4 FROM stations WHERE code='MAS';

  INSERT INTO train_schedule (train_id, station_id, stop_number, arrival_time, departure_time, day_offset, distance_from_origin, platform_number) VALUES
    (t_id, s1, 1, NULL, '06:00', 0, 0, 2),
    (t_id, s2, 2, '07:35', '07:37', 0, 200, 1),
    (t_id, s3, 3, '11:45', '11:50', 0, 706, 4),
    (t_id, s4, 4, '22:30', NULL, 0, 2178, 5)
  ON CONFLICT (train_id, stop_number) DO NOTHING;
END $$;

-- Food Items
INSERT INTO food_items (name, description, price, category, is_veg, image_url) VALUES
  ('Veg Thali', 'Dal, rice, 2 rotis, sabzi, salad, papad', 120.00, 'main', true, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'),
  ('Paneer Butter Masala', 'Rich paneer curry with butter naan', 150.00, 'main', true, 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg'),
  ('Chicken Biryani', 'Fragrant basmati rice with spiced chicken', 180.00, 'main', false, 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg'),
  ('Masala Chai', 'Hot ginger cardamom tea', 20.00, 'beverage', true, 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg'),
  ('Cold Coffee', 'Chilled blended coffee with milk', 60.00, 'beverage', true, 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg'),
  ('Samosa (2 pcs)', 'Crispy potato-filled pastry with chutney', 30.00, 'snack', true, 'https://images.pexels.com/photos/9609842/pexels-photo-9609842.jpeg'),
  ('Veg Sandwich', 'Toasted sandwich with veggies and chutney', 50.00, 'snack', true, 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg'),
  ('Egg Curry with Rice', 'Spiced egg curry served with steamed rice', 130.00, 'main', false, 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg'),
  ('Gulab Jamun (2 pcs)', 'Soft milk-solid sweets in sugar syrup', 40.00, 'dessert', true, 'https://images.pexels.com/photos/14688255/pexels-photo-14688255.jpeg'),
  ('Mineral Water (1L)', 'Sealed packaged drinking water', 20.00, 'beverage', true, 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg')
ON CONFLICT DO NOTHING;
