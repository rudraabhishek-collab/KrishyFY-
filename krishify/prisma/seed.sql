-- Krishify Seed Data
-- Run this after importing the schema to create test accounts
-- Password for all accounts: test123 (bcrypt hash below)
-- Password for inspector/admin: Inspector@123

-- Test accounts (all passwords are bcrypt hashed)
INSERT IGNORE INTO User (id, name, email, password, role, createdAt) VALUES
(UUID(), 'Test Farmer', 'farmer@test.com', '$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG', 'farmer', NOW()),
(UUID(), 'Test Buyer', 'buyer@test.com', '$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG', 'buyer', NOW()),
(UUID(), 'Field Inspector', 'inspector@krishify.com', '$2b$10$H9yYhWnCFNnFhM7r9jI/x.VrgnP8EMGzTRkxnSt42jJkluWaVoyRS', 'inspector', NOW()),
(UUID(), 'Platform Admin', 'admin@krishify.com', '$2b$10$H9yYhWnCFNnFhM7r9jI/x.VrgnP8EMGzTRkxnSt42jJkluWaVoyRS', 'admin', NOW());

-- Sample crop listing
INSERT IGNORE INTO CropListing (id, farmerId, cropName, category, description, quantity, unit, quantityKg, expectedPrice, expectedPricePerQuintal, location, lotStatus, inspectionStatus, status, createdAt, updatedAt)
SELECT UUID(), u.id, 'Wheat', 'Grains', 'Premium quality wheat from Nashik', '5000', 'kg', 5000, 2500.00, 2500.00, 'Nashik, MH', 'QUALITY_VERIFIED', 'APPROVED', 'ACTIVE', NOW(), NOW()
FROM User u WHERE u.email = 'farmer@test.com' LIMIT 1;

SELECT 'Seed complete. Test accounts created.' AS status;
SELECT email, role FROM User ORDER BY createdAt DESC LIMIT 10;
