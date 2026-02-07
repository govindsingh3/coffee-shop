# Coffee Shop Queue - Frontend

React + TypeScript UI for the Smart Coffee Shop Queue System with Vite.

## Quick Start

### Prerequisites
- Node.js 16+
- npm 8+

### Install Dependencies
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```

The app will start on **http://localhost:5176**

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Features

- **Menu Display**: Browse 6 coffee drink options
- **Order Placement**: Place orders with quantity selection
- **Queue Dashboard**: Real-time queue status with auto-refresh (5s polling)
- **Priority Scoring**: Visual priority indicators for orders
- **Responsive Design**: Tailwind CSS styling

## Components

- `App.tsx` - Main app with navigation between Menu and Dashboard
- `Menu.tsx` - Menu display and order placement
- `QueueDashboard.tsx` - Queue status and waiting orders display
- `Navbar.tsx` - Navigation header

## Services

- `api.ts` - Axios client for backend API communication

## Technologies

- React 18
- TypeScript 5
- Vite 4
- Tailwind CSS 3
- PostCSS 8
- Axios

## API Base URL

`http://localhost:3000/api`

Make sure backend is running before starting the frontend.
