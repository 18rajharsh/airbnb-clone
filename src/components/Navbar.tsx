import React, { useState } from "react";
import {
  Search,
  Globe,
  Menu,
  User as UserIcon,
  Download,
  PlusCircle,
  Luggage,
  LogOut,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ISearchFilters } from "../types";

interface NavbarProps {
  filters: ISearchFilters;
  onOpenSearch: () => void;
  onOpenFilters: () => void;
  onOpenHostModal: () => void;
  onOpenTripsModal: () => void;
  onOpenZipModal: () => void;
  totalListingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  filters,
  onOpenSearch,
  onOpenFilters,
  onOpenHostModal,
  onOpenTripsModal,
  onOpenZipModal,
}) => {
  const { user, logout, setAuthModalOpen, setAuthModalMode, switchUser, demoUsers } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derive search summary text
  const locationText = filters.location || "Anywhere";
  const dateText = filters.checkIn && filters.checkOut
    ? `${new Date(filters.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(filters.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : "Any week";
  const guestText = filters.guests ? `${filters.guests} guest${filters.guests > 1 ? "s" : ""}` : "Add guests";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-sm shadow-rose-200">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 32 32">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533.992c1.978 3.655 4.39 8.271 6.551 12.637 2.062 4.167 3.165 7.632 3.165 10.102 0 4.238-3.085 7-7.234 7-3.053 0-5.46-1.579-7.766-4.857C13.694 33.421 11.287 35 8.234 35 4.085 35 1 32.238 1 28c0-2.47 1.103-5.935 3.165-10.102 2.161-4.366 4.573-8.982 6.551-12.637l.533-.992C12.537 1.963 13.992 1 16 1zm0 2c-1.391 0-2.399.645-3.411 2.455l-.547 1.018C10.026 10.17 7.625 14.767 5.496 19.07 3.535 23.033 2.5 26.237 2.5 28c0 3.39 2.41 5.5 5.734 5.5 2.539 0 4.597-1.467 6.643-4.576.438-.667 1.144-1.074 1.939-1.074.795 0 1.501.407 1.939 1.074 2.046 3.109 4.104 4.576 6.643 4.576 3.324 0 5.734-2.11 5.734-5.5 0-1.763-1.035-4.967-2.996-8.93-2.129-4.303-4.53-8.9-6.546-12.597l-.547-1.018C19.399 3.645 18.391 3 16 3zm0 15c2.209 0 4 1.791 4 4 0 2.209-1.791 4-4 4s-4-1.791-4-4c0-2.209 1.791-4 4-4zm0 1.5c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5 2.5-1.119 2.5-2.5-1.119-2.5-2.5-2.5z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-rose-600 hidden sm:inline">airbnb</span>
        </div>

        {/* Central Search Pill */}
        <div
          onClick={onOpenSearch}
          className="flex items-center divide-x divide-neutral-200 bg-white border border-neutral-200 hover:border-neutral-300 rounded-full px-2 py-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer text-xs font-semibold"
        >
          <button className="px-3 py-1 text-neutral-800 truncate max-w-[110px] sm:max-w-[140px] text-left">
            {locationText}
          </button>
          <button className="px-3 py-1 text-neutral-800 hidden md:inline text-left">
            {dateText}
          </button>
          <div className="flex items-center pl-3 pr-1 gap-2.5">
            <span className="text-neutral-500 font-normal hidden lg:inline">{guestText}</span>
            <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Right Action Menu */}
        <div className="flex items-center gap-2">
          {/* Export Project ZIP Button */}
          <button
            onClick={onOpenZipModal}
            title="Download full project source code as ZIP"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition"
          >
            <Download className="w-3.5 h-3.5 text-neutral-600" />
            <span className="hidden md:inline">Export ZIP</span>
          </button>

          {/* Host Property Button */}
          <button
            onClick={onOpenHostModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Airbnb your home</span>
          </button>

          {/* Filter toggle */}
          <button
            onClick={onOpenFilters}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Filters</span>
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:pl-3 sm:pr-1.5 border border-neutral-200 rounded-full hover:shadow-md transition bg-white"
            >
              <Menu className="w-4 h-4 text-neutral-600 ml-1" />
              {user ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-neutral-600 text-white flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-neutral-200 shadow-xl py-2 z-50 text-xs"
                onClick={() => setDropdownOpen(false)}
              >
                {user ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-neutral-100">
                      <p className="font-semibold text-neutral-900 text-sm">{user.name}</p>
                      <p className="text-neutral-500 text-[11px] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-rose-50 text-rose-600">
                        {user.role === "host" ? "Superhost" : "Guest"}
                      </span>
                    </div>

                    <button
                      onClick={onOpenTripsModal}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700 font-medium"
                    >
                      <Luggage className="w-4 h-4 text-neutral-500" />
                      <span>My Trips & Bookings</span>
                    </button>

                    <button
                      onClick={onOpenHostModal}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700 font-medium"
                    >
                      <PlusCircle className="w-4 h-4 text-neutral-500" />
                      <span>Host another property</span>
                    </button>

                    <div className="my-1 border-t border-neutral-100" />

                    <div className="px-4 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Switch Demo User
                    </div>
                    {demoUsers.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => switchUser(u)}
                        className={`w-full text-left px-4 py-1.5 hover:bg-neutral-50 flex items-center justify-between ${
                          user._id === u._id ? "text-rose-600 font-semibold bg-rose-50/50" : "text-neutral-700"
                        }`}
                      >
                        <span className="truncate">{u.name} ({u.role})</span>
                        {user._id === u._id && <Sparkles className="w-3 h-3 text-rose-500" />}
                      </button>
                    ))}

                    <div className="my-1 border-t border-neutral-100" />

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setAuthModalMode("login");
                        setAuthModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 font-semibold text-neutral-900 hover:bg-neutral-50"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => {
                        setAuthModalMode("register");
                        setAuthModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-neutral-600 hover:bg-neutral-50"
                    >
                      Sign up
                    </button>
                    <div className="my-1 border-t border-neutral-100" />
                    <div className="px-4 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase">
                      Quick Demo Login
                    </div>
                    {demoUsers.slice(0, 2).map((u) => (
                      <button
                        key={u._id}
                        onClick={() => switchUser(u)}
                        className="w-full text-left px-4 py-1.5 hover:bg-neutral-50 text-neutral-700 truncate"
                      >
                        Log in as {u.name} ({u.role})
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
