-- Run this query in Supabase SQL Editor if you prefer inserting demo jobs via SQL:
INSERT INTO public.labour_posts (
  customer_name, title, description, category, city, locality, start_date, start_time, workers_needed, daily_rate, status
) VALUES
(
  'Rajesh Patel',
  'Need 4 Daily Wage Labourers for Sariya & Concrete Work',
  'Shifting 200 bags of cement, sand, and aggregate to 2nd floor slab casting. Lunch and tea provided. Cash payment at 5:30 PM.',
  'labour',
  'Nagpur',
  'Dharampeth',
  '2026-10-20',
  '08:30 AM',
  4,
  650,
  'active'
),
(
  'Suresh Kulkarni',
  'Experienced Mistri (Mason) for Boundary Wall Construction',
  '9-inch brickwork for 60 ft boundary wall with red bricks. Must have own plumb line, trowel, and measuring tape.',
  'mason',
  'Pune',
  'Kothrud',
  '2026-10-21',
  '09:00 AM',
  2,
  950,
  'active'
),
(
  'Amit Singhania',
  'Shuttering Carpenter for Beam & Column Framing',
  'Plywood shuttering and scaffolding support for ground floor stilt parking columns. 5 days continuous work.',
  'carpenter',
  'Mumbai',
  'Andheri',
  '2026-10-22',
  '08:00 AM',
  3,
  1100,
  'active'
),
(
  'Manish Gupta',
  '2 Tile Mistris for Living Room & Kitchen Flooring',
  '2x4 ft Vitrified tile laying with epoxy grouting. Surface leveling mortar already prepared.',
  'tile_worker',
  'Delhi',
  'Dwarka',
  '2026-10-21',
  '09:30 AM',
  2,
  1000,
  'active'
),
(
  'Dr. Ashok Rao',
  '2 Electricians for Concealed Pipe Wiring & Switchboard Setup',
  'Pulling wires through conduits in 3BHK duplex apartment and installing modular switchboards and MCB box.',
  'electrician',
  'Bengaluru',
  'Whitefield',
  '2026-10-23',
  '10:00 AM',
  2,
  900,
  'active'
),
(
  'Sanjay Deshmukh',
  '5 Unskilled Labourers for Excavation & Foundation Trench',
  'Soil digging and leveling for column footing foundation. Tools (pickaxe, shovel, gamela) will be provided on site.',
  'labour',
  'Nagpur',
  'Wardha Road',
  '2026-10-20',
  '08:00 AM',
  5,
  600,
  'active'
),
(
  'Pradeep Joshi',
  'Plumber for Concealed CPVC Pipe Fitting & Sanitary Line',
  'Bathroom internal CPVC waterline pressure testing and drainage trap installation.',
  'plumber',
  'Mumbai',
  'Thane',
  '2026-10-24',
  '09:00 AM',
  1,
  850,
  'active'
),
(
  'Vikas Bansal',
  '3 Painters for Exterior Waterproofing & Primer Coat',
  'Exterior wall scraping, crack filling with polymer putty, and 1 coat weatherproof primer on 2-storey house.',
  'painter',
  'Indore',
  'Vijay Nagar',
  '2026-10-22',
  '08:30 AM',
  3,
  800,
  'active'
);
