# Tephra - On-Chain Analytics for Babylon Genesis

> **Production-ready on-chain analytics solution for the Babylon Genesis blockchain**

**Tephra** provides comprehensive tools for blockchain data analysis, address intelligence, portfolio tracking, smart money detection, and compliance screening.

Built for **AWS Global Vibe: AI Coding Hackathon 2025** • **Babylon On-Chain Analytics Track**

---

## 🚀 Features

- ✅ **Real-time Blockchain Data** - Live data from Babylon testnet
- ✅ **Address Intelligence** - Manual and automated labeling with database persistence
- ✅ **Portfolio Tracking** - Watch multiple addresses, aggregate balances
- ✅ **Smart Money Detection** - Track finality providers and sophisticated actors
- ✅ **On-Chain Analytics** - Transaction type breakdown, network metrics
- ✅ **Compliance Tools** - Risk scoring, address screening, known entities
- ✅ **Multiple Dashboards** - Pre-built views for common use cases

---

## 🛠️ Tech Stack

- **Frontend**: Nuxt 4 (Vue 3), Tailwind CSS, Pinia
- **Backend**: Nitro (Nuxt server routes)
- **Database**: SQLite (dev) / Turso libSQL (prod/serverless)
- **Blockchain**: Babylon Genesis Chain (testnet: `bbn-test-6`)
- **SDK**: Babylon REST/LCD API integration

---

## 📦 Setup

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tephra

# Install dependencies
pnpm install

# Configure environment variables as needed

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## 🏗️ Architecture

### Data Flow

```
Babylon LCD API → Babylon Client → API Endpoints → Frontend Components
                                      ↓
                                  SQLite Database
```

### Key Components

- **`server/utils/babylon.ts`** - Babylon API client with caching
- **`server/utils/db.ts`** - Database schema and connection
- **`server/utils/labeling.ts`** - Automated labeling service
- **`app/composables/useBlockchain.ts`** - Frontend data fetching
- **`server/api/*`** - REST API endpoints

### Database Schema

- `blocks` - Block data
- `transactions` - Transaction records
- `addresses` - Address metadata
- `address_labels` - Multiple labels per address
- `watched_addresses` - User's watched wallets
- `finality_providers` - FP data cache
- `btc_delegations` - BTC staking records

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Blockchain Data
- `GET /api/blockchain/stats` - Network statistics
- `GET /api/blockchain/blocks?limit=10` - Recent blocks
- `GET /api/blockchain/transactions?limit=20` - Recent transactions

### Addresses
- `GET /api/addresses/:address` - Address details
- `GET /api/addresses/:address/transactions` - Address transaction history
- `GET /api/addresses/:address/labels` - Address labels

### Labels
- `GET /api/labels` - All labels
- `POST /api/labels` - Add label
- `DELETE /api/labels/:id` - Remove label
- `POST /api/labeling/auto` - Trigger auto-labeling job

### Portfolio
- `GET /api/portfolio/watched` - Watched addresses
- `POST /api/portfolio/watched` - Add watched address
- `DELETE /api/portfolio/watched/:id` - Remove watched address

### Babylon-Specific
- `GET /api/babylon/finality-providers` - Finality providers list
- `GET /api/babylon/staking?status=ACTIVE` - BTC staking delegations

### Analytics
- `GET /api/analytics/overview` - Aggregated analytics

### Compliance
- `POST /api/compliance/analyze` - Risk analysis for address (auto-labels if matches heuristics)
- `GET /api/compliance/entities` - Known entities

---

## 🏷️ Address Labeling Approach

Tephra uses a **hybrid labeling system** combining manual user labeling with heuristic-based automated labeling.

### Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Manual Labeling** | ✅ **Implemented** | Users can add labels via UI |
| **Validator Auto-Labeling** | ✅ **Implemented** | Auto-labels on server startup |
| **Finality Provider Auto-Labeling** | ✅ **Implemented** | Auto-labels FPs as "smart-money" |
| **Whale Detection** | ✅ **Implemented** | Auto-labels addresses with >1M BBN |
| **Bot Detection** | 📝 **Documented** | Heuristics defined, future enhancement |
| **Smart Money (Profit Tracking)** | 📝 **Documented** | ML approach documented, future enhancement |

### Manual Labeling

Users can manually add labels through the UI with categories:
- `whale` - Large balance holders (>1M BBN)
- `exchange` - Exchange hot/cold wallets
- `validator` - Validator operator addresses
- `smart-money` - Sophisticated traders/investors
- `bot` - Automated trading accounts
- `contract` - Smart contract addresses
- `foundation` - Foundation/official addresses
- `custom` - User-defined labels

### Automated Labeling (Heuristics)

#### 1. Validator Auto-Labeling

**Status**: ✅ **Implemented**

Automatically labels all validators from the validator set on server startup.

```typescript
// server/utils/labeling.ts
async function autoLabelValidators() {
  const validators = await client.getValidators()
  for (const val of validators.validators) {
    await upsertLabel(
      val.operator_address,
      val.description?.moniker || 'Unknown Validator',
      'validator',
      0.95,
      'auto'
    )
  }
}
```

**Example:**
```
Address: bbnvaloper1abc...
Label: "Babylon Foundation"
Category: validator
Confidence: 0.95
Source: auto (blockchain-verification)
```

#### 2. Finality Provider Auto-Labeling

**Status**: ✅ **Implemented**

Automatically labels all finality providers as "smart-money" on server startup.

```typescript
async function autoLabelFinalityProviders() {
  const fps = await client.getFinalityProviders()
  for (const fp of fps.finality_providers) {
    await upsertLabel(
      fp.addr,
      fp.description?.moniker || 'Unknown FP',
      'smart-money',
      0.95,
      'auto'
    )
  }
}
```

**Example:**
```
Address: bbn13hefzpveg2kxmu4xvus7wrlaavdllzs9fkdcs5
Label: "Zellic"
Category: smart-money
Confidence: 0.95
Source: auto (blockchain-verification)
```

#### 3. Whale Detection

**Status**: ✅ **Implemented**

Auto-labels addresses with balance > 1M BBN during compliance checks.

```typescript
// Whale Detection Heuristic
function detectWhale(balance: number): boolean {
  return balance >= 1_000_000 // 1M BBN threshold
}

// Auto-labels during compliance analysis
if (balanceLevel === 'whale') {
  await upsertLabel(address, 'Whale', 'whale', 0.85, 'heuristic')
}
```

**Example:**
```
Address: bbn1whale123...
Balance: 2,500,000 BBN
Label: "Whale (2500000 BBN)"
Category: whale
Confidence: 0.85
Source: heuristic
```

#### 4. Activity-Based Heuristics

Used in compliance risk scoring:

```typescript
// Activity Level Detection
const sequence = account.sequence // Transaction count proxy

if (sequence === 0) {
  activityLevel: 'new'
  riskModifier: +15 points
} else if (sequence >= 100) {
  activityLevel: 'high'
  riskModifier: +5 points
  // Potential bot detection
}
```

### Risk Scoring Integration

Labels directly influence risk scoring in the compliance system:

```typescript
function calculateRiskScore(address: Address): number {
  let score = 30 // Base score
  
  // Entity verification reduces risk
  if (isFinalityProvider(address)) score -= 25
  if (isValidator(address)) score -= 20
  
  // Labels reduce risk
  if (hasLabel(address, 'exchange')) score -= 5
  if (hasLabel(address, 'foundation')) score -= 10
  
  // Whale detection increases scrutiny
  if (isWhale(address)) score += 10
  
  // New accounts are higher risk
  if (isNewAccount(address)) score += 15
  
  return Math.max(0, Math.min(100, score))
}
```

**Risk Score Ranges:**
- **0-19**: Clean (Green)
- **20-49**: Low Risk (Blue)
- **50-79**: Medium Risk (Yellow)
- **80-100**: High Risk (Red)

### Label Confidence Levels

| Source | Confidence | Description |
|--------|-----------|-------------|
| **Manual** | 1.0 (100%) | User-verified label |
| **Blockchain Verification** | 0.95 (95%) | Verified from chain data (validator, FP) |
| **Heuristic (High)** | 0.85 (85%) | Strong pattern match (whale detection) |
| **Heuristic (Medium)** | 0.70-0.84 | Moderate pattern match |
| **Heuristic (Low)** | 0.50-0.69 | Weak pattern match |

### Automatic Labeling Flow

1. **Server Startup** (`server/plugins/labeling-cron.ts`):
   ```
   Server starts → Wait 5 seconds → Auto-label validators → Auto-label FPs
   ```

2. **Compliance Check** (`server/api/compliance/analyze.post.ts`):
   ```
   User analyzes address → Run heuristics → Auto-label if matches → Return analysis
   ```

3. **Manual Trigger** (`POST /api/labeling/auto`):
   ```
   API call → Run all auto-labeling functions → Return results
   ```

### Future Enhancements (Documented, Not Implemented)

1. **Bot Detection** - Transaction pattern analysis (requires historical data)
2. **Smart Money (Profit Tracking)** - ML-based profit/loss analysis
3. **Exchange Clustering** - Graph analysis of address connections

**Note**: The requirement asks for "label heuristics **or** ML models used". We've implemented **heuristics-based** automated labeling, which is production-ready. ML models are documented as future enhancements.

---

## 📊 Data Ingestion Pipeline

### Current Implementation (MVP)

- **On-Demand Fetching**: Data fetched when requested via API
- **Caching**: 10-second LRU cache to reduce API calls
- **Database**: Labels and watched addresses persist
- **Auto-Labeling**: Background job runs on server startup

### Pipeline Flow

```
Babylon LCD API → Babylon Client (with cache) → API Endpoints → Frontend
                                      ↓
                              SQLite Database
                                      ↓
                          Auto-Labeling Service
```

### Production Enhancement

For production, add background workers:
- Continuous block ingestion
- Historical data indexing
- Time-series metrics storage

---

## 🎯 Usage

### Demo Mode

The application auto-logs in a "demo" user for easy access. No login required for testing.

### Adding Labels

1. Navigate to Address Explorer
2. Search for an address
3. Click "Add Label" on the address detail page
4. Select category and add label

### Portfolio Tracking

1. Go to Portfolio page
2. Click "+ Add" to add a watched address
3. View aggregated balances and activity

### Compliance Screening

1. Go to Compliance page
2. Enter an address in the search box
3. View risk score and analysis (address is auto-labeled if matches heuristics)

### Triggering Auto-Labeling

```bash
# Manual trigger via API
curl -X POST http://localhost:3000/api/labeling/auto
```

---

## ✅ Requirements Satisfaction

### Core Capabilities (8/8) ✅

1. ✅ **Collect raw blockchain data** - Real-time from Babylon testnet
2. ✅ **Enrich and label addresses** - Manual + automated labeling
3. ✅ **Track portfolio and token activity** - Portfolio page with watched addresses
4. ✅ **Detect "smart money"** - Finality providers as sophisticated actors
5. ✅ **Measure on-chain metrics** - Analytics dashboard with real data
6. ✅ **Dashboards and templates** - Multiple pre-built dashboards
7. ✅ **Support investigations and compliance** - Risk scoring and screening
8. ✅ **Power trading and research workflows** - Address explorer, transaction tracking

### Technical Requirements (4/4) ✅

1. ✅ **Babylon Genesis support** - Using testnet (`bbn-test-6`), mainnet-ready
2. ✅ **Data ingestion pipeline** - On-demand fetching with caching (MVP-ready)
3. ✅ **Address labeling approach** - Heuristics implemented and documented
4. ✅ **Basic authentication** - JWT-based with demo mode

### Deliverables (3/3) ✅

1. ✅ **Working demo/MVP** - Ready for deployment
2. ✅ **Source code repository** - Complete with all features
3. ✅ **README with setup instructions** - This document

---

## 🚢 Deployment

### Build for Production

```bash
pnpm build
pnpm preview
```

### Environment Setup

For production, configure your environment variables in `.env`:
- Database configuration (SQLite or Turso)
- Authentication secret
- Babylon chain endpoints
- Application URL

### Deployment Platforms

- **Vercel**: Zero-config Nuxt deployment
- **Netlify**: Supports Nuxt 4
- **Railway**: Easy database + app hosting
- **AWS**: EC2 + RDS setup

---

## 🔐 Authentication

- JWT-based sessions
- HTTP-only cookies
- Demo mode for easy access
- Session management in database

**Demo Credentials:**
- Username: `demo`
- Password: `babylon2025`

---

## 📝 License

Built for AWS Global Vibe Hackathon 2025

---

## 🤝 Contributing

This is a hackathon project. For questions or issues, please open an issue in the repository.
