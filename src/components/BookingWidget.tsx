import React, { useState } from "react";
import { Star, ShieldCheck, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { IListing } from "../types";
import { useAuth } from "../context/AuthContext";
import { BookingController } from "../server/controllers/bookingController";

interface BookingWidgetProps {
  listing: IListing;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onBookingSuccess: () => void;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  listing,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 1,
  onBookingSuccess,
}) => {
  const { user, setAuthModalOpen } = useAuth();

  const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
  const [guestsCount, setGuestsCount] = useState<number>(initialGuests);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Existing booked ranges for reference
  const bookedRanges = BookingController.getBookedRanges(listing._id);

  // Dynamic price calculation
  const start = checkIn ? new Date(checkIn) : null;
  const end = checkOut ? new Date(checkOut) : null;
  const hasValidDates = start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;

  const totalNights = hasValidDates
    ? Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const nightlyTotal = totalNights * listing.pricePerNight;
  const cleaningFee = listing.cleaningFee;
  const serviceFee = Math.round(nightlyTotal * 0.12);
  const totalPrice = nightlyTotal + cleaningFee + serviceFee;

  const handleReserve = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!checkIn || !checkOut) {
      setErrorMsg("Please select both check-in and check-out dates.");
      return;
    }

    if (start && end && start >= end) {
      setErrorMsg("Check-out date must be after check-in date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = BookingController.createBooking(
        {
          listingId: listing._id,
          checkIn,
          checkOut,
          guestsCount,
        },
        user
      );

      if (!res.success) {
        setErrorMsg(res.message || "Unable to reserve this stay.");
      } else {
        setSuccessMsg("Reservation confirmed! Your stay has been booked without conflicts.");
        setTimeout(() => {
          onBookingSuccess();
        }, 1200);
      }
    } catch {
      setErrorMsg("An unexpected booking error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-6 sticky top-28 space-y-5">
      {/* Top Price & Rating summary */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-extrabold text-neutral-900">${listing.pricePerNight}</span>
          <span className="text-xs text-neutral-500 font-normal"> / night</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-neutral-800">
          <Star className="w-3.5 h-3.5 fill-current text-neutral-900" />
          <span>{listing.averageRating.toFixed(2)}</span>
          <span className="text-neutral-400">·</span>
          <span className="underline text-neutral-500">{listing.totalReviews} reviews</span>
        </div>
      </div>

      {/* Date & Guest Input Box */}
      <div className="border border-neutral-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-neutral-900">
        <div className="grid grid-cols-2 divide-x divide-neutral-200 border-b border-neutral-200 bg-neutral-50/50">
          <div className="p-2.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Check-in
            </label>
            <input
              type="date"
              min={todayStr}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full text-xs font-semibold bg-transparent outline-none cursor-pointer mt-0.5"
            />
          </div>
          <div className="p-2.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Check-out
            </label>
            <input
              type="date"
              min={checkIn || todayStr}
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full text-xs font-semibold bg-transparent outline-none cursor-pointer mt-0.5"
            />
          </div>
        </div>

        <div className="p-2.5 bg-white">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
            Guests
          </label>
          <select
            value={guestsCount}
            onChange={(e) => setGuestsCount(Number(e.target.value))}
            className="w-full text-xs font-semibold bg-transparent outline-none cursor-pointer mt-0.5"
          >
            {Array.from({ length: listing.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error & Collision Banner */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-800 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Reserve Button */}
      <button
        onClick={handleReserve}
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 hover:opacity-95 active:scale-[0.99] shadow-lg shadow-rose-200 transition disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? "Verifying availability..." : "Reserve"}
      </button>

      <p className="text-center text-[11px] text-neutral-500">You won't be charged yet</p>

      {/* Dynamic Pricing Calculation Breakdown */}
      {hasValidDates && (
        <div className="space-y-2.5 pt-4 border-t border-neutral-100 text-xs">
          <div className="flex justify-between text-neutral-700">
            <span className="underline">
              ${listing.pricePerNight} × {totalNights} night{totalNights > 1 ? "s" : ""}
            </span>
            <span>${nightlyTotal}</span>
          </div>

          <div className="flex justify-between text-neutral-700">
            <span className="underline">Cleaning fee</span>
            <span>${cleaningFee}</span>
          </div>

          <div className="flex justify-between text-neutral-700">
            <span className="underline">Airbnb service fee (12%)</span>
            <span>${serviceFee}</span>
          </div>

          <div className="my-2 border-t border-neutral-200" />

          <div className="flex justify-between font-bold text-sm text-neutral-900 pt-1">
            <span>Total before taxes</span>
            <span>${totalPrice}</span>
          </div>
        </div>
      )}

      {/* Active booked intervals reference if any */}
      {bookedRanges.length > 0 && (
        <div className="pt-3 border-t border-neutral-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1 mb-1.5">
            <Calendar className="w-3 h-3 text-neutral-400" />
            <span>Currently reserved dates:</span>
          </p>
          <div className="space-y-1">
            {bookedRanges.map((r, i) => (
              <div key={i} className="text-[11px] text-neutral-500 font-mono bg-neutral-50 px-2 py-0.5 rounded">
                {r.start} to {r.end}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-neutral-500">
        <ShieldCheck className="w-4 h-4 text-rose-500" />
        <span>Conflict-free guarantee with compound index protection</span>
      </div>
    </div>
  );
};
