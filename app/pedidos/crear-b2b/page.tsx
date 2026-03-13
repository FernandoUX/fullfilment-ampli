"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight, Search, Plus, Minus, Trash2, FileText,
  BookmarkCheck, ShoppingCart, ChevronDown, ChevronUp, X,
  Download, AlertCircle, CheckCircle2, Truck, Info, User, Package,
  ShoppingBag,
} from "lucide-react";
import ClientSearch from "@/components/pedidos/ClientSearch";
import GuardarBorradorModal from "@/components/pedidos/GuardarBorradorModal";
import ListaBorradoresModal, { type BorradorItem } from "@/components/pedidos/ListaBorradoresModal";
import { exportarBsale } from "@/lib/exportBsale";

// ── Types ──────────────────────────────────────────────────────────────────
type TipoConsumidor = "" | "persona" | "empresa";
type FormStatus = "idle" | "draft_loaded" | "quoted" | "invalidated";

type Producto = {
  id: string; nombre: string; sku: string;
  barcode: string; precio: number; cantidad: number; stock: number;
  descuento: number;
};

const COURIERS = [
  { nombre: "Starken", abbr: "SK" },
  { nombre: "Chilexpress", abbr: "CX" },
  { nombre: "Blue Express", abbr: "BE" },
  { nombre: "Correos", abbr: "CC" },
] as const;

const COURIER_SERVICES: Record<string, string[]> = {
  Starken: ["Día hábil", "Express 24h", "Económico 3-5 días"],
  Chilexpress: ["Estándar", "Express", "Prioritario"],
  "Blue Express": ["Express", "Estándar", "Masivo"],
  Correos: ["Normal", "Express", "Certificado"],
};

const PRODUCTOS_MOCK: Producto[] = [
  { id: "1", nombre: "Casco MTB Pro X200", sku: "CSC-MTB-200", barcode: "7891234560001", precio: 89990, cantidad: 1, stock: 42, descuento: 0 },
  { id: "2", nombre: "Zapatos Trail Running T42", sku: "ZAP-TRL-042", barcode: "7891234560002", precio: 129990, cantidad: 1, stock: 15, descuento: 0 },
  { id: "3", nombre: "Mochila Hidratación 20L", sku: "MCH-HID-20L", barcode: "7891234560003", precio: 59990, cantidad: 1, stock: 8, descuento: 0 },
  { id: "4", nombre: "Guantes Ciclismo XL", sku: "GNT-CIC-XL", barcode: "7891234560004", precio: 24990, cantidad: 1, stock: 30, descuento: 0 },
  { id: "5", nombre: "Lentes Sol Deportivos", sku: "LNT-SOL-DEP", barcode: "7891234560005", precio: 44990, cantidad: 1, stock: 22, descuento: 0 },
];

const REGIONES = [
  "Región Metropolitana de Santiago", "Valparaíso", "Biobío", "La Araucanía",
  "Los Lagos", "O'Higgins", "Maule", "Coquimbo", "Antofagasta", "Tarapacá",
  "Atacama", "Ñuble", "Los Ríos", "Aysén", "Magallanes", "Arica y Parinacota",
];

const INPUT_BASE = "w-full bg-white text-neutral-700 placeholder:text-neutral-500 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500";

const fmt = (n: number) =>
  n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

// ── ProductosModal ─────────────────────────────────────────────────────────
function ProductosModal({ open, onClose, onAgregar }: {
  open: boolean; onClose: () => void; onAgregar: (p: Producto[]) => void;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, number>>({});
  const filtrados = PRODUCTOS_MOCK.filter(
    (p) => p.nombre.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()) || p.barcode.includes(q)
  );
  const toggle = (id: string) => setSel((prev) => prev[id] !== undefined
    ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id))
    : { ...prev, [id]: 1 });
  const handleAgregar = () => {
    onAgregar(filtrados.filter((p) => sel[p.id] !== undefined).map((p) => ({ ...p, cantidad: sel[p.id], descuento: 0 })));
    setSel({}); setQ(""); onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Agregar Productos</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca por SKU, nombre o código de barras..."
              className="w-full bg-white text-neutral-700 placeholder:text-neutral-500 pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-2.5" />
                {["Nombre", "SKU", "Precio", "Cantidad"].map((h) => (
                  <th key={h} className={`px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide ${h === "Precio" ? "text-right" : h === "Cantidad" ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map((p) => (
                <tr key={p.id} className={sel[p.id] !== undefined ? "bg-blue-50" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3"><input type="checkbox" checked={sel[p.id] !== undefined} onChange={() => toggle(p.id)} className="rounded accent-indigo-600" /></td>
                  <td className="px-4 py-3"><p className="font-medium text-gray-800">{p.nombre}</p><p className="text-xs text-gray-400">{p.barcode} · Stock: {p.stock}</p></td>
                  <td className="px-4 py-3 text-neutral-500">{p.sku}</td>
                  <td className="px-4 py-3 text-right text-gray-800">{fmt(p.precio)}</td>
                  <td className="px-4 py-3">
                    <input type="number" min={1} max={p.stock} value={sel[p.id] ?? 1} disabled={sel[p.id] === undefined}
                      onChange={(e) => setSel((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))}
                      className="w-16 text-center text-sm bg-white text-neutral-700 border border-gray-300 rounded-lg py-1 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 mx-auto block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <span className="text-sm text-neutral-500">{Object.keys(sel).length} producto(s) seleccionado(s)</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleAgregar} disabled={Object.keys(sel).length === 0}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Agregar productos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SectionCard ────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, subtitle, subtitleClass, children, defaultOpen = true }: {
  icon: React.ElementType; title: string; subtitle?: string; subtitleClass?: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          {subtitle && <p className={`text-xs mt-0.5 truncate ${subtitleClass ?? "text-gray-400"}`}>{subtitle}</p>}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CrearPedidoB2B() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [showBorradorModal, setShowBorradorModal] = useState(false);
  const [showListaModal, setShowListaModal] = useState(false);
  const [showNuevoPedidoModal, setShowNuevoPedidoModal] = useState(false);

  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [loadedDraft, setLoadedDraft] = useState<BorradorItem | null>(null);
  const [costoSimulado, setCostoSimulado] = useState<number | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "err" } | null>(null);
  const showToast = (msg: string, tipo: "ok" | "err" = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  // Datos cliente
  const [tipoConsumidor, setTipoConsumidor] = useState<TipoConsumidor>("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [region, setRegion] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [packSeparado, setPackSeparado] = useState(false);

  // Envío / simulación
  const [courierSel, setCourierSel] = useState("");
  const [servicioSel, setServicioSel] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [volumenM3, setVolumenM3] = useState("");
  const [nBultos, setNBultos] = useState("1");
  const [costoManual, setCostoManual] = useState("");
  const [notas, setNotas] = useState("");

  const totalProductos = productos.reduce(
    (a, p) => a + Math.round(p.precio * p.cantidad * (1 - p.descuento / 100)),
    0
  );
  const costoEnvio = costoSimulado ?? (costoManual ? parseInt(costoManual) || 0 : null);
  const totalFinal = totalProductos + (formStatus === "quoted" && costoEnvio !== null ? costoEnvio : 0);
  const clienteNombre = businessName || recipientName || "";

  const markDirty = () => setIsDirty(true);

  const invalidarCotizacion = useCallback(() => {
    if (formStatus === "quoted" || formStatus === "draft_loaded" || formStatus === "invalidated") {
      setFormStatus("invalidated");
      setCostoSimulado(null);
    }
  }, [formStatus]);

  const handleAgregarProductos = (nuevos: Producto[]) => {
    setProductos((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      nuevos.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    });
    invalidarCotizacion();
    markDirty();
  };

  const handleEliminarProducto = (id: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
    invalidarCotizacion();
    markDirty();
  };

  const handleCantidadChange = (id: string, val: number) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, cantidad: Math.max(1, val) } : p)));
    invalidarCotizacion();
    markDirty();
  };

  const handlePrecioChange = (id: string, precio: number) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, precio: Math.max(0, precio) } : p)));
    invalidarCotizacion();
    markDirty();
  };

  const handleDescuentoChange = (id: string, descuento: number) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, descuento: Math.min(100, Math.max(0, descuento)) } : p)));
    invalidarCotizacion();
    markDirty();
  };

  const handleClienteSelect = (c: { tipo: string; nombre: string; email: string; telefono: string; rut?: string; direccion?: string }) => {
    if (c.tipo === "empresa") {
      setTipoConsumidor("empresa"); setBusinessName(c.nombre);
      setTaxId(c.rut ?? ""); setDireccionEntrega(c.direccion ?? "");
    } else {
      setTipoConsumidor("persona"); setRecipientName(c.nombre);
      setRecipientEmail(c.email); setRecipientPhone(c.telefono);
    }
    markDirty();
  };

  const handleCargarBorrador = (b: BorradorItem) => {
    setLoadedDraft(b);

    // Cliente
    setTipoConsumidor(b.tipoConsumidor);
    if (b.tipoConsumidor === "empresa") {
      setBusinessName(b.clienteNombre);
    } else {
      setRecipientName(b.clienteNombre);
    }
    setTaxId(b.clienteData?.rut ?? "");
    setRecipientEmail(b.clienteData?.email ?? "");
    setRecipientPhone(b.clienteData?.telefono ?? "");
    setDireccionEntrega(b.clienteData?.direccion ?? "");
    setCiudad(b.clienteData?.ciudad ?? "");
    setRegion(b.clienteData?.region ?? "");

    // Productos
    if (b.productos && b.productos.length > 0) {
      setProductos(b.productos);
    }

    // Envío — si tiene courier guardado lo precarga, marca como pendiente de re-simulación
    if (b.courier) {
      setCourierSel(b.courier);
      setServicioSel(b.servicio ?? "");
    } else {
      setCourierSel("");
      setServicioSel("");
    }
    setCostoSimulado(null);
    setCostoManual(b.costoEnvio ? String(b.costoEnvio) : "");

    setFormStatus("draft_loaded");
    setIsDirty(false);
    showToast(`Borrador ${b.displayId} cargado`);
  };

  const handleSugerirProductos = () => {
    setProductos(PRODUCTOS_MOCK.slice(0, 3).map((p) => ({ ...p, cantidad: 2 })));
    invalidarCotizacion(); markDirty();
  };

  const handleCourierChange = (courier: string) => {
    setCourierSel(courier);
    setServicioSel("");
    setCostoSimulado(null);
    if (formStatus === "quoted") setFormStatus("invalidated");
  };

  const handleSimular = async () => {
    setSimulando(true);
    await new Promise((r) => setTimeout(r, 1800));
    const simulatedCost = 14341; // mock
    setCostoSimulado(simulatedCost);
    setCostoManual("");
    setFormStatus("quoted");
    setSimulando(false);
    showToast("Simulación completada");
  };

  const handleCostoManualChange = (value: string) => {
    setCostoManual(value);
    setCostoSimulado(null);
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0 && value !== "") {
      setFormStatus("quoted");
    }
    markDirty();
  };

  const handleGuardarBorrador = ({ nombre, validezDias, reservarStock }: { nombre: string; validezDias: number; reservarStock: boolean }) => {
    const id = `BRR-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setIsDirty(false);
    showToast(`Borrador "${nombre}" guardado${reservarStock ? " con stock reservado" : ""} · válido ${validezDias} días`);
    void id;
  };

  const handleExportar = () => {
    exportarBsale(
      productos.map((p) => ({ nombre: p.nombre, sku: p.sku, cantidad: p.cantidad, precioUnitario: p.precio, descuentoPct: p.descuento })),
      loadedDraft?.displayId ?? `ORD-${Date.now()}`
    );
    showToast("Archivo Bsale descargado");
  };

  const handleConfirmar = () => {
    if (formStatus === "draft_loaded" || formStatus === "invalidated") {
      showToast("Simula el costo de envío antes de confirmar", "err"); return;
    }
    showToast("Pedido creado exitosamente · B2B-0044");
    setLoadedDraft(null); setIsDirty(false);
  };

  const resetForm = () => {
    setProductos([]); setTipoConsumidor(""); setRecipientName(""); setRecipientEmail("");
    setRecipientPhone(""); setBusinessName(""); setTaxId(""); setDireccionEntrega("");
    setCiudad(""); setRegion(""); setDeliveryDate(""); setPackSeparado(false);
    setCourierSel(""); setServicioSel(""); setPesoKg(""); setVolumenM3(""); setNBultos("1");
    setCostoManual(""); setNotas(""); setCostoSimulado(null);
    setFormStatus("idle"); setLoadedDraft(null); setIsDirty(false);
  };

  const hasData = productos.length > 0 || tipoConsumidor !== "" || recipientName !== "" || businessName !== "";
  const canSimular = courierSel !== "" && servicioSel !== "";
  const canExportar = formStatus === "quoted";
  const canConfirmar = hasData && (formStatus === "quoted" || formStatus === "idle");
  const canGuardar = hasData;

  // Subtitles
  const simSubtitle = costoSimulado !== null
    ? `${courierSel} · ${fmt(costoSimulado)}`
    : courierSel
      ? `${courierSel} · Pendiente de simulación`
      : "Elige courier y simula el costo de envío";
  const simSubtitleClass = costoSimulado !== null
    ? "text-green-600"
    : courierSel
      ? "text-orange-500"
      : "text-gray-400";

  return (
    <>
      <ProductosModal open={showProductosModal} onClose={() => setShowProductosModal(false)} onAgregar={handleAgregarProductos} />
      <GuardarBorradorModal
        open={showBorradorModal} onClose={() => setShowBorradorModal(false)}
        onConfirm={handleGuardarBorrador}
        productosCount={productos.length} totalEstimado={fmt(totalProductos)}
        clienteNombre={clienteNombre}
      />
      <ListaBorradoresModal open={showListaModal} onClose={() => setShowListaModal(false)} onCargar={handleCargarBorrador} />

      {/* Modal — Nuevo Pedido */}
      {showNuevoPedidoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Iniciar nuevo pedido</p>
                <p className="text-xs text-gray-400 mt-0.5">Tienes datos sin guardar. ¿Qué deseas hacer?</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowNuevoPedidoModal(false);
                  handleConfirmar();
                }}
                disabled={!canConfirmar}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={16} className="shrink-0" />
                <div>
                  <p className="text-sm font-medium">Confirmar pedido actual</p>
                  <p className="text-xs text-indigo-500">Procesa el pedido y luego inicia uno nuevo</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowNuevoPedidoModal(false);
                  setShowBorradorModal(true);
                }}
                disabled={!hasData}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <BookmarkCheck size={16} className="text-gray-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Guardar como borrador</p>
                  <p className="text-xs text-gray-400">Guarda el pedido actual y luego inicia uno nuevo</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowNuevoPedidoModal(false);
                  resetForm();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 size={16} className="text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-600">Descartar y partir de cero</p>
                  <p className="text-xs text-red-400">Se perderán los datos no guardados</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowNuevoPedidoModal(false)}
              className="mt-4 w-full px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.tipo === "ok" ? "bg-gray-900" : "bg-red-600"}`}>
          {toast.tipo === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Breadcrumb + título */}
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <Link href="/" className="hover:text-gray-600">Índice</Link>
              <ChevronRight size={12} />
              <Link href="/pedidos" className="hover:text-gray-600">Pedidos</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600">Crear Pedido B2B</span>
            </nav>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Crear Pedido B2B</h1>
              {loadedDraft && (
                <>
                  <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    <FileText size={11} />{loadedDraft.displayId}
                  </span>
                  {loadedDraft.stockReservado && (
                    <span title="Los productos de este borrador tienen stock reservado en inventario" className="text-xs px-2.5 py-1 bg-orange-100 text-orange-600 rounded-full font-medium cursor-help">
                      Stock reservado
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowListaModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors font-medium">
              <FileText size={14} /> Ver borradores
            </button>
            <button
              onClick={() => hasData ? setShowNuevoPedidoModal(true) : resetForm()}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              <Plus size={14} /> Nuevo pedido
            </button>
          </div>
        </div>

        {/* Banner cambios sin guardar */}
        {isDirty && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle size={15} className="shrink-0 text-amber-500" />
              Tienes cambios sin guardar — guarda como borrador para no perder el progreso.
            </div>
            <button onClick={() => setShowBorradorModal(true)}
              className="text-sm font-semibold text-amber-700 hover:text-amber-800 whitespace-nowrap">
              Guardar ahora
            </button>
          </div>
        )}

        {/* Layout principal: 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

          {/* ── Columna izquierda ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Información del Cliente */}
            <SectionCard icon={User} title="Información del Cliente" subtitle={clienteNombre || "Completa los datos del cliente"}>
              <div className="pt-4 space-y-4">
                <ClientSearch onSelectCliente={handleClienteSelect} onSugerirProductos={handleSugerirProductos} />

                {/* Tipo consumidor */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={tipoConsumidor} onChange={(e) => { setTipoConsumidor(e.target.value as TipoConsumidor); markDirty(); }}
                      className={`${INPUT_BASE} appearance-none bg-white pr-9`}>
                      <option value="">Seleccione un tipo de consumidor</option>
                      <option value="persona">Persona</option>
                      <option value="empresa">Empresa</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Campos persona */}
                {tipoConsumidor === "persona" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Nombre Contacto</label>
                      <input value={recipientName} onChange={(e) => { setRecipientName(e.target.value); markDirty(); }} placeholder="María González" className={INPUT_BASE} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Teléfono</label>
                      <input value={recipientPhone} onChange={(e) => { setRecipientPhone(e.target.value); markDirty(); }} placeholder="+56 9 8765 4321" className={INPUT_BASE} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Email de Contacto</label>
                      <input value={recipientEmail} onChange={(e) => { setRecipientEmail(e.target.value); markDirty(); }} type="email" className={INPUT_BASE} />
                    </div>
                  </div>
                )}

                {/* Campos empresa */}
                {tipoConsumidor === "empresa" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">RUT Cliente</label>
                      <input value={taxId} onChange={(e) => { setTaxId(e.target.value); markDirty(); }} placeholder="76.234.891-2" className={INPUT_BASE} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Email de Contacto</label>
                      <input value={recipientEmail} onChange={(e) => { setRecipientEmail(e.target.value); markDirty(); }} placeholder="compras@empresa.cl" className={INPUT_BASE} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Nombre Contacto</label>
                      <input value={recipientName} onChange={(e) => { setRecipientName(e.target.value); markDirty(); }} placeholder="María González" className={INPUT_BASE} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Teléfono</label>
                      <input value={recipientPhone} onChange={(e) => { setRecipientPhone(e.target.value); markDirty(); }} placeholder="+56 9 8765 4321" className={INPUT_BASE} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Dirección de Entrega <span className="text-red-500">*</span>
                      </label>
                      <input value={direccionEntrega} onChange={(e) => { setDireccionEntrega(e.target.value); markDirty(); }} placeholder="Av. Providencia 1234" className={INPUT_BASE} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Ciudad</label>
                      <input value={ciudad} onChange={(e) => { setCiudad(e.target.value); markDirty(); }} placeholder="Santiago" className={INPUT_BASE} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Región</label>
                      <div className="relative">
                        <select value={region} onChange={(e) => { setRegion(e.target.value); markDirty(); }}
                          className={`${INPUT_BASE} appearance-none pr-9`}>
                          <option value="">Región Metropolitana</option>
                          {REGIONES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Fecha + pack separado */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha Compromiso de Entrega</label>
                    <input type="date" value={deliveryDate} onChange={(e) => { setDeliveryDate(e.target.value); markDirty(); }}
                      min={new Date().toISOString().split("T")[0]}
                      className={INPUT_BASE} />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={packSeparado} onChange={(e) => { setPackSeparado(e.target.checked); markDirty(); }} className="rounded accent-indigo-600 w-4 h-4" />
                    <span className="text-sm text-gray-700">Empacar cada SKU por separado</span>
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* Líneas de Producto */}
            <SectionCard icon={Package} title="Líneas de Producto"
              subtitle={productos.length > 0 ? `${productos.length} producto(s) · ${fmt(totalProductos)}` : "0 productos · $0"}>
              <div className="pt-4 space-y-4">
                <button onClick={() => setShowProductosModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                  <Plus size={15} />
                  Buscar por nombre o SKU...
                </button>

                {productos.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2.5 text-xs font-medium text-gray-400 text-left w-24">SKU</th>
                          <th className="px-3 py-2.5 text-xs font-medium text-gray-400 text-left">PRODUCTO</th>
                          <th className="px-3 py-2.5 text-xs font-medium text-gray-400 text-center w-32">CANTIDAD</th>
                          <th className="px-3 py-2.5 text-xs font-medium text-gray-400 text-right w-28">PRECIO UNIT.</th>
                          <th className="px-3 py-2.5 text-xs font-medium text-gray-400 text-center w-20">DESC. %</th>
                          <th className="px-3 py-2.5 text-xs font-medium text-gray-400 text-right w-24">SUBTOTAL</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {productos.map((p) => {
                          const subtotal = Math.round(p.precio * p.cantidad * (1 - p.descuento / 100));
                          return (
                            <tr key={p.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                              {/* SKU */}
                              <td className="px-3 py-3">
                                <span className="text-xs font-mono text-neutral-500">{p.sku}</span>
                              </td>
                              {/* Nombre */}
                              <td className="px-3 py-3">
                                <p className="font-medium text-neutral-700 text-sm leading-tight">{p.nombre}</p>
                              </td>
                              {/* Cantidad con −/+ */}
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button onClick={() => handleCantidadChange(p.id, p.cantidad - 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                                    <Minus size={10} />
                                  </button>
                                  <span className="w-8 text-center text-sm font-medium text-neutral-700">{p.cantidad}</span>
                                  <button onClick={() => handleCantidadChange(p.id, p.cantidad + 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                                    <Plus size={10} />
                                  </button>
                                </div>
                              </td>
                              {/* Precio editable */}
                              <td className="px-3 py-3">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">$</span>
                                  <input
                                    type="number" min={0} value={p.precio}
                                    onChange={(e) => handlePrecioChange(p.id, Number(e.target.value))}
                                    className="w-full pl-5 pr-1 py-1.5 text-sm text-right bg-white text-neutral-700 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              </td>
                              {/* Descuento % */}
                              <td className="px-3 py-3">
                                <div className="relative">
                                  <input
                                    type="number" min={0} max={100} value={p.descuento}
                                    onChange={(e) => handleDescuentoChange(p.id, Number(e.target.value))}
                                    className="w-full pr-5 pl-2 py-1.5 text-sm text-center bg-white text-neutral-700 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">%</span>
                                </div>
                              </td>
                              {/* Subtotal */}
                              <td className="px-3 py-3 text-right font-semibold text-neutral-700">
                                {fmt(subtotal)}
                              </td>
                              {/* Delete */}
                              <td className="px-3 py-3">
                                <button onClick={() => handleEliminarProducto(p.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Simulación de Envío */}
            <SectionCard
              icon={Truck}
              title="Simulación de Envío"
              subtitle={simSubtitle}
              subtitleClass={simSubtitleClass}
            >
              <div className="pt-4 space-y-4">
                {/* Alert si invalidado o borrador */}
                {formStatus === "invalidated" && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                    <AlertCircle size={12} className="shrink-0" />
                    Productos modificados — vuelve a simular el envío.
                  </div>
                )}
                {formStatus === "draft_loaded" && !costoSimulado && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    <AlertCircle size={12} className="shrink-0" />
                    Borrador cargado — simula el envío antes de confirmar.
                  </div>
                )}

                {/* Selección de courier */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Courier</label>
                  <div className="grid grid-cols-4 gap-2">
                    {COURIERS.map((c) => (
                      <button
                        key={c.nombre}
                        onClick={() => handleCourierChange(c.nombre)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                          courierSel === c.nombre
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold tracking-tight ${
                          courierSel === c.nombre ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                          {c.abbr}
                        </div>
                        <span className={`text-[10px] text-center leading-tight font-medium ${
                          courierSel === c.nombre ? "text-indigo-700" : "text-gray-500"
                        }`}>{c.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de servicio */}
                {courierSel && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Tipo de Servicio</label>
                    <div className="flex flex-wrap gap-2">
                      {COURIER_SERVICES[courierSel]?.map((s) => (
                        <button
                          key={s}
                          onClick={() => setServicioSel(s)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                            servicioSel === s
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Peso / Volumen / Bultos */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Peso estimado (kg)</label>
                    <input type="number" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} placeholder="0.0"
                      className="w-full bg-white text-neutral-700 placeholder:text-neutral-500 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Volumen (m³)</label>
                    <input type="number" value={volumenM3} onChange={(e) => setVolumenM3(e.target.value)} placeholder="0.000"
                      className="w-full bg-white text-neutral-700 placeholder:text-neutral-500 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">N° de bultos</label>
                    <input type="number" value={nBultos} onChange={(e) => setNBultos(e.target.value)} placeholder="1"
                      className="w-full bg-white text-neutral-700 placeholder:text-neutral-500 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* Botón simular + manual */}
                <div className="space-y-2">
                  <button onClick={handleSimular} disabled={!canSimular || simulando}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {simulando
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Simulando...</>
                      : <><Truck size={15} />Simular Costo de Envío</>}
                  </button>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-neutral-500 whitespace-nowrap">O ingresa manualmente:</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 pointer-events-none">$</span>
                      <input
                        type="number" value={costoManual} onChange={(e) => handleCostoManualChange(e.target.value)}
                        placeholder="0"
                        className="w-full pl-6 pr-3 py-1.5 text-sm bg-white text-neutral-700 placeholder:text-neutral-500 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Resultado simulación */}
                {costoSimulado !== null && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-700">{courierSel} · {servicioSel}</p>
                      <p className="text-xs text-green-600 opacity-75">Costo simulado</p>
                    </div>
                    <span className="text-base font-bold text-green-700">{fmt(costoSimulado)}</span>
                  </div>
                )}

                {/* Notas del pedido */}
                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Notas del Pedido</label>
                  <textarea value={notas} onChange={(e) => { setNotas(e.target.value); markDirty(); }} rows={3} maxLength={1000}
                    placeholder="Indicaciones especiales, instrucciones de entrega..."
                    className="w-full bg-white text-neutral-700 placeholder:text-neutral-500 border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  <p className="text-right text-xs text-neutral-500 mt-1">{notas.length}/1000</p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Columna derecha — Resumen + Acciones ── */}
          <div className="space-y-3 sticky top-4">
            {/* Resumen del pedido */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">Resumen del Pedido</h2>
              </div>

              {productos.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-300">
                  <ShoppingCart size={32} className="mb-2 opacity-40" />
                  <p className="text-xs text-center">Agrega productos para ver el resumen</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {productos.map((p) => {
                    const subtotal = Math.round(p.precio * p.cantidad * (1 - p.descuento / 100));
                    return (
                      <div key={p.id} className="flex items-start justify-between text-xs gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 font-medium truncate">{p.nombre}</p>
                          <p className="text-neutral-500">{p.cantidad} × {fmt(p.precio)}{p.descuento > 0 && ` · −${p.descuento}%`}</p>
                        </div>
                        <span className="text-gray-800 font-semibold shrink-0">{fmt(subtotal)}</span>
                      </div>
                    );
                  })}

                  <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Subtotal productos ({productos.reduce((a, p) => a + p.cantidad, 0)} u.)</span>
                      <span>{fmt(totalProductos)}</span>
                    </div>

                    {/* Costo envío */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-500">Costo de envío</span>
                        {courierSel && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-700 text-white rounded font-mono font-bold">
                            {COURIERS.find((c) => c.nombre === courierSel)?.abbr}
                          </span>
                        )}
                      </div>
                      {formStatus === "quoted" && costoEnvio !== null ? (
                        <span className="font-semibold text-gray-800">
                          {costoEnvio === 0 ? "Gratis" : fmt(costoEnvio)}
                        </span>
                      ) : (
                        <span className="text-orange-500 font-medium">Por simular</span>
                      )}
                    </div>
                    {formStatus !== "quoted" && (
                      <p className="text-[10px] text-orange-500 flex items-center gap-1">
                        <AlertCircle size={9} className="shrink-0" />
                        Simula para ver el costo real de envío
                      </p>
                    )}

                    <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-gray-100">
                      <span>Total</span>
                      <span>{fmt(totalFinal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <button onClick={handleConfirmar} disabled={!canConfirmar}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
              <CheckCircle2 size={16} /> Confirmar Pedido
            </button>

            <button onClick={() => setShowBorradorModal(true)} disabled={!canGuardar}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm border border-gray-300 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <BookmarkCheck size={16} /> Guardar como Borrador
            </button>

            <button onClick={handleExportar} disabled={!canExportar}
              title={!canExportar ? "Cotiza el envío para habilitar" : undefined}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-neutral-500 hover:text-gray-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Download size={15} /> Ver exportaciones a Bsale
            </button>

            <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
              <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 leading-relaxed">
                Al guardar como borrador puedes reservar el stock de los productos para asegurar disponibilidad cuando el cliente confirme.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
