# Full-Stack Airbnb Clone

A production-ready, full-stack vacation rental web application replicating Airbnb's core user experience, search filtering, and reservation workflow. Built with **TypeScript**, **React**, **Node.js**, **Express**, and **MongoDB / Mongoose** utilizing strict **MVC (Model-View-Controller)** architecture.

---

## Key Features

- **Multi-Criteria Search & Filtering**: Query properties by destination (city, state, country), date availability, guest counts (adults, children), price ranges, property types (villas, cabins, apartments, chalets), and amenities.
- **Atomic Collision-Free Booking Engine**: Real-time reservation verification that enforces date overlap checks via compound indexes, preventing double-bookings.
- **Dynamic Pricing Engine**: Automated recalculation of base nightly totals, cleaning fees, and service fees based on selected check-in/check-out dates.
- **Interactive Property Showcase**: High-resolution photo mosaics, sleeping arrangements breakdown, host badges, amenity matrices, and verified guest reviews.
- **Host Portal ("Airbnb your home")**: Multi-step listing creator allowing hosts to set location coordinates, room counts, pricing rules, photography, and amenities.
- **Trips & Reservation Management**: Dedicated traveler dashboard to monitor confirmed stays with one-click reservation cancellation and instant date availability restoration.
- **Responsive Design**: Mobile-first interface styled with Tailwind CSS, supporting seamless interactions across desktop, tablet, and mobile viewports.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **State Management** | React Context API (Authentication, Active Filters, Modals) |
| **Backend** | Node.js, Express.js, TypeScript |
| **Architecture** | Model-View-Controller (MVC), RESTful APIs |
| **Database / ODM** | MongoDB, Mongoose |
| **Tooling & Build** | Vite, ESBuild, PostCSS, Autoprefixer |

---

## Architecture & Design Patterns

The codebase follows the strict **Model-View-Controller (MVC)** architectural pattern to ensure clean separation of concerns and maintainability:

```
├── client/                     # View Layer (React + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI components & modals
│   │   │   ├── Navbar.tsx
│   │   │   ├── CategoryBar.tsx
│   │   │   ├── ListingCard.tsx
│   │   │   ├── ListingDetailModal.tsx
│   │   │   ├── BookingWidget.tsx
│   │   │   ├── SearchModal.tsx
│   │   │   ├── FilterModal.tsx
│   │   │   ├── HostListingModal.tsx
│   │   │   ├── TripsModal.tsx
│   │   │   └── ReviewsList.tsx
│   │   ├── context/            # Global state (AuthContext)
│   │   ├── types/              # Shared domain TypeScript definitions
│   │   ├── App.tsx             # Root application orchestrator
│   │   └── main.tsx            # Client entry point
│   └── vite.config.ts
│
├── server/                     # Model & Controller Layers (Express + Mongoose)
│   ├── src/
│   │   ├── models/             # Mongoose schemas, indexes & validation
│   │   │   ├── User.ts
│   │   │   ├── Listing.ts
│   │   │   ├── Booking.ts      # Collision detection logic & statics
│   │   │   └── Review.ts
│   │   ├── controllers/        # Business logic & request handling
│   │   │   ├── authController.ts
│   │   │   ├── listingController.ts
│   │   │   ├── bookingController.ts
│   │   │   └── reviewController.ts
│   │   ├── routes/             # REST endpoint route declarations
│   │   └── server.ts           # Server entry point
│   └── tsconfig.json
│
└── package.json                # Workspace orchestration
```

---

## Collision Detection Engine

To prevent concurrent or conflicting bookings for the same property, the reservation system evaluates date intervals atomically:

$$\text{RequestedCheckIn} < \text{ExistingCheckOut} \quad \land \quad \text{RequestedCheckOut} > \text{ExistingCheckIn}$$

### Mongoose Schema & Compound Indexing

```typescript
// Compound index ensures index-only collision lookups
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1, status: 1 });

bookingSchema.statics.checkAvailability = async function (listingId, checkIn, checkOut) {
  const conflict = await this.findOne({
    listing: listingId,
    status: { $in: ["confirmed", "pending"] },
    $and: [
      { checkIn: { $lt: checkOut } },
      { checkOut: { $gt: checkIn } }
    ],
  });
  return !conflict;
};
```

---

## RESTful API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user and issue session token |
| `GET` | `/api/auth/me` | Retrieve current authenticated user profile |

### Listings
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/listings` | Query listings with multi-criteria filters & date exclusions |
| `GET` | `/api/listings/:id` | Fetch detailed listing information including host details |
| `POST` | `/api/listings` | Create a new property listing (Requires Host role) |
| `DELETE` | `/api/listings/:id` | Remove a property listing |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/bookings` | Create a reservation with collision avoidance check |
| `GET` | `/api/bookings/my-trips` | Retrieve all reservations for the active user |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel an existing reservation and release dates |
| `GET` | `/api/bookings/listing/:id/reserved` | Fetch booked intervals for calendar availability |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reviews/listing/:id` | Fetch all verified guest reviews for a listing |
| `POST` | `/api/reviews` | Submit a review and recalculate property rating |

---

## Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/airbnb-clone.git
   cd airbnb-clone
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/airbnb-clone
   JWT_SECRET=your_jwt_secret_key_here
   CLIENT_URL=http://localhost:3000
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

---

## Scripts

- `npm run dev` — Starts the development server with live reload.
- `npm run build` — Compiles TypeScript and creates optimized production assets in `dist/`.
- `npm run lint` — Validates TypeScript types across the entire codebase (`tsc --noEmit`).

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
