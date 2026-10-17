# TaskFlow API

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TaskFlow API is a modular, production-ready RESTful workflow and task lifecycle management service built with Node.js, Express, and TypeScript. Designed with clean layered architecture (Controllers, Services, Repositories/Stores) and full unit/integration test coverage.

## Features

- **Layered Clean Architecture**: Separation of concerns across controllers, services, middleware, and data models.
- **RESTful Endpoints**: Full CRUD for tasks with status, priority, assignments, and tags.
- **Query Filtering**: Flexible task filtering by status, priority, assignee, and search terms.
- **Centralized Error Handling**: Standardized JSON error response format with appropriate HTTP status codes.
- **Strict Typing**: Fully typed with TypeScript interfaces, DTOs, and compile-time guarantees.
- **Automated Test Suite**: Unit and integration tests written with Jest and Supertest.

## Architecture Overview

```
src/
├── controllers/    # Request/response handling & HTTP status mappings
├── middleware/     # Error handling, request validation, headers
├── routes/         # Express router definitions
├── services/       # Domain business logic & validation rules
├── store/          # Data persistence layer (InMemory database)
├── types/          # TypeScript domain models and DTO interfaces
├── __tests__/      # Automated integration and unit tests
├── app.ts          # Express application factory
└── index.ts        # Server entry point
```

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/taskflow-api.git
cd taskflow-api

# Install dependencies
npm install
```

### Running the Application

```bash
# Development mode with hot-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Running Tests

```bash
npm test
```

## API Documentation

### Health Check
- `GET /health` - Service heartbeat check

### Tasks API
- `GET /api/v1/tasks` - List tasks (supports query params: `status`, `priority`, `assignedTo`, `search`)
- `GET /api/v1/tasks/:id` - Get task details by ID
- `POST /api/v1/tasks` - Create a new task
- `PUT /api/v1/tasks/:id` - Update task attributes or status
- `DELETE /api/v1/tasks/:id` - Remove a task

## License

This project is licensed under the MIT License - see the LICENSE file for details.
