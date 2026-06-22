/**
 * exportCsv — แปลง array of objects เป็น CSV แล้ว trigger download
 *
 * @param data     - ข้อมูลที่จะ export
 * @param columns  - คอลัมน์ที่จะใส่ใน CSV: { key, label, value? }
 * @param filename - ชื่อไฟล์ (ไม่ต้องใส่ .csv)
 */
export function exportCsv<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: string; label: string; value?: (row: T) => string }[],
  filename: string
) {
  const escape = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    // ถ้ามี comma, newline หรือ quote → wrap in quotes
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const header = columns.map((c) => escape(c.label)).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = c.value ? c.value(row) : (row[c.key] ?? "");
        return escape(val);
      })
      .join(",")
  );

  const csv = [header, ...rows].join("\n");
  // BOM สำหรับ Excel ให้อ่าน UTF-8 ถูกต้อง
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
