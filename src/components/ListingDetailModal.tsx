import React from "react";
import {
  X,
  Star,
  MapPin,
  Wifi,
  Tv,
  Car,
  Utensils,
  Wind,
  ShieldCheck,
  CheckCircle,
  Home,
  BedDouble,
  Bath,
  Users,
} from "lucide-react";
import { IListing } from "../types";
import { BookingWidget } from "./BookingWidget";
import { ReviewsList } from "./ReviewsList";

interface ListingDetailModalProps {
  listing: IListing | null;
  onClose: () => void;
  onBookingSuccess: () => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onBookingSuccess,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}) => {
  if (!listing) return null;

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const mainImage = images[0]?.url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200";
  const extraImages = images.slice(1, 5);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden relative my-auto">
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {listing.category}
            </span>
            <h2 className="text-sm font-bold text-neutral-900 truncate">{listing.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 space-y-8">
          {/* Title and location */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-700 mt-2 font-medium">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-neutral-900" />
                <span className="font-bold text-neutral-900">{listing.averageRating.toFixed(2)}</span>
                <span className="text-neutral-500">({listing.totalReviews} reviews)</span>
              </div>
              <span className="text-neutral-400">·</span>
              <div className="flex items-center gap-1 text-neutral-800">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>
                  {listing.location.address}, {listing.location.city}, {listing.location.country}
                </span>
              </div>
            </div>
          </div>

          {/* Photo Mosaic Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[300px] sm:h-[420px]">
            <div className="md:col-span-2 h-full relative overflow-hidden group">
              <img
                src={mainImage}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
              {extraImages.map((img, i) => (
                <div key={i} className="relative h-full overflow-hidden group">
                  <img
                    src={img.url}
                    alt={img.caption || `Photo ${i + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
              {/* Fill placeholders if fewer than 4 extra images */}
              {extraImages.length < 4 &&
                Array.from({ length: 4 - extraImages.length }).map((_, i) => (
                  <div key={i} className="relative h-full overflow-hidden bg-neutral-100">
                    <img
                      src={mainImage}
                      alt="Gallery photo"
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Main Content Grid: Left Details / Right Sticky Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left 2 Cols: Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property summary */}
              <div className="pb-6 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1)} hosted by{" "}
                    {listing.host.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {listing.maxGuests} guests
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Home className="w-3.5 h-3.5" /> {listing.bedrooms} bedroom{listing.bedrooms > 1 ? "s" : ""}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5" /> {listing.beds} bed{listing.beds > 1 ? "s" : ""}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5" /> {listing.bathrooms} bath{listing.bathrooms > 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
                <img
                  src={listing.host.avatar}
                  alt={listing.host.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-neutral-100 shadow-sm"
                />
              </div>

              {/* Host Highlights */}
              <div className="space-y-4 pb-6 border-b border-neutral-200">
                {listing.host.isSuperhost && (
                  <div className="flex items-start gap-3.5">
                    <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">
                        {listing.host.name} is a Superhost
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Great Check-in Experience</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      100% of recent guests gave the check-in process a 5-star rating.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pb-6 border-b border-neutral-200 space-y-3">
                <h3 className="text-base font-bold text-neutral-900">About this space</h3>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="pb-6 border-b border-neutral-200 space-y-4">
                <h3 className="text-base font-bold text-neutral-900">What this place offers</h3>
                <div className="grid grid-cols-2 gap-3">
                  {listing.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-neutral-800">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                        {amenity.toLowerCase().includes("wifi") ? (
                          <Wifi className="w-3.5 h-3.5" />
                        ) : amenity.toLowerCase().includes("kitchen") ? (
                          <Utensils className="w-3.5 h-3.5" />
                        ) : amenity.toLowerCase().includes("air") ? (
                          <Wind className="w-3.5 h-3.5" />
                        ) : amenity.toLowerCase().includes("parking") ? (
                          <Car className="w-3.5 h-3.5" />
                        ) : (
                          <Tv className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Rules & Policies */}
              <div className="space-y-3 pb-6">
                <h3 className="text-base font-bold text-neutral-900">Things to know</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-700">
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-1">House Rules</h4>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600">
                      <li>Check-in: After 3:00 PM</li>
                      <li>Checkout: 11:00 AM</li>
                      <li>No smoking or unregistered parties</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-1">Cancellation Policy</h4>
                    <p className="text-neutral-600">
                      {listing.cancellationPolicy || "Flexible"} cancellation policy. Free cancellation before check-in date.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <ReviewsList listing={listing} onReviewAdded={() => {}} />
            </div>

            {/* Right Col: Interactive Booking Card */}
            <div className="lg:col-span-1">
              <BookingWidget
                listing={listing}
                initialCheckIn={initialCheckIn}
                initialCheckOut={initialCheckOut}
                initialGuests={initialGuests}
                onBookingSuccess={onBookingSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
