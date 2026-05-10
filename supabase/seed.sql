-- Traveloop Seed Data — 22 cities, 110+ activities

-- ===========================
-- CITIES
-- ===========================
insert into public.cities (id, name, country, region, lat, lng, cost_index, popularity_score, cover_image_url) values
('c0000001-0000-0000-0000-000000000001', 'Tokyo', 'Japan', 'Asia', 35.6762, 139.6503, 70, 98, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'),
('c0000001-0000-0000-0000-000000000002', 'Paris', 'France', 'Europe', 48.8566, 2.3522, 80, 97, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'),
('c0000001-0000-0000-0000-000000000003', 'New York', 'USA', 'Americas', 40.7128, -74.0060, 90, 96, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'),
('c0000001-0000-0000-0000-000000000004', 'Bali', 'Indonesia', 'Asia', -8.3405, 115.0920, 30, 95, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'),
('c0000001-0000-0000-0000-000000000005', 'London', 'UK', 'Europe', 51.5074, -0.1278, 85, 94, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'),
('c0000001-0000-0000-0000-000000000006', 'Dubai', 'UAE', 'Middle East', 25.2048, 55.2708, 75, 93, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'),
('c0000001-0000-0000-0000-000000000007', 'Bangkok', 'Thailand', 'Asia', 13.7563, 100.5018, 25, 92, 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=800'),
('c0000001-0000-0000-0000-000000000008', 'Barcelona', 'Spain', 'Europe', 41.3851, 2.1734, 60, 91, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800'),
('c0000001-0000-0000-0000-000000000009', 'Singapore', 'Singapore', 'Asia', 1.3521, 103.8198, 78, 90, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'),
('c0000001-0000-0000-0000-000000000010', 'Rome', 'Italy', 'Europe', 41.9028, 12.4964, 65, 89, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800'),
('c0000001-0000-0000-0000-000000000011', 'Goa', 'India', 'Asia', 15.2993, 74.1240, 20, 88, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800'),
('c0000001-0000-0000-0000-000000000012', 'Sydney', 'Australia', 'Oceania', -33.8688, 151.2093, 82, 87, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800'),
('c0000001-0000-0000-0000-000000000013', 'Istanbul', 'Turkey', 'Europe', 41.0082, 28.9784, 40, 86, 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800'),
('c0000001-0000-0000-0000-000000000014', 'Kyoto', 'Japan', 'Asia', 35.0116, 135.7681, 65, 85, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'),
('c0000001-0000-0000-0000-000000000015', 'Marrakech', 'Morocco', 'Africa', 31.6295, -7.9811, 25, 84, 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800'),
('c0000001-0000-0000-0000-000000000016', 'Maldives', 'Maldives', 'Asia', 3.2028, 73.2207, 95, 83, 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800'),
('c0000001-0000-0000-0000-000000000017', 'Santorini', 'Greece', 'Europe', 36.3932, 25.4615, 80, 82, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800'),
('c0000001-0000-0000-0000-000000000018', 'Phuket', 'Thailand', 'Asia', 7.8804, 98.3923, 28, 81, 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800'),
('c0000001-0000-0000-0000-000000000019', 'Prague', 'Czech Republic', 'Europe', 50.0755, 14.4378, 45, 80, 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800'),
('c0000001-0000-0000-0000-000000000020', 'Mumbai', 'India', 'Asia', 19.0760, 72.8777, 18, 79, 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800'),
('c0000001-0000-0000-0000-000000000021', 'New Delhi', 'India', 'Asia', 28.6139, 77.2090, 15, 78, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'),
('c0000001-0000-0000-0000-000000000022', 'Amsterdam', 'Netherlands', 'Europe', 52.3676, 4.9041, 72, 77, 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800')
on conflict (id) do nothing;

-- ===========================
-- ACTIVITIES — Tokyo
-- ===========================
insert into public.activities (city_id, name, category, cost_estimate, duration_hours, description) values
('c0000001-0000-0000-0000-000000000001', 'Senso-ji Temple Visit', 'culture', 0, 2, 'Explore Tokyo''s oldest and most famous temple in Asakusa'),
('c0000001-0000-0000-0000-000000000001', 'Tsukiji Fish Market Tour', 'food', 2000, 3, 'Early morning sushi breakfast at the world''s largest fish market'),
('c0000001-0000-0000-0000-000000000001', 'Shibuya Crossing & Shopping', 'shopping', 0, 4, 'Experience the world''s busiest pedestrian crossing'),
('c0000001-0000-0000-0000-000000000001', 'Tokyo Skytree Observation', 'culture', 2100, 1.5, 'Panoramic views of Tokyo from 634m tower'),
('c0000001-0000-0000-0000-000000000001', 'Shinjuku Nightlife Tour', 'nightlife', 3000, 4, 'Golden Gai bars and Kabukicho entertainment district'),

-- ACTIVITIES — Paris
('c0000001-0000-0000-0000-000000000002', 'Eiffel Tower Visit', 'culture', 2800, 2, 'Iconic iron tower with panoramic city views'),
('c0000001-0000-0000-0000-000000000002', 'Louvre Museum', 'culture', 1700, 4, 'World''s largest art museum — Mona Lisa, Venus de Milo'),
('c0000001-0000-0000-0000-000000000002', 'Seine River Cruise', 'culture', 1400, 1.5, 'Scenic boat tour past Notre-Dame and Musée d''Orsay'),
('c0000001-0000-0000-0000-000000000002', 'Montmartre & Sacré-Cœur', 'culture', 0, 3, 'Artistic hilltop district with white basilica'),
('c0000001-0000-0000-0000-000000000002', 'Michelin Star Dinner', 'food', 15000, 3, 'Fine dining French cuisine experience'),

-- ACTIVITIES — Bali
('c0000001-0000-0000-0000-000000000004', 'Ubud Monkey Forest', 'nature', 300, 2, 'Sacred woodland sanctuary home to 700 Balinese long-tailed monkeys'),
('c0000001-0000-0000-0000-000000000004', 'Tegallalang Rice Terraces', 'nature', 200, 2, 'UNESCO-listed cascading rice paddies'),
('c0000001-0000-0000-0000-000000000004', 'Tanah Lot Temple at Sunset', 'culture', 100, 2, 'Iconic sea temple perched on a rocky outcropping'),
('c0000001-0000-0000-0000-000000000004', 'Kuta Beach Surfing', 'adventure', 500, 3, 'Learn to surf on Bali''s most famous wave'),
('c0000001-0000-0000-0000-000000000004', 'Traditional Balinese Cooking Class', 'food', 600, 4, 'Learn to make nasi goreng, satay and more'),

-- ACTIVITIES — Dubai
('c0000001-0000-0000-0000-000000000006', 'Burj Khalifa At The Top', 'culture', 3200, 2, 'World''s tallest building observation deck at 555m'),
('c0000001-0000-0000-0000-000000000006', 'Desert Safari with BBQ', 'adventure', 4000, 6, 'Dune bashing, camel riding and sunset BBQ dinner'),
('c0000001-0000-0000-0000-000000000006', 'Dubai Mall & Aquarium', 'shopping', 1000, 4, 'World''s largest mall with underwater zoo'),
('c0000001-0000-0000-0000-000000000006', 'Dubai Creek Dhow Cruise', 'culture', 2000, 2, 'Traditional wooden boat dinner cruise on the creek'),
('c0000001-0000-0000-0000-000000000006', 'Skydiving over Palm Jumeirah', 'adventure', 25000, 3, 'Tandem skydive with views of the iconic Palm island'),

-- ACTIVITIES — Bangkok
('c0000001-0000-0000-0000-000000000007', 'Grand Palace & Wat Phra Kaew', 'culture', 500, 3, 'Thailand''s most sacred temple complex'),
('c0000001-0000-0000-0000-000000000007', 'Floating Market Tour', 'food', 400, 4, 'Authentic wooden boat market experience'),
('c0000001-0000-0000-0000-000000000007', 'Thai Cooking Class', 'food', 800, 4, 'Hands-on street food cooking with local chef'),
('c0000001-0000-0000-0000-000000000007', 'Khao San Road Nightlife', 'nightlife', 1000, 5, 'Backpacker hub with bars, music and street food'),
('c0000001-0000-0000-0000-000000000007', 'Muay Thai Match + Training', 'adventure', 600, 3, 'Watch or participate in traditional Thai boxing'),

-- ACTIVITIES — London
('c0000001-0000-0000-0000-000000000005', 'Tower of London', 'culture', 3000, 3, 'Historic castle, Crown Jewels and Beefeater guards'),
('c0000001-0000-0000-0000-000000000005', 'British Museum', 'culture', 0, 4, 'World-class collection including the Rosetta Stone'),
('c0000001-0000-0000-0000-000000000005', 'Thames River Cruise', 'culture', 1500, 1.5, 'Scenic boat past London Eye and Tower Bridge'),
('c0000001-0000-0000-0000-000000000005', 'West End Musical', 'culture', 5000, 3, 'World-class theatre in the heart of London'),
('c0000001-0000-0000-0000-000000000005', 'Pub Crawl — Soho', 'nightlife', 2000, 5, 'Classic London pubs with real ales and atmosphere'),

-- ACTIVITIES — Barcelona
('c0000001-0000-0000-0000-000000000008', 'Sagrada Família', 'culture', 2000, 2, 'Gaudí''s unfinished masterpiece basilica'),
('c0000001-0000-0000-0000-000000000008', 'Park Güell', 'culture', 1000, 2, 'Mosaic gardens with panoramic city views'),
('c0000001-0000-0000-0000-000000000008', 'La Boqueria Market', 'food', 500, 2, 'Iconic covered market with fresh produce and tapas'),
('c0000001-0000-0000-0000-000000000008', 'Barceloneta Beach', 'nature', 0, 4, 'Vibrant city beach with sun, sea and sangria'),
('c0000001-0000-0000-0000-000000000008', 'Flamenco Show & Dinner', 'culture', 4000, 3, 'Authentic flamenco performance with tapas'),

-- ACTIVITIES — Singapore
('c0000001-0000-0000-0000-000000000009', 'Gardens by the Bay', 'nature', 800, 3, 'Futuristic Supertrees and cloud forest domes'),
('c0000001-0000-0000-0000-000000000009', 'Marina Bay Sands SkyPark', 'culture', 2500, 1.5, 'Infinity pool views from the iconic hotel rooftop'),
('c0000001-0000-0000-0000-000000000009', 'Hawker Centre Food Tour', 'food', 500, 3, 'Michelin-recommended street food at Maxwell'),
('c0000001-0000-0000-0000-000000000009', 'Universal Studios Singapore', 'adventure', 4000, 8, 'Theme park with Hollywood rides and shows'),
('c0000001-0000-0000-0000-000000000009', 'Clarke Quay Nightlife', 'nightlife', 2000, 4, 'Waterfront bars and clubs on the Singapore River'),

-- ACTIVITIES — Rome
('c0000001-0000-0000-0000-000000000010', 'Colosseum & Forum', 'culture', 1500, 3, 'Ancient amphitheatre and Roman ruins'),
('c0000001-0000-0000-0000-000000000010', 'Vatican Museums & Sistine Chapel', 'culture', 2000, 4, 'Michelangelo''s ceiling and St Peter''s Basilica'),
('c0000001-0000-0000-0000-000000000010', 'Pasta Making Class', 'food', 3000, 3, 'Hand-roll fresh pasta with a Roman chef'),
('c0000001-0000-0000-0000-000000000010', 'Trevi Fountain & Gelato Walk', 'culture', 200, 2, 'Iconic baroque fountain and artisan gelato trail'),
('c0000001-0000-0000-0000-000000000010', 'Trastevere Nightlife', 'nightlife', 1500, 4, 'Cobblestone neighborhood bars and live music'),

-- ACTIVITIES — Goa
('c0000001-0000-0000-0000-000000000011', 'Calangute & Baga Beach', 'nature', 0, 5, 'Golden sandy beaches with beach shacks and water sports'),
('c0000001-0000-0000-0000-000000000011', 'Old Goa Churches Tour', 'culture', 0, 3, 'UNESCO World Heritage Portuguese colonial churches'),
('c0000001-0000-0000-0000-000000000011', 'Spice Plantation Tour', 'nature', 400, 3, 'Guided walk through aromatic spice gardens with lunch'),
('c0000001-0000-0000-0000-000000000011', 'Dudhsagar Waterfall Trek', 'adventure', 800, 8, 'Jeep safari and trek to India''s tallest waterfall'),
('c0000001-0000-0000-0000-000000000011', 'Anjuna Flea Market', 'shopping', 0, 3, 'Wednesday beach market with handicrafts and clothes'),

-- ACTIVITIES — Kyoto
('c0000001-0000-0000-0000-000000000014', 'Fushimi Inari Shrine', 'culture', 0, 3, 'Thousands of vermillion torii gates up the mountain'),
('c0000001-0000-0000-0000-000000000014', 'Arashiyama Bamboo Grove', 'nature', 0, 2, 'Towering bamboo forest walk near Tenryu-ji garden'),
('c0000001-0000-0000-0000-000000000014', 'Tea Ceremony Experience', 'culture', 2500, 1.5, 'Traditional matcha tea ceremony in a Kyoto machiya'),
('c0000001-0000-0000-0000-000000000014', 'Geisha District Walk — Gion', 'culture', 0, 2, 'Historic geisha district with preserved machiya'),
('c0000001-0000-0000-0000-000000000014', 'Nishiki Market Street Food', 'food', 1000, 2, 'Kyoto''s kitchen — Japanese pickles, tofu and sweets'),

-- ACTIVITIES — Istanbul
('c0000001-0000-0000-0000-000000000013', 'Hagia Sophia & Blue Mosque', 'culture', 200, 3, 'Byzantine basilica turned mosque — architectural wonder'),
('c0000001-0000-0000-0000-000000000013', 'Grand Bazaar Shopping', 'shopping', 0, 4, 'One of the world''s oldest and largest covered markets'),
('c0000001-0000-0000-0000-000000000013', 'Bosphorus Cruise', 'culture', 800, 2, 'Boat tour between Europe and Asia'),
('c0000001-0000-0000-0000-000000000013', 'Turkish Bath (Hamam)', 'wellness', 1200, 2, 'Traditional steam bath and massage'),
('c0000001-0000-0000-0000-000000000013', 'Rooftop Bar — Galata Tower', 'nightlife', 1500, 3, 'Panoramic views with cocktails at sunset'),

-- ACTIVITIES — Maldives
('c0000001-0000-0000-0000-000000000016', 'Snorkeling with Manta Rays', 'adventure', 5000, 3, 'Guided snorkel with giant manta rays'),
('c0000001-0000-0000-0000-000000000016', 'Overwater Villa Stay', 'wellness', 30000, 24, 'Luxury glass-floor villa above the Indian Ocean'),
('c0000001-0000-0000-0000-000000000016', 'Sunset Dolphin Cruise', 'nature', 3000, 2, 'Watch spinner dolphins at sunset from a dhoni'),
('c0000001-0000-0000-0000-000000000016', 'Scuba Diving — House Reef', 'adventure', 8000, 4, 'Dive with sharks, turtles and colourful reef fish'),
('c0000001-0000-0000-0000-000000000016', 'Private Beach Dinner', 'food', 20000, 2, 'Candle-lit seafood dinner on a deserted sandbank'),

-- ACTIVITIES — New York
('c0000001-0000-0000-0000-000000000003', 'Central Park & Met Museum', 'culture', 1500, 5, 'Iconic park and world-class art collection'),
('c0000001-0000-0000-0000-000000000003', 'Empire State Building', 'culture', 3500, 2, 'Art Deco skyscraper with 360° NYC views'),
('c0000001-0000-0000-0000-000000000003', 'Brooklyn Bridge Walk', 'culture', 0, 1.5, 'Iconic suspension bridge walk with Manhattan skyline'),
('c0000001-0000-0000-0000-000000000003', 'Broadway Show', 'culture', 8000, 3, 'World-class theatre on the Great White Way'),
('c0000001-0000-0000-0000-000000000003', 'NYC Food Tour — Chinatown & Little Italy', 'food', 2000, 3, 'Guided tasting through immigrant neighborhood food'),

-- ACTIVITIES — Mumbai
('c0000001-0000-0000-0000-000000000020', 'Gateway of India & Elephanta Caves', 'culture', 300, 4, 'Iconic arch monument and ancient rock-cut temples'),
('c0000001-0000-0000-0000-000000000020', 'Dharavi Slum Tour', 'culture', 500, 3, 'Insight into Asia''s largest urban community'),
('c0000001-0000-0000-0000-000000000020', 'Marine Drive Sunset Walk', 'nature', 0, 2, 'Queen''s Necklace seafront promenade at golden hour'),
('c0000001-0000-0000-0000-000000000020', 'Street Food Tour — Juhu Beach', 'food', 300, 3, 'Pav bhaji, bhel puri and chaat by the sea'),
('c0000001-0000-0000-0000-000000000020', 'Bollywood Film City Tour', 'culture', 800, 3, 'Behind the scenes at India''s film capital'),

-- ACTIVITIES — Marrakech
('c0000001-0000-0000-0000-000000000015', 'Jemaa el-Fnaa Night Market', 'food', 300, 3, 'Bustling square with snake charmers and food stalls'),
('c0000001-0000-0000-0000-000000000015', 'Medina Souk Shopping', 'shopping', 0, 4, 'Labyrinthine bazaars full of spices and carpets'),
('c0000001-0000-0000-0000-000000000015', 'Majorelle Garden & Yves Saint Laurent Museum', 'culture', 800, 2, 'Stunning cobalt-blue garden and fashion museum'),
('c0000001-0000-0000-0000-000000000015', 'Hammam Spa Day', 'wellness', 1500, 3, 'Traditional Moroccan steam and scrub treatment'),
('c0000001-0000-0000-0000-000000000015', 'Atlas Mountains Day Trip', 'adventure', 2000, 8, 'Berber village trek with panoramic mountain views')
on conflict do nothing;
