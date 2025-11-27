# Real Data Structures for Integration

This document outlines the data structures returned by the API endpoints that can be integrated into the mock pages.

## API Response Format

All API endpoints return data in this format:
```typescript
{
  success: boolean
  data: <Type>
  mock?: boolean  // Present if using fallback mock data
}
```

---

## 1. Address Data (`/api/addresses/[address]`)

### Response Structure
```typescript
{
  success: true,
  data: {
    address: string                    // Full address (e.g., "bbn1abc...xyz")
    addressShort: string              // Shortened address (e.g., "bbn1abc...xyz")
    balances: Array<{
      denom: string                    // Token denomination (e.g., "ubbn")
      amount: string                   // Raw amount (e.g., "1000000000")
      formatted: string               // Formatted amount (e.g., "1,000.00 BBN")
    }>
    totalBBN: string                  // Total BBN balance (e.g., "1,000.00")
    accountType: string               // Account type (e.g., "BaseAccount")
    accountNumber: string             // Account number
    sequence: string                  // Sequence number
  }
}
```

### Example
```json
{
  "success": true,
  "data": {
    "address": "bbn1abcdefghijklmnopqrstuvwxyz",
    "addressShort": "bbn1abc...xyz",
    "balances": [
      {
        "denom": "ubbn",
        "amount": "1000000000",
        "formatted": "1,000.00 BBN"
      }
    ],
    "totalBBN": "1,000.00",
    "accountType": "BaseAccount",
    "accountNumber": "12345",
    "sequence": "10"
  }
}
```

---

## 2. Transactions (`/api/blockchain/transactions?limit=20`)

### Response Structure
```typescript
{
  success: true,
  data: Array<{
    hash: string                      // Transaction hash
    height: number                    // Block height
    type: string                      // "Transfer" | "Delegate" | "Undelegate" | "BTC Stake" | "Vote" | etc.
    from: string                      // Shortened sender address
    fromFull: string                  // Full sender address
    to: string                        // Shortened receiver address
    toFull: string                    // Full receiver address
    amount: string                    // Formatted amount (e.g., "1,000.00 BBN")
    denom: string                     // Token denomination
    status: 'success' | 'failed'      // Transaction status
    time: string                      // ISO timestamp
    timeAgo: string                   // Human-readable time (e.g., "2m ago")
    gasUsed: string                   // Gas used
    gasWanted: string                 // Gas wanted
  }>
}
```

### Example
```json
{
  "success": true,
  "data": [
    {
      "hash": "ABCD1234EFGH5678...",
      "height": 1847293,
      "type": "Transfer",
      "from": "bbn1abc...xyz",
      "fromFull": "bbn1abcdefghijklmnopqrstuvwxyz",
      "to": "bbn1def...uvw",
      "toFull": "bbn1defghijklmnopqrstuvw",
      "amount": "1,000.00 BBN",
      "denom": "ubbn",
      "status": "success",
      "time": "2025-01-15T10:30:00Z",
      "timeAgo": "2m ago",
      "gasUsed": "50000",
      "gasWanted": "100000"
    }
  ]
}
```

---

## 3. Blocks (`/api/blockchain/blocks?limit=10`)

### Response Structure
```typescript
{
  success: true,
  data: Array<{
    height: number                    // Block height
    hash: string                      // Block hash
    time: string                      // ISO timestamp
    timeAgo: string                   // Human-readable time (e.g., "6s ago")
    txCount: number                   // Number of transactions in block
    proposer: string                  // Proposer validator address
    chainId: string                   // Chain ID (e.g., "bbn-test-6")
  }>
}
```

### Example
```json
{
  "success": true,
  "data": [
    {
      "height": 1847293,
      "hash": "BLOCKHASH123...",
      "time": "2025-01-15T10:30:00Z",
      "timeAgo": "6s ago",
      "txCount": 5,
      "proposer": "bbnvaloper1...",
      "chainId": "bbn-test-6"
    }
  ]
}
```

---

## 4. Network Stats (`/api/blockchain/stats`)

### Response Structure
```typescript
{
  success: true,
  data: {
    latestBlock: {
      height: number                  // Latest block height
      time: string                    // ISO timestamp
      hash: string                    // Block hash
      txCount: number                 // Transactions in latest block
      proposer: string                // Proposer address
    }
    chainId: string                   // Chain ID
    nodeVersion: string               // Node version
    totalValidators: number           // Total number of validators
    bondedTokens: string              // Total bonded tokens (raw string)
  }
}
```

### Example
```json
{
  "success": true,
  "data": {
    "latestBlock": {
      "height": 1847293,
      "time": "2025-01-15T10:30:00Z",
      "hash": "ABCD1234...",
      "txCount": 5,
      "proposer": "bbnvaloper1..."
    },
    "chainId": "bbn-test-6",
    "nodeVersion": "0.1.0",
    "totalValidators": 42,
    "bondedTokens": "1000000000000"
  }
}
```

---

## 5. Finality Providers (`/api/babylon/finality-providers`)

### Response Structure
```typescript
{
  success: true,
  data: {
    providers: Array<{
      btcPk: string                    // Bitcoin public key
      btcPkShort: string              // Shortened BTC PK
      address: string                  // Babylon address
      addressShort: string            // Shortened address
      moniker: string                 // Provider name
      website: string                 // Website URL
      commission: string              // Commission rate (decimal, e.g., "0.05")
      commissionPercent: string       // Commission percentage (e.g., "5.00")
      totalBondedSat: string          // Total bonded in satoshis
      totalBondedBTC: string          // Total bonded in BTC (e.g., "5000.00000000")
      active: boolean                 // Active status
    }>
    totalProviders: number            // Total count
    activeProviders: number           // Active count
  }
}
```

### Example
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "btcPk": "fp1pk123...",
        "btcPkShort": "fp1pk...123",
        "address": "bbn1fp1addr",
        "addressShort": "bbn1fp...1",
        "moniker": "Babylon Labs",
        "website": "https://babylonlabs.io",
        "commission": "0.05",
        "commissionPercent": "5.00",
        "totalBondedSat": "500000000000",
        "totalBondedBTC": "5000.00000000",
        "active": true
      }
    ],
    "totalProviders": 5,
    "activeProviders": 4
  }
}
```

---

## 6. BTC Staking Delegations (`/api/babylon/staking?status=`)

### Response Structure
```typescript
{
  success: true,
  data: {
    delegations: Array<{
      stakingTxHash: string           // Staking transaction hash
      stakingTxHashShort: string      // Shortened hash
      stakerAddress: string           // Staker's address
      stakerAddressShort: string      // Shortened staker address
      finalityProviders: string[]     // Array of FP BTC PKs
      stakingValue: string            // Staking value (raw satoshis)
      stakingValueBTC: string         // Staking value in BTC (e.g., "0.10000000")
      stakingTime: number             // Staking time in blocks
      unbondingTime: number           // Unbonding time in blocks
      status: string                  // "ACTIVE" | "UNBONDING" | "UNBONDED"
    }>
    totalDelegations: number          // Total count
    currentEpoch: {
      epoch_number: string
      current_epoch_interval: string
      first_block_height: string
    }
  }
}
```

### Example
```json
{
  "success": true,
  "data": {
    "delegations": [
      {
        "stakingTxHash": "btctxhash123...",
        "stakingTxHashShort": "btctx...123",
        "stakerAddress": "bbn1staker123",
        "stakerAddressShort": "bbn1sta...123",
        "finalityProviders": ["fp1pk123"],
        "stakingValue": "10000000",
        "stakingValueBTC": "0.10000000",
        "stakingTime": 21600,
        "unbondingTime": 1008,
        "status": "ACTIVE"
      }
    ],
    "totalDelegations": 10,
    "currentEpoch": {
      "epoch_number": "100",
      "current_epoch_interval": "3600",
      "first_block_height": "1800000"
    }
  }
}
```

---

## 7. Raw Babylon API Types (from `server/utils/babylon.ts`)

### BabylonBlock
```typescript
interface BabylonBlock {
  block_id: {
    hash: string
  }
  block: {
    header: {
      height: string
      time: string
      chain_id: string
      proposer_address: string
    }
    data: {
      txs: string[]  // Array of base64-encoded transaction hashes
    }
  }
}
```

### BabylonTransaction
```typescript
interface BabylonTransaction {
  txhash: string
  height: string
  tx: {
    body: {
      messages: Array<{
        '@type': string  // Message type URL
        // ... message-specific fields
      }>
    }
  }
  tx_response: {
    code: number        // 0 = success, non-zero = error
    logs: any[]
    gas_wanted: string
    gas_used: string
    timestamp: string
  }
}
```

### FinalityProvider (Raw)
```typescript
interface FinalityProvider {
  btc_pk: string
  addr: string
  description: {
    moniker: string
    identity: string
    website: string
    details: string
  }
  commission: string        // Decimal string (e.g., "0.05")
  total_bonded_sat: string  // Satoshis as string
  active: boolean
}
```

### BTCDelegation (Raw)
```typescript
interface BTCDelegation {
  staking_tx_hash: string
  staker_addr: string
  fp_btc_pk_list: string[]
  staking_value: string     // Satoshis as string
  staking_time: number      // Blocks
  unbonding_time: number    // Blocks
  state: string            // "ACTIVE" | "UNBONDING" | "UNBONDED"
}
```

---

## Integration Notes

### For Address Detail Page (`/address/[address].vue`)
- **Current mock**: Transaction history array
- **Real data**: Use `/api/addresses/[address]` for address info, then fetch transactions for that address
- **Note**: Need to create endpoint `/api/addresses/[address]/transactions` to get transactions for a specific address

### For Portfolio Page (`/portfolio/index.vue`)
- **Current mock**: All portfolio data (holdings, staking, BTC staking)
- **Real data**: Would need:
  - User's watched addresses from database
  - For each address: fetch balance and transaction history
  - Aggregate staking positions from validators
  - Aggregate BTC staking from delegations endpoint

### For Smart Money Page (`/smart-money/index.vue`)
- **Current mock**: Wallet leaderboard, whale movements, trading signals
- **Real data**: Would need:
  - Heuristic analysis of addresses (high PnL, win rate, etc.)
  - Database query for labeled "smart money" addresses
  - Transaction pattern analysis

### For Compliance Page (`/compliance/index.vue`)
- **Current mock**: Random risk scores
- **Real data**: Would need:
  - Address transaction history analysis
  - Connection graph analysis
  - Flagged addresses database
  - Volume and pattern analysis

### For Analytics Page (`/dashboard/analytics.vue`)
- **Current mock**: Chart data, metrics
- **Real data**: Would need:
  - Historical transaction data from database
  - Time-series aggregation
  - Network metrics over time

### For Address Explorer (`/address/index.vue`)
- **Current mock**: Labeled addresses directory
- **Real data**: Query database `addresses` and `address_labels` tables

---

## Database Schema (from `server/utils/db.ts`)

### Available Tables
- `blocks` - Block data
- `transactions` - Transaction data
- `addresses` - Address metadata
- `address_labels` - Address labels (multiple per address)
- `sessions` - User sessions
- `watched_addresses` - User's watched addresses
- `finality_providers` - Finality provider data
- `btc_delegations` - BTC staking delegations

### Key Fields
```sql
addresses:
  - address (PK)
  - label
  - label_source
  - label_confidence
  - tx_count
  - balance (JSON)
  - is_contract
  - is_validator

address_labels:
  - id (PK)
  - address (FK)
  - label
  - category
  - confidence
  - source
```

---

## Usage in Frontend

### Using `useBlockchain()` Composable
```typescript
const { 
  transactions,      // Ref<Transaction[]>
  blocks,            // Ref<Block[]>
  networkStats,      // Ref<NetworkStats | null>
  finalityProviders, // Ref<FinalityProvider[]>
  btcDelegations,    // Ref<BTCDelegation[]>
  isLoading,         // Ref<boolean>
  isMock,            // Ref<boolean>
  error,             // Ref<string | null>
  fetchTransactions,
  fetchBlocks,
  fetchNetworkStats,
  fetchFinalityProviders,
  fetchBTCDelegations
} = useBlockchain()
```

### Direct API Calls
```typescript
// Fetch address data
const { data } = await useFetch(`/api/addresses/${address}`)

// Fetch transactions
const { data } = await $fetch('/api/blockchain/transactions', {
  query: { limit: 50 }
})
```

