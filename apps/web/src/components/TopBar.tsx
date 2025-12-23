"use client";

import React from "react";
import { ConnectKitButton } from "connectkit";
import { Bell, Search } from "lucide-react";

const TopBar = () => {
  return (
    <div className="fixed top-0 right-0 left-72 z-40 h-20 px-8 flex justify-between items-center bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      {/* Search Bar (Visual) */}
      <div className="relative group w-96 hidden md:block">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un match, une équipe..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all placeholder:text-white/30"
        />
      </div>

      <div className="flex items-center gap-4 md:gap-6 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0f172a]"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

        {/* Wallet Button */}
        <div className="connect-button-wrapper">
          <ConnectKitButton />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
