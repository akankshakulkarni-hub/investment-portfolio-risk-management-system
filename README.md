# Investment Portfolio and Risk Management Platform

A full-stack financial portfolio management and risk analytics platform built with React, Node.js/Express, and PostgreSQL.

---

## 1. System Architecture

```
┌──────────────────────────────────────────────┐
│        Frontend (React 19 + Vite 8)         │
│  - Tailwind CSS 3, Recharts, Lucide Icons    │
│  - Real-time ticker via Socket.io-client     │
│  - Port 5173                                 │
└──────────────────────┬───────────────────────┘
                       │ HTTP REST API (JWT Bearer) + WebSocket
┌──────────────────────▼───────────────────────┐
│        Backend (Node.js + Express 5)         │
│  - Parameterized PostgreSQL Driver (pg Pool) │
│  - JWT & Bcrypt Authentication               │
│  - PDFKit & Json2csv Export Engine           │
│  - Socket.io Real-time Market Broadcaster    │
│  - Port 5000                                 │
└──────────────────────┬───────────────────────┘
                       │ TCP 5432 (SCRAM-SHA-256)
┌──────────────────────▼───────────────────────┐
│        Database (PostgreSQL 18 Engine)       │
│  - Normalized Schema (BCNF, 9 Core Tables)   │
│  - Financial Math (SUM, NULLIF, ROUND)       │
│  - Database: portfolio_db                    │
└──────────────────────────────────────────────┘
```

---

## 2. Database Schema (Normalized BCNF)

The platform operates on `portfolio_db` consisting of 9 relational tables:

1. **`users`**: Platform administrators and authenticated investors (`user_id`, `name`, `email`, `password`, `role`, `theme_preference`, `created_at`).
2. **`risk_profile`**: Risk classifications and tolerances (`risk_profile` PK: 'low'/'medium'/'high', `risk_desc`).
3. **`investor`**: Registered investor profiles linked to risk tolerance (`investor_id`, `name`, `email`, `phone`, `risk_profile`, `created_at`).
4. **`portfolio`**: Managed investor portfolios (`portfolio_id`, `portfolio_name`, `total_value`, `creation_date`, `investor_id`).
5. **`asset_class`**: Asset taxonomy (`class_id`, `class_name`, `risk_level`).
6. **`asset`**: Tradable financial assets (`asset_id`, `asset_name`, `symbol`, `sector`, `default_risk_level`, `class_id`).
7. **`investment`**: Portfolio asset allocations (`investment_id`, `quantity`, `purchase_price`, `investment_date`, `portfolio_id`, `asset_id`).
8. **`transactions`**: Financial transaction audit trail (`transaction_id`, `transaction_type` ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW'], `amount`, `transaction_date`, `portfolio_id`, `asset_id`).
9. **`market_data`**: Live market valuation feeds (`market_id`, `current_price`, `last_updated`, `volatility`, `asset_id` UNIQUE).

---

## 3. Local Development Quickstart

### Prerequisites
* Node.js v18+ (tested on Node.js v24.14.0)
* npm v9+
* PostgreSQL 15+ (tested on PostgreSQL 18)

### Step 1: Configure Environment Variables
Inside `portfolio-backend/`:
```bash
cp .env.example .env
```
Edit `.env` and supply your PostgreSQL credentials:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=portfolio_db
JWT_SECRET=supersecretjwtkey_portfolio_risk_mgmt_2026
```

### Step 2: Install Dependencies
```bash
# Backend
cd portfolio-backend
npm install

# Frontend
cd ../portfolio-frontend
npm install
```

### Step 3: Run Automated Test Suites
```bash
cd portfolio-backend
npm test
```
Runs both unit and end-to-end integration test suites:
- `tests/api.test.js`: Database connectivity, Auth, CRUD, Reports (CSV/PDF)
- `tests/financial.test.js`: Financial math, return formulas, zero-denominator safeguards, weighted risk score

### Step 4: Start the Applications
```bash
# In terminal 1: Start Backend (Port 5000)
cd portfolio-backend
npm run dev

# In terminal 2: Start Frontend (Port 5173)
cd portfolio-frontend
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 4. API Endpoints Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | None | API Health Check |
| `POST` | `/auth/signup` | None | Register new user account |
| `POST` | `/auth/login` | None | Authenticate user & issue JWT |
| `GET` | `/auth/me` | JWT | Get current authenticated profile |
| `PATCH` | `/auth/theme` | JWT | Update user UI theme preference |
| `GET` | `/investors` | None | List all investors with risk profiles |
| `GET` | `/investors/:id` | None | Get specific investor by ID |
| `POST` | `/investors` | None | Create new investor |
| `PUT` | `/investors/:id` | None | Update investor details |
| `DELETE` | `/investors/:id` | None | Delete investor record |
| `GET` | `/portfolios` | None | List all portfolios |
| `GET` | `/portfolios/performance`| None | Calculate performance across all portfolios |
| `GET` | `/portfolios/:id` | None | Get portfolio details by ID |
| `GET` | `/portfolios/:id/performance`| None | Calculate performance for single portfolio |
| `POST` | `/portfolios` | None | Create new portfolio |
| `PUT` | `/portfolios/:id` | None | Update portfolio name or valuation |
| `DELETE` | `/portfolios/:id` | None | Delete portfolio and associated positions |
| `GET` | `/assets` | None | List all assets with live market prices |
| `GET` | `/assets/grouped` | None | List assets grouped by asset class (JSON_AGG) |
| `POST` | `/assets` | None | Add asset and initialize market price |
| `PUT` | `/assets/:id` | None | Update asset details and market price |
| `DELETE` | `/assets/:id` | None | Delete asset |
| `GET` | `/investments` | None | List all investment allocations |
| `GET` | `/investments/portfolio/:id`| None | Get positions for a specific portfolio |
| `POST` | `/investments` | None | Add position to a portfolio |
| `DELETE` | `/investments/:id` | None | Remove investment position |
| `GET` | `/transactions` | None | Retrieve financial transaction audit logs |
| `POST` | `/transactions` | None | Record BUY/SELL/DEPOSIT/WITHDRAW transaction |
| `GET` | `/market-data` | None | List market ticker data |
| `POST` | `/market-data` | None | Upsert asset price & volatility |
| `GET` | `/reports/transactions` | JWT | Download transaction log as CSV |
| `GET` | `/reports/portfolio/:id` | JWT | Download portfolio summary report as PDF |

---

## 5. Financial Formulas & Calculations

### 1. Total Invested Cost
$$\text{Total Invested} = \sum (\text{quantity} \times \text{purchase\_price})$$

### 2. Current Portfolio Market Value
$$\text{Current Value} = \sum (\text{quantity} \times \text{current\_price})$$

### 3. Portfolio Return Percentage (with Zero-Denominator Protection)
$$\text{Return \%} = \text{ROUND}\left(\frac{\text{Current Value} - \text{Total Invested}}{\text{NULLIF}(\text{Total Invested}, 0)} \times 100, 2\right)$$
*Note: Using `NULLIF(..., 0)` prevents runtime division-by-zero errors when portfolios have no holdings.*

### 4. Weighted Portfolio Risk Score
$$\text{Risk Score} = \text{ROUND}\left(\frac{\sum (\text{volatility} \times (\text{quantity} \times \text{current\_price}))}{\text{NULLIF}(\sum (\text{quantity} \times \text{current\_price}), 0)} \times 10, 2\right)$$
* **Low Risk**: $\text{Score} \le 3.5$
* **Medium Risk**: $3.5 < \text{Score} \le 6.5$
* **High Risk**: $\text{Score} > 6.5$

---

## 6. AWS Deployment Readiness (Course Project Guide)

For your **Cloud Architecture and Design** course:

### Recommended AWS Architecture:
1. **Frontend**: Static website hosting on **Amazon S3** fronted by **Amazon CloudFront** (Global CDN, HTTPS certificate via ACM).
2. **Backend**: Containerized Node.js Express server on **AWS App Runner** or **AWS Elastic Beanstalk** (or ECS Fargate with an Application Load Balancer).
3. **Database**: Managed **Amazon RDS for PostgreSQL** (`db.t3.micro` or `db.t4g.micro` within the AWS Free Tier: 750 hours/month for 12 months, 20 GB gp2 storage).
4. **Networking & Security**:
   - RDS provisioned in private VPC subnets.
   - Security Group rule: Inbound TCP 5432 permitted ONLY from the backend Application Load Balancer / App Runner security group.
   - Enforce SSL connections (`ssl: { rejectUnauthorized: true }`).
5. **Secrets Management**: Store `DB_PASSWORD` and `JWT_SECRET` in **AWS Secrets Manager** or **AWS Systems Manager Parameter Store** (SecureString).

---

## 7. Rollback Procedure

All changes were strictly additive or bug-fixing:
- To roll back backend code, revert the modified files using Git history.
- The `portfolio_db` database was preserved 100% intact; no tables were dropped or renamed.
- To revert the added `UNIQUE (asset_id)` constraint on `market_data`:
  ```sql
  ALTER TABLE market_data DROP CONSTRAINT market_data_asset_id_key;
  ```
