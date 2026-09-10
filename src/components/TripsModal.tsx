import React, { useState, useEffect } from "react";
import { X, Luggage, Calendar, MapPin, AlertTriangle, CheckCircle, Ban } from "lucide-react";
import { IBooking } from "../types";
import { useAuth } from "../context/AuthContext";
import { BookingController } from "../server/controllers/bookingController";

interface TripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewListing: (listingId: string) => void;
}

export const TripsModal: React.FC<TripsModalProps> = ({ isOpen, onClose, onViewListing }) => {
  const { user, setAuthModalOpen } = useAuth();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTrips = () => {
    if (!user) return;
    const res = BookingController.getMyTrips(user);
    if (res.success && res.bookings) {
      setBookings(res.bookings);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchTrips();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCancelBooking = (bookingId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to cancel this reservation? The dates will become available again.")) return;

    setCancellingId(bookingId);
    const res = BookingController.cancelBooking(bookingId, user);
    if (res.success) {
      setFeedback("Reservation successfully cancelled. Dates have been freed.");
      fetchTrips();
      setTimeout(() => setFeedback(null), 3000);
    }
    setCancellingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Luggage className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-neutral-900">My Trips & Reservations</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {feedback && (
            <div className="p-3 rounded-xl bg-neutral-900 text-white text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{feedback}</span>
            </div>
          )}

          {!user ? (
            <div className="text-center py-12 space-y-3">
              <Luggage className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-800">Please log in to view your trips</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Sign in or choose one of our demo traveler accounts to inspect your confirmed reservations.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black"
              >
                Sign In
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Luggage className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-800">No trips booked yet</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Time to dust off your bags and start planning your next vacation adventure!
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const isCancelled = booking.status === "cancelled";
              return (
                <div
                  key={booking._id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row gap-4 ${
                    isCancelled
                      ? "bg-neutral-50/70 border-neutral-200 opacity-70"
                      : "bg-white border-neutral-200 shadow-xs hover:shadow-sm"
                  }`}
                >
                  <img
                    src={booking.listing.images?.[0]?.url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"}
                    alt={booking.listing.title}
                    className="w-full sm:w-28 h-28 rounded-xl object-cover"
                  />

                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            onClose();
                            onViewListing(booking.listingId);
                          }}
                          className="text-sm font-bold text-neutral-900 hover:text-rose-600 transition cursor-pointer line-clamp-1"
                        >
                          {booking.listing.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCancelled
                              ? "bg-neutral-200 text-neutral-600"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span>
                          {booking.listing.location.city}, {booking.listing.location.country}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-800 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        <span>
                          {booking.checkIn} to {booking.checkOut} ({booking.totalNights} nights)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <span className="text-xs font-bold text-neutral-900">
                        Total Paid: ${booking.totalPrice}
                      </span>

                      {!isCancelled && (
                        <button
                          disabled={cancellingId === booking._id}
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex items-center gap-1 text-xs text-rose-600 font-semibold hover:underline"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel reservation</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
