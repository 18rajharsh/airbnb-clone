export type UserRole = "guest" | "host" | "admin";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  isSuperhost?: boolean;
  joinedDate: string;
}

export type PropertyType = "apartment" | "house" | "villa" | "cabin" | "cottage" | "treehouse" | "chalet";
export type RoomType = "entire_place" | "private_room" | "shared_room";

export interface IListingLocation {
  address: string;
  city: string;
  state?: string;
  country: string;
  neighborhood?: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IListingImage {
  url: string;
  caption?: string;
  isCover?: boolean;
}

export interface IListing {
  _id: string;
  title: string;
  description: string;
  category: string;
  propertyType: PropertyType;
  roomType: RoomType;
  location: IListingLocation;
  pricePerNight: number;
  cleaningFee: number;
  serviceFeePercentage: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  images: IListingImage[];
  host: IUser;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown?: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    checkIn: number;
    value: number;
  };
  houseRules?: string[];
  cancellationPolicy?: "Flexible" | "Moderate" | "Strict";
  createdAt: string;
}

export type BookingStatus = "confirmed" | "completed" | "cancelled";

export interface IBooking {
  _id: string;
  listingId: string;
  listing: IListing;
  guestId: string;
  guest: IUser;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  totalNights: number;
  pricePerNight: number;
  nightlyTotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  guestsCount: number;
  adultsCount: number;
  childrenCount: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  listingId: string;
  authorId: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
    location?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ISearchFilters {
  location?: string;
  category?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: PropertyType[];
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}
