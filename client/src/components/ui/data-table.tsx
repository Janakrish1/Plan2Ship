import { cn } from "@/lib/utils";

export interface DataTableColumn {
  key: string;
  label: string;
  /** Emphasize this column (e.g. first column as "title") */
  highlight?: boolean;
}

interface DataTableProps {
  /** Column definitions: key used for row object lookup, label for header */
  columns: DataTableColumn[];
  /** Each row is an object keyed by column key */
  rows: Record<string, string | undefined>[];
  className?: string;
}

export function DataTable({ columns, rows, className }: DataTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10 bg-card/30 shadow-lg shadow-black/5",
        "ring-1 ring-white/5",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-primary/25 via-primary/10 to-transparent">
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/95",
                    i === 0 && "rounded-tl-xl pl-5",
                    i === columns.length - 1 && "rounded-tr-xl pr-5"
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">{col.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "group transition-all duration-200",
                  rowIndex % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent",
                  "hover:bg-white/10"
                )}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 align-top transition-colors duration-200",
                      colIndex === 0 && "pl-5 border-l-2 border-l-transparent group-hover:border-l-primary/60",
                      colIndex === columns.length - 1 && "pr-5",
                      col.highlight !== false && colIndex === 0
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="block">{row[col.key] ?? "—"}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Simple variant: headers + array of row arrays (for backward compatibility) */
interface SimpleDataTableProps {
  headers: string[];
  rows: (string | undefined)[][];
  className?: string;
}

export function SimpleDataTable({ headers, rows, className }: SimpleDataTableProps) {
  const columns: DataTableColumn[] = headers.map((label, i) => ({
    key: `col_${i}`,
    label,
    highlight: i === 0,
  }));
  const objectRows: Record<string, string | undefined>[] = rows.map((row) =>
    headers.reduce(
      (acc, _, j) => ({ ...acc, [`col_${j}`]: row[j] }),
      {} as Record<string, string | undefined>
    )
  );
  return <DataTable columns={columns} rows={objectRows} className={className} />;
}
