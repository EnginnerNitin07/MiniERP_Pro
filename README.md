# MiniERP Pro — Student ERP Project

A complete, polished small-business ERP built for a college/final-year demonstration. It is intentionally **not enterprise-scale**: there are no microservices, Docker, cloud dependencies, payment gateways, or complicated authentication. Every feature is understandable and runnable locally.

## Modules
- Dashboard with revenue, expenses, profit, margin, low-stock alerts, trend chart and recent sales
- Products & inventory with reorder alerts
- Customers with lifetime paid-spend tracking
- Suppliers
- Sales and purchase transactions
- Employees
- Expenses
- Reports & print-friendly analytics
- Light/dark mode
- Responsive desktop/mobile layout
- SQLite persistence and demo seed data

## Stack
- React 19 + Vite
- Lucide React
- Recharts
- Node.js + Express 5
- SQLite via better-sqlite3

## Folder structure
```text
MiniERP_Pro/
  client/
    index.html
    package.json
    src/
      components/
      lib/api.js
      pages/
      main.jsx
      styles.css
  server/
    index.js
    package.json
    erp.db        # created automatically on first server run
  README.md
```

## Run it
Open two terminals.

### Terminal 1 — backend
```bash
cd server
npm install
npm run dev
```
API: `http://localhost:4000`

### Terminal 2 — frontend
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## API
- `GET/POST/DELETE /api/products`
- `GET/POST/DELETE /api/customers`
- `GET/POST/DELETE /api/suppliers`
- `GET/POST/DELETE /api/employees`
- `GET/POST/DELETE /api/expenses`
- `GET/POST/DELETE /api/sales`
- `GET/POST/DELETE /api/purchases`
- `GET /api/dashboard`
- `GET /api/health`

## Business logic included
- Net Profit = Paid Revenue − Expenses
- Profit Margin = Net Profit / Paid Revenue × 100
- Low stock = Stock Quantity ≤ Reorder Level
- Customer total spent increases for paid sales and is reversed when a paid sale is deleted
- Dashboard metrics are calculated directly from SQLite data

## Demo data
The backend seeds products, customers, suppliers, employees, expenses, sales and purchases only when the database is empty. Delete `server/erp.db` if you want to reset to the original demo dataset.
