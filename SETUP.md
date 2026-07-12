# TransitOps - Developer Setup Guide

Follow these steps to set up and run the TransitOps application (Frontend, Backend, and Database) on your local machine.

## Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (comes with Node.js)

---

## Setup Steps

### 1. Install Dependencies
Navigate to the project root directory and install the required npm packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root directory (if it does not exist) and add the database URL configuration:
```env
DATABASE_URL="file:./dev.db"
```

### 3. Setup the Database (Prisma & SQLite)
Generate the Prisma Client types and synchronize your local SQLite database schema:
```bash
# Generate Prisma Client
npx prisma generate

# Sync the database schema (creates the SQLite database file dev.db)
npx prisma db push

# Seed the database with demo users, vehicles, drivers, and initial data
npx prisma db seed
```

### 4. Run the Application

#### Development Mode (With Hot Reloading)
To start the local development server for both frontend and backend:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Mode
To build the application for production and start the optimized server:
```bash
# Compile and build the project
npm run build

# Start the production server
npm run start
```

---

## Demo Credentials
Once the app is running, you can log in with any of these pre-configured roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@transitops.com` | `admin123` |
| **Fleet Manager** | `fleet@transitops.com` | `fleet123` |
| **Safety Officer** | `safety@transitops.com` | `safety123` |
| **Financial Analyst** | `analyst@transitops.com` | `analyst123` |
