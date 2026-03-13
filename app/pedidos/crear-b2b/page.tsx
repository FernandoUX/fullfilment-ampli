"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Search,
  Plus,
  Trash2,
  FileText,
  BookmarkCheck,
  ShoppingCart,
  ChevronDown,
  X,
} from "lucide-react";
import ClientSearch from "@/components/pedidos/ClientSearch";

// ── Types ──────────────────────────────────────────────────────────────────
type TipoConsumidor = "" | "persona" | "empresa";
type TipoEnvio = "" | "pickup" | "delivery" | "choose_later";

type Producto = {
  id: string;
  nombre: string;
  sku: string;
  barcode: string;
  precio: number;
  cantidad: number;
  stock: number;
};

// Mock productos
const PRODUCTOS_MOCK: Producto[] = [
  { id: "1", nombre: "Casco MTB Pro X200", sku: "CSC-MTB-200", barcode: "7891234560001", precio: 89990, cantidad: 1, stock: 42 },
  { id: "2", nombre: "Zapatos Trail Running T42", sku: "ZAP-TRL-042", barcode: "7891234560002", precio: 129990, cantidad: 1, stock: 15 },
  { id: "3", nombre: "Mochila Hidratación 20L", sku: "MCH-HID-20L", barcode: "7891234560003", precio: 59990, cantidad: 1, stock: 8 },
  { id: "4", nombre: "Guantes Ciclismo XL", sku: "GNT-CIC-XL", barcode: "7891234560004", precio: 24990, cantidad: 1, stock: 30 },
  { id: "5", nombre: "Lentes Sol Deportivos", sku: "LNT-SOL-DEP", barcode: "7891234560005", precio: 44990, cantidad: 1, stock: 22 },
];

const REGIONES = [
  "Región Metropolitana de Santiago",
  "Valparaíso",
  "Biobío",
  "La Araucanía",
  "Los Lagos",
  "O'Higgins",
  "Maule",
  "Coquimbo",
  "Antofagasta",
  "Tarapacá",
  "Atacama",
  "Ñuble",
  "Los Ríos",
  "Aysén",
  "Magallanes",
  "Arica y Parinacota",
];

const fmt = (n: number) =>
  n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

// ── Modals ─────────────────────────────────────────────────────────────────
function ProductosModal({
  open,
  onClose,
  onAgregar,
}: {
  open: boolean;
  onClose: () => void;
  onAgregar: (p: Producto[]) => void;
}) {
  const [q, setQ] = useState("");
  const [seleccionados, setSeleccionados] = useState<Record<string, number>>({});

  const filtrados = PRODUCTOS_MOCK.filter(
    (p) =>
      p.nombre.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase()) ||
      p.barcode.includes(q)
  );

  const toggle = (id: string) => {
    setSeleccionados((prev) =>
      prev[id] !== undefined
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id))
        : { ...prev, [id]: 1 }
    );
  };

  const handleAgregar = () => {
    const productos = filtrados
      .filter((p) => seleccionados[p.id] !== undefined)
      .map((p) => ({ ...p, cantidad: seleccionados[p.id] }));
    onAgregar(productos);
    setSeleccionados({});
    setQ("");
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Agregar Productos</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca por SKU, nombre o código de barras..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-2.5 text-left" />
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">SKU</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Precio</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map((p) => (
                <tr key={p.id} className={seleccionados[p.id] !== undefined ? "bg-blue-50" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={seleccionados[p.id] !== undefined}
                      onChange={() => toggle(p.id)}
                      className="rounded accent-blue-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{p.barcode} · Stock: {p.stock}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 text-right text-gray-800">{fmt(p.precio)}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1}
                      max={p.stock}
                      value={seleccionados[p.id] ?? 1}
                      disabled={seleccionados[p.id] === undefined}
                      onChange={(e) =>
                        setSeleccionados((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))
                      }
                      className="w-16 text-center text-sm border border-gray-300 rounded-lg py-1 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 mx-auto block"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {Object.keys(seleccionados).length} producto(s) seleccionado(s)
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={handleAgregar}
              disabled={Object.keys(seleccionados).length === 0}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar productos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BorradorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const BORRADORES = [
    { id: "BRR-0012", cliente: "Distribuidora Los Andes S.A.", fecha: "hace 2 días", productos: 8, monto: "$1.240.000", reserva: true },
    { id: "BRR-0011", cliente: "Comercial Becker Ltda.", fecha: "hace 4 días", productos: 3, monto: "$340.000", reserva: false },
    { id: "BRR-0009", cliente: "TechStore Chile SpA", fecha: "hace 1 semana", productos: 15, monto: "$3.890.000", reserva: true },
  ];
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Borradores guardados</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {BORRADORES.map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-500">{b.id}</span>
                  {b.reserva && (
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">Stock reservado</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{b.cliente}</p>
                <p className="text-xs text-gray-400">{b.fecha} · {b.productos} productos · {b.monto}</p>
              </div>
              <button className="text-xs px-3 py-1.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 shrink-0">
                Cargar
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">3 borradores guardados</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CrearPedidoB2B() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [showBorradorModal, setShowBorradorModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // Datos cliente
  const [tipoConsumidor, setTipoConsumidor] = useState<TipoConsumidor>("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  // Datos envío
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [comuna, setComuna] = useState("");
  const [region, setRegion] = useState("");

  // Otros
  const [packSeparado, setPackSeparado] = useState(false);
  const [infoAdicional, setInfoAdicional] = useState("");

  const [guardandoBorrador, setGuardandoBorrador] = useState(false);

  const handleClienteSelect = (c: { tipo: string; nombre: string; email: string; telefono: string; rut?: string; direccion?: string }) => {
    if (c.tipo === "empresa") {
      setTipoConsumidor("empresa");
      setBusinessName(c.nombre);
      setTaxId(c.rut ?? "");
      setBusinessAddress(c.direccion ?? "");
    } else {
      setTipoConsumidor("persona");
      setRecipientName(c.nombre);
      setRecipientEmail(c.email);
      setRecipientPhone(c.telefono);
    }
  };

  const handleSugerirProductos = (clienteId: string) => {
    // Simula cargar productos del último pedido
    const mock = PRODUCTOS_MOCK.slice(0, 3).map((p) => ({ ...p, cantidad: Math.ceil(Math.random() * 5) + 1 }));
    setProductos(mock);
  };

  const handleAgregarProductos = (nuevos: Producto[]) => {
    setProductos((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      nuevos.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    });
  };

  const handleEliminarProducto = (id: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCantidadChange = (id: string, val: number) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, cantidad: val } : p)));
  };

  const handleGuardarBorrador = () => {
    setGuardandoBorrador(true);
    setTimeout(() => {
      setGuardandoBorrador(false);
      alert("Borrador guardado correctamente. ID: BRR-0013");
    }, 1000);
  };

  const totalEstimado = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  return (
    <>
      <ProductosModal
        open={showProductosModal}
        onClose={() => setShowProductosModal(false)}
        onAgregar={handleAgregarProductos}
      />
      <BorradorModal open={showBorradorModal} onClose={() => setShowBorradorModal(false)} />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <Link href="/" className="hover:text-gray-600">Índice</Link>
              <ChevronRight size={12} />
              <Link href="/pedidos" className="hover:text-gray-600">Pedidos</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600">Crear Pedido B2B</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900">Crear Pedido B2B</h1>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowBorradorModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            >
              <FileText size={15} />
              Ver borradores
            </button>
            <button
              onClick={handleGuardarBorrador}
              disabled={guardandoBorrador}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-400 bg-white rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-60"
            >
              <BookmarkCheck size={15} />
              {guardandoBorrador ? "Guardando..." : "Guardar borrador"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              <ShoppingCart size={15} />
              Convertir a pedido
            </button>
          </div>
        </div>

        {/* Buscador de cliente */}
        <ClientSearch onSelectCliente={handleClienteSelect} onSugerirProductos={handleSugerirProductos} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-4">

            {/* Productos del Pedido */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800">Productos del Pedido</h2>
                {productos.length > 0 && (
                  <span className="text-xs text-gray-400">{productos.length} producto(s)</span>
                )}
              </div>

              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Busca por SKU, nombre o código de barras..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowProductosModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shrink-0"
                >
                  <Plus size={15} />
                  Buscar
                </button>
              </div>

              {productos.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm">No hay productos para mostrar</p>
                  <button
                    onClick={() => setShowProductosModal(true)}
                    className="mt-2 text-xs text-blue-500 hover:text-blue-700 underline"
                  >
                    Agregar productos
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-400 pb-2">#</th>
                        <th className="text-left text-xs font-medium text-gray-400 pb-2">Nombre</th>
                        <th className="text-left text-xs font-medium text-gray-400 pb-2">Cód. barra</th>
                        <th className="text-right text-xs font-medium text-gray-400 pb-2">Precio unit.</th>
                        <th className="text-center text-xs font-medium text-gray-400 pb-2">Cantidad</th>
                        <th className="text-right text-xs font-medium text-gray-400 pb-2">Subtotal</th>
                        <th className="w-10 pb-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {productos.map((p, i) => (
                        <tr key={p.id}>
                          <td className="py-3 text-gray-400 text-xs pr-2">{i + 1}</td>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-800">{p.nombre}</p>
                            <p className="text-xs text-gray-400">{p.sku}</p>
                          </td>
                          <td className="py-3 text-gray-500 text-xs pr-4">{p.barcode}</td>
                          <td className="py-3 text-right text-gray-700">{fmt(p.precio)}</td>
                          <td className="py-3 text-center">
                            <input
                              type="number"
                              min={1}
                              value={p.cantidad}
                              onChange={(e) => handleCantidadChange(p.id, Number(e.target.value))}
                              className="w-16 text-center text-sm border border-gray-200 rounded-lg py-1 outline-none focus:ring-2 focus:ring-blue-500 mx-auto block"
                            />
                          </td>
                          <td className="py-3 text-right font-medium text-gray-800">
                            {fmt(p.precio * p.cantidad)}
                          </td>
                          <td className="py-3 pl-2">
                            <button
                              onClick={() => handleEliminarProducto(p.id)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200">
                        <td colSpan={5} className="pt-3 text-sm font-semibold text-gray-600 text-right pr-4">
                          Total estimado
                        </td>
                        <td className="pt-3 text-right font-bold text-gray-900">{fmt(totalEstimado)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Datos del cliente */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Datos del cliente</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo consumidor *</label>
                  <div className="relative">
                    <select
                      value={tipoConsumidor}
                      onChange={(e) => setTipoConsumidor(e.target.value as TipoConsumidor)}
                      className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-9"
                    >
                      <option value="">Seleccione un tipo de consumidor</option>
                      <option value="persona">Persona</option>
                      <option value="empresa">Empresa</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {tipoConsumidor === "persona" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Nombre Receptor *</label>
                      <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Teléfono Receptor *</label>
                      <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="+56 9 XXXX XXXX" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Correo Receptor *</label>
                      <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}

                {tipoConsumidor === "empresa" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Razón Social *</label>
                      <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">RUT *</label>
                      <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="XX.XXX.XXX-X" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Dirección *</label>
                      <input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Otros */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Otros</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={packSeparado}
                    onChange={(e) => setPackSeparado(e.target.checked)}
                    className="rounded accent-blue-600 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Empacar cada SKU por separado</span>
                </label>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Información Adicional</label>
                  <textarea
                    value={infoAdicional}
                    onChange={(e) => setInfoAdicional(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">{infoAdicional.length}/1000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha — Datos del envío */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Datos del envío</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo de Envío *</label>
                  <div className="relative">
                    <select
                      value={tipoEnvio}
                      onChange={(e) => setTipoEnvio(e.target.value as TipoEnvio)}
                      className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-9"
                    >
                      <option value="">Seleccione el tipo de envío</option>
                      <option value="pickup">Retiro en Sucursal</option>
                      <option value="delivery">Envío a Domicilio</option>
                      <option value="choose_later">Elegir después</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha Compromiso de Entrega</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {tipoEnvio === "delivery" && (
                  <>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-medium text-gray-500 mb-3">Dirección de entrega</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Calle o Avenida *</label>
                          <input value={calle} onChange={(e) => setCalle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Número *</label>
                            <input value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Complemento</label>
                            <input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Depto, of..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Comuna *</label>
                          <input value={comuna} onChange={(e) => setComuna(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Región *</label>
                          <div className="relative">
                            <select
                              value={region}
                              onChange={(e) => setRegion(e.target.value)}
                              className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-8"
                            >
                              <option value="">Seleccionar...</option>
                              {REGIONES.map((r) => <option key={r}>{r}</option>)}
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Resumen */}
                {productos.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Productos</span>
                      <span>{productos.reduce((a, p) => a + p.cantidad, 0)} unid.</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal productos</span>
                      <span>{fmt(totalEstimado)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-gray-800 pt-1 border-t border-gray-100">
                      <span>Total estimado</span>
                      <span>{fmt(totalEstimado)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
