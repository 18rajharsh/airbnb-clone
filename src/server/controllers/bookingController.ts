import { IBooking, IUser } from "../../types";
import { db } from "../models/db";

export interface BookingResponse {
  success: boolean;
  booking?: IBooking;
  bookings?: IBooking[];
  message?: string;
  collision?: boolean;
}

export class BookingController {
  // Create reservation with strict conflict avoidance
  static createBooking(
    data: {
      listingId: string;
      checkIn: string;
      checkOut: string;
      guestsCount: number;
      adultsCount?: number;
      childrenCount?: number;
      specialRequests?: string;
    },
    currentUser: IUser
  ): BookingResponse {
    if (!currentUser) {
      return { success: false, message: "Please log in to reserve a property." };
    }

    const { listingId, checkIn, checkOut, guestsCount } = data;

    if (!listingId || !checkIn || !checkOut) {
      return { success: false, message: "Please select both check-in and check-out dates." };
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, message: "Invalid date format." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return { success: false, message: "Check-in date cannot be in the past." };
    }

    if (start >= end) {
      return { success: false, message: "Check-out date must be after check-in date." };
    }

    const listing = db.findListingById(listingId);
    if (!listing) {
      return { success: false, message: "Listing does not exist." };
    }

    // Guard: Prevent Host from reserving their own home
    if (listing.host._id === currentUser._id) {
      return { success: false, message: "You cannot book your own property listing." };
    }

    // Guard: Verify guest capacity
    if (guestsCount > listing.maxGuests) {
      return {
        success: false,
        message: `Capacity exceeded. Maximum allowed guests is ${listing.maxGuests}.`,
      };
    }

    // ATOMIC COLLISION CHECK:
    // (RequestedCheckIn < ExistingCheckOut) AND (RequestedCheckOut > ExistingCheckIn)
    const isAvailable = db.checkAvailability(listingId, checkIn, checkOut);
    if (!isAvailable) {
      return {
        success: false,
        collision: true,
        message: "These dates are no longer available. Another guest has already reserved this property for the selected window.",
      };
    }

    // Calculate nights & pricing
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const nightlyTotal = totalNights * listing.pricePerNight;
    const cleaningFee = listing.cleaningFee;
    const serviceFee = Math.round(nightlyTotal * 0.12);
    const totalPrice = nightlyTotal + cleaningFee + serviceFee;

    const newBooking: IBooking = {
      _id: `bk_${Date.now()}`,
      listingId,
      listing,
      guestId: currentUser._id,
      guest: currentUser,
      checkIn,
      checkOut,
      totalNights,
      pricePerNight: listing.pricePerNight,
      nightlyTotal,
      cleaningFee,
      serviceFee,
      totalPrice,
      guestsCount: guestsCount || 1,
      adultsCount: data.adultsCount || guestsCount || 1,
      childrenCount: data.childrenCount || 0,
      status: "confirmed",
      specialRequests: data.specialRequests,
      createdAt: new Date().toISOString(),
    };

    db.saveBooking(newBooking);

    return {
      success: true,
      booking: newBooking,
      message: "Reservation confirmed successfully! Pack your bags!",
    };
  }

  // Get user's booked trips
  static getMyTrips(currentUser: IUser): BookingResponse {
    if (!currentUser) {
      return { success: false, message: "Not authenticated." };
    }

    const bookings = db.findBookingsByGuest(currentUser._id);
    // Sort recent first
    bookings.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

    return {
      success: true,
      bookings,
    };
  }

  // Cancel reservation
  static cancelBooking(bookingId: string, currentUser: IUser): BookingResponse {
    const booking = db.findBookingById(bookingId);
    if (!booking) {
      return { success: false, message: "Booking record not found." };
    }

    if (booking.guestId !== currentUser._id && currentUser.role !== "admin") {
      return { success: false, message: "You are not authorized to cancel this booking." };
    }

    booking.status = "cancelled";
    db.saveBooking(booking);

    return {
      success: true,
      booking,
      message: "Booking was cancelled successfully.",
    };
  }

  // Get booked date intervals for a listing (used by client calendar to visually disable blocked dates)
  static getBookedRanges(listingId: string): { start: string; end: string }[] {
    const bookings = db.findBookingsByListing(listingId);
    return bookings.map(b => ({ start: b.checkIn, end: b.checkOut }));
  }
}
