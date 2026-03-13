import * as XLSX from "xlsx";

export type ProductoBsale = {
  nombre: string;
  sku: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct?: number;
};

// 7 columnas exactas del formato oficial Bsale
const BSALE_HEADERS = [
  "Cantidad",
  "Código",
  "Glosa",
  "Valor Unitario",
  "% Descuento",
  "Impuesto",
  "Costo Neto Glosa",
];

export function exportarBsale(
  productos: ProductoBsale[],
  ordenId: string
): void {
  const filas = productos.map((p) => ({
    Cantidad: p.cantidad,
    Código: p.sku || "",
    Glosa: p.sku ? p.nombre : p.nombre, // Si no hay SKU, glosa = nombre
    "Valor Unitario": p.precioUnitario,
    "% Descuento": p.descuentoPct ?? 0,
    Impuesto: 19, // IVA Chile
    "Costo Neto Glosa": "",
  }));

  const ws = XLSX.utils.json_to_sheet(filas, { header: BSALE_HEADERS });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Productos");

  const fecha = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const fileName = `Orden_B2B_${ordenId}_${fecha}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
