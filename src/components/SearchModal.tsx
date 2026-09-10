import React, { useState } from "react";
import { X, Search, MapPin, Calendar, Users, Minus, Plus } from "lucide-react";
import { ISearchFilters } from "../types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ISearchFilters;
  onApplyFilters: (newFilters: ISearchFilters) => void;
}

const POPULAR_DESTINATIONS = [
  "Malibu, United States",
  "Aspen, United States",
  "Positano, Italy",
  "Kyoto, Japan",
  "Santorini, Greece",
  "Tulum, Mexico",
  "Zermatt, Switzerland",
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [location, setLocation] = useState(filters.location || "");
  const [checkIn, setCheckIn] = useState(filters.checkIn || "");
  const [checkOut, setCheckOut] = useState(filters.checkOut || "");
  const [adults, setAdults] = useState(filters.guests ? Math.max(1, filters.guests) : 1);
  const [children, setChildren] = useState(0);

  if (!isOpen) return null;

  const handleSearch = () => {
    onApplyFilters({
      ...filters,
      location: location.trim(),
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: adults + children,
    });
    onClose();
  };

  const handleClear = () => {
    setLocation("");
    setCheckIn("");
    setCheckOut("");
    setAdults(1);
    setChildren(0);
    onApplyFilters({
      ...filters,
      location: undefined,
      checkIn: undefined,
      checkOut: undefined,
      guests: undefined,
    });
    onClose();
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-neutral-900">Find your vacation stay</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Where */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Where to?</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search destinations (e.g. Malibu, Italy, Kyoto, Aspen)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm font-medium outline-none transition"
              />
              {location && (
                <button
                  onClick={() => setLocation("")}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick destination tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setLocation(dest.split(",")[0])}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Check-in date</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm font-medium outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Check-out date</span>
              </label>
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm font-medium outline-none"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
              <Users className="w-3.5 h-3.5 text-rose-500" />
              <span>Who is coming?</span>
            </div>

            <div className="space-y-3">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Adults</p>
                  <p className="text-xs text-neutral-500">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => setAdults((a) => Math.max(1, a - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-neutral-800">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults((a) => a + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Children</p>
                  <p className="text-xs text-neutral-500">Ages 2–12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => setChildren((c) => Math.max(0, c - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-neutral-800">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren((c) => c + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold underline text-neutral-700 hover:text-neutral-900"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-200 hover:opacity-95 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search properties</span>
          </button>
        </div>
      </div>
    </div>
  );
};
