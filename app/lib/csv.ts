/**
 * Utilitaires CSV — génération côté navigateur à partir de données RÉELLES reçues de l'API.
 *
 * Échappement RFC 4180 avec séparateur `;` (convention FR/Excel) :
 * - tout champ contenant `;`, `"` ou un retour ligne est entouré de guillemets ;
 * - les guillemets internes sont doublés ;
 * - préfixe BOM UTF-8 pour une ouverture correcte dans Excel.
 */

export function csvEscapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text =
    typeof value === "string"
      ? value
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  const escaped = text.replace(/"/g, '""');
  return /[;"\r\n]/.test(text) ? `"${escaped}"` : escaped;
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(csvEscapeCell).join(";"),
    ...rows.map((row) => row.map(csvEscapeCell).join(";")),
  ];
  return "\uFEFF" + lines.join("\r\n");
}

export function downloadCsv(filename: string, headers: string[], rows: unknown[][]): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([buildCsv(headers, rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
