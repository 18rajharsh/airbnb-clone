import React, { useState } from "react";
import { X, PlusCircle, Check, Image as ImageIcon } from "lucide-react";
import { IListing, PropertyType } from "../types";
import { useAuth } from "../context/AuthContext";
import { ListingController } from "../server/controllers/listingController";

interface HostListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (newListing: IListing) => void;
}

const PRESET_IMAGES = [
  { label: "Modern Cliffside Villa", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200" },
  { label: "Nordic Alpine Cabin", url: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200" },
  { label: "Mediterranean Terrace", url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200" },
  { label: "Kyoto Heritage Garden", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200" },
  { label: "Tulum Jungle Treehouse", url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200" },
];

const AMENITY_OPTIONS = [
  "Fast Wifi (450 Mbps)",
  "Infinity pool",
  "Cedar hot tub",
  "Chef's kitchen",
  "Private beach access",
  "Air conditioning",
  "Wood-burning fireplace",
  "EV charger",
  "Free parking on premises",
  "Dedicated workspace",
];

export const HostListingModal: React.FC<HostListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const { user, switchUser, demoUsers, setAuthModalOpen } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("beachfront");
  const [propertyType, setPropertyType] = useState<PropertyType>("villa");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [pricePerNight, setPricePerNight] = useState<number | "">(350);
  const [cleaningFee, setCleaningFee] = useState<number | "">(65);
  const [maxGuests, setMaxGuests] = useState<number>(4);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [beds, setBeds] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Fast Wifi (450 Mbps)",
    "Air conditioning",
    "Chef's kitchen",
  ]);
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleAmenity = (am: string) => {
    if (selectedAmenities.includes(am)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== am));
    } else {
      setSelectedAmenities([...selectedAmenities, am]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Auto-promote to host if current user is a guest
    let activeHost = user;
    if (user.role !== "host") {
      activeHost = { ...user, role: "host", isSuperhost: true };
      switchUser(activeHost);
    }

    if (!title.trim() || !city.trim() || !country.trim() || !pricePerNight) {
      setErrorMsg("Please fill in the title, city, country, and price per night.");
      return;
    }

    setSubmitting(true);

    try {
      const res = ListingController.createListing(
        {
          title: title.trim(),
          description: description.trim() || "An exclusive luxury retreat with thoughtful design.",
          category,
          propertyType,
          roomType: "entire_place",
          location: {
            address: address.trim() || "Scenic View Road",
            city: city.trim(),
            country: country.trim(),
            coordinates: [0, 0],
          },
          pricePerNight: Number(pricePerNight),
          cleaningFee: Number(cleaningFee || 40),
          maxGuests,
          bedrooms,
          beds,
          bathrooms,
          amenities: selectedAmenities,
          images: [
            {
              url: imageUrl,
              caption: "Property exterior view",
              isCover: true,
            },
          ],
        },
        activeHost
      );

      if (res.success && res.listing) {
        onListingCreated(res.listing);
        onClose();
      } else {
        setErrorMsg(res.message || "Failed to publish listing.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while publishing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-neutral-900">Airbnb your home — Create Listing</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 text-sm">1. Property Overview</h3>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Catchy Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Modern Glass Villa with Sunset Ocean View"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Describe your space, unique features, and neighborhood vibe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:border-neutral-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold bg-white outline-none"
                >
                  <option value="beachfront">Beachfront</option>
                  <option value="cabins">Cabins</option>
                  <option value="trending">Trending</option>
                  <option value="luxe">Luxe</option>
                  <option value="countryside">Countryside</option>
                  <option value="iconic">Iconic Cities</option>
                  <option value="mansions">Mansions</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold bg-white outline-none"
                >
                  <option value="villa">Villa</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="cabin">Cabin</option>
                  <option value="chalet">Chalet</option>
                  <option value="treehouse">Treehouse</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="font-bold text-neutral-900 text-sm">2. Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block font-semibold text-neutral-700 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Ocean View"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malibu"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Country</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="font-bold text-neutral-900 text-sm">3. Pricing & Capacity</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Price / night ($)</label>
                <input
                  type="number"
                  required
                  min={20}
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-bold outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Cleaning Fee ($)</label>
                <input
                  type="number"
                  min={0}
                  value={cleaningFee}
                  onChange={(e) => setCleaningFee(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Max Guests</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photography */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-rose-500" />
              <span>4. Photography</span>
            </h3>

            <p className="text-[11px] text-neutral-500">
              Select one of our curated high-resolution photography styles or paste a custom image URL:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setImageUrl(preset.url)}
                  className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                    imageUrl === preset.url ? "border-rose-600 ring-2 ring-rose-200" : "border-neutral-200 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    {preset.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2">
              <label className="block font-semibold text-neutral-700 mb-1">Custom Photo URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2 rounded-xl border border-neutral-200 text-xs outline-none"
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="font-bold text-neutral-900 text-sm">5. Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {AMENITY_OPTIONS.map((am) => {
                const checked = selectedAmenities.includes(am);
                return (
                  <button
                    key={am}
                    type="button"
                    onClick={() => toggleAmenity(am)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border transition ${
                      checked ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-200"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${checked ? "bg-white text-neutral-900" : "border-neutral-300"}`}>
                      {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate text-xs">{am}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-[11px] text-neutral-500">
              Publishing as <span className="font-semibold text-neutral-800">{user?.name}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-xl text-xs hover:opacity-95 shadow-md shadow-rose-200 transition"
              >
                {submitting ? "Publishing..." : "Publish Listing"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
