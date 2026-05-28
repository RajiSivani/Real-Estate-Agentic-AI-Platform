-- ============================================
-- HOMEPORT - SEED COMPARABLE HOMES
-- ============================================
-- This creates 20 realistic comparable homes
-- that can be used for both seller and buyer
-- comp analysis in the MVP demo
-- ============================================

INSERT INTO comps (
    comp_address,
    comp_city,
    comp_state,
    comp_price,
    bedrooms,
    bathrooms,
    square_feet,
    property_type,
    sale_date,
    days_on_market,
    price_per_sqft,
    distance_miles,
    source,
    relevance_score
) VALUES
-- Similar to typical 3bd/2ba $400-500K homes
('456 Maple Avenue', 'San Jose', 'CA', 445000, 3, 2.0, 1850, 'single_family', '2024-03-15', 12, 240.54, 0.8, 'staged', 0.95),
('789 Oak Street', 'San Jose', 'CA', 462000, 3, 2.0, 1920, 'single_family', '2024-02-28', 18, 240.63, 1.2, 'staged', 0.92),
('123 Pine Drive', 'San Jose', 'CA', 438000, 3, 2.0, 1800, 'single_family', '2024-03-22', 9, 243.33, 0.5, 'staged', 0.96),
('321 Elm Court', 'San Jose', 'CA', 455000, 3, 2.5, 1950, 'single_family', '2024-01-10', 25, 233.33, 1.5, 'staged', 0.88),
('567 Cedar Lane', 'San Jose', 'CA', 470000, 4, 2.0, 2100, 'single_family', '2024-02-05', 15, 223.81, 2.1, 'staged', 0.85),

-- Slightly higher-end comps (4bd or larger homes)
('890 Birch Way', 'San Jose', 'CA', 520000, 4, 2.5, 2300, 'single_family', '2024-03-01', 20, 226.09, 1.8, 'staged', 0.82),
('234 Willow Road', 'San Jose', 'CA', 498000, 4, 2.0, 2150, 'single_family', '2024-02-18', 14, 231.63, 1.3, 'staged', 0.87),
('678 Spruce Street', 'Campbell', 'CA', 515000, 4, 3.0, 2400, 'single_family', '2024-01-25', 22, 214.58, 3.2, 'staged', 0.79),
('901 Redwood Drive', 'Santa Clara', 'CA', 485000, 3, 2.5, 2050, 'single_family', '2024-03-10', 11, 236.59, 2.5, 'staged', 0.84),
('345 Ash Avenue', 'San Jose', 'CA', 505000, 4, 2.5, 2200, 'single_family', '2024-02-12', 17, 229.55, 1.6, 'staged', 0.86),

-- Lower-end comps (smaller or older homes)
('112 Cypress Court', 'San Jose', 'CA', 395000, 3, 2.0, 1650, 'single_family', '2024-03-05', 28, 239.39, 2.8, 'staged', 0.78),
('223 Poplar Place', 'Milpitas', 'CA', 410000, 3, 1.5, 1700, 'single_family', '2024-01-30', 35, 241.18, 4.2, 'staged', 0.72),
('334 Magnolia Street', 'San Jose', 'CA', 425000, 2, 2.0, 1600, 'condo', '2024-02-20', 19, 265.63, 1.9, 'staged', 0.75),
('445 Sycamore Lane', 'Santa Clara', 'CA', 418000, 3, 2.0, 1750, 'townhouse', '2024-03-18', 13, 238.86, 3.5, 'staged', 0.76),
('556 Hawthorn Drive', 'San Jose', 'CA', 408000, 3, 1.5, 1680, 'single_family', '2024-01-15', 31, 242.86, 2.3, 'staged', 0.77),

-- Townhouse/condo comparables
('667 Beech Court', 'San Jose', 'CA', 435000, 3, 2.5, 1850, 'townhouse', '2024-02-25', 16, 235.14, 1.4, 'staged', 0.81),
('778 Alder Way', 'Campbell', 'CA', 428000, 2, 2.0, 1500, 'condo', '2024-03-12', 21, 285.33, 3.8, 'staged', 0.73),
('889 Hickory Road', 'San Jose', 'CA', 442000, 3, 2.0, 1820, 'townhouse', '2024-01-22', 24, 242.86, 1.7, 'staged', 0.83),
('990 Walnut Street', 'Santa Clara', 'CA', 452000, 3, 2.5, 1900, 'townhouse', '2024-02-08', 18, 237.89, 2.9, 'staged', 0.80),
('101 Cherry Avenue', 'San Jose', 'CA', 465000, 4, 2.0, 2000, 'single_family', '2024-03-20', 10, 232.50, 1.1, 'staged', 0.90);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify seed data was inserted:
-- SELECT COUNT(*) as total_comps FROM comps WHERE source = 'staged';
-- SELECT 
--     AVG(comp_price) as avg_price,
--     MIN(comp_price) as min_price,
--     MAX(comp_price) as max_price,
--     AVG(price_per_sqft) as avg_price_per_sqft
-- FROM comps 
-- WHERE source = 'staged';
