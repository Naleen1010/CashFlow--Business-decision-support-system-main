---
title: CashFlow Business Management
emoji: 💼
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# CashFlow Business Management System

A comprehensive business management system with inventory management, sales tracking, customer management, and ML-powered predictions.

## Features

- User authentication with JWT
- Inventory management
- Sales tracking and invoicing
- Customer management
- Order management
- ML-powered sales predictions
- Barcode scanning support
- Responsive React frontend

## Tech Stack

- **Backend**: FastAPI with MongoDB
- **Frontend**: React with TypeScript, Material UI
- **ML**: scikit-learn for sales predictions

## Architecture

This application uses a combined deployment approach where:
- The FastAPI backend serves the React frontend as static files
- The API is available under the `/api` prefix
- ML models are used for sales predictions and business insights

## Environment Variables

This application requires the following environment variables:
- `MONGODB_URL`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation

## API Documentation

When the server is running, visit `/docs` for the OpenAPI documentation.