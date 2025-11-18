-- --------------------------------------------------------
-- Máy chủ:                      mysql-52bc0f0-phudev23-c359.d.aivencloud.com
-- Phiên bản máy chủ:            8.0.35 - Source distribution
-- HĐH máy chủ:                  Linux
-- HeidiSQL Phiên bản:           12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for sales_db
CREATE DATABASE IF NOT EXISTS `sales_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sales_db`;

-- Dumping structure for bảng sales_db.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` binary(16) NOT NULL,
  `audience` enum('CUSTOMER','DEALER','STAFF') NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `message` varchar(512) NOT NULL,
  `type` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Đang đổ dữ liệu cho bảng sales_db.notifications: ~18 rows (xấp xỉ)
INSERT INTO `notifications` (`id`, `audience`, `created_at`, `is_read`, `link`, `message`, `type`) VALUES
	(_binary 0x011e3aec5453433eb6863af870f5c4a4, 'STAFF', '2025-11-16 00:56:39.040855', b'0', '/evm/b2b-orders/e58527f9-cad2-47c4-b900-0cec04f930ce', 'Đại lý (Email: admin@gmail.com) vừa tạo đơn hàng mới ...04f930ce.', 'ORDER_PLACED'),
	(_binary 0x106391af64c84e7284fc3e1b697aec4d, 'STAFF', '2025-11-15 00:30:42.818715', b'0', '/evm/b2b-orders/2d15c270-69b0-49a3-afe4-b942963f6f0b', 'Đại lý (Email: HPMN@gmail.com) vừa tạo đơn hàng mới ...963f6f0b.', 'ORDER_PLACED'),
	(_binary 0x12d4a4d68f3e49949d568b51828412a9, 'STAFF', '2025-11-14 21:04:21.083505', b'0', '/evm/b2b-orders/f72bd8fd-5c11-48f4-9fd6-f7a9733d70ea', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...733d70ea.', 'ORDER_PLACED'),
	(_binary 0x1471439bfed34da4918ae70045cdedb4, 'STAFF', '2025-11-16 01:50:55.504619', b'0', '/evm/b2b-orders/67ea9afd-7c23-4a42-ad7f-6768b81fc0e5', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...b81fc0e5.', 'ORDER_PLACED'),
	(_binary 0x2125a943af5d43e186ef14e85c87dc70, 'STAFF', '2025-11-16 18:53:39.827089', b'0', '/evm/b2b-orders/6cba30c1-3b1e-4791-ab43-9514008992d1', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...008992d1.', 'ORDER_PLACED'),
	(_binary 0x240b69d5cb4844ff838304aa3a51f37a, 'STAFF', '2025-11-15 00:54:36.452086', b'0', '/evm/b2b-orders/cc55cc5c-1ba5-4780-8daf-0d6095fc92b7', 'Đại lý (Email: admin@gmail.com) vừa tạo đơn hàng mới ...95fc92b7.', 'ORDER_PLACED'),
	(_binary 0x26414db37e524c6d89b0c9798a17512d, 'STAFF', '2025-11-16 18:17:23.796941', b'0', '/evm/b2b-orders/7be90106-916f-4c58-8f1d-d0c2198adf4e', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...198adf4e.', 'ORDER_PLACED'),
	(_binary 0x361d27fe506f4c17b2d7fd78ce43ef77, 'STAFF', '2025-11-14 20:53:54.977292', b'0', '/evm/b2b-orders/3621a0e1-43d6-4df4-9ee6-013bff506179', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...ff506179.', 'ORDER_PLACED'),
	(_binary 0x3b307c85a4794dafad3ed0921cc954f8, 'STAFF', '2025-11-14 16:20:57.456122', b'0', '/evm/b2b-orders/004d2d49-e921-4d1e-bb37-96f32237f508', 'Đại lý (Email: HPMN@gmail.com) vừa tạo đơn hàng mới ...2237f508.', 'ORDER_PLACED'),
	(_binary 0x3f23a484bf7e4a7ebe2294f2681c1f58, 'STAFF', '2025-11-14 14:27:02.100914', b'0', '/evm/b2b-orders/acce18a7-7126-4fa5-b00a-9eee25a66c6e', 'Đại lý (Email: StafffHangXe@gmail.com) vừa tạo đơn hàng mới ...25a66c6e.', 'ORDER_PLACED'),
	(_binary 0x445894552aff408ca660205cb7a77a22, 'STAFF', '2025-11-14 14:27:07.434752', b'0', '/evm/b2b-orders/acce18a7-7126-4fa5-b00a-9eee25a66c6e', 'Đại lý (Email: StafffHangXe@gmail.com) vừa tạo đơn hàng mới ...25a66c6e.', 'ORDER_PLACED'),
	(_binary 0x48038a74f36642dbb541e1e21f79dfb4, 'STAFF', '2025-11-15 20:57:47.650503', b'0', '/evm/b2b-orders/8dd9725c-090f-4bf3-a70f-5241133d939c', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...133d939c.', 'ORDER_PLACED'),
	(_binary 0x4ed366ca3b3c4800bb6e1996bffa5fdd, 'STAFF', '2025-11-16 01:13:25.919117', b'0', '/evm/b2b-orders/35440bbf-0586-4ac9-811d-bbc4eed823d6', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...eed823d6.', 'ORDER_PLACED'),
	(_binary 0x4fc35993802e4526b267b6b981c84b1a, 'STAFF', '2025-11-15 00:39:03.370790', b'0', '/evm/b2b-orders/21db75ae-b37e-43ef-a3b4-a9eeb5c9e9fe', 'Đại lý (Email: admin@gmail.com) vừa tạo đơn hàng mới ...b5c9e9fe.', 'ORDER_PLACED'),
	(_binary 0x549e63332adf4dde873bd027827288f0, 'STAFF', '2025-11-15 00:52:24.393542', b'0', '/evm/b2b-orders/bde1605d-6f57-4f06-9faf-e46d01f3b54e', 'Đại lý (Email: Q1MN@gmail.com) vừa tạo đơn hàng mới ...01f3b54e.', 'ORDER_PLACED'),
	(_binary 0x5882c757999749729b4b4336e0a7b9e2, 'STAFF', '2025-11-16 18:31:17.909725', b'0', '/evm/b2b-orders/cb30b23b-c8a2-4ef6-9d93-f288401e9d8a', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...401e9d8a.', 'ORDER_PLACED'),
	(_binary 0x5903ab64145c4458b15e5eca53fc97c9, 'STAFF', '2025-11-15 00:57:33.251889', b'0', '/evm/b2b-orders/b325337a-e179-4390-9049-2732ce37bbee', 'Đại lý (Email: Q1MN@gmail.com) vừa tạo đơn hàng mới ...ce37bbee.', 'ORDER_PLACED'),
	(_binary 0x68cfcb7f7e0d45d6807d2ee8160227f3, 'STAFF', '2025-11-15 00:53:30.725703', b'0', '/evm/b2b-orders/cc55cc5c-1ba5-4780-8daf-0d6095fc92b7', 'Đại lý (Email: admin@gmail.com) vừa tạo đơn hàng mới ...95fc92b7.', 'ORDER_PLACED'),
	(_binary 0x6cfba0a0081041dca2e2aeccfe8939a0, 'STAFF', '2025-11-16 18:09:50.263574', b'0', '/evm/b2b-orders/d4ae837f-12c3-4b95-bef2-ac7c0628a8a8', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...0628a8a8.', 'ORDER_PLACED'),
	(_binary 0x924c96917468455eb6f1e529102abef1, 'STAFF', '2025-11-16 01:47:38.701292', b'0', '/evm/b2b-orders/c3a1a690-4226-4f9d-a091-23060ae535b1', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...0ae535b1.', 'ORDER_PLACED'),
	(_binary 0x93ed856ea87c4e29b68f3199ef002460, 'STAFF', '2025-11-15 00:54:41.946621', b'0', '/evm/b2b-orders/cc55cc5c-1ba5-4780-8daf-0d6095fc92b7', 'Đại lý (Email: admin@gmail.com) vừa tạo đơn hàng mới ...95fc92b7.', 'ORDER_PLACED'),
	(_binary 0x949c414f5de04534ab603afa280f9c93, 'STAFF', '2025-11-16 18:02:51.731686', b'0', '/evm/b2b-orders/baf513ec-0b61-4527-b0e5-80346d039e91', 'Đại lý (Email: HPMN@gmail.com) vừa tạo đơn hàng mới ...6d039e91.', 'ORDER_PLACED'),
	(_binary 0x95cd99d30adf49e2b3a23fecfc220bc7, 'STAFF', '2025-11-16 18:11:57.319516', b'0', '/evm/b2b-orders/5a5a684a-47ea-4cdd-b928-b50f3445ab00', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...3445ab00.', 'ORDER_PLACED'),
	(_binary 0xa1a941f8a3244e5683dfad2c7f12099d, 'STAFF', '2025-11-16 01:12:29.797579', b'0', '/evm/b2b-orders/35440bbf-0586-4ac9-811d-bbc4eed823d6', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...eed823d6.', 'ORDER_PLACED'),
	(_binary 0xa32e04b5bb014e8b88e1eea67eb1db0a, 'STAFF', '2025-11-16 18:19:49.388584', b'0', '/evm/b2b-orders/bc6292c9-9f35-46b5-a8b3-944e54c06435', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...54c06435.', 'ORDER_PLACED'),
	(_binary 0xa7e6317e4e324fef837ba13c7fa548eb, 'STAFF', '2025-11-16 18:33:15.862384', b'0', '/evm/b2b-orders/4a1dc95d-ed6f-4bee-a20a-c0f73163010b', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...3163010b.', 'ORDER_PLACED'),
	(_binary 0xaa85d377a0624490ac070c67e3d9275d, 'STAFF', '2025-11-14 20:54:47.489370', b'0', '/evm/b2b-orders/3621a0e1-43d6-4df4-9ee6-013bff506179', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...ff506179.', 'ORDER_PLACED'),
	(_binary 0xad706802df8941b197f7567263658dd0, 'STAFF', '2025-11-16 01:39:02.745474', b'0', '/evm/b2b-orders/8c9e12f4-91d8-4946-9b71-9584ef747403', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...ef747403.', 'ORDER_PLACED'),
	(_binary 0xb606ad332f114f4799bffe136319b4aa, 'STAFF', '2025-11-16 02:19:19.141353', b'0', '/evm/b2b-orders/a98767a3-3b07-487e-a02d-6157dcfedb55', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...dcfedb55.', 'ORDER_PLACED'),
	(_binary 0xb778992b45034157aa60193b04a96bc6, 'STAFF', '2025-11-16 02:07:53.967738', b'0', '/evm/b2b-orders/843d1a5f-95ee-411c-aee4-06ea7960e848', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...7960e848.', 'ORDER_PLACED'),
	(_binary 0xb80f9719c9754624831c2ef62271e2d2, 'STAFF', '2025-11-16 18:43:22.751926', b'0', '/evm/b2b-orders/59044779-c2c8-4f7a-ba18-4d761750a5df', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...1750a5df.', 'ORDER_PLACED'),
	(_binary 0xc0eb7a9ae7cc48479c0dd94cbaf9c41b, 'STAFF', '2025-11-15 00:52:18.859421', b'0', '/evm/b2b-orders/bde1605d-6f57-4f06-9faf-e46d01f3b54e', 'Đại lý (Email: Q1MN@gmail.com) vừa tạo đơn hàng mới ...01f3b54e.', 'ORDER_PLACED'),
	(_binary 0xc148791c7c7541ce9f8d945e565464ed, 'STAFF', '2025-11-15 00:31:53.879785', b'0', '/evm/b2b-orders/2d15c270-69b0-49a3-afe4-b942963f6f0b', 'Đại lý (Email: HPMN@gmail.com) vừa tạo đơn hàng mới ...963f6f0b.', 'ORDER_PLACED'),
	(_binary 0xda9014ca8cfc440eb0baa082ca6e6ed1, 'STAFF', '2025-11-15 20:57:53.032315', b'0', '/evm/b2b-orders/8dd9725c-090f-4bf3-a70f-5241133d939c', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...133d939c.', 'ORDER_PLACED'),
	(_binary 0xde3036ec66ff4ec8b0b680c992b8f093, 'STAFF', '2025-11-16 18:42:30.683381', b'0', '/evm/staff/distribution/inventory/central', 'Cảnh báo: Standard (SKU: VF3-STD-WHT) sắp hết hàng! (Tồn kho: 10 / Ngưỡng: 10)', 'INVENTORY_ALERT'),
	(_binary 0xe780357a97ae4bf7b8de76bebe399ec6, 'STAFF', '2025-11-15 00:31:48.365223', b'0', '/evm/b2b-orders/2d15c270-69b0-49a3-afe4-b942963f6f0b', 'Đại lý (Email: HPMN@gmail.com) vừa tạo đơn hàng mới ...963f6f0b.', 'ORDER_PLACED'),
	(_binary 0xe8bf501673904edcb6a467fb5c27f1f7, 'STAFF', '2025-11-16 18:15:08.521606', b'0', '/evm/b2b-orders/7f0f21e4-b96c-40dd-90aa-ee3585c55e29', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...85c55e29.', 'ORDER_PLACED'),
	(_binary 0xf4895ecfe4054045bca9bc86548164e4, 'STAFF', '2025-11-16 18:42:16.582223', b'0', '/evm/b2b-orders/32785a54-3034-4b58-b5b9-c598ab0c0c84', 'Đại lý (Email: DNMN@gmail.com) vừa tạo đơn hàng mới ...ab0c0c84.', 'ORDER_PLACED'),
	(_binary 0xf6a1212dc0e04ce9950593b9f6213b7d, 'STAFF', '2025-11-15 00:52:29.898985', b'0', '/evm/b2b-orders/cc55cc5c-1ba5-4780-8daf-0d6095fc92b7', 'Đại lý (Email: admin@gmail.com) vừa tạo đơn hàng mới ...95fc92b7.', 'ORDER_PLACED'),
	(_binary 0xfa5108c2581445bf98b3df7676884dc7, 'STAFF', '2025-11-16 18:06:05.480703', b'0', '/evm/b2b-orders/71aab000-c95c-42a8-9c2a-767f09726447', 'Đại lý (Email: HPMN@gmail.com) vừa tạo đơn hàng mới ...09726447.', 'ORDER_PLACED'),
	(_binary 0xff2a361db6164758b5d9cc55d4b5692e, 'STAFF', '2025-11-16 01:38:09.600835', b'0', '/evm/b2b-orders/8c9e12f4-91d8-4946-9b71-9584ef747403', 'Đại lý (Email: HNMN@gmail.com) vừa tạo đơn hàng mới ...ef747403.', 'ORDER_PLACED');

-- Dumping structure for bảng sales_db.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `order_item_id` binary(16) NOT NULL,
  `discount` decimal(5,2) DEFAULT NULL,
  `final_price` decimal(15,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_price` decimal(15,2) DEFAULT NULL,
  `variant_id` bigint NOT NULL,
  `order_id` binary(16) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `FKnpjjoxb2elwrbbitb1pho67cq` (`order_id`),
  CONSTRAINT `FKnpjjoxb2elwrbbitb1pho67cq` FOREIGN KEY (`order_id`) REFERENCES `sales_orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Đang đổ dữ liệu cho bảng sales_db.order_items: ~12 rows (xấp xỉ)
INSERT INTO `order_items` (`order_item_id`, `discount`, `final_price`, `quantity`, `unit_price`, `variant_id`, `order_id`) VALUES
	(_binary 0x04a1da098fff4134bde85738b024ba9a, 0.00, 4200000000.00, 3, 1400000000.00, 11, _binary 0xbaf513ec0b614527b0e580346d039e91),
	(_binary 0x1600b42a3d2d484e800b712af51188c0, 0.00, 4000000000.00, 5, 800000000.00, 7, _binary 0xf72bd8fd5c1148f49fd6f7a9733d70ea),
	(_binary 0x1ba8fcb283214976a5a32d0c68adb772, 0.00, 930000000.00, 1, 930000000.00, 8, _binary 0xc3a1a69042264f9da09123060ae535b1),
	(_binary 0x1f11fbb35d23454f88d54d46bc4f498e, 30.00, 1050000000.00, 2, 750000000.00, 3, _binary 0xa419ac15357944568b7231a95bf44c16),
	(_binary 0x2435c4a14dd54cc48725d7f7ee1e7b44, 0.00, 6100000000.00, 5, 1220000000.00, 10, _binary 0xd4ae837f12c34b95bef2ac7c0628a8a8),
	(_binary 0x302ca0cb985e4f65acd3240aba390958, 0.00, 7550000000.00, 5, 1510000000.00, 12, _binary 0x71aab000c95c42a89c2a767f09726447),
	(_binary 0x30c7dd53c9654e92b74004738207a7c6, 0.00, 1220000000.00, 1, 1220000000.00, 10, _binary 0x843d1a5f95ee411caee406ea7960e848),
	(_binary 0x35f90fd9ea8e496f9bcc2ffcdcf744a4, 0.00, 1260000000.00, 2, 630000000.00, 5, _binary 0xcc55cc5c1ba547808daf0d6095fc92b7),
	(_binary 0x378c0710db7d4d5c9f7cffb47062395b, 0.00, 840000000.00, 2, 420000000.00, 3, _binary 0xcb30b23bc8a24ef69d93f288401e9d8a),
	(_binary 0x38432470796c4bb8b8df9fa8d65a49b4, 0.00, 220000000.00, 1, 220000000.00, 1, _binary 0xb325337ae179439090492732ce37bbee),
	(_binary 0x3bb06badfc484688b761ec84ad63d85e, 0.00, 420000000.00, 1, 420000000.00, 3, _binary 0x67ea9afd7c234a42ad7f6768b81fc0e5),
	(_binary 0x51054c4c16ed4cd4b4c9493088a655cf, 0.00, 1400000000.00, 1, 1400000000.00, 11, _binary 0xbde1605d6f574f069fafe46d01f3b54e),
	(_binary 0x57d76d7406624245ab8afc53a71f9d3e, 0.00, 7550000000.00, 5, 1510000000.00, 12, _binary 0xf72bd8fd5c1148f49fd6f7a9733d70ea),
	(_binary 0x659c74afae284cc4aa9c0879efd0b5b6, 0.00, 1510000000.00, 1, 1510000000.00, 12, _binary 0x35440bbf05864ac9811dbbc4eed823d6),
	(_binary 0x6b9998de7a2341589066e67a45bfdd5b, 0.00, 220000000.00, 1, 220000000.00, 1, _binary 0x3621a0e143d64df49ee6013bff506179),
	(_binary 0x71fdbe306ed2484690e514b46e63b6dc, 0.00, 3200000000.00, 4, 800000000.00, 7, _binary 0x5a5a684a47ea4cddb928b50f3445ab00),
	(_binary 0x728208e4ca4242b8a834ab4cca4f1510, 0.00, 630000000.00, 1, 630000000.00, 5, _binary 0x8dd9725c090f4bf3a70f5241133d939c),
	(_binary 0x7af5395ca930445e8118d1f4a2df4a6e, 0.00, 4650000000.00, 5, 930000000.00, 8, _binary 0x7be90106916f4c588f1dd0c2198adf4e),
	(_binary 0x7b7cc5559d514a67bbb90fe5273202ab, 0.00, 7320000000.00, 6, 1220000000.00, 10, _binary 0x4a1dc95ded6f4beea20ac0f73163010b),
	(_binary 0x876f38282c674359a29b0def6074a6a0, 0.00, 660000000.00, 3, 220000000.00, 2, _binary 0x32785a5430344b58b5b9c598ab0c0c84),
	(_binary 0x95b12c66a590410198bac240bc0d81bf, 0.00, 440000000.00, 2, 220000000.00, 2, _binary 0x2d15c27069b049a3afe4b942963f6f0b),
	(_binary 0x97c9e4e8014d456ea930ac15aaa26cbb, 0.00, 1100000000.00, 5, 220000000.00, 2, _binary 0xf72bd8fd5c1148f49fd6f7a9733d70ea),
	(_binary 0x98fd0686da5247729008d7b4fb40f225, 0.00, 2440000000.00, 2, 1220000000.00, 10, _binary 0x59044779c2c84f7aba184d761750a5df),
	(_binary 0x9a0e9ed8636c4a5f99884f656e61dd63, 0.00, 6200000000.00, 10, 620000000.00, 1, _binary 0x004d2d49e9214d1ebb3796f32237f508),
	(_binary 0xaaeea34837964084a6026b742a6385e6, 0.00, 440000000.00, 2, 220000000.00, 1, _binary 0x21db75aeb37e43efa3b4a9eeb5c9e9fe),
	(_binary 0xb86ce97c19a14ce386eb5d8380b98e52, 0.00, 220000000.00, 1, 220000000.00, 1, _binary 0x6cba30c13b1e4791ab439514008992d1),
	(_binary 0xb96e54d1ddae4e518bd0b4d880c14248, 0.00, 420000000.00, 1, 420000000.00, 3, _binary 0x8c9e12f491d849469b719584ef747403),
	(_binary 0xc97cd0c94dcf4dacbfd412b9f29103dc, 0.00, 6200000000.00, 10, 620000000.00, 1, _binary 0xacce18a771264fa5b00a9eee25a66c6e),
	(_binary 0xcc43de8b89994b6f965ab4d530b16a56, 0.00, 5250000000.00, 5, 1050000000.00, 9, _binary 0xf72bd8fd5c1148f49fd6f7a9733d70ea),
	(_binary 0xdf474e62d2fe42e298a1c45f22f2edf5, 0.00, 1860000000.00, 2, 930000000.00, 8, _binary 0xbc6292c99f3546b5a8b3944e54c06435),
	(_binary 0xe49a06285b844514a6c48e6fb62ef5ea, 0.00, 6040000000.00, 4, 1510000000.00, 12, _binary 0xa98767a33b07487ea02d6157dcfedb55),
	(_binary 0xe8d3b012965448989333248308c7a5d8, 0.00, 1220000000.00, 1, 1220000000.00, 10, _binary 0xe58527f9cad247c4b9000cec04f930ce),
	(_binary 0xee24ce07910d430ea4c5d0d461b9b9f4, 0.00, 1600000000.00, 2, 800000000.00, 7, _binary 0x7f0f21e4b96c40dd90aaee3585c55e29);

-- Dumping structure for bảng sales_db.order_tracking
CREATE TABLE IF NOT EXISTS `order_tracking` (
  `track_id` binary(16) NOT NULL,
  `notes` text,
  `status` varchar(50) DEFAULT NULL,
  `statusb2c` enum('CANCELLED','CONFIRMED','CREATED','DELETED','DELIVERED','EDITED','IN_PRODUCTION','ISSUE_DETECTED','ON_HOLD','READY_FOR_DELIVERY','REJECTED') DEFAULT NULL,
  `update_date` datetime(6) NOT NULL,
  `updated_by` binary(16) DEFAULT NULL,
  `order_id` binary(16) NOT NULL,
  PRIMARY KEY (`track_id`),
  KEY `FK4oyb7pkvgr7xyn14repah6hdc` (`order_id`),
  CONSTRAINT `FK4oyb7pkvgr7xyn14repah6hdc` FOREIGN KEY (`order_id`) REFERENCES `sales_orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Đang đổ dữ liệu cho bảng sales_db.order_tracking: ~52 rows (xấp xỉ)
INSERT INTO `order_tracking` (`track_id`, `notes`, `status`, `statusb2c`, `update_date`, `updated_by`, `order_id`) VALUES
	(_binary 0x044a1271bc6c44cba8412e937f240d9a, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:15:06.140374', NULL, _binary 0x7f0f21e4b96c40dd90aaee3585c55e29),
	(_binary 0x0613bf1d931940c188516eb9fd4d40c4, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:18:01.451469', NULL, _binary 0x7be90106916f4c588f1dd0c2198adf4e),
	(_binary 0x06b4ceb77975426d81546d4fcb49ddea, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 01:38:06.327324', NULL, _binary 0x8c9e12f491d849469b719584ef747403),
	(_binary 0x07803059bf1f4975b8f8763494fa8500, 'Order created from quotation', NULL, 'CREATED', '2025-11-14 16:15:17.840029', _binary 0xba85d10420fb438b8fab4c67073d88c6, _binary 0x314d51e6db6248d5a28f0597b282ef3a),
	(_binary 0x0b969a4697674661af4dfeeae8ebc4e5, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-15 00:52:35.933058', NULL, _binary 0xcc55cc5c1ba547808daf0d6095fc92b7),
	(_binary 0x0bdee401b5dd418fa2c34afe5b558eca, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 01:48:04.171030', NULL, _binary 0xc3a1a69042264f9da09123060ae535b1),
	(_binary 0x0dbaee65caf34c85aa1854691c74604e, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-15 00:55:18.333724', NULL, _binary 0xbde1605d6f574f069fafe46d01f3b54e),
	(_binary 0x14304e7d62014162a87b0bd4d01fec42, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-15 00:57:31.010618', NULL, _binary 0xb325337ae179439090492732ce37bbee),
	(_binary 0x14f3edd883284fd29eb1046f88c4ed03, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:15:41.954915', NULL, _binary 0x7f0f21e4b96c40dd90aaee3585c55e29),
	(_binary 0x1a05147f27fb4e8293d6df5cb3e3f056, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-15 00:58:04.797130', NULL, _binary 0xb325337ae179439090492732ce37bbee),
	(_binary 0x1d8648f07d314386a3c7f3ba8eabbe1e, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-15 00:39:00.676990', NULL, _binary 0x21db75aeb37e43efa3b4a9eeb5c9e9fe),
	(_binary 0x24f3d21a83f146bebb521b4c3be84181, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:03:28.433626', NULL, _binary 0xbaf513ec0b614527b0e580346d039e91),
	(_binary 0x28dc8e40343b4f4a9e5f9dc353de7dde, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:19:47.430234', NULL, _binary 0xbc6292c99f3546b5a8b3944e54c06435),
	(_binary 0x2947fc2fc0c140be8b5bdb76dbb14ce5, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-15 00:39:37.697627', NULL, _binary 0x21db75aeb37e43efa3b4a9eeb5c9e9fe),
	(_binary 0x2a2e4b0747b54c39abf95fd8622929e8, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-15 20:57:59.222743', NULL, _binary 0x8dd9725c090f4bf3a70f5241133d939c),
	(_binary 0x2c9a807e0ba7457481f5d5aeff21c5bb, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:03:01.488456', NULL, _binary 0xbaf513ec0b614527b0e580346d039e91),
	(_binary 0x2d86b315c0734845a48f8c303d5cfa87, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:09:59.163929', NULL, _binary 0xd4ae837f12c34b95bef2ac7c0628a8a8),
	(_binary 0x3084af807b6c42d18cdf261249829768, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-14 20:58:12.923087', NULL, _binary 0x3621a0e143d64df49ee6013bff506179),
	(_binary 0x32844fcbc7cd45b7a4f1a4c13938ca23, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-15 00:58:17.516259', NULL, _binary 0xb325337ae179439090492732ce37bbee),
	(_binary 0x35b40f5d38be403ab7a5f1d253dfd8bc, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:17:31.268642', NULL, _binary 0x7be90106916f4c588f1dd0c2198adf4e),
	(_binary 0x39ce3a8af2ce499c9269910bb4f7bc95, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:02:48.002148', NULL, _binary 0xbaf513ec0b614527b0e580346d039e91),
	(_binary 0x3ebd895dbd9f40dea1f54fb359895cb8, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 00:56:36.852177', NULL, _binary 0xe58527f9cad247c4b9000cec04f930ce),
	(_binary 0x3f5417288fc74a8781982d8f37030749, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-14 16:22:55.789120', NULL, _binary 0x004d2d49e9214d1ebb3796f32237f508),
	(_binary 0x4105310cff2741a49c9befb369c9dc90, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:43:21.721080', NULL, _binary 0x59044779c2c84f7aba184d761750a5df),
	(_binary 0x42b4d29a93b64234a01f655ca3fe7061, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 01:38:57.817633', NULL, _binary 0x8c9e12f491d849469b719584ef747403),
	(_binary 0x4546bde13c1d40c292ae233a554d25f2, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:53:59.621483', NULL, _binary 0x6cba30c13b1e4791ab439514008992d1),
	(_binary 0x45eea62e88e0498aae65e79a4a2e75d9, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 01:47:36.158061', NULL, _binary 0xc3a1a69042264f9da09123060ae535b1),
	(_binary 0x471a024a0b8949bfb77d343bc4d5e893, 'Status updated to CONFIRMED', 'CONFIRMED', NULL, '2025-11-14 16:01:10.183646', _binary 0x432a97e7dcf4052cae418a19b67af864, _binary 0xbfa89b25c13611f08492862ccfb0003d),
	(_binary 0x4816725716df4acba41eabacbf506350, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:42:22.440133', NULL, _binary 0x32785a5430344b58b5b9c598ab0c0c84),
	(_binary 0x4aea823b8c364778bb079ababb867bab, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-14 16:24:20.324325', NULL, _binary 0x004d2d49e9214d1ebb3796f32237f508),
	(_binary 0x4b8dacc14ad94bf08cb58369d2190d2b, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 01:13:39.135171', NULL, _binary 0x35440bbf05864ac9811dbbc4eed823d6),
	(_binary 0x4db07b3ab789444e85031fbd592a0f59, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 02:19:35.472571', NULL, _binary 0xa98767a33b07487ea02d6157dcfedb55),
	(_binary 0x4ee4da3e8f1a41e1b371a6019c26512c, 'Order approved by manager', NULL, 'CREATED', '2025-11-14 15:42:45.992286', _binary 0x122bde25eb3942098f181675a0666ffe, _binary 0xa419ac15357944568b7231a95bf44c16),
	(_binary 0x4f91883a309e4a91bcda546c66634003, 'EVM Staff (StafffEVM@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-14 20:55:09.136815', NULL, _binary 0x21ffec44c15a11f08492862ccfb0003d),
	(_binary 0x506e9cb56c114c61a420305e450cefd9, 'nkkkm', NULL, NULL, '2025-11-14 15:58:08.619050', _binary 0xba85d10420fb438b8fab4c67073d88c6, _binary 0xa419ac15357944568b7231a95bf44c16),
	(_binary 0x52af90b5bdb04edebf17783fd85ab22c, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-14 16:20:55.808758', NULL, _binary 0x004d2d49e9214d1ebb3796f32237f508),
	(_binary 0x545cb30303ac4e4d8e15b5fe2037dc46, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:20:06.717165', NULL, _binary 0xbc6292c99f3546b5a8b3944e54c06435),
	(_binary 0x55bdad237fb44fb2a612fb7624c23044, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:31:16.248122', NULL, _binary 0xcb30b23bc8a24ef69d93f288401e9d8a),
	(_binary 0x560bf937830642f5acc1ac12cdbcff61, 'EVM Staff (StafffEVM@gmail.com) đã giải quyết: Tiếp tục vận chuyển. Ghi chú: ', 'ĐÃ GIẢI QUYẾT (VẬN CHUYỂN LẠI)', NULL, '2025-11-14 21:41:07.218264', NULL, _binary 0xbfa89870c13611f08492862ccfb0003d),
	(_binary 0x5670009b8b3643a6a9e1b0492bf83427, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:17:45.502600', NULL, _binary 0x7be90106916f4c588f1dd0c2198adf4e),
	(_binary 0x5bb3c30a74414421b5c98b8521e24578, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 01:13:59.520282', NULL, _binary 0x35440bbf05864ac9811dbbc4eed823d6),
	(_binary 0x5c164ead456c48c6894f332055491506, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 02:07:51.873482', NULL, _binary 0x843d1a5f95ee411caee406ea7960e848),
	(_binary 0x5c7bc385ff61475caf077e739af15263, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-14 16:21:51.187375', NULL, _binary 0x004d2d49e9214d1ebb3796f32237f508),
	(_binary 0x5fc067942fd74ccfa506312c08bdb813, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 01:38:27.794228', NULL, _binary 0x8c9e12f491d849469b719584ef747403),
	(_binary 0x607c1cf178534144b9bc30b098806261, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-15 00:31:37.616699', NULL, _binary 0x2d15c27069b049a3afe4b942963f6f0b),
	(_binary 0x616990bdf6b540aa8bca69571f754d19, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:12:11.610057', NULL, _binary 0x5a5a684a47ea4cddb928b50f3445ab00),
	(_binary 0x63d06075ed584bcabe689bfc6882a35c, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-14 21:42:59.747613', NULL, _binary 0xf72bd8fd5c1148f49fd6f7a9733d70ea),
	(_binary 0x6488b444942d4fc28ca5c6493f73cd67, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:33:21.413738', NULL, _binary 0x4a1dc95ded6f4beea20ac0f73163010b),
	(_binary 0x68badaa7ea7b43a2ba4db2a9e72bb756, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-15 00:30:03.167225', NULL, _binary 0x2d15c27069b049a3afe4b942963f6f0b),
	(_binary 0x6b2157fa3540435fa1fae33a2f295c4a, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:15:30.211440', NULL, _binary 0x7f0f21e4b96c40dd90aaee3585c55e29),
	(_binary 0x6dd9cb39e18e431ea618277d042c48b5, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-15 20:58:42.786183', NULL, _binary 0x8dd9725c090f4bf3a70f5241133d939c),
	(_binary 0x714533d4ac5840bcbe4da2bca8cc2707, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:09:48.453882', NULL, _binary 0xd4ae837f12c34b95bef2ac7c0628a8a8),
	(_binary 0x734ed7ca92414c60ad95c199f4625349, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:53:40.478574', NULL, _binary 0x6cba30c13b1e4791ab439514008992d1),
	(_binary 0x749890e4a91a421c8f7531ac439acd38, '', NULL, NULL, '2025-11-14 16:17:25.434232', _binary 0x122bde25eb3942098f181675a0666ffe, _binary 0x314d51e6db6248d5a28f0597b282ef3a),
	(_binary 0x7776b89f27634a5f917f822119d97191, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-15 20:57:43.482189', NULL, _binary 0x8dd9725c090f4bf3a70f5241133d939c),
	(_binary 0x78354071376144f1864f2d2a68f6ab4a, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-15 00:58:30.952002', NULL, _binary 0xb325337ae179439090492732ce37bbee),
	(_binary 0x7a38b5cc7ad244f59d5f18035fb8efaf, 'EVM Staff (StafffEVM@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-14 21:40:39.341555', NULL, _binary 0xf72bd8fd5c1148f49fd6f7a9733d70ea),
	(_binary 0x7a475013620543b992f174e6518ead78, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 00:56:48.693076', NULL, _binary 0xe58527f9cad247c4b9000cec04f930ce),
	(_binary 0x7e43a9b33a4440b7a4b2acb2360bc0b4, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:17:22.201230', NULL, _binary 0x7be90106916f4c588f1dd0c2198adf4e),
	(_binary 0x7f1f62c138574486afe8a67c45341231, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:11:49.936816', NULL, _binary 0x5a5a684a47ea4cddb928b50f3445ab00),
	(_binary 0x851c5e261cfe465291738a0e63d82cc0, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 02:08:16.135108', NULL, _binary 0x843d1a5f95ee411caee406ea7960e848),
	(_binary 0x8806efa27884465882a8d7621aa91b7e, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:15:16.114623', NULL, _binary 0x7f0f21e4b96c40dd90aaee3585c55e29),
	(_binary 0x881d256a102c49fc8ba877499bc71020, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:31:25.791303', NULL, _binary 0xcb30b23bc8a24ef69d93f288401e9d8a),
	(_binary 0x8e1d523e82f444df9c8795d270cd50ae, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-15 00:52:27.737678', NULL, _binary 0xcc55cc5c1ba547808daf0d6095fc92b7),
	(_binary 0x8f8868910a9d4ce798b0be24beeac1e2, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:06:17.582370', NULL, _binary 0x71aab000c95c42a89c2a767f09726447),
	(_binary 0x9003c1eb74be4c758959acbd93b9e26a, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-15 20:58:25.798330', NULL, _binary 0x8dd9725c090f4bf3a70f5241133d939c),
	(_binary 0x908325c52f1b454fb61a198df89bbe67, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 01:51:47.516685', NULL, _binary 0x67ea9afd7c234a42ad7f6768b81fc0e5),
	(_binary 0x934956fb749148eeb162a6f1dee98287, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:12:20.503513', NULL, _binary 0x5a5a684a47ea4cddb928b50f3445ab00),
	(_binary 0x940b9b31a977476893c9814bb9a8fac6, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:11:59.428674', NULL, _binary 0x5a5a684a47ea4cddb928b50f3445ab00),
	(_binary 0x95679fa70124482ba076352e8c456214, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 01:50:54.476399', NULL, _binary 0x67ea9afd7c234a42ad7f6768b81fc0e5),
	(_binary 0x96af31e4cdc24fac9bca2b5c596fece5, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:03:15.059419', NULL, _binary 0xbaf513ec0b614527b0e580346d039e91),
	(_binary 0x9923a4fd82eb4005990dec0b2bf6b791, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 01:13:20.572240', NULL, _binary 0x35440bbf05864ac9811dbbc4eed823d6),
	(_binary 0x99c7068b49e54f248800bd3adb7f9f31, 'Order approved by manager', NULL, 'CREATED', '2025-11-14 16:15:44.552132', _binary 0x122bde25eb3942098f181675a0666ffe, _binary 0x314d51e6db6248d5a28f0597b282ef3a),
	(_binary 0x9a3b51d2de754dfa8491807f62009b1f, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:33:31.110650', NULL, _binary 0x4a1dc95ded6f4beea20ac0f73163010b),
	(_binary 0x9fe2444a5e4e4888b4f2d1621dcd9567, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:43:54.521149', NULL, _binary 0x59044779c2c84f7aba184d761750a5df),
	(_binary 0xa0842ff75657450f8ff65ecfe2bd95b8, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 01:47:51.852900', NULL, _binary 0xc3a1a69042264f9da09123060ae535b1),
	(_binary 0xa780c97c933143779b7a063d5087ec48, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 02:07:57.520034', NULL, _binary 0x843d1a5f95ee411caee406ea7960e848),
	(_binary 0xad1b9ddc9c264cf29bb1dac835cdbb43, 'Order created from quotation', NULL, 'CREATED', '2025-11-14 15:40:50.589749', _binary 0xba85d10420fb438b8fab4c67073d88c6, _binary 0xa419ac15357944568b7231a95bf44c16),
	(_binary 0xae02016e8694490ca5ef44392dce6413, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-15 00:51:17.227013', NULL, _binary 0xbde1605d6f574f069fafe46d01f3b54e),
	(_binary 0xb0e0958c00e348eaa6abf3e3cb7713ee, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 00:57:13.881880', NULL, _binary 0xe58527f9cad247c4b9000cec04f930ce),
	(_binary 0xb0fc098235514b24a94ccfa4e6501eaa, 'EVM Staff (StafffHangXe@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-14 14:27:20.208592', NULL, _binary 0xacce18a771264fa5b00a9eee25a66c6e),
	(_binary 0xb28b707e2d6548568839fe4e41efc624, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:42:31.008869', NULL, _binary 0x32785a5430344b58b5b9c598ab0c0c84),
	(_binary 0xb2c381b5332041ff866f6c635fe778b4, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:19:56.793117', NULL, _binary 0xbc6292c99f3546b5a8b3944e54c06435),
	(_binary 0xb9fb68d2c8164dddacf484ea04f0d23e, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 02:19:51.436769', NULL, _binary 0xa98767a33b07487ea02d6157dcfedb55),
	(_binary 0xba13dfa56a104845a9d82d217543ce87, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 01:14:16.711519', NULL, _binary 0x35440bbf05864ac9811dbbc4eed823d6),
	(_binary 0xbe83233a33bd40b59d18aef15674accc, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 01:38:47.748972', NULL, _binary 0x8c9e12f491d849469b719584ef747403),
	(_binary 0xc01279be3ab0454189b5b69152bc6101, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:33:41.385764', NULL, _binary 0x4a1dc95ded6f4beea20ac0f73163010b),
	(_binary 0xc18c5e7260b34bb481e1cac4719c625f, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-14 21:04:19.060925', NULL, _binary 0xf72bd8fd5c1148f49fd6f7a9733d70ea),
	(_binary 0xc3eed4c86d3540eea8824315fc869d0a, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-15 00:29:43.830101', NULL, _binary 0x2d15c27069b049a3afe4b942963f6f0b),
	(_binary 0xc4b8e96ae02247c2a976ad74f45d76ae, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 02:08:06.924544', NULL, _binary 0x843d1a5f95ee411caee406ea7960e848),
	(_binary 0xc7cbc4fdb3e6491c92f3d269fde6876b, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 18:43:31.882257', NULL, _binary 0x59044779c2c84f7aba184d761750a5df),
	(_binary 0xcc5aecaa48154311b49a8a46fea52536, 'EVM Staff (StafffEVM@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-14 20:57:05.765444', NULL, _binary 0x3621a0e143d64df49ee6013bff506179),
	(_binary 0xd192d99466fe4097bebdfdae533e4420, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:20:17.760456', NULL, _binary 0xbc6292c99f3546b5a8b3944e54c06435),
	(_binary 0xd1c96930bc8c4a91854f5bdf5744dd0c, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-15 00:55:03.837671', NULL, _binary 0xbde1605d6f574f069fafe46d01f3b54e),
	(_binary 0xd2e8a00c7b97465180f1f3b007acc07a, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-14 20:53:52.104862', NULL, _binary 0x3621a0e143d64df49ee6013bff506179),
	(_binary 0xd7996450f7f344d0938c1229e61cd8ca, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:43:42.394159', NULL, _binary 0x59044779c2c84f7aba184d761750a5df),
	(_binary 0xd7e9d4b7b495494087f5216e80b684c4, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:06:29.515004', NULL, _binary 0x71aab000c95c42a89c2a767f09726447),
	(_binary 0xd84f312fdf704b28ad2fac9b900f52fc, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-15 00:39:11.785046', NULL, _binary 0x21db75aeb37e43efa3b4a9eeb5c9e9fe),
	(_binary 0xd8738558b5344ba3883ffda25f913a92, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:06:57.551196', NULL, _binary 0x71aab000c95c42a89c2a767f09726447),
	(_binary 0xde9364029cff4ffd8b86a3c65cb4e0ee, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 01:47:44.489271', NULL, _binary 0xc3a1a69042264f9da09123060ae535b1),
	(_binary 0xe08f89209a6240b5a52731cef1ba4d22, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:53:34.025630', NULL, _binary 0x6cba30c13b1e4791ab439514008992d1),
	(_binary 0xe36da18e4a674c868379a433d18872f8, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-14 14:26:56.463274', NULL, _binary 0xacce18a771264fa5b00a9eee25a66c6e),
	(_binary 0xe4a5a569582f4dd0955e3a101f41b2cf, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:10:10.370578', NULL, _binary 0xd4ae837f12c34b95bef2ac7c0628a8a8),
	(_binary 0xe886d3cf7c7b44abb2af0b7c17049ea5, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:42:15.219766', NULL, _binary 0x32785a5430344b58b5b9c598ab0c0c84),
	(_binary 0xe905f2dd7f1744d48c573cb45019dbe2, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-16 01:51:14.687288', NULL, _binary 0x67ea9afd7c234a42ad7f6768b81fc0e5),
	(_binary 0xe9c5e25fd25942cb9c331fcea1a3a20b, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:42:38.691514', NULL, _binary 0x32785a5430344b58b5b9c598ab0c0c84),
	(_binary 0xeb416d7567bd4b7eb017ea737f4f78b1, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:31:36.883025', NULL, _binary 0xcb30b23bc8a24ef69d93f288401e9d8a),
	(_binary 0xeb7f113ef0a84538b2afc342b0b296eb, 'Status updated to CONFIRMED', 'CONFIRMED', NULL, '2025-11-14 17:27:49.719020', _binary 0x432a97e7dcf4052cae418a19b67af864, _binary 0xbfa89bdcc13611f08492862ccfb0003d),
	(_binary 0xf1dba9cddd8e46488f6fda3b4f447c33, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:31:58.698611', NULL, _binary 0xcb30b23bc8a24ef69d93f288401e9d8a),
	(_binary 0xf302aa568ec746539ca40c533706b510, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 02:20:19.791934', NULL, _binary 0xa98767a33b07487ea02d6157dcfedb55),
	(_binary 0xf33e7428dc91495cb4be75c31ff6c67d, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:33:11.395790', NULL, _binary 0x4a1dc95ded6f4beea20ac0f73163010b),
	(_binary 0xf5a250990fd3450fb0405bb345fa6107, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 01:51:27.617879', NULL, _binary 0x67ea9afd7c234a42ad7f6768b81fc0e5),
	(_binary 0xf5ffcd26d4dc4f42a11432dced3ee418, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-14 21:42:45.576684', NULL, _binary 0xf72bd8fd5c1148f49fd6f7a9733d70ea),
	(_binary 0xf708029ece164d089045b6e6abe69637, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 18:06:04.375783', NULL, _binary 0x71aab000c95c42a89c2a767f09726447),
	(_binary 0xf85e1ccc326b4b30b2319db82397b6f0, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-15 00:32:30.495819', NULL, _binary 0x2d15c27069b049a3afe4b942963f6f0b),
	(_binary 0xfa34167dedc84e7c9b92ea433a9a7182, 'EVM Staff (admin@gmail.com) đã xác nhận đơn hàng và kho đã giữ hàng.', 'ĐÃ TIẾP NHẬN ĐẶT XE', NULL, '2025-11-15 00:51:48.891777', NULL, _binary 0xbde1605d6f574f069fafe46d01f3b54e),
	(_binary 0xfc4dbccbb1ba4e928cddbc07180b82e6, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-14 20:57:14.321220', NULL, _binary 0x3621a0e143d64df49ee6013bff506179),
	(_binary 0xfc90f80a3aac4d599da3a5ddda069acd, 'Hàng đã được xuất kho trung tâm, đang trên đường đến đại lý.', 'ĐANG VẬN CHUYỂN', NULL, '2025-11-16 18:53:48.707119', NULL, _binary 0x6cba30c13b1e4791ab439514008992d1),
	(_binary 0xfd782aca7ebc4b2591c5ec5cc6ae6bbe, 'Đại lý đã tạo đơn hàng, chờ EVM xác nhận.', 'ĐÃ ĐẶT HÀNG', NULL, '2025-11-16 02:19:17.134340', NULL, _binary 0xa98767a33b07487ea02d6157dcfedb55),
	(_binary 0xff97871f437b48678a6bbe1236d643e1, 'Đại lý đã xác nhận nhận hàng.', 'ĐÃ GIAO THÀNH CÔNG', NULL, '2025-11-16 18:10:18.797979', NULL, _binary 0xd4ae837f12c34b95bef2ac7c0628a8a8);

-- Dumping structure for bảng sales_db.outbox
CREATE TABLE IF NOT EXISTS `outbox` (
  `id` varchar(36) NOT NULL,
  `aggregate_id` varchar(255) DEFAULT NULL,
  `aggregate_type` varchar(255) DEFAULT NULL,
  `attempts` int NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `event_type` varchar(255) DEFAULT NULL,
  `last_attempt_at` datetime(6) DEFAULT NULL,
  `payload` longtext,
  `sent_at` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Đang đổ dữ liệu cho bảng sales_db.outbox: ~24 rows (xấp xỉ)
INSERT INTO `outbox` (`id`, `aggregate_id`, `aggregate_type`, `attempts`, `created_at`, `event_type`, `last_attempt_at`, `payload`, `sent_at`, `status`) VALUES
	('099a9f01-3a6b-458c-9a19-2aa4174ce03d', '3621a0e1-43d6-4df4-9ee6-013bff506179', 'SalesOrder', 0, '2025-11-14 20:58:12.960770', 'OrderDelivered', '2025-11-14 20:58:13.660949', '{"orderId":"3621a0e1-43d6-4df4-9ee6-013bff506179","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-14T20:58:12.9230867","totalAmount":220000000.00,"items":[{"variantId":1,"quantity":1,"finalPrice":220000000.00}]}', '2025-11-14 20:58:13.660949', 'SENT'),
	('101cde91-ec72-4e68-92ed-45e41f8a75f0', '3621a0e1-43d6-4df4-9ee6-013bff506179', 'SalesOrder', 1, '2025-11-14 20:53:52.215302', 'B2BOrderPlaced', '2025-11-14 20:54:47.400922', '{"orderId":"3621a0e1-43d6-4df4-9ee6-013bff506179","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":220000000.00,"orderDate":"2025-11-14T20:53:51.4723206","placedByEmail":"HNMN@gmail.com"}', '2025-11-14 20:54:47.400379', 'SENT'),
	('10888937-8f88-4800-90e5-b58d457707d5', '67ea9afd-7c23-4a42-ad7f-6768b81fc0e5', 'SalesOrder', 0, '2025-11-16 01:51:47.556846', 'OrderDelivered', '2025-11-16 01:52:47.225378', '{"orderId":"67ea9afd-7c23-4a42-ad7f-6768b81fc0e5","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T01:51:47.5166853","totalAmount":420000000.00,"items":[{"variantId":3,"quantity":1,"finalPrice":420000000.00}]}', '2025-11-16 01:52:47.225378', 'SENT'),
	('16681c37-7fae-40d1-9b54-53ad84b3fa8d', '5a5a684a-47ea-4cdd-b928-b50f3445ab00', 'SalesOrder', 1, '2025-11-16 18:11:49.937346', 'B2BOrderPlaced', '2025-11-16 18:11:56.593135', '{"orderId":"5a5a684a-47ea-4cdd-b928-b50f3445ab00","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":3200000000.00,"orderDate":"2025-11-16T18:11:49.2513992","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 18:11:56.593135', 'SENT'),
	('1886b6c2-7f88-4126-8a19-d5d8c9ad76f1', '7f0f21e4-b96c-40dd-90aa-ee3585c55e29', 'SalesOrder', 0, '2025-11-16 18:15:06.141794', 'B2BOrderPlaced', '2025-11-16 18:15:08.452694', '{"orderId":"7f0f21e4-b96c-40dd-90aa-ee3585c55e29","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":1600000000.00,"orderDate":"2025-11-16T18:15:05.4567619","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 18:15:08.452694', 'SENT'),
	('1b0b7cff-18fd-458b-a518-9dcf2f880732', '2d15c270-69b0-49a3-afe4-b942963f6f0b', 'SalesOrder', 2, '2025-11-15 00:29:43.847716', 'B2BOrderPlaced', '2025-11-15 00:31:53.865348', '{"orderId":"2d15c270-69b0-49a3-afe4-b942963f6f0b","dealerId":"122bde25-eb39-4209-8f18-1675a0666ffe","totalAmount":440000000.00,"orderDate":"2025-11-15T00:29:42.58686956","placedByEmail":"HPMN@gmail.com"}', '2025-11-15 00:31:53.864757', 'SENT'),
	('1d7ff9f1-7046-44bd-a2d4-e1888cd82cd1', '7b5c5ff6-8a39-4ac9-828f-d18407bf15ac', 'Promotion', 0, '2025-11-14 14:47:15.382882', 'PromotionCreated', '2025-11-14 14:47:19.071482', '{"eventId":"1d7ff9f1-7046-44bd-a2d4-e1888cd82cd1","promotionId":"7b5c5ff6-8a39-4ac9-828f-d18407bf15ac","promotionName":"khuyen mãi tết đại lý ĐN","description":"dành riêng cho đại lý Đn và các model xe bán chậm","discountRate":0.2968,"startDate":"2025-11-14T14:49:00","endDate":"2025-11-15T23:59:00","occurredAt":"2025-11-14T14:47:15.3817177"}', '2025-11-14 14:47:19.071467', 'SENT'),
	('1e7eb9ad-4ca8-44b6-8d40-8aad5ea31881', '32785a54-3034-4b58-b5b9-c598ab0c0c84', 'SalesOrder', 0, '2025-11-16 18:42:38.741478', 'OrderDelivered', '2025-11-16 18:42:41.973839', '{"orderId":"32785a54-3034-4b58-b5b9-c598ab0c0c84","dealerId":"aa5c6e31-96af-4a53-8c56-cd3efeae028e","deliveryDate":"2025-11-16T18:42:38.6915144","totalAmount":660000000.00,"items":[{"variantId":2,"quantity":3,"finalPrice":660000000.00}]}', '2025-11-16 18:42:41.973839', 'SENT'),
	('2ece875f-152f-489a-9d9c-8f389cc6f041', '7be90106-916f-4c58-8f1d-d0c2198adf4e', 'SalesOrder', 0, '2025-11-16 18:18:01.503277', 'OrderDelivered', '2025-11-16 18:18:05.300747', '{"orderId":"7be90106-916f-4c58-8f1d-d0c2198adf4e","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T18:18:01.451469","totalAmount":4650000000.00,"items":[{"variantId":8,"quantity":5,"finalPrice":4650000000.00}]}', '2025-11-16 18:18:05.300747', 'SENT'),
	('2f4a1662-54d5-4f92-8865-659522e36901', '35440bbf-0586-4ac9-811d-bbc4eed823d6', 'SalesOrder', 1, '2025-11-16 01:13:20.572240', 'B2BOrderPlaced', '2025-11-16 01:13:25.915964', '{"orderId":"35440bbf-0586-4ac9-811d-bbc4eed823d6","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":1510000000.00,"orderDate":"2025-11-16T01:13:19.2431984","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 01:13:25.915964', 'SENT'),
	('37cc9492-cd7f-45fa-a194-a10b98d4ae4f', 'b325337a-e179-4390-9049-2732ce37bbee', 'SalesOrder', 1, '2025-11-15 00:58:31.015190', 'OrderDelivered', '2025-11-15 00:59:37.450497', '{"orderId":"b325337a-e179-4390-9049-2732ce37bbee","dealerId":"0cda5b59-069b-4d2f-b14b-539974f98676","deliveryDate":"2025-11-15T00:58:30.9520017","totalAmount":220000000.00,"items":[{"variantId":1,"quantity":1,"finalPrice":220000000.00}]}', '2025-11-15 00:59:37.450497', 'SENT'),
	('3ac6792f-5548-4f4a-a33d-5a77d827f0e8', 'baf513ec-0b61-4527-b0e5-80346d039e91', 'SalesOrder', 0, '2025-11-16 18:02:48.079133', 'B2BOrderPlaced', '2025-11-16 18:02:51.724719', '{"orderId":"baf513ec-0b61-4527-b0e5-80346d039e91","dealerId":"122bde25-eb39-4209-8f18-1675a0666ffe","totalAmount":4200000000.00,"orderDate":"2025-11-16T18:02:47.2276282","placedByEmail":"HPMN@gmail.com"}', '2025-11-16 18:02:51.724719', 'SENT'),
	('3d2f2e9d-3787-4b47-97a5-bf402c4237c9', '8c9e12f4-91d8-4946-9b71-9584ef747403', 'SalesOrder', 0, '2025-11-16 01:38:57.859630', 'OrderDelivered', '2025-11-16 01:39:56.477638', '{"orderId":"8c9e12f4-91d8-4946-9b71-9584ef747403","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T01:38:57.8176328","totalAmount":420000000.00,"items":[{"variantId":3,"quantity":1,"finalPrice":420000000.00}]}', '2025-11-16 01:39:56.477638', 'SENT'),
	('3d48b251-f9a1-4a03-8837-37e08ca3e5dc', 'cc55cc5c-1ba5-4780-8daf-0d6095fc92b7', 'SalesOrder', 3, '2025-11-15 00:52:27.737678', 'B2BOrderPlaced', '2025-11-15 00:54:41.945661', '{"orderId":"cc55cc5c-1ba5-4780-8daf-0d6095fc92b7","dealerId":"3ec76f92-7d44-49f4-ada1-b47d4f55b418","totalAmount":1260000000.00,"orderDate":"2025-11-15T00:52:26.8401087","placedByEmail":"admin@gmail.com"}', '2025-11-15 00:54:41.945661', 'SENT'),
	('3e8e9900-8fb9-4920-9195-00c37b1779d6', 'c3a1a690-4226-4f9d-a091-23060ae535b1', 'SalesOrder', 0, '2025-11-16 01:47:36.158061', 'B2BOrderPlaced', '2025-11-16 01:47:38.686176', '{"orderId":"c3a1a690-4226-4f9d-a091-23060ae535b1","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":930000000.00,"orderDate":"2025-11-16T01:47:35.5756606","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 01:47:38.686176', 'SENT'),
	('4191eb09-8246-400f-b32a-1b8d65aa1b7b', 'bde1605d-6f57-4f06-9faf-e46d01f3b54e', 'SalesOrder', 0, '2025-11-15 00:55:18.410092', 'OrderDelivered', '2025-11-15 00:55:19.535788', '{"orderId":"bde1605d-6f57-4f06-9faf-e46d01f3b54e","dealerId":"0cda5b59-069b-4d2f-b14b-539974f98676","deliveryDate":"2025-11-15T00:55:18.3337241","totalAmount":1400000000.00,"items":[{"variantId":11,"quantity":1,"finalPrice":1400000000.00}]}', '2025-11-15 00:55:19.535788', 'SENT'),
	('4a97b2b6-50dc-4605-9904-d5b3131495d8', '2d15c270-69b0-49a3-afe4-b942963f6f0b', 'SalesOrder', 2, '2025-11-15 00:32:30.600045', 'OrderDelivered', '2025-11-15 00:32:31.482295', '{"orderId":"2d15c270-69b0-49a3-afe4-b942963f6f0b","dealerId":"122bde25-eb39-4209-8f18-1675a0666ffe","deliveryDate":"2025-11-15T00:32:30.495804659","totalAmount":440000000.00,"items":[{"variantId":2,"quantity":2,"finalPrice":440000000.00}]}', '2025-11-15 00:32:31.482295', 'SENT'),
	('4be1715f-ded4-4b81-884c-dc4055005b9f', 'acce18a7-7126-4fa5-b00a-9eee25a66c6e', 'SalesOrder', 1, '2025-11-14 14:26:56.507278', 'B2BOrderPlaced', '2025-11-14 14:27:07.433148', '{"orderId":"acce18a7-7126-4fa5-b00a-9eee25a66c6e","dealerId":"dfa9f4d7-c09c-11f0-8492-862ccfb0003d","totalAmount":6200000000.00,"orderDate":"2025-11-14T14:26:55.798636772","placedByEmail":"StafffHangXe@gmail.com"}', '2025-11-14 14:27:07.433136', 'SENT'),
	('61af552d-dd31-4b11-b37c-714a46426208', 'bc6292c9-9f35-46b5-a8b3-944e54c06435', 'SalesOrder', 0, '2025-11-16 18:19:47.430234', 'B2BOrderPlaced', '2025-11-16 18:19:49.361052', '{"orderId":"bc6292c9-9f35-46b5-a8b3-944e54c06435","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":1860000000.00,"orderDate":"2025-11-16T18:19:46.8303788","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 18:19:49.361052', 'SENT'),
	('649b9ba1-7d49-4826-b451-6caadf31ec7e', 'd4ae837f-12c3-4b95-bef2-ac7c0628a8a8', 'SalesOrder', 1, '2025-11-16 18:09:48.454880', 'B2BOrderPlaced', '2025-11-16 18:09:50.258730', '{"orderId":"d4ae837f-12c3-4b95-bef2-ac7c0628a8a8","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":6100000000.00,"orderDate":"2025-11-16T18:09:47.68854","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 18:09:50.258730', 'SENT'),
	('67b31f30-fa3a-4d98-bcaf-22a456ac6091', '67ea9afd-7c23-4a42-ad7f-6768b81fc0e5', 'SalesOrder', 0, '2025-11-16 01:50:54.476929', 'B2BOrderPlaced', '2025-11-16 01:50:55.501241', '{"orderId":"67ea9afd-7c23-4a42-ad7f-6768b81fc0e5","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":420000000.00,"orderDate":"2025-11-16T01:50:53.9791648","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 01:50:55.501241', 'SENT'),
	('6ca3c6f9-b771-4615-8770-796d696e6b26', '6cba30c1-3b1e-4791-ab43-9514008992d1', 'SalesOrder', 0, '2025-11-16 18:53:59.669886', 'OrderDelivered', '2025-11-16 18:54:00.123644', '{"orderId":"6cba30c1-3b1e-4791-ab43-9514008992d1","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T18:53:59.6214825","totalAmount":220000000.00,"items":[{"variantId":1,"quantity":1,"finalPrice":220000000.00}]}', '2025-11-16 18:54:00.123644', 'SENT'),
	('7c8d839d-d3b4-4bca-ade0-6dbdc8e12ba0', 'baf513ec-0b61-4527-b0e5-80346d039e91', 'SalesOrder', 0, '2025-11-16 18:03:28.485783', 'OrderDelivered', '2025-11-16 18:03:33.316938', '{"orderId":"baf513ec-0b61-4527-b0e5-80346d039e91","dealerId":"122bde25-eb39-4209-8f18-1675a0666ffe","deliveryDate":"2025-11-16T18:03:28.4336257","totalAmount":4200000000.00,"items":[{"variantId":11,"quantity":3,"finalPrice":4200000000.00}]}', '2025-11-16 18:03:33.315931', 'SENT'),
	('817c9327-26a0-4428-a04e-6090064b7c46', '6cba30c1-3b1e-4791-ab43-9514008992d1', 'SalesOrder', 0, '2025-11-16 18:53:34.027635', 'B2BOrderPlaced', '2025-11-16 18:53:39.788596', '{"orderId":"6cba30c1-3b1e-4791-ab43-9514008992d1","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":220000000.00,"orderDate":"2025-11-16T18:53:33.6251685","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 18:53:39.788596', 'SENT'),
	('827dd570-f8c4-4b2c-9d22-b5c893a657bf', 'bc6292c9-9f35-46b5-a8b3-944e54c06435', 'SalesOrder', 0, '2025-11-16 18:20:17.816936', 'OrderDelivered', '2025-11-16 18:20:21.068321', '{"orderId":"bc6292c9-9f35-46b5-a8b3-944e54c06435","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T18:20:17.7604563","totalAmount":1860000000.00,"items":[{"variantId":8,"quantity":2,"finalPrice":1860000000.00}]}', '2025-11-16 18:20:21.068321', 'SENT'),
	('896dda00-b8f3-43a6-b82f-7a3fb34e2156', 'cb30b23b-c8a2-4ef6-9d93-f288401e9d8a', 'SalesOrder', 1, '2025-11-16 18:31:58.750580', 'OrderDelivered', '2025-11-16 18:32:02.269600', '{"orderId":"cb30b23b-c8a2-4ef6-9d93-f288401e9d8a","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T18:31:58.6986111","totalAmount":840000000.00,"items":[{"variantId":3,"quantity":2,"finalPrice":840000000.00}]}', '2025-11-16 18:32:02.269600', 'SENT'),
	('8db46321-0a51-4ea0-b184-f197434c2c2a', '59044779-c2c8-4f7a-ba18-4d761750a5df', 'SalesOrder', 0, '2025-11-16 18:43:54.563939', 'OrderDelivered', '2025-11-16 18:44:54.135179', '{"orderId":"59044779-c2c8-4f7a-ba18-4d761750a5df","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T18:43:54.5211493","totalAmount":2440000000.00,"items":[{"variantId":10,"quantity":2,"finalPrice":2440000000.00}]}', '2025-11-16 18:44:54.135179', 'SENT'),
	('8e626202-9a9f-43b3-9a22-ae53557f12dd', '430efc16-4164-4e69-bece-7126bb9bbcfa', 'Promotion', 0, '2025-11-14 15:01:19.747066', 'PromotionCreated', '2025-11-14 15:01:20.755988', '{"eventId":"8e626202-9a9f-43b3-9a22-ae53557f12dd","promotionId":"430efc16-4164-4e69-bece-7126bb9bbcfa","promotionName":"khuyen mãi tết 2025","description":"hihi","discountRate":0.2995,"startDate":"2025-11-14T15:02:00","endDate":"2025-11-15T23:59:00","occurredAt":"2025-11-14T15:01:19.746759633"}', '2025-11-14 15:01:20.755981', 'SENT'),
	('a200ffdc-f36f-4360-b2f6-3a4ceb7b9ef7', 'f72bd8fd-5c11-48f4-9fd6-f7a9733d70ea', 'SalesOrder', 0, '2025-11-14 21:42:59.781963', 'OrderDelivered', '2025-11-14 21:43:01.360703', '{"orderId":"f72bd8fd-5c11-48f4-9fd6-f7a9733d70ea","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-14T21:42:59.7476125","totalAmount":17900000000.00,"items":[{"variantId":7,"quantity":5,"finalPrice":4000000000.00},{"variantId":12,"quantity":5,"finalPrice":7550000000.00},{"variantId":2,"quantity":5,"finalPrice":1100000000.00},{"variantId":9,"quantity":5,"finalPrice":5250000000.00}]}', '2025-11-14 21:43:01.360703', 'SENT'),
	('a57bd33c-3274-46fa-87d5-92830b6e0264', 'd4ae837f-12c3-4b95-bef2-ac7c0628a8a8', 'SalesOrder', 1, '2025-11-16 18:10:18.852621', 'OrderDelivered', '2025-11-16 18:10:21.489600', '{"orderId":"d4ae837f-12c3-4b95-bef2-ac7c0628a8a8","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T18:10:18.7979786","totalAmount":6100000000.00,"items":[{"variantId":10,"quantity":5,"finalPrice":6100000000.00}]}', '2025-11-16 18:10:21.489600', 'SENT'),
	('a6a33848-9596-494e-8d5f-e24fd32214d6', 'd4059f60-95dd-409e-afd4-0edb5535e5d6', 'Promotion', 0, '2025-11-14 15:33:33.434495', 'PromotionCreated', '2025-11-14 15:33:36.078839', '{"eventId":"a6a33848-9596-494e-8d5f-e24fd32214d6","promotionId":"d4059f60-95dd-409e-afd4-0edb5535e5d6","promotionName":"khuyen mãi tết 2025 cho HP","description":"hihi","discountRate":0.3,"startDate":"2025-11-14T15:34:00","endDate":"2025-11-15T23:59:00","occurredAt":"2025-11-14T15:33:33.434359774"}', '2025-11-14 15:33:36.078835', 'SENT'),
	('a8cfe74d-c990-4fd2-9b0d-e0da1524ac15', '7be90106-916f-4c58-8f1d-d0c2198adf4e', 'SalesOrder', 0, '2025-11-16 18:17:22.202229', 'B2BOrderPlaced', '2025-11-16 18:17:23.789695', '{"orderId":"7be90106-916f-4c58-8f1d-d0c2198adf4e","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":4650000000.00,"orderDate":"2025-11-16T18:17:21.3869441","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 18:17:23.789695', 'SENT'),
	('b2d54828-8aa8-4ddd-8198-98b8ad8e919f', 'b325337a-e179-4390-9049-2732ce37bbee', 'SalesOrder', 0, '2025-11-15 00:57:31.015756', 'B2BOrderPlaced', '2025-11-15 00:57:33.249995', '{"orderId":"b325337a-e179-4390-9049-2732ce37bbee","dealerId":"0cda5b59-069b-4d2f-b14b-539974f98676","totalAmount":220000000.00,"orderDate":"2025-11-15T00:57:30.3153254","placedByEmail":"Q1MN@gmail.com"}', '2025-11-15 00:57:33.249995', 'SENT'),
	('b42d0240-1d2c-4902-acf0-53d03e89a04a', '8c9e12f4-91d8-4946-9b71-9584ef747403', 'SalesOrder', 1, '2025-11-16 01:38:06.349983', 'B2BOrderPlaced', '2025-11-16 01:38:09.590569', '{"orderId":"8c9e12f4-91d8-4946-9b71-9584ef747403","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":420000000.00,"orderDate":"2025-11-16T01:38:05.7133144","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 01:38:09.590569', 'SENT'),
	('b5ab6a74-e1ae-40fb-b7cc-908c322e5f22', '5a5a684a-47ea-4cdd-b928-b50f3445ab00', 'SalesOrder', 0, '2025-11-16 18:12:20.551617', 'OrderDelivered', '2025-11-16 18:12:22.655421', '{"orderId":"5a5a684a-47ea-4cdd-b928-b50f3445ab00","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T18:12:20.5035134","totalAmount":3200000000.00,"items":[{"variantId":7,"quantity":4,"finalPrice":3200000000.00}]}', '2025-11-16 18:12:22.655421', 'SENT'),
	('bcb62d21-0618-4d38-ab7a-cf35460756e6', 'a98767a3-3b07-487e-a02d-6157dcfedb55', 'SalesOrder', 0, '2025-11-16 02:19:17.210557', 'B2BOrderPlaced', '2025-11-16 02:19:19.135666', '{"orderId":"a98767a3-3b07-487e-a02d-6157dcfedb55","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":6040000000.00,"orderDate":"2025-11-16T02:19:15.6869649","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 02:19:19.135666', 'SENT'),
	('bd7d4c43-10fd-475d-8be9-4b443ce3098a', '7f0f21e4-b96c-40dd-90aa-ee3585c55e29', 'SalesOrder', 0, '2025-11-16 18:15:42.011929', 'OrderDelivered', '2025-11-16 18:15:44.747049', '{"orderId":"7f0f21e4-b96c-40dd-90aa-ee3585c55e29","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T18:15:41.9549147","totalAmount":1600000000.00,"items":[{"variantId":7,"quantity":2,"finalPrice":1600000000.00}]}', '2025-11-16 18:15:44.747049', 'SENT'),
	('bf39ea8e-377d-46ec-b7fb-74a605f3d331', 'a98767a3-3b07-487e-a02d-6157dcfedb55', 'SalesOrder', 1, '2025-11-16 02:20:19.876664', 'OrderDelivered', '2025-11-16 02:20:23.654796', '{"orderId":"a98767a3-3b07-487e-a02d-6157dcfedb55","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T02:20:19.791934","totalAmount":6040000000.00,"items":[{"variantId":12,"quantity":4,"finalPrice":6040000000.00}]}', '2025-11-16 02:20:23.654796', 'SENT'),
	('c96441df-c14a-4dfc-8094-e32a523f2d53', '4a1dc95d-ed6f-4bee-a20a-c0f73163010b', 'SalesOrder', 0, '2025-11-16 18:33:41.433506', 'OrderDelivered', '2025-11-16 18:33:42.202867', '{"orderId":"4a1dc95d-ed6f-4bee-a20a-c0f73163010b","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T18:33:41.385764","totalAmount":7320000000.00,"items":[{"variantId":10,"quantity":6,"finalPrice":7320000000.00}]}', '2025-11-16 18:33:42.202867', 'SENT'),
	('cc9019f0-e00c-4135-a113-844f1368b777', 'bde1605d-6f57-4f06-9faf-e46d01f3b54e', 'SalesOrder', 1, '2025-11-15 00:51:17.228035', 'B2BOrderPlaced', '2025-11-15 00:52:24.388270', '{"orderId":"bde1605d-6f57-4f06-9faf-e46d01f3b54e","dealerId":"0cda5b59-069b-4d2f-b14b-539974f98676","totalAmount":1400000000.00,"orderDate":"2025-11-15T00:51:16.2411515","placedByEmail":"Q1MN@gmail.com"}', '2025-11-15 00:52:24.387696', 'SENT'),
	('cd9c7f87-7ae1-42fd-90c9-7a7533fd3400', '8dd9725c-090f-4bf3-a70f-5241133d939c', 'SalesOrder', 1, '2025-11-15 20:57:43.535876', 'B2BOrderPlaced', '2025-11-15 20:57:53.028458', '{"orderId":"8dd9725c-090f-4bf3-a70f-5241133d939c","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":630000000.00,"orderDate":"2025-11-15T20:57:42.7407379","placedByEmail":"HNMN@gmail.com"}', '2025-11-15 20:57:53.028458', 'SENT'),
	('cfeb90a3-eb4e-4d67-9d0c-d61da326bfe5', 'c3a1a690-4226-4f9d-a091-23060ae535b1', 'SalesOrder', 0, '2025-11-16 01:48:04.205770', 'OrderDelivered', '2025-11-16 01:48:04.673860', '{"orderId":"c3a1a690-4226-4f9d-a091-23060ae535b1","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T01:48:04.1710297","totalAmount":930000000.00,"items":[{"variantId":8,"quantity":1,"finalPrice":930000000.00}]}', '2025-11-16 01:48:04.673860', 'SENT'),
	('d2c13f30-64a1-42ad-b957-7640e369697f', '71aab000-c95c-42a8-9c2a-767f09726447', 'SalesOrder', 0, '2025-11-16 18:06:04.375783', 'B2BOrderPlaced', '2025-11-16 18:06:05.473226', '{"orderId":"71aab000-c95c-42a8-9c2a-767f09726447","dealerId":"122bde25-eb39-4209-8f18-1675a0666ffe","totalAmount":7550000000.00,"orderDate":"2025-11-16T18:06:03.4948285","placedByEmail":"HPMN@gmail.com"}', '2025-11-16 18:06:05.473226', 'SENT'),
	('d2c7ffab-c55d-4268-b894-ec41d5039258', '21db75ae-b37e-43ef-a3b4-a9eeb5c9e9fe', 'SalesOrder', 0, '2025-11-15 00:39:00.692239', 'B2BOrderPlaced', '2025-11-15 00:39:03.367420', '{"orderId":"21db75ae-b37e-43ef-a3b4-a9eeb5c9e9fe","dealerId":"dfa5b6e2-c09c-11f0-8492-862ccfb0003d","totalAmount":440000000.00,"orderDate":"2025-11-15T00:38:59.9078926","placedByEmail":"admin@gmail.com"}', '2025-11-15 00:39:03.367420', 'SENT'),
	('d69651d4-91bb-4a97-9f7c-a6f43cde4c97', '8dd9725c-090f-4bf3-a70f-5241133d939c', 'SalesOrder', 0, '2025-11-15 20:58:42.840562', 'OrderDelivered', '2025-11-15 20:58:45.492220', '{"orderId":"8dd9725c-090f-4bf3-a70f-5241133d939c","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-15T20:58:42.7861832","totalAmount":630000000.00,"items":[{"variantId":5,"quantity":1,"finalPrice":630000000.00}]}', '2025-11-15 20:58:45.492220', 'SENT'),
	('de0c7e35-6876-4da9-9477-89d53deceb86', '4a1dc95d-ed6f-4bee-a20a-c0f73163010b', 'SalesOrder', 1, '2025-11-16 18:33:11.396793', 'B2BOrderPlaced', '2025-11-16 18:33:15.859815', '{"orderId":"4a1dc95d-ed6f-4bee-a20a-c0f73163010b","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":7320000000.00,"orderDate":"2025-11-16T18:33:10.5529367","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 18:33:15.859815', 'SENT'),
	('de82c161-ab1d-4879-b849-4ca059b86294', 'cb30b23b-c8a2-4ef6-9d93-f288401e9d8a', 'SalesOrder', 0, '2025-11-16 18:31:16.251123', 'B2BOrderPlaced', '2025-11-16 18:31:17.890306', '{"orderId":"cb30b23b-c8a2-4ef6-9d93-f288401e9d8a","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":840000000.00,"orderDate":"2025-11-16T18:31:15.5063884","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 18:31:17.890306', 'SENT'),
	('e34a8bdf-361b-4da9-a69d-ab3e2baba414', '59044779-c2c8-4f7a-ba18-4d761750a5df', 'SalesOrder', 0, '2025-11-16 18:43:21.798943', 'B2BOrderPlaced', '2025-11-16 18:43:22.744826', '{"orderId":"59044779-c2c8-4f7a-ba18-4d761750a5df","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":2440000000.00,"orderDate":"2025-11-16T18:43:21.09428","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 18:43:22.744826', 'SENT'),
	('e4076062-979e-476c-a3cd-1dc53109d78e', '004d2d49-e921-4d1e-bb37-96f32237f508', 'SalesOrder', 1, '2025-11-14 16:20:55.809499', 'B2BOrderPlaced', '2025-11-14 16:20:57.344840', '{"orderId":"004d2d49-e921-4d1e-bb37-96f32237f508","dealerId":"122bde25-eb39-4209-8f18-1675a0666ffe","totalAmount":6200000000.00,"orderDate":"2025-11-14T16:20:55.166394182","placedByEmail":"HPMN@gmail.com"}', '2025-11-14 16:20:57.344840', 'SENT'),
	('e6e90642-5ba5-46f7-8376-fa5db97b163a', 'e58527f9-cad2-47c4-b900-0cec04f930ce', 'SalesOrder', 0, '2025-11-16 00:56:36.956382', 'B2BOrderPlaced', '2025-11-16 00:56:39.015012', '{"orderId":"e58527f9-cad2-47c4-b900-0cec04f930ce","dealerId":"dfa5b6e2-c09c-11f0-8492-862ccfb0003d","totalAmount":1220000000.00,"orderDate":"2025-11-16T00:56:35.6356431","placedByEmail":"admin@gmail.com"}', '2025-11-16 00:56:39.015012', 'SENT'),
	('ebcca4d6-51d6-42e9-8637-12dc3d6f75a5', '004d2d49-e921-4d1e-bb37-96f32237f508', 'SalesOrder', 0, '2025-11-14 16:24:20.375914', 'OrderDelivered', '2025-11-14 16:24:22.432147', '{"orderId":"004d2d49-e921-4d1e-bb37-96f32237f508","dealerId":"122bde25-eb39-4209-8f18-1675a0666ffe","deliveryDate":"2025-11-14T16:24:20.32431334","totalAmount":6200000000.00,"items":[{"variantId":1,"quantity":10,"finalPrice":6200000000.00}]}', '2025-11-14 16:24:22.432147', 'SENT'),
	('ee95def1-1093-4f62-b3c5-5b6d920a8b1d', '65175fe1-02f3-4718-a5f9-9a5dc072f9b9', 'Promotion', 1, '2025-11-14 15:15:14.962305', 'PromotionCreated', '2025-11-14 15:15:19.957392', '{"eventId":"ee95def1-1093-4f62-b3c5-5b6d920a8b1d","promotionId":"65175fe1-02f3-4718-a5f9-9a5dc072f9b9","promotionName":"khuyen mãi tết 2025","description":"gfdg","discountRate":0.2981,"startDate":"2025-11-14T15:16:00","endDate":"2025-11-15T23:59:00","occurredAt":"2025-11-14T15:15:14.962090261"}', '2025-11-14 15:15:19.957386', 'SENT'),
	('ee9c5205-492f-474e-96db-5f94378e3300', '32785a54-3034-4b58-b5b9-c598ab0c0c84', 'SalesOrder', 0, '2025-11-16 18:42:15.221782', 'B2BOrderPlaced', '2025-11-16 18:42:16.579791', '{"orderId":"32785a54-3034-4b58-b5b9-c598ab0c0c84","dealerId":"aa5c6e31-96af-4a53-8c56-cd3efeae028e","totalAmount":660000000.00,"orderDate":"2025-11-16T18:42:14.624738","placedByEmail":"DNMN@gmail.com"}', '2025-11-16 18:42:16.579791', 'SENT'),
	('f39d3f92-c28d-4907-82f2-b30c491d11ff', '843d1a5f-95ee-411c-aee4-06ea7960e848', 'SalesOrder', 0, '2025-11-16 02:08:16.172806', 'OrderDelivered', '2025-11-16 02:08:20.236670', '{"orderId":"843d1a5f-95ee-411c-aee4-06ea7960e848","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T02:08:16.1351076","totalAmount":1220000000.00,"items":[{"variantId":10,"quantity":1,"finalPrice":1220000000.00}]}', '2025-11-16 02:08:20.236670', 'SENT'),
	('f428ab86-ee18-41f2-ba5f-8f152335ef35', '843d1a5f-95ee-411c-aee4-06ea7960e848', 'SalesOrder', 1, '2025-11-16 02:07:51.885734', 'B2BOrderPlaced', '2025-11-16 02:07:53.967210', '{"orderId":"843d1a5f-95ee-411c-aee4-06ea7960e848","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":1220000000.00,"orderDate":"2025-11-16T02:07:51.2455538","placedByEmail":"HNMN@gmail.com"}', '2025-11-16 02:07:53.967210', 'SENT'),
	('f5967c96-6fdf-443a-816e-233ae2f60dd5', '35440bbf-0586-4ac9-811d-bbc4eed823d6', 'SalesOrder', 0, '2025-11-16 01:14:16.866124', 'OrderDelivered', '2025-11-16 01:14:19.460989', '{"orderId":"35440bbf-0586-4ac9-811d-bbc4eed823d6","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","deliveryDate":"2025-11-16T01:14:16.7109599","totalAmount":1510000000.00,"items":[{"variantId":12,"quantity":1,"finalPrice":1510000000.00}]}', '2025-11-16 01:14:19.460989', 'SENT'),
	('f7b94ddf-ac7c-4aa9-9bd7-1d67bfd124d4', '71aab000-c95c-42a8-9c2a-767f09726447', 'SalesOrder', 0, '2025-11-16 18:06:57.617197', 'OrderDelivered', '2025-11-16 18:06:57.972505', '{"orderId":"71aab000-c95c-42a8-9c2a-767f09726447","dealerId":"122bde25-eb39-4209-8f18-1675a0666ffe","deliveryDate":"2025-11-16T18:06:57.5511962","totalAmount":7550000000.00,"items":[{"variantId":12,"quantity":5,"finalPrice":7550000000.00}]}', '2025-11-16 18:06:57.972505', 'SENT'),
	('ff5f3e28-e20b-40cc-8e6e-3ed049c522bd', 'f72bd8fd-5c11-48f4-9fd6-f7a9733d70ea', 'SalesOrder', 0, '2025-11-14 21:04:19.060925', 'B2BOrderPlaced', '2025-11-14 21:04:21.079056', '{"orderId":"f72bd8fd-5c11-48f4-9fd6-f7a9733d70ea","dealerId":"1df77d68-4d87-4f9e-9488-84b40de153a7","totalAmount":17900000000.00,"orderDate":"2025-11-14T21:04:17.1225503","placedByEmail":"HNMN@gmail.com"}', '2025-11-14 21:04:21.079056', 'SENT');

-- Dumping structure for bảng sales_db.promotions
CREATE TABLE IF NOT EXISTS `promotions` (
  `promotion_id` binary(16) NOT NULL,
  `applicable_models_json` json DEFAULT NULL,
  `dealer_id_json` json DEFAULT NULL,
  `description` text,
  `discount_rate` decimal(5,2) DEFAULT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `promotion_name` varchar(255) NOT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `status` enum('ACTIVE','DELETED','DRAFT','EXPIRED','INACTIVE','NEAR') DEFAULT NULL,
  PRIMARY KEY (`promotion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Đang đổ dữ liệu cho bảng sales_db.promotions: ~1 rows (xấp xỉ)
INSERT INTO `promotions` (`promotion_id`, `applicable_models_json`, `dealer_id_json`, `description`, `discount_rate`, `end_date`, `promotion_name`, `start_date`, `status`) VALUES
	(_binary 0xd4059f6095dd409eafd40edb5535e5d6, '[2]', '["dfa9f57f-c09c-11f0-8492-862ccfb0003d"]', 'hihi', 0.30, '2025-11-15 23:59:00.000000', 'khuyen mãi tết 2025 cho HP', '2025-11-14 15:34:00.000000', 'ACTIVE');

-- Dumping structure for bảng sales_db.quotations
CREATE TABLE IF NOT EXISTS `quotations` (
  `quotation_id` binary(16) NOT NULL,
  `base_price` decimal(15,2) DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  `dealer_id` binary(16) NOT NULL,
  `discount_amount` decimal(15,2) DEFAULT NULL,
  `final_price` decimal(15,2) DEFAULT NULL,
  `model_id` bigint NOT NULL,
  `quotation_date` datetime(6) DEFAULT NULL,
  `staff_id` binary(16) NOT NULL,
  `status` enum('ACCEPTED','APPROVED','COMPLETE','DRAFT','EXPIRED','PENDING','REJECTED','SENT') DEFAULT NULL,
  `terms_conditions` text,
  `valid_until` datetime(6) DEFAULT NULL,
  `variant_id` bigint NOT NULL,
  PRIMARY KEY (`quotation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Đang đổ dữ liệu cho bảng sales_db.quotations: ~8 rows (xấp xỉ)
INSERT INTO `quotations` (`quotation_id`, `base_price`, `customer_id`, `dealer_id`, `discount_amount`, `final_price`, `model_id`, `quotation_date`, `staff_id`, `status`, `terms_conditions`, `valid_until`, `variant_id`) VALUES
	(_binary 0x005b17be97ec413daea543b92e2d7d32, 750000000.00, 2, _binary 0xdfa9f57fc09c11f08492862ccfb0003d, 300000000.00, 450000000.00, 2, '2025-11-14 15:40:00.863469', _binary 0xba85d10420fb438b8fab4c67073d88c6, 'COMPLETE', 'giảm giá cực mạnh nhớ xn', '2025-11-21 08:39:00.000000', 3),
	(_binary 0x1ff40b752c5842f4bc3316023794e6a5, 1604000000.00, 1, _binary 0xdfa5b6e2c09c11f08492862ccfb0003d, 1587960000.00, 16040000.00, 6, '2025-11-15 23:28:53.475915', _binary 0x1df77d684d874f9e948884b40de153a7, 'PENDING', 'Standard terms and conditions apply', NULL, 12),
	(_binary 0x48d2f3a3e68f4d5c92012dfc28a91598, 1020000000.00, 2, _binary 0xdfa9f57fc09c11f08492862ccfb0003d, 0.00, 1020000000.00, 5, '2025-11-14 16:14:34.565665', _binary 0xba85d10420fb438b8fab4c67073d88c6, 'COMPLETE', 'jj', '2025-11-21 09:14:00.000000', 8),
	(_binary 0xac2a9011c09811f08492862ccfb0003d, 50000.00, 101, _binary 0x6c8c229dc8f643d8b2f601261b46baa3, 5000.00, 45000.00, 1, '2025-11-13 13:57:23.000000', _binary 0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6, 'ACCEPTED', NULL, '2025-11-20 13:57:23.000000', 10),
	(_binary 0xac557acdc09811f08492862ccfb0003d, 75000.00, 102, _binary 0x6c8c229dc8f643d8b2f601261b46baa3, 5000.00, 70000.00, 2, '2025-11-13 13:57:23.000000', _binary 0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6, 'ACCEPTED', NULL, '2025-11-20 13:57:23.000000', 12),
	(_binary 0xac7a0f8fc09811f08492862ccfb0003d, 52000.00, 101, _binary 0x6c8c229dc8f643d8b2f601261b46baa3, 0.00, 52000.00, 1, '2025-11-13 13:57:23.000000', _binary 0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6, 'ACCEPTED', NULL, '2025-11-20 13:57:23.000000', 11),
	(_binary 0xac9bb827c09811f08492862ccfb0003d, 30000.00, 201, _binary 0x6c8c229dc8f643d8b2f601261b46baa3, 2000.00, 28000.00, 3, '2025-11-13 13:57:23.000000', _binary 0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6, 'ACCEPTED', NULL, '2025-11-20 13:57:23.000000', 15),
	(_binary 0xacbd9f73c09811f08492862ccfb0003d, 40000.00, 202, _binary 0x6c8c229dc8f643d8b2f601261b46baa3, 0.00, 40000.00, 4, '2025-11-13 13:57:23.000000', _binary 0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6, 'ACCEPTED', NULL, '2025-11-20 13:57:23.000000', 20),
	(_binary 0xacdfec61c09811f08492862ccfb0003d, 31000.00, 203, _binary 0x6c8c229dc8f643d8b2f601261b46baa3, 1000.00, 30000.00, 3, '2025-11-13 13:57:23.000000', _binary 0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6, 'ACCEPTED', NULL, '2025-11-20 13:57:23.000000', 16);

-- Dumping structure for bảng sales_db.quotation_promotions
CREATE TABLE IF NOT EXISTS `quotation_promotions` (
  `quotation_id` binary(16) NOT NULL,
  `promotion_id` binary(16) NOT NULL,
  PRIMARY KEY (`quotation_id`,`promotion_id`),
  KEY `FKcrv3ru12xg7tdtxaea37w7hxj` (`promotion_id`),
  CONSTRAINT `FK49p0m7xr9os6w0ok9u15dbv3m` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`quotation_id`),
  CONSTRAINT `FKcrv3ru12xg7tdtxaea37w7hxj` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`promotion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Đang đổ dữ liệu cho bảng sales_db.quotation_promotions: ~0 rows (xấp xỉ)
INSERT INTO `quotation_promotions` (`quotation_id`, `promotion_id`) VALUES
	(_binary 0x005b17be97ec413daea543b92e2d7d32, _binary 0xd4059f6095dd409eafd40edb5535e5d6);

-- Dumping structure for bảng sales_db.sales_contracts
CREATE TABLE IF NOT EXISTS `sales_contracts` (
  `contract_id` binary(16) NOT NULL,
  `contract_date` datetime(6) DEFAULT NULL,
  `contract_file_url` varchar(500) DEFAULT NULL,
  `contract_status` enum('CANCELLED','DRAFT','EXPIRED','PENDING_SIGNATURE','SIGNED') DEFAULT NULL,
  `contract_terms` text,
  `digital_signature` text,
  `signing_date` datetime(6) DEFAULT NULL,
  `order_id` binary(16) NOT NULL,
  PRIMARY KEY (`contract_id`),
  UNIQUE KEY `UKorpnvv3jed8o0r91628e93x9x` (`order_id`),
  CONSTRAINT `FKhrkv5m9hy1xb7f8ubyx564bwj` FOREIGN KEY (`order_id`) REFERENCES `sales_orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Đang đổ dữ liệu cho bảng sales_db.sales_contracts: ~2 rows (xấp xỉ)
INSERT INTO `sales_contracts` (`contract_id`, `contract_date`, `contract_file_url`, `contract_status`, `contract_terms`, `digital_signature`, `signing_date`, `order_id`) VALUES
	(_binary 0x5b33cf0e78c04d19aa8c382c591e0042, '2025-11-14 15:40:50.589733', 'khách hàng hẹn lịch', 'SIGNED', 'Các phụ lục, biên bản phát sinh là một phần hợp đồng.\n\nHợp đồng được lập thành … bản, mỗi bên giữ … bản, có giá trị pháp lý như nhau.', '9ijh8u9j', '2025-11-14 15:57:29.491636', _binary 0xa419ac15357944568b7231a95bf44c16),
	(_binary 0xdbb4af8f4a464c3ca0b4adadbcc83c95, '2025-11-14 16:15:17.840023', 'https://static-cms-prod.vinfastauto.com/vf_pc01.81_mau-hd-mua-ban-xe-dien-vf_01.03.2025.pdf', 'SIGNED', 'jj', NULL, '2025-11-14 00:00:00.000000', _binary 0x314d51e6db6248d5a28f0597b282ef3a);

-- Dumping structure for bảng sales_db.sales_orders
CREATE TABLE IF NOT EXISTS `sales_orders` (
  `order_id` binary(16) NOT NULL,
  `approval_date` datetime(6) DEFAULT NULL,
  `approved_by` binary(16) DEFAULT NULL,
  `customer_id` binary(16) DEFAULT NULL,
  `dealer_id` binary(16) NOT NULL,
  `delivery_date` datetime(6) DEFAULT NULL,
  `down_payment` decimal(15,2) DEFAULT NULL,
  `manager_approval` bit(1) DEFAULT NULL,
  `order_date` datetime(6) NOT NULL,
  `order_status` enum('CANCELLED','CONFIRMED','DELIVERED','DISPUTED','IN_TRANSIT','PENDING','RETURNED_TO_CENTRAL') DEFAULT NULL,
  `order_status_b2c` enum('APPROVED','CANCELLED','CONFIRMED','DELIVERED','EDITED','IN_PRODUCTION','PENDING','REJECTED') DEFAULT NULL,
  `payment_status` enum('NONE','PAID','PARTIALLY_PAID','UNPAID') DEFAULT NULL,
  `staff_id` binary(16) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `type_oder` enum('B2B','B2C') DEFAULT NULL,
  `quotation_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `UKctlwuy2ffec4f9fcfs531yp4b` (`quotation_id`),
  CONSTRAINT `FK6v04g5pnvxi7u3welqvnmv2nd` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`quotation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Đang đổ dữ liệu cho bảng sales_db.sales_orders: ~55 rows (xấp xỉ)
INSERT INTO `sales_orders` (`order_id`, `approval_date`, `approved_by`, `customer_id`, `dealer_id`, `delivery_date`, `down_payment`, `manager_approval`, `order_date`, `order_status`, `order_status_b2c`, `payment_status`, `staff_id`, `total_amount`, `type_oder`, `quotation_id`) VALUES
	(_binary 0x004d2d49e9214d1ebb3796f32237f508, '2025-11-14 16:21:51.187369', NULL, NULL, _binary 0x122bde25eb3942098f181675a0666ffe, '2025-11-14 16:24:20.324313', NULL, b'1', '2025-11-14 16:20:55.166394', 'DELIVERED', NULL, 'NONE', NULL, 6200000000.00, 'B2B', NULL),
	(_binary 0x21db75aeb37e43efa3b4a9eeb5c9e9fe, '2025-11-15 00:39:11.785046', NULL, NULL, _binary 0xdfa5b6e2c09c11f08492862ccfb0003d, NULL, NULL, b'1', '2025-11-15 00:38:59.907893', 'IN_TRANSIT', NULL, 'NONE', NULL, 440000000.00, 'B2B', NULL),
	(_binary 0x21f4071dc15a11f08492862ccfb0003d, '2025-11-06 13:02:10.000000', _binary 0xa2fbf21443c949d79feb71a0a6dc1964, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, '2025-11-19 13:02:10.000000', 18400000.00, b'1', '2025-11-04 13:02:10.000000', 'DELIVERED', NULL, NULL, _binary 0x6b62045faa3e48d8a612b971e06caeb0, 92000000.00, 'B2B', NULL),
	(_binary 0x21feb938c15a11f08492862ccfb0003d, NULL, NULL, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, '2025-12-09 13:02:10.000000', 7600000.00, b'0', '2025-11-07 13:02:10.000000', 'DELIVERED', NULL, NULL, _binary 0x6b62045faa3e48d8a612b971e06caeb0, 38000000.00, 'B2B', NULL),
	(_binary 0x21febcc6c15a11f08492862ccfb0003d, '2025-11-12 13:02:10.000000', _binary 0x6b62045faa3e48d8a612b971e06caeb0, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, '2025-11-13 13:02:10.000000', 13400000.00, b'1', '2025-11-10 13:02:10.000000', 'DELIVERED', NULL, NULL, _binary 0xa2fbf21443c949d79feb71a0a6dc1964, 67000000.00, 'B2B', NULL),
	(_binary 0x21ffe7f9c15a11f08492862ccfb0003d, '2025-11-13 13:02:10.000000', _binary 0xa2fbf21443c949d79feb71a0a6dc1964, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, '2025-11-26 13:02:10.000000', 11000000.00, b'1', '2025-11-12 13:02:10.000000', 'DELIVERED', NULL, NULL, _binary 0x6b62045faa3e48d8a612b971e06caeb0, 55000000.00, 'B2B', NULL),
	(_binary 0x21ffec44c15a11f08492862ccfb0003d, '2025-11-14 20:55:09.136815', NULL, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, '2025-12-02 13:02:10.000000', 15600000.00, b'1', '2025-11-13 13:02:10.000000', 'CONFIRMED', NULL, NULL, _binary 0x6b62045faa3e48d8a612b971e06caeb0, 78000000.00, 'B2B', NULL),
	(_binary 0x21ffed75c15a11f08492862ccfb0003d, '2025-11-13 13:02:10.000000', _binary 0x6b62045faa3e48d8a612b971e06caeb0, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, '2025-11-14 13:02:10.000000', 9800000.00, b'1', '2025-11-14 13:02:10.000000', 'DELIVERED', NULL, NULL, _binary 0xa2fbf21443c949d79feb71a0a6dc1964, 49000000.00, 'B2B', NULL),
	(_binary 0x21ffee8ec15a11f08492862ccfb0003d, NULL, NULL, _binary 0x31303037000000000000000000000000, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, 0.00, b'1', '2025-11-06 13:02:10.000000', NULL, 'CONFIRMED', NULL, _binary 0x432a97e7dcf4052cae418a19b67af864, 41000000.00, 'B2C', NULL),
	(_binary 0x2200278ec15a11f08492862ccfb0003d, NULL, NULL, _binary 0x31303038000000000000000000000000, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, 0.00, b'1', '2025-11-08 13:02:10.000000', NULL, 'APPROVED', NULL, _binary 0x432a97e7dcf4052cae418a19b67af864, 36000000.00, 'B2C', NULL),
	(_binary 0x220029d4c15a11f08492862ccfb0003d, NULL, NULL, _binary 0x31303039000000000000000000000000, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, 0.00, b'1', '2025-11-09 13:02:10.000000', NULL, 'PENDING', NULL, _binary 0x432a97e7dcf4052cae418a19b67af864, 29000000.00, 'B2C', NULL),
	(_binary 0x22002b99c15a11f08492862ccfb0003d, NULL, NULL, _binary 0x31303130000000000000000000000000, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, 0.00, b'1', '2025-11-11 13:02:10.000000', NULL, 'CONFIRMED', NULL, _binary 0x432a97e7dcf4052cae418a19b67af864, 63000000.00, 'B2C', NULL),
	(_binary 0x22002d1bc15a11f08492862ccfb0003d, NULL, NULL, _binary 0x31303131000000000000000000000000, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, 0.00, b'1', '2025-11-12 13:02:10.000000', NULL, 'APPROVED', NULL, _binary 0x432a97e7dcf4052cae418a19b67af864, 47000000.00, 'B2C', NULL),
	(_binary 0x22002e03c15a11f08492862ccfb0003d, NULL, NULL, _binary 0x31303132000000000000000000000000, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, 0.00, b'1', '2025-11-13 13:02:10.000000', NULL, 'PENDING', NULL, _binary 0x432a97e7dcf4052cae418a19b67af864, 52000000.00, 'B2C', NULL),
	(_binary 0x2d15c27069b049a3afe4b942963f6f0b, '2025-11-15 00:30:03.167212', NULL, NULL, _binary 0x122bde25eb3942098f181675a0666ffe, '2025-11-15 00:32:30.495805', NULL, b'1', '2025-11-15 00:29:42.586870', 'DELIVERED', NULL, 'NONE', NULL, 440000000.00, 'B2B', NULL),
	(_binary 0x314d51e6db6248d5a28f0597b282ef3a, '2025-11-14 16:15:44.552126', _binary 0x122bde25eb3942098f181675a0666ffe, _binary 0x32000000000000000000000000000000, _binary 0xdfa9f57fc09c11f08492862ccfb0003d, NULL, 0.00, b'1', '2025-11-14 16:15:17.840010', NULL, 'DELIVERED', 'NONE', _binary 0xba85d10420fb438b8fab4c67073d88c6, 1020000000.00, 'B2C', _binary 0x48d2f3a3e68f4d5c92012dfc28a91598),
	(_binary 0x32785a5430344b58b5b9c598ab0c0c84, '2025-11-16 18:42:22.440133', NULL, NULL, _binary 0xaa5c6e3196af4a538c56cd3efeae028e, '2025-11-16 18:42:38.691514', NULL, b'1', '2025-11-16 18:42:14.624738', 'DELIVERED', NULL, 'NONE', NULL, 660000000.00, 'B2B', NULL),
	(_binary 0x35440bbf05864ac9811dbbc4eed823d6, '2025-11-16 01:13:39.135171', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 01:14:16.710960', NULL, b'1', '2025-11-16 01:13:19.243198', 'DELIVERED', NULL, 'NONE', NULL, 1510000000.00, 'B2B', NULL),
	(_binary 0x3621a0e143d64df49ee6013bff506179, '2025-11-14 20:57:05.765444', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-14 20:58:12.923087', NULL, b'1', '2025-11-14 20:53:51.472321', 'DELIVERED', NULL, 'NONE', NULL, 220000000.00, 'B2B', NULL),
	(_binary 0x412100e10a8f68c2b34979f460f1740f, NULL, NULL, NULL, _binary 0x41ffae6fe29efe69bfe6dc6addf3821b, '2025-11-08 16:35:17.000000', 0.00, b'1', '2025-11-03 16:35:17.000000', 'DELIVERED', NULL, 'UNPAID', _binary 0x4789e5f6a1b2c3d4a0b1c2d3e4f5a6b7, 5000000.00, 'B2B', NULL),
	(_binary 0x46fa462e96d9b741a8fcd5dcffb45a52, NULL, NULL, NULL, _binary 0x41ffae6fe29efe69bfe6dc6addf3821b, '2025-11-12 16:35:18.000000', 0.00, b'1', '2025-11-07 16:35:18.000000', 'DELIVERED', NULL, 'NONE', _binary 0x4789e5f6a1b2c3d4a0b1c2d3e4f5a6b7, 12000000.00, 'B2B', NULL),
	(_binary 0x495da6d6dc9895cbb4cd8e2568bf6c4e, NULL, NULL, _binary 0x31303032000000000000000000000000, _binary 0x461f1afc6dbc7cef95d949693ef5efa4, NULL, 0.00, b'1', '2025-11-08 16:35:18.000000', NULL, 'APPROVED', 'NONE', _binary 0x432a97e7dcf4052cae418a19b67af864, 4700000.00, 'B2C', NULL),
	(_binary 0x4a1dc95ded6f4beea20ac0f73163010b, '2025-11-16 18:33:21.413738', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 18:33:41.385764', NULL, b'1', '2025-11-16 18:33:10.552937', 'DELIVERED', NULL, 'NONE', NULL, 7320000000.00, 'B2B', NULL),
	(_binary 0x4aff9db1fe0b0fdebba50bf62b8ca7fb, NULL, NULL, NULL, _binary 0x41ffae6fe29efe69bfe6dc6addf3821b, '2025-11-10 16:35:18.000000', 0.00, b'1', '2025-11-05 16:35:18.000000', 'DELIVERED', NULL, 'NONE', _binary 0x4789e5f6a1b2c3d4a0b1c2d3e4f5a6b7, 7500000.00, 'B2B', NULL),
	(_binary 0x4b49257fb0a809b3a5e3f022798f0ecc, NULL, NULL, _binary 0x31303031000000000000000000000000, _binary 0x461f1afc6dbc7cef95d949693ef5efa4, NULL, 0.00, b'1', '2025-11-06 16:35:18.000000', NULL, 'DELIVERED', 'NONE', _binary 0x432a97e7dcf4052cae418a19b67af864, 3200000.00, 'B2C', NULL),
	(_binary 0x4f0c54458d729760b7acf796fad9170d, NULL, NULL, _binary 0x31303033000000000000000000000000, _binary 0x461f1afc6dbc7cef95d949693ef5efa4, NULL, 0.00, b'1', '2025-11-10 16:35:19.000000', NULL, 'CONFIRMED', 'NONE', _binary 0x432a97e7dcf4052cae418a19b67af864, 6800000.00, 'B2C', NULL),
	(_binary 0x59044779c2c84f7aba184d761750a5df, '2025-11-16 18:43:31.882257', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 18:43:54.521149', NULL, b'1', '2025-11-16 18:43:21.094280', 'DELIVERED', NULL, 'NONE', NULL, 2440000000.00, 'B2B', NULL),
	(_binary 0x5a5a684a47ea4cddb928b50f3445ab00, '2025-11-16 18:11:59.428674', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 18:12:20.503513', NULL, b'1', '2025-11-16 18:11:49.251399', 'DELIVERED', NULL, 'NONE', NULL, 3200000000.00, 'B2B', NULL),
	(_binary 0x67ea9afd7c234a42ad7f6768b81fc0e5, '2025-11-16 01:51:14.687288', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 01:51:47.516685', NULL, b'1', '2025-11-16 01:50:53.979165', 'DELIVERED', NULL, 'NONE', NULL, 420000000.00, 'B2B', NULL),
	(_binary 0x6cba30c13b1e4791ab439514008992d1, '2025-11-16 18:53:40.478574', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 18:53:59.621483', NULL, b'1', '2025-11-16 18:53:33.625169', 'DELIVERED', NULL, 'NONE', NULL, 220000000.00, 'B2B', NULL),
	(_binary 0x71aab000c95c42a89c2a767f09726447, '2025-11-16 18:06:17.582370', NULL, NULL, _binary 0x122bde25eb3942098f181675a0666ffe, '2025-11-16 18:06:57.551196', NULL, b'1', '2025-11-16 18:06:03.494829', 'DELIVERED', NULL, 'NONE', NULL, 7550000000.00, 'B2B', NULL),
	(_binary 0x7be90106916f4c588f1dd0c2198adf4e, '2025-11-16 18:17:31.268642', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 18:18:01.451469', NULL, b'1', '2025-11-16 18:17:21.386944', 'DELIVERED', NULL, 'NONE', NULL, 4650000000.00, 'B2B', NULL),
	(_binary 0x7f0f21e4b96c40dd90aaee3585c55e29, '2025-11-16 18:15:16.114623', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 18:15:41.954915', NULL, b'1', '2025-11-16 18:15:05.456762', 'DELIVERED', NULL, 'NONE', NULL, 1600000000.00, 'B2B', NULL),
	(_binary 0x843d1a5f95ee411caee406ea7960e848, '2025-11-16 02:07:57.520034', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 02:08:16.135108', NULL, b'1', '2025-11-16 02:07:51.245554', 'DELIVERED', NULL, 'NONE', NULL, 1220000000.00, 'B2B', NULL),
	(_binary 0x8c9e12f491d849469b719584ef747403, '2025-11-16 01:38:27.794228', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 01:38:57.817633', NULL, b'1', '2025-11-16 01:38:05.713314', 'DELIVERED', NULL, 'NONE', NULL, 420000000.00, 'B2B', NULL),
	(_binary 0x8dd9725c090f4bf3a70f5241133d939c, '2025-11-15 20:57:59.222743', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-15 20:58:42.786183', NULL, b'1', '2025-11-15 20:57:42.740738', 'DELIVERED', NULL, 'NONE', NULL, 630000000.00, 'B2B', NULL),
	(_binary 0xa419ac15357944568b7231a95bf44c16, '2025-11-14 15:42:45.992279', _binary 0x122bde25eb3942098f181675a0666ffe, _binary 0x32000000000000000000000000000000, _binary 0xdfa9f57fc09c11f08492862ccfb0003d, NULL, 315000000.00, b'1', '2025-11-14 15:40:50.589680', NULL, 'DELIVERED', 'NONE', _binary 0xba85d10420fb438b8fab4c67073d88c6, 1050000000.00, 'B2C', _binary 0x005b17be97ec413daea543b92e2d7d32),
	(_binary 0xa98767a33b07487ea02d6157dcfedb55, '2025-11-16 02:19:35.472571', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 02:20:19.791934', NULL, b'1', '2025-11-16 02:19:15.686965', 'DELIVERED', NULL, 'NONE', NULL, 6040000000.00, 'B2B', NULL),
	(_binary 0xacce18a771264fa5b00a9eee25a66c6e, '2025-11-14 14:27:20.208570', NULL, NULL, _binary 0xdfa9f4d7c09c11f08492862ccfb0003d, NULL, NULL, b'1', '2025-11-14 14:26:55.798637', 'DELIVERED', NULL, 'NONE', NULL, 6200000000.00, 'B2B', NULL),
	(_binary 0xb325337ae179439090492732ce37bbee, '2025-11-15 00:58:04.797130', NULL, NULL, _binary 0x0cda5b59069b4d2fb14b539974f98676, '2025-11-15 00:58:30.952002', NULL, b'1', '2025-11-15 00:57:30.315325', 'DELIVERED', NULL, 'NONE', NULL, 220000000.00, 'B2B', NULL),
	(_binary 0xbaf513ec0b614527b0e580346d039e91, '2025-11-16 18:03:01.488456', NULL, NULL, _binary 0x122bde25eb3942098f181675a0666ffe, '2025-11-16 18:03:28.433626', NULL, b'1', '2025-11-16 18:02:47.227628', 'DELIVERED', NULL, 'NONE', NULL, 4200000000.00, 'B2B', NULL),
	(_binary 0xbc6292c99f3546b5a8b3944e54c06435, '2025-11-16 18:19:56.793117', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 18:20:17.760456', NULL, b'1', '2025-11-16 18:19:46.830379', 'DELIVERED', NULL, 'NONE', NULL, 1860000000.00, 'B2B', NULL),
	(_binary 0xbde1605d6f574f069fafe46d01f3b54e, '2025-11-15 00:51:48.891777', NULL, NULL, _binary 0x0cda5b59069b4d2fb14b539974f98676, '2025-11-15 00:55:18.333724', NULL, b'1', '2025-11-15 00:51:16.241152', 'DELIVERED', NULL, 'NONE', NULL, 1400000000.00, 'B2B', NULL),
	(_binary 0xbfa7298dc13611f08492862ccfb0003d, '2025-11-11 08:48:53.000000', _binary 0xa2fbf21443c949d79feb71a0a6dc1964, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, '2025-11-29 08:48:53.000000', 17000000.00, b'1', '2025-11-09 08:48:53.000000', 'DELIVERED', NULL, 'UNPAID', _binary 0x6b62045faa3e48d8a612b971e06caeb0, 85000000.00, 'B2B', NULL),
	(_binary 0xbfa89870c13611f08492862ccfb0003d, NULL, NULL, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, '2025-12-04 08:48:53.000000', 12400000.00, b'0', '2025-11-11 08:48:53.000000', 'IN_TRANSIT', NULL, NULL, _binary 0x6b62045faa3e48d8a612b971e06caeb0, 62000000.00, 'B2B', NULL),
	(_binary 0xbfa89a11c13611f08492862ccfb0003d, '2025-11-13 08:48:53.000000', _binary 0x6b62045faa3e48d8a612b971e06caeb0, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, '2025-11-13 08:48:53.000000', 9000000.00, b'1', '2025-11-13 08:48:53.000000', 'DELIVERED', NULL, NULL, _binary 0xa2fbf21443c949d79feb71a0a6dc1964, 45000000.00, 'B2B', NULL),
	(_binary 0xbfa89b25c13611f08492862ccfb0003d, NULL, NULL, _binary 0x31303034000000000000000000000000, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, 0.00, b'1', '2025-11-10 08:48:53.000000', NULL, 'DELIVERED', NULL, _binary 0x432a97e7dcf4052cae418a19b67af864, 32000000.00, 'B2C', NULL),
	(_binary 0xbfa89bdcc13611f08492862ccfb0003d, NULL, NULL, _binary 0x31303035000000000000000000000000, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, 0.00, b'1', '2025-11-12 08:48:53.000000', NULL, 'PENDING', NULL, _binary 0x432a97e7dcf4052cae418a19b67af864, 28000000.00, 'B2C', NULL),
	(_binary 0xbfa89c78c13611f08492862ccfb0003d, NULL, NULL, _binary 0x31303036000000000000000000000000, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, 0.00, b'1', '2025-11-14 08:48:53.000000', NULL, 'PENDING', NULL, _binary 0x432a97e7dcf4052cae418a19b67af864, 55000000.00, 'B2C', NULL),
	(_binary 0xc3a1a69042264f9da09123060ae535b1, '2025-11-16 01:47:44.489271', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 01:48:04.171030', NULL, b'1', '2025-11-16 01:47:35.575661', 'DELIVERED', NULL, 'NONE', NULL, 930000000.00, 'B2B', NULL),
	(_binary 0xcb30b23bc8a24ef69d93f288401e9d8a, '2025-11-16 18:31:25.791303', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 18:31:58.698611', NULL, b'1', '2025-11-16 18:31:15.506388', 'DELIVERED', NULL, 'NONE', NULL, 840000000.00, 'B2B', NULL),
	(_binary 0xcc55cc5c1ba547808daf0d6095fc92b7, '2025-11-15 00:52:35.933058', NULL, NULL, _binary 0x3ec76f927d4449f4ada1b47d4f55b418, NULL, NULL, b'1', '2025-11-15 00:52:26.840109', 'CONFIRMED', NULL, 'NONE', NULL, 1260000000.00, 'B2B', NULL),
	(_binary 0xd4ae837f12c34b95bef2ac7c0628a8a8, '2025-11-16 18:09:59.163929', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-16 18:10:18.797979', NULL, b'1', '2025-11-16 18:09:47.688540', 'DELIVERED', NULL, 'NONE', NULL, 6100000000.00, 'B2B', NULL),
	(_binary 0xe58527f9cad247c4b9000cec04f930ce, '2025-11-16 00:56:48.693076', NULL, NULL, _binary 0xdfa5b6e2c09c11f08492862ccfb0003d, NULL, NULL, b'1', '2025-11-16 00:56:35.635643', 'IN_TRANSIT', NULL, 'NONE', NULL, 1220000000.00, 'B2B', NULL),
	(_binary 0xf72bd8fd5c1148f49fd6f7a9733d70ea, '2025-11-14 21:40:39.341555', NULL, NULL, _binary 0x1df77d684d874f9e948884b40de153a7, '2025-11-14 21:42:59.747613', NULL, b'1', '2025-11-14 21:04:17.122550', 'DELIVERED', NULL, 'NONE', NULL, 17900000000.00, 'B2B', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
