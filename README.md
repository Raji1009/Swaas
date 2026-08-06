# Swaas - MERN Smart Health Measurement Application

## Overview
Swaas is a MERN full-stack smart health measurement application for viewing patient mental-health metrics, patient profiles, and browser-based RPPG camera analysis.

## Tech Stack
- **MongoDB** database for users, patients, and metric samples.
- **Express.js** and **Node.js** backend written in JavaScript.
- **React** frontend written in JavaScript/JSX.
- **Mongoose** for MongoDB models and persistence.

## Features
- User registration and login endpoints backed by MongoDB.
- Patient profile storage in MongoDB with historical mental-health samples.
- API endpoints for retrieving patients and appending mental-health data.
- React dashboard, patient profile charts, authentication, and RPPG camera UI.
- Docker Compose setup with MongoDB, backend, and frontend services.

## Project Structure
```
Swaas
├── backend
│   ├── Dockerfile
│   ├── src
│   │   ├── index.js
│   │   ├── controllers
│   │   │   └── authController.js
│   │   ├── routes
│   │   │   └── index.js
│   │   ├── services
│   │   │   └── mentalHealthService.js
│   │   ├── models
│   │   │   ├── patient.js
│   │   │   └── user.js
│   │   └── utils
│   │       └── validators.js
│   ├── package.json
│   └── package-lock.json
├── frontend
│   ├── Dockerfile
│   ├── public
│   ├── src
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── components
│   │   │   ├── Dashboard.jsx
│   │   │   └── Header.jsx
│   │   ├── pages
│   │   │   ├── Auth.jsx
│   │   │   ├── PatientProfile.jsx
│   │   │   └── RppgCamera.jsx
│   │   └── services
│   │       └── api.js
│   ├── package.json
│   └── package-lock.json
├── shared
│   └── schemas
│       └── mentalHealthSchema.js
├── docker-compose.yml
└── .env.example
```

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start MongoDB locally or run the full stack with Docker Compose:
   ```bash
   docker compose up --build
   ```

4. Run services locally without Docker:
   ```bash
   # terminal 1
   mongod

   # terminal 2
   npm start --prefix backend

   # terminal 3
   REACT_APP_API_URL=http://localhost:5000/api npm start --prefix frontend
   ```

## API Notes
- `GET /health` reports backend and MongoDB connection status.
- `POST /api/register` creates a user document.
- `POST /api/login` validates a user document.
- `GET /api/patients/1` seeds and returns a sample MongoDB patient profile.
- `POST /api/patients` creates a patient.
- `POST /api/patients/:id/mental-health` appends a mental-health sample.

## License
This project is licensed under the MIT License.
