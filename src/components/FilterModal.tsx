import React, { useState } from "react";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { ISearchFilters, PropertyType } from "../types";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ISearchFilters;
  onApplyFilters: (newFilters: ISearchFilters) => void;
}

const PROPERTY_TYPES: { id: PropertyType; label: string }[] = [
  { id: "house", label: "House" },
  { id: "apartment", label: "Apartment" },
  { id: "villa", label: "Villa" },
  { id: "cabin", label: "Cabin" },
  { id: "cottage", label: "Cottage" },
  { id: "treehouse", label: "Treehouse" },
  { id: "chalet", label: "Chalet" },
];

const AMENITY_OPTIONS = [
  "Wifi",
  "Infinity pool",
  "Cedar hot tub",
  "Chef's kitchen",
  "Private beach access",
  "Air conditioning",
  "Fireplace",
  "EV charger",
  "Sauna",
  "Zen courtyard",
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [minPrice, setMinPrice] = useState<number | "">(filters.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState<number | "">(filters.maxPrice ?? "");
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(filters.propertyTypes || []);
  const [bedrooms, setBedrooms] = useState<number>(filters.bedrooms || 0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(filters.amenities || []);

  if (!isOpen) return null;

  const togglePropertyType = (type: PropertyType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      minPrice: minPrice !== "" ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
      propertyTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      bedrooms: bedrooms > 0 ? bedrooms : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedTypes([]);
    setBedrooms(0);
    setSelectedAmenities([]);
    onApplyFilters({
      ...filters,
      minPrice: undefined,
      maxPrice: undefined,
      propertyTypes: undefined,
      bedrooms: undefined,
      amenities: undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-neutral-800" />
            <h2 className="text-base font-bold text-neutral-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900">Price range per night</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase">Minimum ($)</label>
                <input
                  type="number"
                  placeholder="$100"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm font-semibold outline-none focus:border-neutral-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase">Maximum ($)</label>
                <input
                  type="number"
                  placeholder="$1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm font-semibold outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Property Types */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Property type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((pt) => {
                const active = selectedTypes.includes(pt.id);
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => togglePropertyType(pt.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      active
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Minimum bedrooms</h3>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setBedrooms(num)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    bedrooms === num
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {num === 0 ? "Any" : `${num}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Amenities</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {AMENITY_OPTIONS.map((am) => {
                const checked = selectedAmenities.includes(am);
                return (
                  <button
                    key={am}
                    type="button"
                    onClick={() => toggleAmenity(am)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs text-left border transition ${
                      checked
                        ? "border-neutral-900 bg-neutral-50 font-semibold text-neutral-900"
                        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50/50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        checked ? "bg-neutral-900 border-neutral-900 text-white" : "border-neutral-300"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{am}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold underline text-neutral-700 hover:text-neutral-900"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-black transition"
          >
            Show listings
          </button>
        </div>
      </div>
    </div>
  );
};
