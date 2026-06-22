"use client";
import React, { useMemo, useState, useId } from "react";
import { exportCsv } from "@/lib/exportCsv";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DtColumn<T> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  /** ปิด sort สำหรับคอลัมน์นี้ (default: true ถ้ามี key) */
  sortable?: boolean;
  /** text ที่ใช้ค้นหา (ถ้าไม่ระบุจะใช้ row[key]) */
  searchText?: (row: T) => string;
  /** text ที่ export เป็น CSV (ถ้าไม่ระบุจะใช้ row[key]) */
  exportText?: (row: T) => string;
  /** custom cell renderer */
  render?: (row: T) => React.ReactNode;
  /** ไม่ export คอลัมน์นี้ */
  noExport?: boolean;
  /** ส่งออกคอลัมน์นี้ใน CSV เท่านั้น (ไม่แสดงบนตารางหน้าเว็บ) */
  onlyExport?: boolean;
}

export interface DataTableWrapperProps<T extends Record<string, unknown>> {
  /** ข้อมูลดิบ (pre-filtered จาก parent ถ้ามี extra filter) */
  data: T[];
  columns: DtColumn<T>[];
  /** field ที่เป็น primary key */
  idKey: keyof T;
  // ── Toolbar ──
  addUrl?: string;
  canAdd?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  /** callback เมื่อกด Delete — รับ array ของ selected ids */
  onDeleteSelected?: (ids: (string | number)[]) => void;
  exportFilename?: string;
  /** JSX เพิ่มเติมใน toolbar (เช่น filter dropdown) */
  toolbarExtra?: React.ReactNode;
  // ── Options ──
  loading?: boolean;
  emptyText?: string;
  /** double click row → navigate */
  onRowDoubleClick?: (row: T) => void;
}

const PAGE_SIZES = [10, 25, 50, 100];

// ── Component ──────────────────────────────────────────────────────────────

export default function DataTableWrapper<T extends Record<string, unknown>>({
  data,
  columns,
  idKey,
  addUrl,
  canAdd = false,
  canDelete = false,
  canExport = false,
  onDeleteSelected,
  exportFilename = "export",
  toolbarExtra,
  loading = false,
  emptyText = "ไม่พบข้อมูล",
  onRowDoubleClick,
}: DataTableWrapperProps<T>) {
  const uid = useId();
  const [search, setSearch]       = useState("");
  const [pageSize, setPageSize]   = useState(10);
  const [page, setPage]           = useState(1);
  const [sortKey, setSortKey]     = useState<string | null>(null);
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("asc");
  const [selected, setSelected]   = useState<Set<string | number>>(new Set());

  // ── Search & Sort ──
  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();

    let filtered = data;
    if (q) {
      filtered = data.filter((row) =>
        columns.filter((c) => !c.onlyExport).some((col) => {
          const txt = col.searchText
            ? col.searchText(row)
            : String(row[col.key] ?? "");
          return txt.toLowerCase().includes(q);
        })
      );
    }

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      filtered = [...filtered].sort((a, b) => {
        const av = col?.searchText ? col.searchText(a) : String(a[sortKey] ?? "");
        const bv = col?.searchText ? col.searchText(b) : String(b[sortKey] ?? "");
        const cmp = av.localeCompare(bv, "th", { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return filtered;
  }, [data, search, sortKey, sortDir, columns]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageData   = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  // reset to page 1 when search/sort changes
  React.useEffect(() => { setPage(1); }, [search, sortKey, sortDir, pageSize]);

  // ── Selection ──
  const allPageIds   = pageData.map((r) => r[idKey] as string | number);
  const isAllPage    = allPageIds.length > 0 && allPageIds.every((id) => selected.has(id));
  const isIndeterminate = !isAllPage && allPageIds.some((id) => selected.has(id));

  const toggleAll = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      allPageIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const toggleOne = (id: string | number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  // ── Sort toggle ──
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // ── Delete ──
  const handleDelete = () => {
    if (selected.size === 0) return;
    onDeleteSelected?.([...selected]);
    setSelected(new Set());
  };

  // ── Export ──
  const handleExport = () => {
    const exportCols = columns
      .filter((c) => !c.noExport)
      .map((c) => ({
        key: c.key,
        label: c.label,
        value: c.exportText ? (row: T) => c.exportText!(row) : (row: T) => String(row[c.key] ?? ""),
      }));
    exportCsv(processed, exportCols, exportFilename);
  };

  // ── Page numbers ──
  const pageNumbers = useMemo(() => {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("…");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  // ── Align helper ──
  const alignClass = (align?: string) =>
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  // ── Render ──
  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {/* Left: Add / Delete / Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {canAdd && addUrl && (
            <a
              href={addUrl}
              className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add
            </a>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={selected.size === 0 || loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              ลบที่เลือก{selected.size > 0 ? ` (${selected.size})` : ""}
            </button>
          )}
          {canExport && (
            <button
              onClick={handleExport}
              disabled={processed.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </button>
          )}
          {/* Extra toolbar slots (e.g. filter dropdowns) */}
          {toolbarExtra}
        </div>

        {/* Right: page size + search */}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <span>แสดง</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span>รายการ</span>
          </div>
          <input
            id={`${uid}-search`}
            type="text"
            placeholder="ค้นหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-48 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                {canDelete && (
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllPage}
                      ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </th>
                )}
                {columns.filter((col) => !col.onlyExport).map((col) => {
                  const isSorted = sortKey === col.key;
                  const sortable = col.sortable !== false;
                  return (
                    <th
                      key={col.key}
                      onClick={() => sortable && handleSort(col.key)}
                      className={`px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide whitespace-nowrap select-none ${alignClass(col.align)} ${sortable ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" : ""}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortable && (
                          <span className="text-gray-300 dark:text-gray-600">
                            {isSorted ? (sortDir === "asc" ? " ▲" : " ▼") : " ⇅"}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={columns.filter((c) => !c.onlyExport).length + (canDelete ? 1 : 0)} className="py-10 text-center text-gray-400">
                    <span className="inline-block animate-spin mr-2">⏳</span> กำลังโหลด...
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter((c) => !c.onlyExport).length + (canDelete ? 1 : 0)} className="py-10 text-center text-gray-400">
                    {emptyText}
                  </td>
                </tr>
              ) : (
                pageData.map((row) => {
                  const id = row[idKey] as string | number;
                  const isSelected = selected.has(id);
                  return (
                    <tr
                      key={String(id)}
                      onDoubleClick={() => onRowDoubleClick?.(row)}
                      className={`transition-colors ${onRowDoubleClick ? "cursor-pointer" : ""} ${isSelected ? "bg-red-50 dark:bg-red-500/10" : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"}`}
                    >
                      {canDelete && (
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleOne(id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.filter((col) => !col.onlyExport).map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-gray-600 dark:text-gray-400 text-sm ${alignClass(col.align)}`}
                        >
                          {col.render ? col.render(row) : String(row[col.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination Footer ── */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>
          แสดง {processed.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, processed.length)} จาก {processed.length} รายการ
          {search && ` (กรองจาก ${data.length} ทั้งหมด)`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={safePage === 1}
            className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >«</button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >‹</button>
          {pageNumbers.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p as number)}
                className={`px-3 py-1 rounded border transition-colors ${safePage === p ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >›</button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={safePage === totalPages}
            className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >»</button>
        </div>
      </div>
    </div>
  );
}
