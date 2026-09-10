import { IListing, ISearchFilters, IUser } from "../../types";
import { db } from "../models/db";

export interface ListingResponse {
  success: boolean;
  listings?: IListing[];
  listing?: IListing;
  total?: number;
  message?: string;
}

export class ListingController {
  // Query listings with advanced filtering & date-conflict exclusion
  static getListings(filters: ISearchFilters = {}): ListingResponse {
    let results = db.getListings();

    // 1. Text search across location (City, State, Country, Address, Neighborhood, Title)
    if (filters.location && filters.location.trim()) {
      const q = filters.location.trim().toLowerCase();
      results = results.filter(item => {
        return (
          item.location.city.toLowerCase().includes(q) ||
          (item.location.state && item.location.state.toLowerCase().includes(q)) ||
          item.location.country.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      });
    }

    // 2. Category filter
    if (filters.category && filters.category !== "all") {
      results = results.filter(item => item.category.toLowerCase() === filters.category!.toLowerCase());
    }

    // 3. Guest count capacity
    if (filters.guests && filters.guests > 1) {
      results = results.filter(item => item.maxGuests >= filters.guests!);
    }

    // 4. Price range filter
    if (typeof filters.minPrice === "number") {
      results = results.filter(item => item.pricePerNight >= filters.minPrice!);
    }
    if (typeof filters.maxPrice === "number") {
      results = results.filter(item => item.pricePerNight <= filters.maxPrice!);
    }

    // 5. Bedrooms
    if (filters.bedrooms && filters.bedrooms > 0) {
      results = results.filter(item => item.bedrooms >= filters.bedrooms!);
    }

    // 6. Property types
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      results = results.filter(item => filters.propertyTypes!.includes(item.propertyType));
    }

    // 7. Amenities (must contain all selected amenities)
    if (filters.amenities && filters.amenities.length > 0) {
      results = results.filter(item =>
        filters.amenities!.every(reqAmenity =>
          item.amenities.some(a => a.toLowerCase().includes(reqAmenity.toLowerCase()))
        )
      );
    }

    // 8. Date Availability Exclusion ($nin booked listings)
    if (filters.checkIn && filters.checkOut) {
      results = results.filter(item =>
        db.checkAvailability(item._id, filters.checkIn!, filters.checkOut!)
      );
    }

    return {
      success: true,
      total: results.length,
      listings: results,
    };
  }

  // Get single listing by ID
  static getListingById(id: string): ListingResponse {
    const listing = db.findListingById(id);
    if (!listing) {
      return { success: false, message: "Listing not found." };
    }
    return { success: true, listing };
  }

  // Host: Create listing
  static createListing(payload: Partial<IListing>, currentUser: IUser): ListingResponse {
    if (!currentUser || currentUser.role !== "host") {
      return { success: false, message: "Only registered hosts can create listings." };
    }

    if (!payload.title || !payload.pricePerNight || !payload.location?.city || !payload.location?.country) {
      return { success: false, message: "Missing required listing fields (title, price, location)." };
    }

    const newListing: IListing = {
      _id: `lst_${Date.now()}`,
      title: payload.title,
      description: payload.description || "A wonderful getaway designed for comfort and peace.",
      category: payload.category || "beachfront",
      propertyType: payload.propertyType || "apartment",
      roomType: payload.roomType || "entire_place",
      location: {
        address: payload.location.address || "Main Street",
        city: payload.location.city,
        state: payload.location.state || "",
        country: payload.location.country,
        neighborhood: payload.location.neighborhood || "",
        coordinates: payload.location.coordinates || [0, 0],
      },
      pricePerNight: Number(payload.pricePerNight),
      cleaningFee: Number(payload.cleaningFee || 35),
      serviceFeePercentage: 12,
      maxGuests: Number(payload.maxGuests || 2),
      bedrooms: Number(payload.bedrooms || 1),
      beds: Number(payload.beds || 1),
      bathrooms: Number(payload.bathrooms || 1),
      amenities: payload.amenities && payload.amenities.length > 0
        ? payload.amenities
        : ["Fast Wifi", "Kitchen", "Air conditioning"],
      images: payload.images && payload.images.length > 0
        ? payload.images
        : [
            {
              url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=85",
              caption: "Property exterior",
              isCover: true,
            },
          ],
      host: currentUser,
      averageRating: 5.0,
      totalReviews: 0,
      cancellationPolicy: payload.cancellationPolicy || "Flexible",
      createdAt: new Date().toISOString(),
    };

    db.saveListing(newListing);
    return { success: true, listing: newListing, message: "Listing published successfully!" };
  }

  // Delete listing
  static deleteListing(id: string, currentUser: IUser): ListingResponse {
    const listing = db.findListingById(id);
    if (!listing) {
      return { success: false, message: "Listing not found." };
    }

    if (listing.host._id !== currentUser._id && currentUser.role !== "admin") {
      return { success: false, message: "You are not authorized to delete this property." };
    }

    db.deleteListing(id);
    return { success: true, message: "Listing removed successfully." };
  }
}
