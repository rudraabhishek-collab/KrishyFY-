-- MySQL dump 10.13  Distrib 9.6.0, for macos26.3 (arm64)
--
-- Host: localhost    Database: krishify
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'e61c9a08-9d4c-11f1-b318-b15594e6c72f:1-132';

--
-- Table structure for table `Auction`
--

DROP TABLE IF EXISTS `Auction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Auction` (
  `id` varchar(191) NOT NULL,
  `cropListingId` varchar(191) NOT NULL,
  `startingPrice` decimal(10,2) NOT NULL,
  `minimumIncrement` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  `startsAt` datetime(3) NOT NULL,
  `endsAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `cropListingId` (`cropListingId`),
  CONSTRAINT `auction_ibfk_1` FOREIGN KEY (`cropListingId`) REFERENCES `CropListing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Auction`
--

LOCK TABLES `Auction` WRITE;
/*!40000 ALTER TABLE `Auction` DISABLE KEYS */;
INSERT INTO `Auction` VALUES ('fbefe552-055a-48c8-b28c-8ff0ef724d24','05ac3c22-2318-42cc-a838-3c96b91c26e6',3456.00,500.00,'ACTIVE','2026-09-01 17:44:41.000','2026-09-08 18:44:41.000','2026-08-23 17:04:01.000','2026-08-23 17:04:01.000');
/*!40000 ALTER TABLE `Auction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Bid`
--

DROP TABLE IF EXISTS `Bid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Bid` (
  `id` varchar(191) NOT NULL,
  `auctionId` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `auctionId` (`auctionId`),
  KEY `buyerId` (`buyerId`),
  CONSTRAINT `bid_ibfk_1` FOREIGN KEY (`auctionId`) REFERENCES `Auction` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bid_ibfk_2` FOREIGN KEY (`buyerId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Bid`
--

LOCK TABLES `Bid` WRITE;
/*!40000 ALTER TABLE `Bid` DISABLE KEYS */;
INSERT INTO `Bid` VALUES ('73e66585-f930-4977-8de9-5428e517116a','fbefe552-055a-48c8-b28c-8ff0ef724d24','d81459ee-a5e1-11f1-860c-5395f1fa136c',3500.00,'2026-09-01 18:45:02.000');
/*!40000 ALTER TABLE `Bid` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CropInspection`
--

DROP TABLE IF EXISTS `CropInspection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CropInspection` (
  `id` varchar(36) NOT NULL,
  `cropListingId` varchar(36) NOT NULL,
  `inspectorId` varchar(36) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'PENDING',
  `grade` varchar(20) DEFAULT NULL,
  `moisturePercentage` decimal(5,2) DEFAULT NULL,
  `foreignMatterPercentage` decimal(5,2) DEFAULT NULL,
  `damagedPercentage` decimal(5,2) DEFAULT NULL,
  `weightKg` int DEFAULT NULL,
  `appearance` varchar(100) DEFAULT NULL,
  `remarks` text,
  `inspectionCertificate` varchar(100) DEFAULT NULL,
  `inspectedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cropListingId` (`cropListingId`),
  KEY `inspectorId` (`inspectorId`),
  CONSTRAINT `cropinspection_ibfk_1` FOREIGN KEY (`cropListingId`) REFERENCES `CropListing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cropinspection_ibfk_2` FOREIGN KEY (`inspectorId`) REFERENCES `User` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CropInspection`
--

LOCK TABLES `CropInspection` WRITE;
/*!40000 ALTER TABLE `CropInspection` DISABLE KEYS */;
INSERT INTO `CropInspection` VALUES ('b40a033a-a5ed-11f1-860c-5395f1fa136c','05ac3c22-2318-42cc-a838-3c96b91c26e6','a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-01 15:42:57','2026-09-01 16:05:48'),('b40a03d0-a5ed-11f1-860c-5395f1fa136c','5fd26193-b3e5-46d7-9bd7-200d351fe957','a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-01 15:42:57','2026-09-01 15:42:57'),('b40a03f8-a5ed-11f1-860c-5395f1fa136c','b1616cf5-e35d-4352-a8e3-dc817e10499f','a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-01 15:42:57','2026-09-01 15:42:57'),('b40a0416-a5ed-11f1-860c-5395f1fa136c','c9ced4d7-ca2a-40b4-8a22-fe2439dc0237','a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-01 15:42:57','2026-09-01 15:42:57'),('fdee07fa-a5f0-11f1-860c-5395f1fa136c','aca92332-1064-4b99-8587-f72780002678','a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','APPROVED','A',11.50,NULL,NULL,NULL,NULL,'Good quality',NULL,'2026-09-01 18:10:36','2026-09-01 16:06:29','2026-09-01 18:10:36');
/*!40000 ALTER TABLE `CropInspection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CropListing`
--

DROP TABLE IF EXISTS `CropListing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CropListing` (
  `id` varchar(191) NOT NULL,
  `farmerId` varchar(191) NOT NULL,
  `cropName` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `description` text,
  `quantity` varchar(191) NOT NULL,
  `unit` varchar(191) NOT NULL,
  `expectedPrice` decimal(10,2) DEFAULT NULL,
  `quantityKg` int DEFAULT '0',
  `expectedPricePerQuintal` decimal(10,2) DEFAULT NULL,
  `lotStatus` varchar(50) DEFAULT 'DRAFT',
  `inspectionStatus` varchar(50) DEFAULT 'PENDING',
  `aiAssessmentStatus` varchar(50) DEFAULT 'PENDING',
  `location` varchar(191) DEFAULT NULL,
  `harvestDate` datetime(3) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `farmerId` (`farmerId`),
  CONSTRAINT `croplisting_ibfk_1` FOREIGN KEY (`farmerId`) REFERENCES `User` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CropListing`
--

LOCK TABLES `CropListing` WRITE;
/*!40000 ALTER TABLE `CropListing` DISABLE KEYS */;
INSERT INTO `CropListing` VALUES ('05ac3c22-2318-42cc-a838-3c96b91c26e6','1037858a-9e3f-11f1-b6a6-7d2d6c97b1b2','Mangoes','Fruits','kldhfla','470','quintal',3425.74,470,3425.74,'AUCTION_ACTIVE','PENDING','PENDING','Nashik, MH',NULL,'ACTIVE','2026-08-23 17:03:23.000','2026-09-01 16:05:48.000'),('5fd26193-b3e5-46d7-9bd7-200d351fe957','9aa0ef12-a5e3-11f1-860c-5395f1fa136c','Barley','Grains','Test','3000','kg',2200.00,3000,2200.00,'QUALITY_VERIFIED','APPROVED','PENDING','Pune, MH',NULL,'ACTIVE','2026-09-01 14:30:59.000','2026-09-01 14:30:59.000'),('aca92332-1064-4b99-8587-f72780002678','1037858a-9e3f-11f1-b6a6-7d2d6c97b1b2','wheat','Grains',NULL,'4981','kg',2344.65,4981,2344.65,'QUALITY_VERIFIED','APPROVED','PENDING','Pune, maharashtra','2026-08-19 05:30:00.000','ACTIVE','2026-09-01 16:06:26.000','2026-09-01 18:10:36.000'),('b1616cf5-e35d-4352-a8e3-dc817e10499f','d806f182-a5e1-11f1-860c-5395f1fa136c','Wheat','Grains','Good quality','5000','kg',2500.00,5000,2500.00,'QUALITY_VERIFIED','APPROVED','PENDING','Nashik, MH',NULL,'ACTIVE','2026-09-01 14:29:36.000','2026-09-01 14:29:36.000'),('c9ced4d7-ca2a-40b4-8a22-fe2439dc0237','d806f182-a5e1-11f1-860c-5395f1fa136c','Wheat','Grains','Good quality','5000','kg',2500.00,5000,2500.00,'QUALITY_VERIFIED','APPROVED','PENDING','Nashik, MH',NULL,'ACTIVE','2026-09-01 14:19:10.000','2026-09-01 14:19:10.000');
/*!40000 ALTER TABLE `CropListing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CropQualityAssessment`
--

DROP TABLE IF EXISTS `CropQualityAssessment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CropQualityAssessment` (
  `id` varchar(36) NOT NULL,
  `cropListingId` varchar(36) NOT NULL,
  `score` int DEFAULT NULL,
  `grade` varchar(1) DEFAULT NULL,
  `issues` json DEFAULT NULL,
  `observations` text,
  `confidence` int DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cropListingId` (`cropListingId`),
  CONSTRAINT `cropqualityassessment_ibfk_1` FOREIGN KEY (`cropListingId`) REFERENCES `CropListing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CropQualityAssessment`
--

LOCK TABLES `CropQualityAssessment` WRITE;
/*!40000 ALTER TABLE `CropQualityAssessment` DISABLE KEYS */;
/*!40000 ALTER TABLE `CropQualityAssessment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Delivery`
--

DROP TABLE IF EXISTS `Delivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Delivery` (
  `id` varchar(36) NOT NULL,
  `orderId` varchar(36) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'CREATED',
  `trackingNumber` varchar(100) DEFAULT NULL,
  `deliveryPartner` varchar(100) DEFAULT NULL,
  `estimatedDeliveryDate` datetime DEFAULT NULL,
  `dispatchedAt` datetime DEFAULT NULL,
  `deliveredAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderId` (`orderId`),
  CONSTRAINT `delivery_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Delivery`
--

LOCK TABLES `Delivery` WRITE;
/*!40000 ALTER TABLE `Delivery` DISABLE KEYS */;
/*!40000 ALTER TABLE `Delivery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DeliveryEvent`
--

DROP TABLE IF EXISTS `DeliveryEvent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DeliveryEvent` (
  `id` varchar(36) NOT NULL,
  `deliveryId` varchar(36) NOT NULL,
  `status` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `deliveryId` (`deliveryId`),
  CONSTRAINT `deliveryevent_ibfk_1` FOREIGN KEY (`deliveryId`) REFERENCES `Delivery` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DeliveryEvent`
--

LOCK TABLES `DeliveryEvent` WRITE;
/*!40000 ALTER TABLE `DeliveryEvent` DISABLE KEYS */;
/*!40000 ALTER TABLE `DeliveryEvent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notification`
--

DROP TABLE IF EXISTS `Notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notification` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `read_flag` tinyint(1) NOT NULL DEFAULT '0',
  `relatedEntityType` varchar(100) DEFAULT NULL,
  `relatedEntityId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notification`
--

LOCK TABLES `Notification` WRITE;
/*!40000 ALTER TABLE `Notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Order`
--

DROP TABLE IF EXISTS `Order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Order` (
  `id` varchar(191) NOT NULL,
  `cropListingId` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `farmerId` varchar(191) NOT NULL,
  `auctionId` varchar(191) DEFAULT NULL,
  `quantity` varchar(50) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `pricePerUnit` decimal(10,2) DEFAULT NULL,
  `totalAmount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `cropListingId` (`cropListingId`),
  KEY `buyerId` (`buyerId`),
  KEY `farmerId` (`farmerId`),
  KEY `auctionId` (`auctionId`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`cropListingId`) REFERENCES `CropListing` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`buyerId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_ibfk_3` FOREIGN KEY (`farmerId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_ibfk_4` FOREIGN KEY (`auctionId`) REFERENCES `Auction` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Order`
--

LOCK TABLES `Order` WRITE;
/*!40000 ALTER TABLE `Order` DISABLE KEYS */;
/*!40000 ALTER TABLE `Order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Payment`
--

DROP TABLE IF EXISTS `Payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `razorpayOrderId` varchar(191) NOT NULL,
  `razorpayPaymentId` varchar(191) DEFAULT NULL,
  `razorpaySignature` varchar(191) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(50) NOT NULL DEFAULT 'INR',
  `status` varchar(50) NOT NULL DEFAULT 'CREATED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderId` (`orderId`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payment`
--

LOCK TABLES `Payment` WRITE;
/*!40000 ALTER TABLE `Payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `Payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Review`
--

DROP TABLE IF EXISTS `Review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Review` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `farmerId` varchar(191) NOT NULL,
  `cropListingId` varchar(191) NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uidx_orderId_bucket` (`orderId`,`buyerId`),
  KEY `buyerId` (`buyerId`),
  KEY `farmerId` (`farmerId`),
  KEY `cropListingId` (`cropListingId`),
  CONSTRAINT `review_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_ibfk_2` FOREIGN KEY (`buyerId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_ibfk_3` FOREIGN KEY (`farmerId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_ibfk_4` FOREIGN KEY (`cropListingId`) REFERENCES `CropListing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Review`
--

LOCK TABLES `Review` WRITE;
/*!40000 ALTER TABLE `Review` DISABLE KEYS */;
/*!40000 ALTER TABLE `Review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Session`
--

DROP TABLE IF EXISTS `Session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Session` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Session`
--

LOCK TABLES `Session` WRITE;
/*!40000 ALTER TABLE `Session` DISABLE KEYS */;
INSERT INTO `Session` VALUES ('0c29af86bc5647e11df2d1b9b047e8cdb9d71877581ff75ef1afef0d33c944e4','d806f182-a5e1-11f1-860c-5395f1fa136c','2026-09-02 15:56:23.851','2026-09-01 15:56:23.000'),('0fa89990b1524bb4ce729823c4b6cfe88ebafd2571d4333f63af68d4e836f2c7','d81459ee-a5e1-11f1-860c-5395f1fa136c','2026-09-02 18:44:06.822','2026-09-01 18:44:06.000'),('1133f7d43c72d5d1a0ae7231ae21494d47c14ed4aa3c9437e29f388748831259','1037858a-9e3f-11f1-b6a6-7d2d6c97b1b2','2026-08-23 21:05:29.794','2026-08-22 21:05:29.000'),('130ac01b4ebca32602f280e81c1ceb004cc40cac483d8c94a5c8151ec0b5d80d','a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','2026-09-02 15:50:26.798','2026-09-01 15:50:26.000'),('1e8ec8582cfd233ccc4aca8b1e5ad434cdf89e32f403145af36ff7cc6794fd76','d81459ee-a5e1-11f1-860c-5395f1fa136c','2026-09-02 16:04:18.940','2026-09-01 16:04:18.000'),('2c365ac330ff5b2abbefcb5db9e5e6d4d1b726667dd78e10730b8042a745e25c','f6091e06-a5e8-11f1-860c-5395f1fa136c','2026-09-02 15:09:00.475','2026-09-01 15:09:00.000'),('2e253c4c812cd6c55c81ec53a76a5d99e6c4e45e4c4aaf22b8d59640bfc816d6','a6c2bd2a-a5ed-11f1-860c-5395f1fa136c','2026-09-02 18:46:43.170','2026-09-01 18:46:43.000'),('3a9bed5b81399eff2aea048c6b0404d0eb558c05dd89b6ffaf61ce7ba9879594','96100302-a5e3-11f1-860c-5395f1fa136c','2026-09-02 14:30:31.977','2026-09-01 14:30:31.000'),('43a302fc543648b98cc360173f4f90ae959cab9c2c25a2d830f857d84979df48','2abbd33c-9ee6-11f1-860c-5395f1fa136c','2026-08-24 17:01:32.998','2026-08-23 17:01:32.000'),('473bfd50df5ee457f9f8d3e2cf139b4c08d10d5b63074f66f6fa88ce7fac6642','2abbd33c-9ee6-11f1-860c-5395f1fa136c','2026-08-24 17:01:26.371','2026-08-23 17:01:26.000'),('579d623b60587b0b5f53db32a38e6776a0613b2e043a055abd51202b156470ce','a6c2bd2a-a5ed-11f1-860c-5395f1fa136c','2026-09-02 16:04:28.930','2026-09-01 16:04:28.000'),('59be33d27aa5c99d121fc3d29e440c362433d11091853f9d88e709cac5e3cdfc','f6091e06-a5e8-11f1-860c-5395f1fa136c','2026-09-02 15:09:13.798','2026-09-01 15:09:13.000'),('5a9de91b169f3e0ac51ad5d3c798691fb71d394ea9224652e89dcf1749543e59','d806f182-a5e1-11f1-860c-5395f1fa136c','2026-09-02 15:26:57.128','2026-09-01 15:26:57.000'),('5f8798407e491d547f347dcca574dd39a776c207db59f77b0b9283bbe90c5569','1037858a-9e3f-11f1-b6a6-7d2d6c97b1b2','2026-08-23 23:48:58.795','2026-08-22 23:48:58.000'),('712f4472371b09bd28b21e1b76402201db577b3cfc442744d56234681a3440ea','9aa0ef12-a5e3-11f1-860c-5395f1fa136c','2026-09-02 14:30:50.478','2026-09-01 14:30:50.000'),('7c5049f463d87ece506e21fcc52ebb0dfdac150b14d603820e4e7c7354625f77','f86d1634-a5e3-11f1-860c-5395f1fa136c','2026-09-02 14:33:27.598','2026-09-01 14:33:27.000'),('8564b1faac743439677a8e6c70ba42e905cb74e76162edf60c6c3471ef480bf1','9e2a0366-9ee6-11f1-860c-5395f1fa136c','2026-08-25 13:36:13.348','2026-08-24 13:36:13.000'),('a1d65ec39e093f4610213c01b9697765b0761af5b6c2abe3f56c6315657b5e99','9aa0ef12-a5e3-11f1-860c-5395f1fa136c','2026-09-02 14:30:39.635','2026-09-01 14:30:39.000'),('a88fa6afea2e4afabd2894b2082e806719d717b7c2565eaca1bd5623509c6bd1','5624c182-9d79-11f1-b6a6-7d2d6c97b1b2','2026-09-02 18:46:42.646','2026-09-01 18:46:42.000'),('b1c9b4f39427566c3c3c77badc62656a01292fd462862ae75fa2491d2a5e463c','a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','2026-09-02 15:50:43.708','2026-09-01 15:50:43.000'),('b339742e2e89460ebab40eaf146d8cb07ddb3c01d5550c2a8405d2778bd094f0','2abbd33c-9ee6-11f1-860c-5395f1fa136c','2026-08-24 17:01:28.725','2026-08-23 17:01:28.000'),('d33d64f8062ded77d0df844e50b86614bb75dbe2a2465ae5af924bb219f765ee','a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','2026-09-02 16:04:28.715','2026-09-01 16:04:28.000'),('dd5fc08838234d600f478cdbf4ad16841cf47131a70c96b0770a9dfcc0f0bcc7','a6c2bd2a-a5ed-11f1-860c-5395f1fa136c','2026-09-02 15:51:22.864','2026-09-01 15:51:22.000'),('dda5a631d70bfba8e787d4a5d0848724802d9b6563780795b9b345855f1fad9b','f6091e06-a5e8-11f1-860c-5395f1fa136c','2026-09-02 15:23:22.359','2026-09-01 15:23:22.000'),('e45479cad36d5f87c885097cff4a83a3dcabc7bbbe12e38e15fa2f6514efbdf7','a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','2026-09-02 16:04:38.726','2026-09-01 16:04:38.000'),('fd136e3b6a397bc32fae8c7727d09c8ef39152040cca3c802a6750822be99db2','9aa0ef12-a5e3-11f1-860c-5395f1fa136c','2026-09-02 14:30:50.393','2026-09-01 14:30:50.000'),('fe53ad24028c689ba2b8e9d5ca3615b07ad59fd117af2ec02a3d981be6d1d863','d806f182-a5e1-11f1-860c-5395f1fa136c','2026-09-02 14:18:27.210','2026-09-01 14:18:27.000');
/*!40000 ALTER TABLE `Session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('1037858a-9e3f-11f1-b6a6-7d2d6c97b1b2','Rudraabhishek','rudrasharmaabhishek2006@gmail.com','$2b$10$oZEPR1gGE6EIkoknJZSLAukyyx70VFfQmh/RJxaSwuFlGxEd.AKHS','farmer','2026-08-22 21:05:11.000'),('5624c182-9d79-11f1-b6a6-7d2d6c97b1b2','Test Farmer','farmer@example.com','$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG','farmer','2026-08-21 21:29:48.000'),('562f8e5a-9d79-11f1-b6a6-7d2d6c97b1b2','Test Buyer','buyer@example.com','$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG','buyer','2026-08-21 21:29:48.000'),('96100302-a5e3-11f1-860c-5395f1fa136c','Test Farmer 2','farmer2@test.com','$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG','farmer','2026-09-01 14:30:31.000'),('9aa0ef12-a5e3-11f1-860c-5395f1fa136c','TestFarmer3','f3@test.com','$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG','farmer','2026-09-01 14:30:39.000'),('9e2a0366-9ee6-11f1-860c-5395f1fa136c','Ramesh','cryptofx438@gmail.com','$2b$10$5Ok.KLCu5nexB.vEo/RsjuBfXLreUiO9DBzGxvzZzSw/o.L2qHARe','buyer','2026-08-23 17:04:35.000'),('a6c2b4c4-a5ed-11f1-860c-5395f1fa136c','Field Inspector','inspector@krishify.com','$2b$10$H9yYhWnCFNnFhM7r9jI/x.VrgnP8EMGzTRkxnSt42jJkluWaVoyRS','inspector','2026-09-01 15:42:34.000'),('a6c2bd2a-a5ed-11f1-860c-5395f1fa136c','Platform Admin','admin@krishify.com','$2b$10$H9yYhWnCFNnFhM7r9jI/x.VrgnP8EMGzTRkxnSt42jJkluWaVoyRS','admin','2026-09-01 15:42:34.000'),('d806f182-a5e1-11f1-860c-5395f1fa136c','Test Farmer','farmer@test.com','$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG','farmer','2026-09-01 14:18:03.000'),('d81459ee-a5e1-11f1-860c-5395f1fa136c','Test Buyer','buyer@test.com','$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG','buyer','2026-09-01 14:18:03.000'),('f6091e06-a5e8-11f1-860c-5395f1fa136c','Test User','testlogin@test.com','$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG','farmer','2026-09-01 15:09:00.000'),('f86d1634-a5e3-11f1-860c-5395f1fa136c','AuditFarmer','auditf@test.com','$2b$10$hlFqb9fdcuPIBJferHaDfey7jx9RYFnTh/qvU.AVT.bVulgZsqjHG','farmer','2026-09-01 14:33:16.000');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-02 15:01:07
