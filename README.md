# CampusFind – Smart Lost & Found Management System

MCA mini project built with React, Express, Node.js and MongoDB.

## Features
- Student/staff registration and login with JWT
- Report lost and found items
- Browse/search/filter reports
- Automatic match scoring between lost and found items
- Claim workflow
- Notifications
- Admin dashboard and moderation
- Responsive modern UI

## Run
### Server
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
### Client
```bash
cd client
npm install
npm run dev
```
Set `MONGO_URI` and `JWT_SECRET` in `server/.env`.
