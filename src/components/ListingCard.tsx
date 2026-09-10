import React, { useState } from "react";
import { Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { IListing } from "../types";

interface ListingCardProps {
  listing: IListing;
  onSelect: (listing: IListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = listing.images && listing.images.length > 0 ? listing.images : [{ url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800" }];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group flex flex-col cursor-pointer transition duration-200"
    >
      {/* Image Carousel Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 mb-3">
        <img
          src={images[currentImageIndex]?.url}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Favorite Heart */}
        <button
          onClick={toggleFav}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:scale-110 active:scale-90 transition z-10"
        >
          <Heart
            className={`w-5 h-5 drop-shadow-md transition ${
              isFavorite ? "fill-rose-500 text-rose-500" : "fill-black/30 text-white stroke-[2]"
            }`}
          />
        </button>

        {/* Superhost badge if applicable */}
        {listing.host?.isSuperhost && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-neutral-900 shadow-xs">
            Superhost
          </span>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Carousel Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listing Info */}
      <div className="flex justify-between items-start text-xs font-semibold text-neutral-900">
        <h3 className="truncate font-bold text-sm text-neutral-900">
          {listing.location.city}, {listing.location.country}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-3.5 h-3.5 fill-current text-neutral-900" />
          <span>{listing.averageRating.toFixed(2)}</span>
        </div>
      </div>

      <p className="text-xs text-neutral-500 truncate mt-0.5 capitalize">
        {listing.category} • {listing.propertyType}
      </p>

      <p className="text-xs text-neutral-500 mt-0.5">
        Up to {listing.maxGuests} guests • {listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}
      </p>

      <div className="mt-2 text-xs text-neutral-800">
        <span className="font-bold text-sm text-neutral-900">${listing.pricePerNight}</span>
        <span className="font-normal text-neutral-600"> night</span>
      </div>
    </div>
  );
};
