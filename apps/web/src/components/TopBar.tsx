"use client";

import React from "react";
import { ConnectKitButton } from "connectkit";
import { Bell, Search } from "lucide-react";

const TopBar = () => {
  return (
    <div className="fixed top-0 right-0 left-80 z-40 h-24 px-10 flex justify-between items-center bg-[#0f172a]/90 backdrop-blur-3xl border-b border-white/[0.03] transition-all duration-300">
      {/* Search Bar (Visual) */}
      <div className="relative group w-[500px] hidden lg:block">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-green-500 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="RECHERCHER UN ÉVÉNEMENT..."
          className="w-full glass bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-xs font-black tracking-widest text-white focus:outline-none focus:bg-white/[0.05] focus:border-green-500/50 focus:ring-4 focus:ring-green-500/5 transition-all placeholder:text-white/20"
        />
      </div>

      <div className="flex items-center gap-6 md:gap-8 ml-auto">
        {/* Notifications */}
        <button className="relative group p-3 glass text-white/40 hover:text-orange-500 hover:border-orange-500/50 rounded-2xl transition-all duration-500">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#0f172a] shadow-lg shadow-orange-500/50"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-10 bg-white/5 hidden sm:block"></div>

        {/* Wallet Button */}
        <div className="connect-button-wrapper">
          <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress, ensName }) => {
              return (
                <button
                  onClick={show}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-[#0f172a] px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:translate-y-[-2px] active:translate-y-[1px] shadow-xl shadow-green-500/10 transition-all"
                >
                  {isConnected ? ensName ?? truncatedAddress : "Connexion Wallet"}
                </button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
