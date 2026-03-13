"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  RefreshCcw,
  Package,
  Download,
  Box,
  GitBranch,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Pedidos",
    icon: ShoppingCart,
    children: [
      { label: "Ver pedidos", href: "/pedidos" },
      { label: "Ver pedidos B2B", href: "/pedidos/b2b" },
      { label: "Crear pedido manual", href: "/pedidos/crear" },
      { label: "Crear pedido B2B", href: "/pedidos/crear-b2b" },
      { label: "Pedidos sin stock", href: "/pedidos/sin-stock" },
      { label: "Carga masiva de pedidos", href: "/pedidos/carga-masiva" },
    ],
  },
  {
    label: "Devoluciones",
    icon: RefreshCcw,
    children: [
      { label: "Ver devoluciones", href: "/devoluciones" },
      { label: "Crear devolución", href: "/devoluciones/crear" },
    ],
  },
  {
    label: "Inventario",
    icon: Package,
    children: [
      { label: "Stock actual", href: "/inventario/stock" },
      { label: "Toma de inventario", href: "/inventario/toma" },
    ],
  },
  {
    label: "Recepciones",
    icon: Download,
    children: [
      { label: "Ver recepciones", href: "/recepciones" },
      { label: "Crear recepción", href: "/recepciones/crear" },
    ],
  },
  {
    label: "Productos",
    icon: Box,
    children: [
      { label: "Ver productos", href: "/productos" },
    ],
  },
  {
    label: "Conjunto de reglas",
    icon: GitBranch,
    children: [
      { label: "Ver reglas", href: "/reglas" },
    ],
  },
  {
    label: "Configuración",
    icon: Settings,
    children: [
      { label: "General", href: "/configuracion" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(["Pedidos"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-200 h-screen transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      } shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            {/* Amplifica logo mark */}
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
              <path d="M4 20L10 4L16 14L19 9L24 20H4Z" fill="#F5C518" stroke="#F5C518" strokeWidth="0.5" strokeLinejoin="round"/>
            </svg>
            <span className="font-bold text-gray-900 text-base tracking-tight">amplifica</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir menú" : "Contraer menú"}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-auto"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenus.includes(item.label);
          const isActive =
            item.href === pathname ||
            item.children?.some((c) => c.href === pathname);

          if (!item.children) {
            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          }

          return (
            <div key={item.label}>
              <button
                onClick={() => !collapsed && toggleMenu(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="ml-7 mb-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                        pathname === child.href
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
