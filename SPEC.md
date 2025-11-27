# Tephra - On-Chain Analytics for Babylon Genesis Chain

## Project Overview

**Tephra** is a production-ready on-chain analytics solution for the Babylon Genesis blockchain. It provides comprehensive tools for blockchain data analysis, address intelligence, portfolio tracking, and smart money detection.

> **Hackathon**: AWS Global Vibe: AI Coding Hackathon 2025  
> **Sponsor**: Babylon  
> **Track**: On-Chain Analytics

---

## Core Capabilities

| Capability | Description |
|------------|-------------|
| **Raw Data Collection** | Ingest blocks, transactions, and events from Babylon Genesis Chain |
| **Address Labeling** | Enrich addresses with labels (exchanges, whales, contracts, validators) |
| **Portfolio Tracking** | Monitor wallet holdings and token activity over time |
| **Smart Money Detection** | Identify and track sophisticated on-chain actors |
| **On-Chain Metrics** | Calculate TVL, volume, active addresses, gas usage, etc. |
| **Dashboards & Templates** | Pre-built views for common analytics use cases |
| **Compliance Support** | Transaction tracing and investigation tools |
| **Research Workflows** | Export data, custom queries, and API access |

---

## Tech Stack

### Frontend
- **Framework**: Nuxt 4 (Vue 3)
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Charts**: nuxt-charts (Chart.js wrapper)
- **Icons**: @nuxt/icon (Iconify)
- **Security**: nuxt-security

### Backend (Nuxt Server Routes)
- **Runtime**: Nitro (Nuxt's server engine)
- **Database**: SQLite (dev) / PostgreSQL (prod) via Drizzle ORM
- **Cache**: In-memory LRU cache for API responses

### Blockchain
- **Chain**: Babylon Genesis (Cosmos SDK based)
- **Mainnet**: Chain ID `bbn-1`
- **Testnet**: Chain ID `bbn-test-6`
- **Devnets**: `bsn-devnet-1`, `devnet-12`
- **Endpoints**:
  - RPC: `https://rpc.babylon.io` (mainnet) / `https://rpc.testnet.babylon.io` (testnet)
  - REST/LCD: `https://lcd.babylon.io` (mainnet) / `https://lcd.testnet.babylon.io` (testnet)
  - gRPC: Port 9090 (for advanced queries)

### Babylon SDK Integration
We'll leverage the official [Babylon Toolkit](https://github.com/babylonlabs-io/babylon-toolkit) packages:

| Package | Purpose |
|---------|---------|
| `@babylonlabs-io/babylon-proto-ts` | TypeScript protobuf definitions for Babylon chain |
| `@babylonlabs-io/babylon-ts-sdk` | TypeScript SDK with LCD/RPC clients |
| `@babylonlabs-io/babylon-bsn-registry` | BSN registry with chain metadata |

**Babylon Chain Modules** (queryable via SDK):
- `btccheckpoint` - Bitcoin checkpoint data
- `btclightclient` - Bitcoin light client state
- `btcstaking` - BTC staking delegations, finality providers
- `checkpointing` - Epoch checkpoints
- `epoching` - Epoch management
- `finality` - Finality signatures
- `incentive` - Staking rewards
- `mint` - Token minting
- `monitor` - Chain monitoring
- `zoneconcierge` - IBC zone management

---

## UI/UX Design

### Color Scheme
Primary palette using **amber/orange** tones instead of emerald green:

```css
/* Primary Colors */
--primary-50: #fffbeb;
--primary-100: #fef3c7;
--primary-200: #fde68a;
--primary-300: #fcd34d;
--primary-400: #fbbf24;
--primary-500: #f59e0b;  /* Main accent */
--primary-600: #d97706;
--primary-700: #b45309;
--primary-800: #92400e;
--primary-900: #78350f;

/* Background */
--bg-primary: #0f172a;   /* slate-900 */
--bg-secondary: #1e293b; /* slate-800 */
--bg-tertiary: #334155;  /* slate-700 */
```

### Design Elements
- Dark theme with slate backgrounds
- Animated gradient orbs for depth
- Glass-morphism cards with subtle borders
- Gradient text for headings
- Smooth hover transitions
- Grid pattern background overlay

---

## Application Structure

```
tephra/
├── app/                           # Main application directory
│   ├── assets/
│   │   └── css/
│   │       └── main.css           # Global styles, grid pattern
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Button.vue
│   │   │   ├── Card.vue
│   │   │   ├── Input.vue
│   │   │   ├── Badge.vue
│   │   │   ├── Table.vue
│   │   │   ├── Modal.vue
│   │   │   └── Skeleton.vue
│   │   ├── layout/
│   │   │   ├── Header.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── Footer.vue
│   │   ├── charts/
│   │   │   ├── LineChart.vue
│   │   │   ├── BarChart.vue
│   │   │   ├── PieChart.vue
│   │   │   └── AreaChart.vue
│   │   ├── dashboard/
│   │   │   ├── MetricCard.vue
│   │   │   ├── TopAddresses.vue
│   │   │   ├── RecentTransactions.vue
│   │   │   └── NetworkStats.vue
│   │   ├── address/
│   │   │   ├── AddressSearch.vue
│   │   │   ├── AddressCard.vue
│   │   │   ├── AddressLabels.vue
│   │   │   └── TransactionHistory.vue
│   │   └── common/
│   │       ├── Logo.vue
│   │       ├── LoadingSpinner.vue
│   │       └── ErrorState.vue
│   ├── composables/
│   │   ├── useBlockchain.ts       # Blockchain data fetching
│   │   ├── useAddressLabels.ts    # Address labeling logic
│   │   ├── useMetrics.ts          # On-chain metrics calculations
│   │   └── useAuth.ts             # Authentication state
│   ├── layouts/
│   │   ├── default.vue            # Landing page layout
│   │   └── dashboard.vue          # Dashboard layout with sidebar
│   ├── middleware/                # Route middleware
│   │   └── auth.ts                # Auth guard for protected routes
│   ├── pages/
│   │   ├── index.vue              # Landing page
│   │   ├── login.vue              # Authentication page
│   │   ├── dashboard/
│   │   │   ├── index.vue          # Main dashboard
│   │   │   ├── analytics.vue      # Deep analytics
│   │   │   └── metrics.vue        # On-chain metrics
│   │   ├── address/
│   │   │   ├── index.vue          # Address explorer
│   │   │   └── [address].vue      # Address detail page
│   │   ├── portfolio/
│   │   │   └── index.vue          # Portfolio tracker
│   │   ├── smart-money/
│   │   │   └── index.vue          # Smart money tracking
│   │   ├── compliance/
│   │   │   └── index.vue          # Investigation tools
│   │   └── settings/
│   │       └── index.vue          # User settings
│   ├── plugins/                   # Vue plugins
│   │   └── chart.client.ts        # Chart.js client plugin
│   ├── utils/                     # Utility functions (auto-imported)
│   │   ├── format.ts              # Formatting helpers
│   │   └── validation.ts          # Validation helpers
│   ├── app.vue                    # Root component
│   ├── app.config.ts              # App configuration
│   └── error.vue                  # Error page
├── server/                        # Server-side code (Nitro)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   ├── logout.post.ts
│   │   │   └── me.get.ts
│   │   ├── blockchain/
│   │   │   ├── blocks.get.ts
│   │   │   ├── transactions.get.ts
│   │   │   └── stats.get.ts
│   │   ├── addresses/
│   │   │   ├── [address].get.ts
│   │   │   ├── labels.get.ts
│   │   │   └── portfolio.get.ts
│   │   ├── metrics/
│   │   │   ├── overview.get.ts
│   │   │   └── history.get.ts
│   │   └── smart-money/
│   │       └── wallets.get.ts
│   ├── middleware/
│   │   └── auth.ts                # Server auth middleware
│   ├── plugins/
│   │   └── db.ts                  # Database initialization
│   └── utils/
│       ├── babylon.ts             # Babylon chain client
│       ├── db.ts                  # Database connection
│       └── cache.ts               # Caching utilities
├── shared/                        # Shared between app and server
│   ├── types/
│   │   ├── blockchain.ts          # Blockchain types
│   │   ├── address.ts             # Address types
│   │   └── api.ts                 # API response types
│   └── constants/
│       └── labels.ts              # Address label constants
├── public/                        # Static files (served at root)
│   ├── favicon.ico
│   └── robots.txt
├── stores/                        # Pinia stores (can be in app/ too)
│   ├── auth.ts                    # Auth store
│   ├── blockchain.ts              # Blockchain data store
│   └── ui.ts                      # UI state store
├── nuxt.config.ts                 # Nuxt configuration
├── tailwind.config.ts             # Tailwind configuration
├── package.json
└── tsconfig.json
```

---

## Pages & Features

### 1. Landing Page (`/`)
- Hero section with project name and description
- Feature highlights (3-column grid)
- Platform statistics (TVL, transactions, addresses)
- CTA buttons to login/explore

### 2. Dashboard (`/dashboard`)
- Network overview cards (block height, TPS, validators)
- Real-time transaction feed
- Top addresses by balance/activity
- 24h volume and activity charts
- Quick search for addresses

### 3. Address Explorer (`/address`)
- Search bar for address lookup
- Recent searches
- Labeled address directory
- Address categories (exchanges, whales, validators)

### 4. Address Detail (`/address/[address]`)
- Address summary (balance, first seen, label)
- Token holdings breakdown
- Transaction history with filters
- Activity charts over time
- Related addresses graph

### 5. Portfolio Tracker (`/portfolio`)
- Connect wallet or enter addresses
- Aggregate portfolio value
- Token allocation chart
- Historical performance
- Profit/loss tracking

### 6. Smart Money (`/smart-money`)
- Top profitable wallets
- Recent whale movements
- Copy trading signals
- Behavior pattern analysis
- Wallet clustering

### 7. Analytics (`/dashboard/analytics`)
- Custom date range selection
- On-chain metrics charts
- Comparative analysis
- Export functionality

### 8. Compliance (`/compliance`)
- Transaction tracing tool
- Address risk scoring
- Flow visualization
- Report generation

---

## Address Labeling System

### Label Categories
```typescript
enum AddressLabel {
  // Entity Types
  EXCHANGE = 'exchange',
  DEX = 'dex',
  VALIDATOR = 'validator',
  BRIDGE = 'bridge',
  
  // Behavior Types
  WHALE = 'whale',
  SMART_MONEY = 'smart_money',
  BOT = 'bot',
  MEV = 'mev',
  
  // Risk Levels
  HIGH_RISK = 'high_risk',
  SANCTIONED = 'sanctioned',
  
  // Custom
  WATCHED = 'watched',
  CUSTOM = 'custom'
}
```

### Labeling Heuristics
1. **Known Addresses**: Curated database of exchange hot/cold wallets, validator addresses
2. **Behavior Analysis**:
   - High frequency trading → Bot
   - Large holdings with infrequent moves → Whale
   - Consistent profits on new tokens → Smart Money
3. **On-chain Patterns**:
   - Contract interactions → DeFi user
   - Staking delegations → Long-term holder
   - Bridge transactions → Cross-chain user

---

## API Endpoints

### Authentication
```
POST /api/auth/login     - Login with credentials
POST /api/auth/logout    - Logout current session
GET  /api/auth/me        - Get current user
```

### Blockchain Data
```
GET /api/blockchain/blocks          - Latest blocks
GET /api/blockchain/blocks/:height  - Block by height
GET /api/blockchain/transactions    - Recent transactions
GET /api/blockchain/tx/:hash        - Transaction by hash
GET /api/blockchain/stats           - Network statistics
```

### Addresses
```
GET /api/addresses/:address         - Address details
GET /api/addresses/:address/txs     - Address transactions
GET /api/addresses/:address/tokens  - Address token holdings
GET /api/addresses/labels           - All labeled addresses
POST /api/addresses/label           - Add custom label
```

### Metrics
```
GET /api/metrics/overview           - Current network metrics
GET /api/metrics/history            - Historical metrics
GET /api/metrics/tvl                - Total value locked
GET /api/metrics/volume             - Trading volume
```

### Smart Money
```
GET /api/smart-money/wallets        - Top smart money wallets
GET /api/smart-money/movements      - Recent whale movements
GET /api/smart-money/signals        - Trading signals
```

### Babylon-Specific
```
GET /api/babylon/staking            - BTC staking delegations
GET /api/babylon/finality-providers - Finality provider list
GET /api/babylon/epoch              - Current epoch info
GET /api/babylon/checkpoints        - BTC checkpoints
GET /api/babylon/rewards            - Incentive rewards
```

---

## Data Pipeline

### Ingestion Flow
```
Babylon LCD/RPC → babylon-proto-ts → Parser → Database → Cache → API
```

### Using Babylon SDK
```typescript
// server/utils/babylon.ts
import { createLCDClient } from '@babylonlabs-io/babylon-proto-ts';

const lcd = createLCDClient({
  restEndpoint: process.env.NUXT_BABYLON_LCD_URL
});

// Query BTC staking delegations
const delegations = await lcd.babylon.btcstaking.v1.bTCDelegations({});

// Query finality providers
const fps = await lcd.babylon.btcstaking.v1.finalityProviders({});

// Query epoch info
const epoch = await lcd.babylon.epoching.v1.currentEpoch({});

// Query incentive rewards
const rewards = await lcd.babylon.incentive.rewardGauges({});
```

### Components
1. **Block Listener**: Poll latest blocks via LCD client
2. **Transaction Parser**: Extract data using babylon-proto-ts types
3. **Indexer**: Store parsed data with proper indexes
4. **Enricher**: Add labels and calculated metrics
5. **Cache Layer**: LRU cache for frequent queries

### Database Schema (Simplified)
```sql
-- Blocks
CREATE TABLE blocks (
  height INTEGER PRIMARY KEY,
  hash TEXT NOT NULL,
  time TIMESTAMP NOT NULL,
  tx_count INTEGER,
  proposer TEXT
);

-- Transactions
CREATE TABLE transactions (
  hash TEXT PRIMARY KEY,
  block_height INTEGER REFERENCES blocks(height),
  sender TEXT,
  type TEXT,
  amount DECIMAL,
  fee DECIMAL,
  status TEXT,
  time TIMESTAMP
);

-- Addresses
CREATE TABLE addresses (
  address TEXT PRIMARY KEY,
  label TEXT,
  label_source TEXT,
  first_seen TIMESTAMP,
  last_seen TIMESTAMP,
  tx_count INTEGER,
  balance DECIMAL
);

-- Labels
CREATE TABLE address_labels (
  id SERIAL PRIMARY KEY,
  address TEXT REFERENCES addresses(address),
  label TEXT NOT NULL,
  confidence DECIMAL,
  source TEXT,
  created_at TIMESTAMP
);
```

---

## Authentication

### Simple Auth Flow
- Session-based authentication with secure cookies
- Default demo account for hackathon: `demo` / `babylon2025`
- Protected routes require valid session

### Implementation
```typescript
// Login endpoint
export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);
  
  if (username === 'demo' && password === 'babylon2025') {
    // Set session cookie
    setCookie(event, 'session', generateSessionToken(), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    return { success: true };
  }
  
  throw createError({ statusCode: 401, message: 'Invalid credentials' });
});
```

---

## Development Phases

### Phase 1: Foundation (Day 1)
- [x] Project setup with Nuxt modules
- [ ] Tailwind config with amber/orange theme
- [ ] Global styles (grid pattern, gradients)
- [ ] UI component library
- [ ] Layout components (header, sidebar, footer)

### Phase 2: Landing & Auth (Day 1-2)
- [ ] Landing page with hero section
- [ ] Feature cards
- [ ] Stats section (mock data)
- [ ] Login page
- [ ] Basic authentication

### Phase 3: Core Dashboard (Day 2-3)
- [ ] Dashboard layout
- [ ] Network stats cards
- [ ] Recent transactions table
- [ ] Basic charts (line, bar)
- [ ] Babylon API integration

### Phase 4: Address Features (Day 3-4)
- [ ] Address explorer page
- [ ] Address search
- [ ] Address detail page
- [ ] Transaction history
- [ ] Label system

### Phase 5: Advanced Features (Day 4-5)
- [ ] Portfolio tracking
- [ ] Smart money detection
- [ ] On-chain metrics
- [ ] Analytics page

### Phase 6: Polish & Deploy (Day 5)
- [ ] Compliance tools (basic)
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design fixes
- [ ] Deploy to Vercel/Netlify

---

## Dependencies to Add

```bash
# Babylon SDK packages
pnpm add @babylonlabs-io/babylon-proto-ts
pnpm add @babylonlabs-io/babylon-ts-sdk

# Database (Drizzle ORM with SQLite)
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3

# Utilities
pnpm add date-fns             # Date formatting
pnpm add @vueuse/core         # Vue composition utilities
pnpm add nuxt-og-image        # Social sharing images (optional)
```

---

## Environment Variables

```env
# App
NUXT_PUBLIC_APP_NAME=Tephra
NUXT_PUBLIC_APP_URL=http://localhost:3000

# Babylon Chain
NUXT_BABYLON_RPC_URL=https://rpc.testnet.babylon.io
NUXT_BABYLON_LCD_URL=https://lcd.testnet.babylon.io
NUXT_BABYLON_CHAIN_ID=bbn-test-6

# Database
DATABASE_URL=file:./data/tephra.db

# Auth
NUXT_AUTH_SECRET=your-secret-key-here
```

---

## Deliverables Checklist

- [ ] Working demo accessible via public URL
- [ ] Source code on GitHub with MIT license
- [ ] README with setup instructions
- [ ] Demo video (backup if hosting fails)
- [ ] Clear documentation of:
  - [ ] Data ingestion pipeline
  - [ ] Address labeling approach
  - [ ] Supported endpoints (mainnet/testnet)

---

## References

- [Babylon Labs Documentation](https://docs.babylonlabs.io/)
- [Babylon Toolkit SDK](https://github.com/babylonlabs-io/babylon-toolkit) - Official TypeScript SDK
- [Babylon Proto TS](https://github.com/babylonlabs-io/babylon-toolkit/tree/main/packages/babylon-proto-ts) - Protobuf definitions
- [Cosmos SDK Documentation](https://docs.cosmos.network/)
- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Chart.js](https://www.chartjs.org/docs/)

---

*Last Updated: November 2025*

