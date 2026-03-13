"use client";

import { useState } from "react";
import { X, BookmarkCheck } from "lucide-react";

const VALIDEZ_OPTIONS = [3, 7, 14, 30] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (opts: { nombre: string; validezDias: number; reservarStock: boolean }) => void;
  productosCount: number;
  totalEstimado: string;
  clienteNombre: string;
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
        checked ? "bg-indigo-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function GuardarBorradorModal({
  open,
  onClose,
  onConfirm,
  productosCount,
  totalEstimado,
  clienteNombre,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [validezDias, setValidezDias] = useState<number>(7);
  const [reservarStock, setReservarStock] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const fechaVencimiento = (() => {
    const d = new Date();
    d.setDate(d.getDate() + validezDias);
    return d
      .toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })
      .replace(/\//g, "-");
  })();

  const handleConfirm = async () => {
    setGuardando(true);
    await new Promise((r) => setTimeout(r, 800));
    onConfirm({
      nombre: nombre.trim() || `Borrador ${new Date().toLocaleDateString("es-CL")}`,
      validezDias,
      reservarStock,
    });
    setGuardando(false);
    setNombre("");
    setValidezDias(7);
    setReservarStock(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <BookmarkCheck size={18} className="text-indigo-600" />
              <h2 className="text-base font-semibold text-gray-800">Guardar como Borrador</h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 ml-7">
              El borrador quedará disponible en tu lista de cotizaciones
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0 mt-0.5">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Nombre del borrador */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Nombre del Borrador <span className="text-red-500">*</span>
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Reposición Q2 Distribuidora Conosur"
              className="w-full bg-white text-neutral-700 placeholder:text-neutral-500 border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400"
            />
          </div>

          {/* Validez */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">Validez del Borrador</label>
              <span className="text-xs text-neutral-500">Vence el {fechaVencimiento}</span>
            </div>
            <div className="flex gap-2">
              {VALIDEZ_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setValidezDias(d)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    validezDias === d
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {d} días
                </button>
              ))}
            </div>
          </div>

          {/* Toggle reservar stock */}
          <div className="flex items-start justify-between gap-4 py-3 px-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-800">Reservar stock al guardar</p>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                Los productos quedarán reservados y no estarán disponibles para otros pedidos mientras el borrador esté activo.
              </p>
            </div>
            <Toggle checked={reservarStock} onChange={setReservarStock} />
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
              <span>Productos</span>
              <span className="font-medium text-gray-800">{productosCount} ítem(s)</span>
            </div>
            {clienteNombre && (
              <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                <span>Cliente</span>
                <span className="font-medium text-gray-800 truncate ml-4 max-w-[180px] text-right">
                  {clienteNombre}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-1.5 border-t border-gray-200">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="font-bold text-gray-900">{totalEstimado}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={guardando}
            className="flex-1 px-4 py-2.5 text-sm bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Borrador"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
