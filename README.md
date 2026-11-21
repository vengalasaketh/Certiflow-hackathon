# CertiFlow – Skilling Certificate Issuance Platform

CertiFlow is a web-based prototype for managing skill-training batches and certificate issuance workflows.

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express
- Database: PostgreSQL

## Project Structure

```text
certiflow-hackathon/
├── frontend/
└── server/
```

## Features

- Training batch dashboard
- Batch creation interface
- Role-based workflow interface
- Candidate and approval views
- Certificate and public verification interface
- PostgreSQL integration for batch records

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
node server.js
```

Configure the PostgreSQL connection using environment variables in `server/.env`.

## Current Implementation Status

This is a hackathon prototype. Batch retrieval is connected to PostgreSQL. Other workflow screens and actions may still contain demonstration functionality and should not be considered production-ready.

## Future Improvements

- Secure server-side role-based authentication
- Complete approval and audit workflows
- Certificate generation and cancellation
- Automated tests
- Docker Compose and Redis queue integration
