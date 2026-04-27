-- Migration: Create overtime table
-- This script adds the overtime table to track overtime entries for workers

CREATE TABLE IF NOT EXISTS `overtime` (
  `id` int NOT NULL AUTO_INCREMENT,
  `worker_id` int NOT NULL,
  `date` date NOT NULL,
  `hours` decimal(3,1) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_overtime_worker_date` (`worker_id`, `date`),
  KEY `fk_overtime_worker_id` (`worker_id`),
  CONSTRAINT `fk_overtime_worker_id` FOREIGN KEY (`worker_id`) REFERENCES `data_pegawai` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- UNIQUE KEY uq_overtime_worker_date handles duplicate checks and query performance on worker_id/date.
