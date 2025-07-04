<div align="center">
  <img src="public/placeholder-logo.png" alt="Emmie Logo" width="120" />
  
  # Emmie – AI Warehouse Assistant
  
  <b>ExxonMobil Bootcathon 2025</b>
</div>

---

## Overview

Emmie is an AI-powered warehouse assistant dashboard designed for the ExxonMobil Bootcathon 2025. It helps you visualize, analyze, and interact with warehouse data using smart widgets, charts, tables, and a chat assistant.

## Features

- 🧑‍💼 **AI Chat Assistant (Emmie):** Ask questions, get insights, and add widgets to your dashboard.
- 📊 **AI Dashboard:**
  - Add, remove, drag, and resize widgets (charts/tables)
  - Persistent widget state (auto-save)
  - Export dashboard as PNG
  - Supports both markdown and tab-separated tables
- 🔔 **Notification Dropdown:**
  - Fetches notifications from API
  - Responsive layout, "read more" for long messages
- 🌐 **Modern UI:** Built with Next.js, Tailwind CSS, Zustand, Chart.js, and html2canvas

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```
2. **Run the app:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `components/` – UI components (dashboard, chat, widgets, etc.)
- `store/` – Zustand global store for widget state
- `app/` – Next.js app directory
- `public/` – Static assets (logo, images)
- `styles/` – Global styles

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Zustand (state management)
- Chart.js
- html2canvas

## License

MIT License. For Bootcathon demo purposes only.