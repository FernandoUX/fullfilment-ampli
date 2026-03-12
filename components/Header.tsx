"use client";

import { useState } from "react";
import { Bell, HelpCircle, Maximize2, ChevronDown } from "lucide-react";

const SUCURSALES = ["Quilicura", "Santiago Centro", "Las Condes", "Maipú"];
const TIENDAS = ["100 Aventuras", "Bekoko", "Mi Tienda", "Otra Tienda"];

export default function Header() {
  const [sucursal, setSucursal] = useState("Quilicura");
  const [tienda, setTienda] = useState("100 Aventuras");

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
      {/* Dropdowns center */}
      <div className="flex items-center gap-3 flex-1">
        {/* Sucursal */}
        <div className="relative">
          <label className="absolute -top-2 left-3 text-[10px] text-gray-400 bg-white px-0.5 leading-none">
            Sucursal
          </label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 min-w-[160px] cursor-pointer hover:border-gray-400 transition-colors">
            <select
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              className="text-sm text-gray-800 font-medium bg-transparent outline-none cursor-pointer w-full appearance-none"
            >
              {SUCURSALES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="text-gray-400 shrink-0 pointer-events-none" />
          </div>
        </div>

        {/* Tienda */}
        <div className="relative">
          <label className="absolute -top-2 left-3 text-[10px] text-gray-400 bg-white px-0.5 leading-none">
            Tienda
          </label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 min-w-[160px] cursor-pointer hover:border-gray-400 transition-colors">
            <select
              value={tienda}
              onChange={(e) => setTienda(e.target.value)}
              className="text-sm text-gray-800 font-medium bg-transparent outline-none cursor-pointer w-full appearance-none"
            >
              {TIENDAS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={14} className="text-gray-400 shrink-0 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Maximize2 size={18} />
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <HelpCircle size={18} />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 ml-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-indigo-600 text-sm font-semibold">FR</span>
          </div>
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm font-medium text-gray-800">Fernando Roblero</p>
            <p className="text-xs text-gray-400">usuario@ejemplo.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
