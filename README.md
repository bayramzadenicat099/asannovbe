# ASAN Smart Queue Management System

A production-ready queue management application inspired by ASAN Xidmət.

## Tech Stack
- **Frontend**: React.js (Vite), TailwindCSS, Lucide-React, Axios
- **Backend**: Node.js (Express), MongoDB (Mongoose), JWT
- **Auth**: Secure admin panel with JSON Web Tokens

## Project Structure
- `/client`: Frontend React application
- `/server`: Backend Express API

## Setup Instructions

### 1. Prerequisite
- Node.js installed
- MongoDB installed and running locally (or use MongoDB Atlas)

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory (see `.env.example`).
Start the server:
```bash
npm start
# or for development
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Admin Credentials
To create a test admin account, you can send a POST request to `http://localhost:5000/api/auth/register-test` with:
```json
{
  "username": "admin",
  "password": "password123"
}
```

## Features
- **Smart Queue Flow**: Step-by-step logic for service selection, info request, and document pickup.
- **Validation**: FIN code format verification and age checks (>= 16).
- **Admin Dashboard**: Real-time stats, queue filtering, and service management.
- **Responsive Design**: Mobile-friendly UI using TailwindCSS.
