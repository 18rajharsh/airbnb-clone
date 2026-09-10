import { IListing, IUser, IBooking, IReview } from "../../types";
import { SEED_LISTINGS, SEED_USERS, SEED_REVIEWS } from "../../data/seedListings";

const STORAGE_KEYS = {
  USERS: "airbnb_db_users",
  LISTINGS: "airbnb_db_listings",
  BOOKINGS: "airbnb_db_bookings",
  REVIEWS: "airbnb_db_reviews",
};

class MongoStore {
  private users: IUser[] = [];
  private listings: IListing[] = [];
  private bookings: IBooking[] = [];
  private reviews: IReview[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    // Load from localStorage if present in browser, else use seed
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const storedListings = localStorage.getItem(STORAGE_KEYS.LISTINGS);
        const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
        const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);

        this.users = storedUsers ? JSON.parse(storedUsers) : [...SEED_USERS];
        this.listings = storedListings ? JSON.parse(storedListings) : [...SEED_LISTINGS];
        this.bookings = storedBookings ? JSON.parse(storedBookings) : [];
        this.reviews = storedReviews ? JSON.parse(storedReviews) : [...SEED_REVIEWS];

        // Ensure we persist seeds on first run
        if (!storedListings) {
          this.persist();
        }
      } else {
        this.users = [...SEED_USERS];
        this.listings = [...SEED_LISTINGS];
        this.bookings = [];
        this.reviews = [...SEED_REVIEWS];
      }
    } catch {
      this.users = [...SEED_USERS];
      this.listings = [...SEED_LISTINGS];
      this.bookings = [];
      this.reviews = [...SEED_REVIEWS];
    }

    // Add a default sample booking to test conflict detection right away
    if (this.bookings.length === 0 && this.listings.length > 0) {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const nextWeekEnd = new Date(today);
      nextWeekEnd.setDate(today.getDate() + 10);

      const d1 = nextWeek.toISOString().split("T")[0];
      const d2 = nextWeekEnd.toISOString().split("T")[0];

      this.bookings.push({
        _id: "bk_sample_reserved",
        listingId: this.listings[0]._id,
        listing: this.listings[0],
        guestId: "usr_guest_demo",
        guest: this.users[3] || SEED_USERS[3],
        checkIn: d1,
        checkOut: d2,
        totalNights: 3,
        pricePerNight: this.listings[0].pricePerNight,
        nightlyTotal: this.listings[0].pricePerNight * 3,
        cleaningFee: this.listings[0].cleaningFee,
        serviceFee: Math.round(this.listings[0].pricePerNight * 3 * 0.12),
        totalPrice: this.listings[0].pricePerNight * 3 + this.listings[0].cleaningFee + Math.round(this.listings[0].pricePerNight * 3 * 0.12),
        guestsCount: 2,
        adultsCount: 2,
        childrenCount: 0,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });
      this.persist();
    }

    this.initialized = true;
  }

  private persist() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(this.listings));
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
      }
    } catch (e) {
      console.warn("Storage persist warning:", e);
    }
  }

  // Users
  getUsers(): IUser[] { return [...this.users]; }
  findUserById(id: string): IUser | undefined { return this.users.find(u => u._id === id); }
  findUserByEmail(email: string): IUser | undefined { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  saveUser(user: IUser): IUser {
    const idx = this.users.findIndex(u => u._id === user._id);
    if (idx >= 0) this.users[idx] = user;
    else this.users.push(user);
    this.persist();
    return user;
  }

  // Listings
  getListings(): IListing[] { return [...this.listings]; }
  findListingById(id: string): IListing | undefined { return this.listings.find(l => l._id === id); }
  saveListing(listing: IListing): IListing {
    const idx = this.listings.findIndex(l => l._id === listing._id);
    if (idx >= 0) this.listings[idx] = listing;
    else this.listings.unshift(listing);
    this.persist();
    return listing;
  }
  deleteListing(id: string): boolean {
    const prevLen = this.listings.length;
    this.listings = this.listings.filter(l => l._id !== id);
    if (this.listings.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Bookings
  getBookings(): IBooking[] { return [...this.bookings]; }
  findBookingById(id: string): IBooking | undefined { return this.bookings.find(b => b._id === id); }
  findBookingsByListing(listingId: string): IBooking[] { return this.bookings.filter(b => b.listingId === listingId && b.status !== "cancelled"); }
  findBookingsByGuest(guestId: string): IBooking[] { return this.bookings.filter(b => b.guestId === guestId); }
  saveBooking(booking: IBooking): IBooking {
    const idx = this.bookings.findIndex(b => b._id === booking._id);
    if (idx >= 0) this.bookings[idx] = booking;
    else this.bookings.unshift(booking);
    this.persist();
    return booking;
  }

  // Check date collision strictly according to Airbnb date collision logic:
  // (RequestedCheckIn < ExistingCheckOut) AND (RequestedCheckOut > ExistingCheckIn)
  checkAvailability(listingId: string, checkIn: string, checkOut: string, excludeBookingId?: string): boolean {
    const reqIn = new Date(checkIn).getTime();
    const reqOut = new Date(checkOut).getTime();

    if (isNaN(reqIn) || isNaN(reqOut) || reqIn >= reqOut) {
      return false;
    }

    const activeBookings = this.bookings.filter(
      b => b.listingId === listingId && b.status !== "cancelled" && (!excludeBookingId || b._id !== excludeBookingId)
    );

    for (const b of activeBookings) {
      const existIn = new Date(b.checkIn).getTime();
      const existOut = new Date(b.checkOut).getTime();

      // Overlap formula
      if (reqIn < existOut && reqOut > existIn) {
        return false; // Conflicting booking found
      }
    }

    return true; // Available!
  }

  // Reviews
  getReviewsByListing(listingId: string): IReview[] { return this.reviews.filter(r => r.listingId === listingId); }
  saveReview(review: IReview): IReview {
    this.reviews.unshift(review);
    // Recalculate listing rating
    const listing = this.findListingById(review.listingId);
    if (listing) {
      const allReviews = this.getReviewsByListing(review.listingId);
      const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
      listing.averageRating = Math.round((totalScore / allReviews.length) * 10) / 10;
      listing.totalReviews = allReviews.length;
      this.saveListing(listing);
    }
    this.persist();
    return review;
  }

  // Reset to seeds
  resetDatabase() {
    this.users = [...SEED_USERS];
    this.listings = [...SEED_LISTINGS];
    this.bookings = [];
    this.reviews = [...SEED_REVIEWS];
    this.persist();
  }
}

export const db = new MongoStore();
