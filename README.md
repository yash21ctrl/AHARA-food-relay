# AHARA (FoodRelay) 🍲🌱🐾

> **Real-time Hyperlocal Surplus Food Redistribution & Zero-Waste Platform**  
> Connecting commercial food donors (weddings, caterers, hotels, corporate cafeterias) with verified recipient organizations (orphanages, night shelters, hunger relief NGOs), with a zero-waste fallback to local cattle shelters and animal rescue centers.

---

## 🌟 Key Highlights

- **👥 Multi-Portal Experience with Session Isolation**:
  - **Donor Portal (`/#/donor`)**: Fast 60-second surplus food creation, live remaining shelf-life tracker, delivery fare quote proposer, and animal feed emergency dispatch.
  - **Recipient Portal (`/#/receiver`)**: Hyperlocal marketplace filtered by Bangalore localities, batch quantity requests, delivery coordination, and delivery receipt confirmation.
  - **Isolated Sessions**: Supports multi-tab usage (`sessionStorage` for active identity, `localStorage` for real-time state synchronization).
- **⏱️ FSSAI-Compliant Food Safety Safe-Until Limits**:
  - Food listings feature strict `safeUntil` deadlines calculated from preparation and storage parameters.
  - Automated continuous countdowns prevent expired human food consumption.
- **🛵 Dynamic Fare Negotiation & Live Delivery Quoting**:
  - Automatic Haversine distance-based delivery cost baseline.
  - Proposers can enter live fare quotes from on-demand delivery apps (Porter, Dunzo, Rapido, Uber Auto).
  - Real-time share splits: `SPLIT` (50/50), `DONOR_PAYS`, `RECEIVER_PAYS`, `SELF_PICKUP`, or `DONOR_DROP`.
- **🐾 Zero-Waste Animal Shelter & Gaushala Fallback**:
  - When food enters the final 30 minutes of its safe window, donors receive an emergency warning.
  - Donors can route unclaimed surplus food directly to Bangalore's nearest cattle shelters and animal rescue centers via **Self-Drop** or **Goodwill Courier** (donor covers delivery fare).
  - Celebrates every successful animal feed dispatch with inspiring quotes on kindness to animals.
- **📊 Real-time Community & Environmental Impact Dashboard**:
  - Live tracking of total plates saved (human + animal feed), verified orders completed, kilograms of food diverted from landfills, and CO₂e emissions prevented.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React icons
- **State Management**: Zustand with persistent storage and cross-tab synchronization
- **Testing**: Node.js ESM Test Runner with `node:assert`
- **Geolocation**: Haversine distance calculations across major Bangalore urban zones

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yash21ctrl/AHARA-food-relay.git
cd AHARA-food-relay

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🧪 Testing & Quality Assurance

Run the comprehensive automated test suite verifying distance calculations, fair-share splits, custom fare validation, 30-minute expiry detection, and Gaushala dispatch:

```bash
npm test
```

### Production Build

```bash
npm run build
```

---

## 📄 License

MIT License. Built for zero food wastage and social impact.
