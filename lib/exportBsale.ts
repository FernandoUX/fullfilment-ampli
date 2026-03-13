export type ProductoBsale = {
  nombre: string;
  sku: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct?: number;
};

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
  const filas = productos.map((p) => [
    p.cantidad,
    p.sku ?? "",
    p.nombre,
    p.precioUnitario,
    p.descuentoPct ?? 0,
    19,
    "",
  ]);

  const csvRows = [
    BSALE_HEADERS.join(";"),
    ...filas.map((f) => f.join(";")),
  ];
  const csvContent = csvRows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const fecha = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const a = document.createElement("a");
  a.href = url;
  a.download = `Orden_B2B_${ordenId}_${fecha}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
