"use client";

import { useState, useRef, useEffect } from "react";
import { Search, User, Building2, Clock, Package } from "lucide-react";

type Cliente = {
  id: string;
  tipo: "persona" | "empresa";
  nombre: string;
  rut?: string;
  email: string;
  telefono: string;
  ultimoPedido?: {
    id: string;
    fecha: string;
    productos: number;
    monto: string;
  };
  direccion?: string;
};

// Mock data de clientes previos
const CLIENTES_MOCK: Cliente[] = [
  {
    id: "1",
    tipo: "empresa",
    nombre: "Distribuidora Los Andes S.A.",
    rut: "76.543.210-9",
    email: "compras@losandes.cl",
    telefono: "+56 9 8765 4321",
    direccion: "Av. Providencia 1234, Las Condes",
    ultimoPedido: { id: "B2B-0042", fecha: "hace 3 días", productos: 12, monto: "$2.340.000" },
  },
  {
    id: "2",
    tipo: "empresa",
    nombre: "Comercial Becker Ltda.",
    rut: "77.123.456-K",
    email: "pedidos@becker.cl",
    telefono: "+56 9 7654 3210",
    direccion: "Calle Maipú 456, Maipú",
    ultimoPedido: { id: "B2B-0039", fecha: "hace 1 semana", productos: 8, monto: "$890.000" },
  },
  {
    id: "3",
    tipo: "persona",
    nombre: "Carlos Hernández Muñoz",
    email: "carlos.hernandez@gmail.com",
    telefono: "+56 9 6543 2109",
    ultimoPedido: { id: "B2B-0031", fecha: "hace 2 semanas", productos: 3, monto: "$145.000" },
  },
  {
    id: "4",
    tipo: "empresa",
    nombre: "TechStore Chile SpA",
    rut: "76.999.888-1",
    email: "compras@techstore.cl",
    telefono: "+56 9 5432 1098",
    direccion: "Av. Apoquindo 3000, Las Condes",
    ultimoPedido: { id: "B2B-0028", fecha: "hace 3 semanas", productos: 25, monto: "$5.120.000" },
  },
];

type Props = {
  onSelectCliente: (cliente: Cliente) => void;
  onSugerirProductos: (clienteId: string) => void;
};

export default function ClientSearch({ onSelectCliente, onSugerirProductos }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarSugerencia, setMostrarSugerencia] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const resultados = CLIENTES_MOCK.filter(
    (c) =>
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      (c.rut && c.rut.includes(query))
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setQuery(cliente.nombre);
    setOpen(false);
    onSelectCliente(cliente);
    if (cliente.ultimoPedido) setMostrarSugerencia(true);
  };

  const handleLimpiar = () => {
    setClienteSeleccionado(null);
    setQuery("");
    setMostrarSugerencia(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Search size={16} className="text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">Buscar cliente existente</h3>
        <span className="text-xs text-gray-400">(opcional — precarga datos automáticamente)</span>
      </div>

      <div ref={ref} className="relative">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (!e.target.value) setClienteSeleccionado(null);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Busca por nombre, RUT o email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {clienteSeleccionado && (
            <button
              onClick={handleLimpiar}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && query.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {resultados.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">No se encontraron clientes</div>
            ) : (
              resultados.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                >
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    {c.tipo === "empresa" ? (
                      <Building2 size={14} className="text-gray-500" />
                    ) : (
                      <User size={14} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                    <p className="text-xs text-gray-400">
                      {c.rut && <span className="mr-2">{c.rut}</span>}
                      {c.email}
                    </p>
                    {c.ultimoPedido && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-gray-300" />
                        <span className="text-xs text-gray-400">
                          Último pedido {c.ultimoPedido.fecha} · {c.ultimoPedido.productos} productos · {c.ultimoPedido.monto}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sugerencia de último pedido */}
      {mostrarSugerencia && clienteSeleccionado?.ultimoPedido && (
        <div className="mt-3 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          <Package size={16} className="text-blue-500 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="text-blue-800 font-medium">¿Usar productos del último pedido?</span>
            <span className="text-blue-600 ml-1">
              {clienteSeleccionado.ultimoPedido.id} · {clienteSeleccionado.ultimoPedido.productos} productos · {clienteSeleccionado.ultimoPedido.monto}
            </span>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                onSugerirProductos(clienteSeleccionado.id);
                setMostrarSugerencia(false);
              }}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sí, cargar
            </button>
            <button
              onClick={() => setMostrarSugerencia(false)}
              className="text-xs px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              No, gracias
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
