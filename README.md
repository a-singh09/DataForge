# DataForge 🔥

**The Decentralized AI Training Data Marketplace**

DataForge is a revolutionary platform that transforms how AI training datasets are created, licensed, and distributed. Built on blockchain technology using the Origin SDK, DataForge enables creators to monetize their valuable training data while providing AI developers with access to high-quality, ethically-sourced datasets.

_Submission for URL Hackathon_

## 🌟 What DataForge Does

DataForge bridges the gap between data creators and AI developers by providing:

- **Decentralized Dataset Marketplace**: Browse, purchase, and license AI training datasets with transparent pricing
- **NFT-Based Licensing**: Each dataset is minted as an NFT with embedded licensing terms using Origin Protocol
- **Creator Monetization**: Data creators earn revenue through direct sales and usage-based licensing
- **Quality Assurance**: Community-driven rating and verification system for dataset quality
- **Flexible Licensing**: Multiple licensing models from one-time purchases to subscription-based access
- **Analytics Dashboard**: Track dataset performance, earnings, and market trends

## 🚀 Key Features

### For Data Creators

- **Easy Upload**: Drag-and-drop interface for dataset uploads with metadata management
- **Smart Licensing**: Automated licensing terms with customizable usage rights
- **Revenue Tracking**: Real-time analytics on sales, downloads, and earnings
- **Quality Metrics**: Community feedback and rating system

### For AI Developers

- **Curated Marketplace**: Discover high-quality datasets across various domains
- **Instant Access**: Purchase and download datasets with blockchain-verified licenses
- **Bulk Licensing**: Enterprise-grade licensing for large-scale AI projects

### Blockchain Integration

- **Origin SDK Integration**: Leverages Origin Protocol for decentralized marketplace functionality
- **NFT Minting**: Each dataset becomes a tradeable NFT with embedded licensing
- **Smart Contracts**: Automated royalty distribution and license enforcement
- **Transparent Transactions**: All purchases and licenses recorded on-chain

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, MongoDB, Next.js API Routes
- **Blockchain**: Origin SDK, Base Camp network
- **Authentication**: NextAuth.js with Web3 wallet integration
- **UI Components**: Radix UI, Lucide Icons

## � Problem Statement

### Current AI Industry Challenges

**For AI Companies & Researchers:**

- **Licensing Uncertainty**: Most datasets on platforms like Kaggle lack clear commercial licensing terms
- **Legal Risk**: Using "free" datasets without proper licensing can lead to costly legal disputes
- **Quality Issues**: No standardized quality metrics or creator accountability
- **Attribution Problems**: Difficulty tracking data provenance and giving proper credit

**For Data Creators:**

- **No Monetization**: Valuable training data shared freely with no compensation
- **Lack of Control**: Once uploaded, creators lose control over how their data is used
- **No Recognition**: Creators rarely receive attribution for their contributions to AI breakthroughs

### How DataForge Solves These Problems

DataForge addresses these critical issues through blockchain-verified licensing and decentralized ownership:

- **Clear Licensing**: Every dataset has transparent, legally-binding license terms stored on-chain
- **Creator Compensation**: Automated royalty distribution ensures creators are fairly compensated
- **Usage Tracking**: Blockchain records provide complete audit trails for compliance
- **Quality Assurance**: Community-driven ratings and verification systems

## 🔧 Origin SDK Integration

DataForge leverages the Origin SDK for comprehensive blockchain functionality:

### 1. Authentication & Wallet Integration

```typescript
import { CampProvider, useAuth, useAuthState } from "@campnetwork/origin/react";

// Wrap app with Origin provider
<CampProvider clientId="your-client-id">
  <App />
</CampProvider>

// Use authentication hooks
const auth = useAuth();
const { authenticated } = useAuthState();
```

### 2. File Upload & IpNFT Minting

```typescript
// Direct file minting with licensing terms
const tokenId = await auth.origin.mintFile(
  file, // File object
  {
    name: "Dataset Name",
    description: "Dataset description",
    category: "computer-vision",
  },
  {
    price: BigInt("1000000000000000000"), // 1 ETH in wei
    duration: 86400, // 1 day in seconds
    royaltyBps: 500, // 5% royalty
    paymentToken: "0x0000000000000000000000000000000000000000", // ETH
  },
);
```

### 3. Marketplace Operations

```typescript
// Check user access to datasets
const hasAccess = await auth.origin.hasAccess(tokenId, userAddress);

// Purchase dataset access with automatic payment handling
const result = await auth.origin.buyAccessSmart(tokenId, periods);

// Download dataset content (only if user has access)
const data = await auth.origin.getData(tokenId);
```

### 4. License Management

```typescript
// Get license terms for any dataset
const terms = await auth.origin.getTerms(tokenId);

// Check subscription expiry
const expiry = await auth.origin.subscriptionExpiry(tokenId, userAddress);

// Renew existing access
const renewal = await auth.origin.renewAccess(tokenId, periods);
```

### 5. Content & Ownership Verification

```typescript
// Verify ownership and metadata
const owner = await auth.origin.ownerOf(tokenId);
const contentHash = await auth.origin.contentHash(tokenId);
const tokenURI = await auth.origin.tokenURI(tokenId);

// Update license terms (owner only)
await auth.origin.updateTerms(tokenId, newLicenseTerms);
```

### Key Origin SDK Features Used:

- **Decentralized File Storage**: Files uploaded through Origin's infrastructure
- **Smart Contract Integration**: Automated licensing and payment processing
- **Access Control**: Blockchain-verified permissions for dataset downloads
- **Royalty Distribution**: Automatic creator compensation on each sale

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB instance
- Web3 wallet (MetaMask recommended)
- Origin SDK API keys

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/a-singh09/dataforge.git
cd dataforge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Origin SDK
ORIGIN_API_KEY=your_origin_api_key
ORIGIN_MARKETPLACE_ADDRESS=your_marketplace_contract_address
ORIGIN_NETWORK=mainnet
```

### Database Setup

```bash
# Seed the database with initial data
npm run seed
```

### Development

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see DataForge in action!

## 🎯 How It Works

### For Dataset Creators

1. **Upload**: Upload your training dataset with comprehensive metadata
2. **License**: Define licensing terms (commercial use, attribution, etc.)
3. **Mint**: Dataset is minted as an NFT on the blockchain via Origin SDK
4. **List**: Dataset appears in the marketplace for discovery
5. **Earn**: Receive payments automatically through smart contracts

### For AI Developers

1. **Browse**: Explore datasets by category, quality rating, and price
2. **Preview**: Access sample data and metadata before purchase
3. **Purchase**: Buy dataset licenses using cryptocurrency
4. **Download**: Instant access to full dataset with verified licensing

## 🔐 Security & Trust

- **Blockchain Verification**: All transactions and licenses verified on-chain
- **IPFS Storage**: Decentralized storage prevents data loss or censorship
- **Smart Contract Escrow**: Secure transactions with automated dispute resolution
- **Community Moderation**: User-driven quality control and reporting system

## 📊 Market Impact

DataForge addresses critical challenges in the AI industry:

- **Data Scarcity**: Provides access to diverse, high-quality training datasets
- **Creator Rights**: Ensures fair compensation for data creators
- **Licensing Clarity**: Transparent, blockchain-verified usage rights
- **Quality Assurance**: Community-driven quality control mechanisms

## 🚀 Future Roadmap

- **Automatic Renew Mechanism**: Licenses renew automatically without manually making transactions.
- **AI Model Integration**: Direct API access for seamless model training
- **Collaborative Datasets**: Tools for community-driven dataset creation, giving each member a royalty share for his work.
- **Advanced Analytics**: ML-powered dataset recommendation engine

## 🌐 Links

- **Live Demo**: [https://dataforge.app](https://dataforge.app)
- **Documentation**: [https://docs.dataforge.app](https://docs.dataforge.app)

---

**Built with ❤️ for the Camp Network Hackathon**

_Empowering the future of AI through decentralized data markets_
