# Weight Management Software

Professional offline local business management software built using React, Tailwind CSS, Spring Boot, JPA, and SQLite.

---

# Suggested Repository Names

Choose any one:

1. weight-management-software
2. local-weight-management-system
3. weight-management-dashboard
4. offline-weight-management-app
5. business-weight-manager
6. weight-record-management-system
7. smart-weight-management
8. weight-management-desktop-software
9. weight-management-crud-app
10. local-business-weight-software

Recommended:

```bash
weight-management-software
```

---

# Project Overview

This project is a professional local business software designed to manage daily weight records on a local computer without internet.

The system allows users to:

* Add weight records
* Edit records
* Delete records
* View records in table format
* Calculate totals
* Export records to PDF
* Export records to Excel
* Run completely offline

---

# Tech Stack

## Frontend

* React
* Tailwind CSS
* Axios
* React Toastify

## Backend

* Spring Boot
* Spring Data JPA
* SQLite Database

---

# Features

## Core Features

* Add Record
* Edit Record
* Delete Record
* Show All Records
* Search Records
* Filter Records
* Daily Total Calculation
* Responsive Dashboard
* Loading States
* Empty State UI
* Toast Notifications
* Delete Confirmation

## Export Features

* Export PDF
* Export Excel

## Future Ready Features

* Authentication
* Analytics Dashboard
* Charts & Reports
* Desktop EXE Conversion
* Backup & Restore

---

# Folder Structure

```bash
WeightManagementSoftware/
│
├── backend/
│   └── weight-management/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/
│       │   │   │       └── weight/
│       │   │   │           └── weight_management/
│       │   │   │               ├── controller/
│       │   │   │               ├── service/
│       │   │   │               ├── repository/
│       │   │   │               ├── entity/
│       │   │   │               ├── config/
│       │   │   │               └── WeightManagementApplication.java
│       │   │   │
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   │
│       │   └── test/
│       │
│       ├── pom.xml
│       └── weight_management.db
│
└── frontend/
    └── weight-management-ui/
```

---

# Backend Setup

## Step 1 — Open Backend Folder

```bash
cd backend/weight-management
```

---

## Step 2 — Run Spring Boot

```bash
./mvnw.cmd spring-boot:run
```

---

## Backend URL

```bash
http://localhost:8080
```

---

# API Endpoints

## Get All Records

```http
GET /api/records
```

## Add Record

```http
POST /api/records
```

## Update Record

```http
PUT /api/records/{id}
```

## Delete Record

```http
DELETE /api/records/{id}
```

---

# SQLite Database

SQLite runs automatically.

Database file:

```bash
weight_management.db
```

No MySQL or XAMPP required.

---

# Frontend Setup

## Create React App

```bash
npm create vite@latest
```

## Install Dependencies

```bash
npm install
npm install axios react-toastify jspdf xlsx file-saver react-icons
```

## Run Frontend

```bash
npm run dev
```

---

# Axios Base URL

```javascript
http://localhost:8080/api
```

---

# Export Features

## PDF Export

Using:

* jsPDF

## Excel Export

Using:

* xlsx
* file-saver

---

# UI Features

* Modern Dashboard Layout
* Sidebar Navigation
* Responsive Design
* Professional Table UI
* Toast Notifications
* Search & Filter
* Business Logo Header
* Mobile Responsive Layout

---

# Future Improvements

* JWT Authentication
* Admin Panel
* Role Based Access
* Charts & Analytics
* Electron Desktop EXE
* Cloud Backup
* Multi User System

---

# Author

Developed for local business weight management and offline desktop operations.

---

# License

This project is free for learning and business use.
