"use client";

import { useState } from "react";
import { X, Inbox, Unlock, Trash2, AlertTriangle } from "lucide-react";

export type BorradorProducto = {
  id: string; nombre: string; sku: string; barcode: string;
  precio: number; cantidad: number; stock: number; descuento: number;
};

export type BorradorItem = {
  id: string;
  displayId: string;
  clienteNombre: string;
  tipoConsumidor: "persona" | "empresa";
  fecha: string;
  productosCount: number;
  montoEstimado: string;
  stockReservado: boolean;
  estadoCotizacion: "sin_cotizar" | "cotizado";
  // Rich data for form population
  clienteData?: {
    rut?: string; email?: string; telefono?: string;
    direccion?: string; ciudad?: string; region?: string;
  };
  productos?: BorradorProducto[];
  courier?: string;
  servicio?: string;
  costoEnvio?: number;
};

const BORRADORES_MOCK: BorradorItem[] = [
  {
    id: "1",
    displayId: "BRR-0013",
    clienteNombre: "Distribuidora Los Andes S.A.",
    tipoConsumidor: "empresa",
    fecha: "hace 1 hora",
    productosCount: 8,
    montoEstimado: "$1.240.000",
    stockReservado: true,
    estadoCotizacion: "cotizado",
    clienteData: {
      rut: "76.543.210-9",
      email: "compras@losandes.cl",
      telefono: "+56 9 8765 4321",
      direccion: "Av. Providencia 1234, Las Condes",
      ciudad: "Santiago",
      region: "Región Metropolitana de Santiago",
    },
    courier: "Starken",
    servicio: "Express 24h",
    costoEnvio: 4990,
    productos: [
      { id: "p1", nombre: "Casco MTB Pro X200", sku: "CSC-MTB-200", barcode: "7891234560001", precio: 89990, cantidad: 4, stock: 42, descuento: 5 },
      { id: "p2", nombre: "Zapatos Trail Running T42", sku: "ZAP-TRL-042", barcode: "7891234560002", precio: 129990, cantidad: 2, stock: 15, descuento: 0 },
      { id: "p3", nombre: "Mochila Hidratación 20L", sku: "MCH-HID-20L", barcode: "7891234560003", precio: 59990, cantidad: 3, stock: 8, descuento: 10 },
      { id: "p4", nombre: "Guantes Ciclismo XL", sku: "GNT-CIC-XL", barcode: "7891234560004", precio: 24990, cantidad: 6, stock: 30, descuento: 0 },
      { id: "p5", nombre: "Lentes Sol Deportivos", sku: "LNT-SOL-DEP", barcode: "7891234560005", precio: 44990, cantidad: 2, stock: 22, descuento: 15 },
      { id: "p6", nombre: "Botella Hidratación 750ml", sku: "BOT-HID-750", barcode: "7891234560006", precio: 14990, cantidad: 8, stock: 60, descuento: 0 },
      { id: "p7", nombre: "Calcetines Técnicos Pack x3", sku: "CAL-TEC-3PK", barcode: "7891234560007", precio: 9990, cantidad: 5, stock: 45, descuento: 0 },
      { id: "p8", nombre: "Rodilleras Protección Pro", sku: "ROD-PRO-M", barcode: "7891234560008", precio: 34990, cantidad: 3, stock: 18, descuento: 5 },
    ],
  },
  {
    id: "2",
    displayId: "BRR-0012",
    clienteNombre: "Comercial Becker Ltda.",
    tipoConsumidor: "empresa",
    fecha: "hace 2 días",
    productosCount: 3,
    montoEstimado: "$340.000",
    stockReservado: false,
    estadoCotizacion: "sin_cotizar",
    clienteData: {
      rut: "77.123.456-K",
      email: "pedidos@becker.cl",
      telefono: "+56 9 7654 3210",
      direccion: "Calle Maipú 456",
      ciudad: "Maipú",
      region: "Región Metropolitana de Santiago",
    },
    productos: [
      { id: "p2", nombre: "Zapatos Trail Running T42", sku: "ZAP-TRL-042", barcode: "7891234560002", precio: 129990, cantidad: 1, stock: 15, descuento: 0 },
      { id: "p3", nombre: "Mochila Hidratación 20L", sku: "MCH-HID-20L", barcode: "7891234560003", precio: 59990, cantidad: 2, stock: 8, descuento: 0 },
      { id: "p5", nombre: "Lentes Sol Deportivos", sku: "LNT-SOL-DEP", barcode: "7891234560005", precio: 44990, cantidad: 3, stock: 22, descuento: 0 },
    ],
  },
  {
    id: "3",
    displayId: "BRR-0011",
    clienteNombre: "TechStore Chile SpA",
    tipoConsumidor: "empresa",
    fecha: "hace 1 semana",
    productosCount: 15,
    montoEstimado: "$3.890.000",
    stockReservado: true,
    estadoCotizacion: "sin_cotizar",
    clienteData: {
      rut: "76.999.888-1",
      email: "compras@techstore.cl",
      telefono: "+56 9 5432 1098",
      direccion: "Av. Apoquindo 3000",
      ciudad: "Las Condes",
      region: "Región Metropolitana de Santiago",
    },
    productos: [
      { id: "p1", nombre: "Casco MTB Pro X200", sku: "CSC-MTB-200", barcode: "7891234560001", precio: 89990, cantidad: 5, stock: 42, descuento: 10 },
      { id: "p2", nombre: "Zapatos Trail Running T42", sku: "ZAP-TRL-042", barcode: "7891234560002", precio: 129990, cantidad: 3, stock: 15, descuento: 5 },
      { id: "p3", nombre: "Mochila Hidratación 20L", sku: "MCH-HID-20L", barcode: "7891234560003", precio: 59990, cantidad: 4, stock: 8, descuento: 0 },
      { id: "p4", nombre: "Guantes Ciclismo XL", sku: "GNT-CIC-XL", barcode: "7891234560004", precio: 24990, cantidad: 8, stock: 30, descuento: 0 },
      { id: "p5", nombre: "Lentes Sol Deportivos", sku: "LNT-SOL-DEP", barcode: "7891234560005", precio: 44990, cantidad: 6, stock: 22, descuento: 20 },
    ],
  },
];

type ConfirmAction = {
  tipo: "eliminar" | "liberar";
  borrador: BorradorItem;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCargar: (borrador: BorradorItem) => void;
};

export default function ListaBorradoresModal({ open, onClose, onCargar }: Props) {
  const [borradores, setBorradores] = useState<BorradorItem[]>(BORRADORES_MOCK);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  const handleEliminar = async (b: BorradorItem) => {
    setProcesando(b.id);
    await new Promise((r) => setTimeout(r, 600));
    setBorradores((prev) => prev.filter((x) => x.id !== b.id));
    setProcesando(null);
    setConfirm(null);
  };

  const handleLiberar = async (b: BorradorItem) => {
    setProcesando(b.id);
    await new Promise((r) => setTimeout(r, 600));
    setBorradores((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, stockReservado: false } : x))
    );
    setProcesando(null);
    setConfirm(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* Confirm dialog */}
      {confirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {confirm.tipo === "eliminar" ? "¿Eliminar borrador?" : "¿Liberar stock?"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{confirm.borrador.displayId}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              {confirm.tipo === "eliminar"
                ? confirm.borrador.stockReservado
                  ? "El stock reservado será liberado automáticamente. Esta acción no se puede deshacer."
                  : "Esta acción no se puede deshacer."
                : "Se liberarán las cantidades reservadas en inventario. El borrador se mantendrá sin reserva."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  confirm.tipo === "eliminar"
                    ? handleEliminar(confirm.borrador)
                    : handleLiberar(confirm.borrador)
                }
                disabled={procesando === confirm.borrador.id}
                className={`flex-1 px-4 py-2 text-sm text-white rounded-lg font-medium flex items-center justify-center gap-2 ${
                  confirm.tipo === "eliminar"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-500 hover:bg-orange-600"
                } disabled:opacity-60`}
              >
                {procesando === confirm.borrador.id ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : confirm.tipo === "eliminar" ? (
                  "Sí, eliminar"
                ) : (
                  "Sí, liberar stock"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Borradores guardados</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {borradores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Inbox size={32} className="mb-3 opacity-50" />
              <p className="text-sm">No tienes borradores guardados</p>
            </div>
          ) : (
            borradores.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-medium text-gray-500">{b.displayId}</span>
                    {b.stockReservado ? (
                      <span
                        title="Los productos están reservados en inventario mientras el borrador esté activo"
                        className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium cursor-help"
                      >
                        Stock reservado
                      </span>
                    ) : (
                      <span
                        title="Sin reserva de stock — el inventario podría no estar disponible al retomar"
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full cursor-help"
                      >
                        Sin reserva
                      </span>
                    )}
                    {b.estadoCotizacion === "cotizado" && (
                      <span
                        title="El envío fue cotizado y tiene una tarifa de referencia disponible"
                        className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium cursor-help"
                      >
                        Cotizado
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{b.clienteNombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {b.fecha} · {b.productosCount} productos · {b.montoEstimado}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {b.stockReservado && (
                    <button
                      onClick={() => setConfirm({ tipo: "liberar", borrador: b })}
                      title="Liberar stock reservado — devuelve los productos al inventario disponible"
                      className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                    >
                      <Unlock size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirm({ tipo: "eliminar", borrador: b })}
                    title="Eliminar borrador — acción irreversible"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      onCargar(b);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Cargar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">{borradores.length} borrador(es) guardado(s)</p>
        </div>
      </div>
    </div>
  );
}
