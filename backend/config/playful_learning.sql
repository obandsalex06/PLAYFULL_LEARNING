-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-11-2025 a las 20:13:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `playful_learning`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `academic_records`
--

CREATE TABLE `academic_records` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_email` varchar(255) NOT NULL,
  `class_id` int(11) NOT NULL,
  `grade` decimal(5,2) DEFAULT NULL,
  `observation` text DEFAULT NULL,
  `evaluation_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `password`, `school_id`, `created_at`, `updated_at`) VALUES
(3, 'Alex Obando', 'lobandoalex@gmail.com', '$2a$10$2UuWrBQuywM9klXpss457ufskic.9sG8UlwJMOfKOxFUAQt4L5DBy', 1, '2025-11-06 17:46:01', '2025-11-06 18:45:59'),
(4, 'Admin 1', 'admin1@demo.com', '$2a$10$..eALWYkUeSlK9.orsKmaeWEWr2g7uBgqEfsbgFR12R8JKiAgmYIu', 1, '2025-11-06 17:46:01', '2025-11-06 18:45:59'),
(5, 'Admin 2', 'admin2@demo.com', '$2a$10$PfHLuEMa1VyNdQZTKopp6ee/3hk2lv1ItacmZT1ig7SDw//LVBWNO', 2, '2025-11-06 17:46:01', '2025-11-06 18:45:59'),
(6, 'Admin 3', 'admin3@demo.com', '$2a$10$y4AMEHdVtHryTNQ/JT/Y7./Hb2KJXb39Ok6P02q34uzgvYTMirLgq', 3, '2025-11-06 17:46:01', '2025-11-06 18:45:59'),
(7, 'Admin 4', 'admin4@demo.com', '$2a$10$kOSfYVnKFLUi87ZmIgIFB.2VsiNRd0KJoUgEVHGc7KZQBgsOGGvlu', 4, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(8, 'Admin 5', 'admin5@demo.com', '$2a$10$ekQm5R0fYr8vWpwYAKQm8OLEDRP1S6aye5ipgPREi5JdUJOWH9qi6', 5, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(9, 'Admin 6', 'admin6@demo.com', '$2a$10$kDpt1wsb31J385x7Ait/pe0IZ5ew.KfWDtLpv8Y2dY8uz7yey1LLW', 6, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(10, 'Admin 7', 'admin7@demo.com', '$2a$10$xZL0EbA5Priacc9eN2OEIuRmQsxRf1TIXaca4MH03NesTMqa51B5.', 7, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(11, 'Admin 8', 'admin8@demo.com', '$2a$10$z3J5tZqFOf0ybqrdtsIxx.kFrtufxdsvQuJPCvOMXatZSY8JWzM12', 8, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(12, 'Admin 9', 'admin9@demo.com', '$2a$10$kIXBxqQDB6NCmeUqqzK2MOdXYasxnbwREzeBJg3CJp872cxCpmS76', 9, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(13, 'Admin 10', 'admin10@demo.com', '$2a$10$0Nly0FgQFUbtJJmMnTCq9unAIKd9dxSKjYm384gDXBAx21QrrMY2W', 10, '2025-11-06 17:46:02', '2025-11-06 18:45:59');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `priority` enum('normal','high','urgent') DEFAULT 'normal',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `message`, `priority`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'no hay clase', 'Reuniones', 'normal', 1, '2025-11-06 18:05:32', '2025-11-06 18:05:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `classes`
--

INSERT INTO `classes` (`id`, `name`, `description`, `teacher_id`, `school_id`, `created_at`, `updated_at`) VALUES
(1, 'Clase 1', 'Clase 1 descripción', 1, 1, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(2, 'Clase 2', 'Clase 2 descripción', 2, 2, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(3, 'Clase 3', 'Clase 3 descripción', 3, 3, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(4, 'Clase 4', 'Clase 4 descripción', 4, 4, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(5, 'Clase 5', 'Clase 5 descripción', 5, 5, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(6, 'Clase 6', 'Clase 6 descripción', 6, 6, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(7, 'Clase 7', 'Clase 7 descripción', 7, 7, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(8, 'Clase 8', 'Clase 8 descripción', 8, 8, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(9, 'Clase 9', 'Clase 9 descripción', 9, 9, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(10, 'Clase 10', 'Clase 10 descripción', 10, 10, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(11, 'Educacion Fisica', 'Recreacion y deportes', 1, 3, '2025-11-06 18:06:37', '2025-11-06 18:06:37'),
(12, 'Etica', 'Etica y derechos humanos', 11, 1, '2025-11-06 19:02:02', '2025-11-06 19:02:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `class_students`
--

CREATE TABLE `class_students` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `class_students`
--

INSERT INTO `class_students` (`id`, `class_id`, `student_id`, `assigned_at`) VALUES
(1, 1, 1, '2025-11-06 18:46:01'),
(2, 2, 2, '2025-11-06 18:46:01'),
(3, 3, 3, '2025-11-06 18:46:01'),
(4, 4, 4, '2025-11-06 18:46:01'),
(5, 5, 5, '2025-11-06 18:46:01'),
(6, 6, 6, '2025-11-06 18:46:01'),
(7, 7, 7, '2025-11-06 18:46:01'),
(8, 8, 8, '2025-11-06 18:46:01'),
(9, 9, 9, '2025-11-06 18:46:01'),
(10, 10, 10, '2025-11-06 18:46:01'),
(11, 12, 12, '2025-11-06 19:02:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `coins`
--

CREATE TABLE `coins` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `amount` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `coins`
--

INSERT INTO `coins` (`id`, `student_id`, `amount`, `reason`, `created_at`) VALUES
(1, 1, 3, 'buen comportamiento', '2025-11-06 18:18:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consents`
--

CREATE TABLE `consents` (
  `id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_role` enum('admin','docente','secretaria','estudiante') NOT NULL,
  `consent_type` enum('terms','privacy','both') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `accepted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evidences`
--

CREATE TABLE `evidences` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_email` varchar(255) NOT NULL,
  `class_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `redeemed_rewards`
--

CREATE TABLE `redeemed_rewards` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `reward_id` int(11) DEFAULT NULL,
  `cost_at_time` int(11) NOT NULL,
  `redeemed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rewards`
--

CREATE TABLE `rewards` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `cost` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rewards`
--

INSERT INTO `rewards` (`id`, `name`, `description`, `cost`, `created_at`, `updated_at`) VALUES
(1, 'Premio 1', 'Descripción 1', 10, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(2, 'Premio 2', 'Descripción 2', 20, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(3, 'Premio 3', 'Descripción 3', 30, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(4, 'Premio 4', 'Descripción 4', 40, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(5, 'Premio 5', 'Descripción 5', 50, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(6, 'Premio 6', 'Descripción 6', 60, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(7, 'Premio 7', 'Descripción 7', 70, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(8, 'Premio 8', 'Descripción 8', 80, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(9, 'Premio 9', 'Descripción 9', 90, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(10, 'Premio 10', 'Descripción 10', 100, '2025-11-06 17:46:04', '2025-11-06 17:46:04'),
(11, 'Balon', 'Balon de micro futbol', 40, '2025-11-06 18:57:39', '2025-11-06 18:57:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `schools`
--

CREATE TABLE `schools` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `schools`
--

INSERT INTO `schools` (`id`, `name`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Colegio 1', 'Calle 1 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01'),
(2, 'Colegio 2', 'Calle 2 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01'),
(3, 'Colegio 3', 'Calle 3 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01'),
(4, 'Colegio 4', 'Calle 4 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01'),
(5, 'Colegio 5', 'Calle 5 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01'),
(6, 'Colegio 6', 'Calle 6 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01'),
(7, 'Colegio 7', 'Calle 7 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01'),
(8, 'Colegio 8', 'Calle 8 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01'),
(9, 'Colegio 9', 'Calle 9 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01'),
(10, 'Colegio 10', 'Calle 10 #123', '2025-11-06 17:46:01', '2025-11-06 17:46:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `secretaries`
--

CREATE TABLE `secretaries` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `secretaries`
--

INSERT INTO `secretaries` (`id`, `name`, `email`, `password`, `school_id`, `created_at`, `updated_at`) VALUES
(1, 'Secretaria 1', 'secretary1@demo.com', '$2a$10$Z.AE0X4/HkGj5hTsBuM6KeqAp5lgJ.BwP0o9OL8OEL3AMUbZkt9pm', 1, '2025-11-06 17:46:03', '2025-11-06 18:46:01'),
(2, 'Secretaria 2', 'secretary2@demo.com', '$2a$10$bbL4Ca0GT.mZCbP3cRPR7eZtH4D2ionb4mT4qJA/xvEOHrvn/WwA6', 2, '2025-11-06 17:46:03', '2025-11-06 18:46:01'),
(3, 'Secretaria 3', 'secretary3@demo.com', '$2a$10$efOgpvHM5oYn0NP8ZsQYveofltaas75audo3mV65E3MLYk1cmxdb2', 3, '2025-11-06 17:46:03', '2025-11-06 18:46:01'),
(4, 'Secretaria 4', 'secretary4@demo.com', '$2a$10$Avrat6PZiglrCdnCA5LkMuFMjT4XaIxNeOepnuY0iQy9LiRrGXQTC', 4, '2025-11-06 17:46:03', '2025-11-06 18:46:01'),
(5, 'Secretaria 5', 'secretary5@demo.com', '$2a$10$KQZ0ohgyBGT5c/ZWeYeQzOz5lFaDoe1eIici/oEBEs0TgLCvfBOAG', 5, '2025-11-06 17:46:04', '2025-11-06 18:46:01'),
(6, 'Secretaria 6', 'secretary6@demo.com', '$2a$10$L/QUzqGkzbzLA8atPpAiz.zq4mQn7hzvb4Gm01HNnSe8OZ79m68wW', 6, '2025-11-06 17:46:04', '2025-11-06 18:46:01'),
(7, 'Secretaria 7', 'secretary7@demo.com', '$2a$10$BZSXn40lWFyqKwqwJkvzJelEut0Uv6bYHkBzlngGzYaJPdRWVZ7Om', 7, '2025-11-06 17:46:04', '2025-11-06 18:46:01'),
(8, 'Secretaria 8', 'secretary8@demo.com', '$2a$10$ylLesfJpdSs3HjuKenXYFOy/NIyJWltQ3hLhigrV5P73U4zRSHESC', 8, '2025-11-06 17:46:04', '2025-11-06 18:46:01'),
(9, 'Secretaria 9', 'secretary9@demo.com', '$2a$10$py7f0NVcolqHZN8KiM8h5um9dfwRMOOVL4mOPTbAsA7XCJWIH/wHW', 9, '2025-11-06 17:46:04', '2025-11-06 18:46:01'),
(10, 'Secretaria 10', 'secretary10@demo.com', '$2a$10$KTPBTIO1eHEAGjcswKbJIe8SS/sZZuLyU27n8a0iXcT0YpGLHF4jW', 10, '2025-11-06 17:46:04', '2025-11-06 18:46:01'),
(11, 'Milena', 'Mile@gmail.com', '$2a$10$./N.5jLN.98EyHfD0o/sh.4AEG6d2PbAnK7o7/P3mNEVE1ia3lOnS', 3, '2025-11-06 18:07:11', '2025-11-06 18:07:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `coins` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `grade` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `students`
--

INSERT INTO `students` (`id`, `name`, `email`, `password`, `school_id`, `coins`, `created_at`, `updated_at`, `first_name`, `last_name`, `role`, `grade`) VALUES
(1, 'Estudiante 1', 'student1@demo.com', '$2a$10$HQH8q8kpwObBhUUsjYD5femkmu4OAAuVYzkZ.i.0nkvalJ.12G.Ye', 1, 10, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(2, 'Estudiante 2', 'student2@demo.com', '$2a$10$BflS1EF6s1OmsJ7SEgPGkefeBUm9O5vGDdhxIBf2TZn2VXd8ewXx.', 2, 20, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(3, 'Estudiante 3', 'student3@demo.com', '$2a$10$Te9LpxQ7vxwD0GSMDighseLFiSdEI8lpaSVfClMsUsmQyFEbmp2lO', 3, 30, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(4, 'Estudiante 4', 'student4@demo.com', '$2a$10$i64Usb9zf0aKbDIoOq00OeD6upBrbKDj1qBhm5Ngy06Pkp7qxUMki', 4, 40, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(5, 'Estudiante 5', 'student5@demo.com', '$2a$10$4LmDvqbEXpCN0svUdiarZufn34a9RO9LQ35yp7UAh/YBTA0Ly02Jy', 5, 50, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(6, 'Estudiante 6', 'student6@demo.com', '$2a$10$NvAr8GmjeAnBNYGKzrRQzOR9MnJA0O0NeBJGyLwp1PRM3wFxbG7pK', 6, 60, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(7, 'Estudiante 7', 'student7@demo.com', '$2a$10$Cm.bTsJ5xRa1dB8u7H8MiOX2uiq3pD1yEGyVgIVP1rpxZikDJnlPy', 7, 70, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(8, 'Estudiante 8', 'student8@demo.com', '$2a$10$91nlv/C5a3A28I/BX4mScu4pmVxQ5SFOr3gZsyfeTy7BtqTNrK8gG', 8, 80, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(9, 'Estudiante 9', 'student9@demo.com', '$2a$10$t86S9nmXxIEgl/eRNh6cKeLVfGXr9wByrXb0yGXO9UD4nlT4ypVPC', 9, 90, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(10, 'Estudiante 10', 'student10@demo.com', '$2a$10$Pb.jW7A2NAyA4diPtFM5JOsMxlhLCjhVr7eUQkIafD4H2qj2IwWGC', 10, 100, '2025-11-06 17:46:03', '2025-11-06 18:46:00', NULL, NULL, NULL, NULL),
(12, 'Duver Arley Gonzales', 'duver12345@gmail.com', '$2a$10$/Sy4xVfJYEzyUhdx3DscZODbFcSvvcLOrW7KtelybZ6JH0Ad9Bpce', 3, 0, '2025-11-06 18:05:05', '2025-11-06 18:05:05', 'Duver Arley', 'Gonzales', 'estudiante', 10),
(13, 'alert(\"Muerto\"); Espinoza', 'espinoza12@gmail.com', '$2a$10$eqz7jTkvVC.0DY7tMN5tzexCdDB6Gd2hyXfQFkOYZwsfNGetRDKA2', 5, 0, '2025-11-06 21:35:09', '2025-11-06 21:35:09', 'alert(\"Muerto\");', 'Espinoza', 'estudiante', 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `students_classes`
--

CREATE TABLE `students_classes` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `students_classes`
--

INSERT INTO `students_classes` (`id`, `student_id`, `class_id`, `created_at`) VALUES
(1, 1, 1, '2025-11-06 17:46:04'),
(2, 2, 2, '2025-11-06 17:46:04'),
(3, 3, 3, '2025-11-06 17:46:04'),
(4, 4, 4, '2025-11-06 17:46:04'),
(5, 5, 5, '2025-11-06 17:46:04'),
(6, 6, 6, '2025-11-06 17:46:04'),
(7, 7, 7, '2025-11-06 17:46:04'),
(8, 8, 8, '2025-11-06 17:46:04'),
(9, 9, 9, '2025-11-06 17:46:04'),
(10, 10, 10, '2025-11-06 17:46:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `teachers`
--

INSERT INTO `teachers` (`id`, `name`, `email`, `password`, `school_id`, `created_at`, `updated_at`) VALUES
(1, 'Docente 1', 'teacher1@demo.com', '$2a$10$mSMCcaUEc4PSFbSmk6ZK4eKPZCdvfLiewUv1IAhrixAAx6LsYgNTW', 1, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(2, 'Docente 2', 'teacher2@demo.com', '$2a$10$RP9s4nOhhfuxU6wjD7Ts1.sdl9KAhoAgzvaEFztBszOLni4dFDfR.', 2, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(3, 'Docente 3', 'teacher3@demo.com', '$2a$10$oSyC7bb34fULhYv6XK9tjeHkkDuwmRIqRoUYYHWuC2X9I70SGJuq2', 3, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(4, 'Docente 4', 'teacher4@demo.com', '$2a$10$sHZs0/s7mx65B0FuOiz/AORB9fPE8Y/f1uHa1TbtOifTGCzC9ut5y', 4, '2025-11-06 17:46:02', '2025-11-06 18:45:59'),
(5, 'Docente 5', 'teacher5@demo.com', '$2a$10$AvIbvtKvSWB0kKyIwD9Hfe0KxxoM//sBk4pyouf0/cOjzMrylXCe2', 5, '2025-11-06 17:46:02', '2025-11-06 18:46:00'),
(6, 'Docente 6', 'teacher6@demo.com', '$2a$10$jf0NcxjcDtWaYTUbzCvaD.5wsBrhtWCJ4aCsLIiC9HkzyRHoF807q', 6, '2025-11-06 17:46:02', '2025-11-06 18:46:00'),
(7, 'Docente 7', 'teacher7@demo.com', '$2a$10$0bMGn4UBJIUkpk8BYmc5DuGkEmvddzXrRW1Q/Vb1SVcUI0L1QGRFS', 7, '2025-11-06 17:46:02', '2025-11-06 18:46:00'),
(8, 'Docente 8', 'teacher8@demo.com', '$2a$10$aSqOYVW2r/gHXr.QKbv9zeGukxCp1ReujMGhT2Z7XwfrcaqiRWFn6', 8, '2025-11-06 17:46:02', '2025-11-06 18:46:00'),
(9, 'Docente 9', 'teacher9@demo.com', '$2a$10$wrK9svNoNfTviCy5cAOQ.eDKD5XQ0xHdH/kI9gk.kzk9.yhGTehUG', 9, '2025-11-06 17:46:02', '2025-11-06 18:46:00'),
(10, 'Docente 10', 'teacher10@demo.com', '$2a$10$agErUhNvxslgTTv2nW2eauKuoKFkqQ2X36y0ZZC5KAF.aJzgjny7m', 10, '2025-11-06 17:46:03', '2025-11-06 18:46:00'),
(11, 'Luz', 'luz@gmail.com', '$2a$10$OKsVKUlGPbj4qxSxwcbKVeyXZpZsEhqVY6VEUk4Hn4SO94zjBBAxm', 3, '2025-11-06 18:09:14', '2025-11-06 18:09:14');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `academic_records`
--
ALTER TABLE `academic_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indices de la tabla `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `school_id` (`school_id`);

--
-- Indices de la tabla `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indices de la tabla `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indices de la tabla `class_students`
--
ALTER TABLE `class_students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_student` (`class_id`,`student_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indices de la tabla `coins`
--
ALTER TABLE `coins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indices de la tabla `consents`
--
ALTER TABLE `consents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_email` (`user_email`),
  ADD KEY `idx_accepted_at` (`accepted_at`);

--
-- Indices de la tabla `evidences`
--
ALTER TABLE `evidences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indices de la tabla `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indices de la tabla `redeemed_rewards`
--
ALTER TABLE `redeemed_rewards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `reward_id` (`reward_id`);

--
-- Indices de la tabla `rewards`
--
ALTER TABLE `rewards`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `secretaries`
--
ALTER TABLE `secretaries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `school_id` (`school_id`);

--
-- Indices de la tabla `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `school_id` (`school_id`);

--
-- Indices de la tabla `students_classes`
--
ALTER TABLE `students_classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indices de la tabla `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `school_id` (`school_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `academic_records`
--
ALTER TABLE `academic_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `class_students`
--
ALTER TABLE `class_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `coins`
--
ALTER TABLE `coins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `consents`
--
ALTER TABLE `consents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `evidences`
--
ALTER TABLE `evidences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `redeemed_rewards`
--
ALTER TABLE `redeemed_rewards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rewards`
--
ALTER TABLE `rewards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `secretaries`
--
ALTER TABLE `secretaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `students_classes`
--
ALTER TABLE `students_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `academic_records`
--
ALTER TABLE `academic_records`
  ADD CONSTRAINT `academic_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `academic_records_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`);

--
-- Filtros para la tabla `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);

--
-- Filtros para la tabla `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `secretaries` (`id`);

--
-- Filtros para la tabla `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);

--
-- Filtros para la tabla `class_students`
--
ALTER TABLE `class_students`
  ADD CONSTRAINT `class_students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  ADD CONSTRAINT `class_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

--
-- Filtros para la tabla `coins`
--
ALTER TABLE `coins`
  ADD CONSTRAINT `coins_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

--
-- Filtros para la tabla `evidences`
--
ALTER TABLE `evidences`
  ADD CONSTRAINT `evidences_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `evidences_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`);

--
-- Filtros para la tabla `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`);

--
-- Filtros para la tabla `redeemed_rewards`
--
ALTER TABLE `redeemed_rewards`
  ADD CONSTRAINT `redeemed_rewards_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `redeemed_rewards_ibfk_2` FOREIGN KEY (`reward_id`) REFERENCES `rewards` (`id`);

--
-- Filtros para la tabla `secretaries`
--
ALTER TABLE `secretaries`
  ADD CONSTRAINT `secretaries_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);

--
-- Filtros para la tabla `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);

--
-- Filtros para la tabla `students_classes`
--
ALTER TABLE `students_classes`
  ADD CONSTRAINT `students_classes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
