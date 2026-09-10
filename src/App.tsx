import React, { useState, useMemo } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { CategoryBar } from "./components/CategoryBar";
import { ListingCard } from "./components/ListingCard";
import { ListingDetailModal } from "./components/ListingDetailModal";
import { SearchModal } from "./components/SearchModal";
import { FilterModal } from "./components/FilterModal";
import { HostListingModal } from "./components/HostListingModal";
import { TripsModal } from "./components/TripsModal";
import { AuthModal } from "./components/AuthModal";
import { ZipExportModal } from "./components/ZipExportModal";
import { IListing, ISearchFilters } from "./types";
import { ListingController } from "./server/controllers/listingController";
import { Search, X, SlidersHorizontal, Download, Globe, Sparkles, AlertCircle } from "lucide-react";

function AirbnbApp() {
  const [filters, setFilters] = useState<ISearchFilters>({
    category: "all",
  });

  const [selectedListing, setSelectedListing] = useState<IListing | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [tripsModalOpen, setTripsModalOpen] = useState(false);
  const [zipModalOpen, setZipModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Query listings dynamically via ListingController
  const listingsResponse = useMemo(() => {
    return ListingController.getListings(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, refreshTrigger]);

  const listings = listingsResponse.listings || [];

  const handleSelectCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: category === "all" ? undefined : category,
    }));
  };

  const handleApplyFilters = (newFilters: ISearchFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({ category: "all" });
  };

  const handleListingCreated = (newListing: IListing) => {
    setRefreshTrigger((prev) => prev + 1);
    setSelectedListing(newListing);
  };

  // Count active non-default filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.checkIn && filters.checkOut) count++;
    if (filters.guests && filters.guests > 1) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.propertyTypes && filters.propertyTypes.length > 0) count++;
    if (filters.amenities && filters.amenities.length > 0) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        filters={filters}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenFilters={() => setFilterModalOpen(true)}
        onOpenHostModal={() => setHostModalOpen(true)}
        onOpenTripsModal={() => setTripsModalOpen(true)}
        onOpenZipModal={() => setZipModalOpen(true)}
        totalListingsCount={listings.length}
      />

      {/* Category Icon Bar */}
      <CategoryBar
        selectedCategory={filters.category || "all"}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Listing View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Active Filters Summary Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-neutral-700 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                Active criteria:
              </span>

              {filters.location && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-neutral-200 font-medium text-neutral-800">
                  Location: {filters.location}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, location: undefined }))}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.checkIn && filters.checkOut && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-neutral-200 font-medium text-neutral-800">
                  Dates: {filters.checkIn} to {filters.checkOut}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, checkIn: undefined, checkOut: undefined }))}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.guests && filters.guests > 1 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-neutral-200 font-medium text-neutral-800">
                  Guests: {filters.guests}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, guests: undefined }))}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-neutral-200 font-medium text-neutral-800">
                  Price: ${filters.minPrice || 0} - ${filters.maxPrice || "Any"}
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-neutral-500 hover:text-neutral-900 font-semibold underline text-xs"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Listings Count Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {listings.length} vacation {listings.length === 1 ? "home" : "homes"} available
          </p>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Real-time availability & collision protection enabled</span>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {listings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onSelect={(item) => setSelectedListing(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">No properties match your exact filters</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Try adjusting your search criteria, widening your dates, or clearing specific amenities to see more homes.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 text-neutral-600 text-xs py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2.5">
              <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">Support</h4>
              <p className="hover:underline cursor-pointer">Help Center</p>
              <p className="hover:underline cursor-pointer">AirCover</p>
              <p className="hover:underline cursor-pointer">Anti-discrimination</p>
              <p className="hover:underline cursor-pointer">Disability support</p>
              <p className="hover:underline cursor-pointer">Cancellation options</p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">Hosting</h4>
              <p
                onClick={() => setHostModalOpen(true)}
                className="hover:underline cursor-pointer font-semibold text-rose-600"
              >
                Airbnb your home
              </p>
              <p className="hover:underline cursor-pointer">AirCover for Hosts</p>
              <p className="hover:underline cursor-pointer">Hosting resources</p>
              <p className="hover:underline cursor-pointer">Community forum</p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">Airbnb</h4>
              <p className="hover:underline cursor-pointer">Newsroom</p>
              <p className="hover:underline cursor-pointer">New features</p>
              <p className="hover:underline cursor-pointer">Careers</p>
              <p className="hover:underline cursor-pointer">Investors</p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">Source Code</h4>
              <p
                onClick={() => setZipModalOpen(true)}
                className="hover:underline cursor-pointer font-semibold text-neutral-900 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-rose-500" />
                <span>Export Full Project (ZIP)</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                MongoDB · Express · React · Node · TypeScript · Tailwind · MVC
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex items-center gap-4">
              <span>© 2026 Airbnb Clone, Inc. All rights reserved.</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Privacy</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Terms</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Sitemap</span>
            </div>

            <div className="flex items-center gap-4 font-semibold text-neutral-800">
              <span className="flex items-center gap-1 cursor-pointer hover:underline">
                <Globe className="w-3.5 h-3.5" /> English (US)
              </span>
              <span className="cursor-pointer hover:underline">$ USD</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        initialCheckIn={filters.checkIn}
        initialCheckOut={filters.checkOut}
        initialGuests={filters.guests}
        onBookingSuccess={() => {
          setRefreshTrigger((p) => p + 1);
          setTripsModalOpen(true);
        }}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      <HostListingModal
        isOpen={hostModalOpen}
        onClose={() => setHostModalOpen(false)}
        onListingCreated={handleListingCreated}
      />

      <TripsModal
        isOpen={tripsModalOpen}
        onClose={() => setTripsModalOpen(false)}
        onViewListing={(listingId) => {
          const l = listings.find((item) => item._id === listingId);
          if (l) setSelectedListing(l);
        }}
      />

      <AuthModal />

      <ZipExportModal
        isOpen={zipModalOpen}
        onClose={() => setZipModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AirbnbApp />
    </AuthProvider>
  );
}
