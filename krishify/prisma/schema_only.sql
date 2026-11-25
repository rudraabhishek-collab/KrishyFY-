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
  `read` tinyint(1) NOT NULL DEFAULT '0',
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
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-02 15:01:27
