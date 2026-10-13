"use client"
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import PermissionGuard from "@/components/common/PermissionGuard";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";

interface PendingHousehold {
  householdId: number;
  houseNo: string | null;
  moo: string | null;
  previousReading: number;
}

interface RowState {
  householdId: number;
  houseNo: string | null;
  moo: string | null;
  previousReading: number;
  currentReading: string;
  meterNo: string;
  include: boolean;
}

interface BulkResultItem {
  householdId: number;
  success: boolean;
  message?: string;
}

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function WaterBillBulkAdd() {
  const router = useRouter();
  const { village, loaded } = useVillage();
  const [period, setPeriod] = useState(currentPeriod());
  const [rows, setRows] = useState<RowState[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPending = useCallback(async (p: string) => {
    if (!loaded) return;
    setLoading(true);
    try {
      const vid = village?.villageId;
      const params: Record<string, string | number> = { period: p };
      if (vid) params.villageId = vid;
      const res = await axios.get<PendingHousehold[]>("/water-bills/pending", { params });
      setRows(res.data.map((h) => ({
        householdId: h.householdId,
        houseNo: h.houseNo,
        moo: h.moo,
        previousReading: h.previousReading,
        currentReading: "",
        meterNo: "",
        include: false,
      })));
    } catch {
      Swal.fire({ icon: "error", title: "โหลดรายชื่อครัวเรือนไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  }, [loaded, village]);

  useEffect(() => {
    document.title = "หมู่บ้านดิจิตอล | ออกบิลค่าน้ำทั้งหมู่บ้าน";
    fetchPending(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPending]);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    fetchPending(p);
  };

  const updateRow = (householdId: number, patch: Partial<RowState>) => {
    setRows((prev) => prev.map((r) => (r.householdId === householdId ? { ...r, ...patch } : r)));
  };

  const handleSubmit = async () => {
    const toSubmit = rows.filter((r) => r.include && r.currentReading !== "");
    if (toSubmit.length === 0) {
      Swal.fire({ icon: "warning", title: "กรุณาเลือกและกรอกเลขมิเตอร์อย่างน้อย 1 ครัวเรือน" });
      return;
    }
    const invalid = toSubmit.find((r) => parseFloat(r.currentReading) < r.previousReading);
    if (invalid) {
      Swal.fire({ icon: "warning", title: "เลขมิเตอร์ไม่ถูกต้อง", text: `บ้านเลขที่ ${invalid.houseNo || "-"} เลขมิเตอร์ปัจจุบันน้อยกว่าครั้งก่อน` });
      return;
    }
    setSaving(true);
    try {
      const payload = toSubmit.map((r) => ({
        householdId: r.householdId,
        billingPeriod: `${period}-01`,
        currentReading: parseFloat(r.currentReading),
        meterNo: r.meterNo || null,
      }));
      const res = await axios.post<BulkResultItem[]>("/water-bills/add-bulk", payload);
      const successCount = res.data.filter((r) => r.success).length;
      const failed = res.data.filter((r) => !r.success);
      if (failed.length === 0) {
        await Swal.fire({ icon: "success", title: `ออกบิลสำเร็จ ${successCount} รายการ`, timer: 2000, showConfirmButton: false });
        router.push("/waterbilling");
      } else {
        const failList = failed.map((f) => {
          const row = rows.find((r) => r.householdId === f.householdId);
          return `บ้านเลขที่ ${row?.houseNo || f.householdId}: ${f.message || "เกิดข้อผิดพลาด"}`;
        }).join("<br/>");
        await Swal.fire({
          icon: "warning",
          title: `สำเร็จ ${successCount} รายการ, ไม่สำเร็จ ${failed.length} รายการ`,
          html: failList,
        });
        fetchPending(period);
      }
    } catch {
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  };

  const includedCount = rows.filter((r) => r.include && r.currentReading !== "").length;
  const inputClass = "w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500";

  return (
    <PermissionGuard menuUrl="/waterbilling" action="add">
      <ComponentCard title="ออกบิลค่าน้ำทั้งหมู่บ้าน">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Label>งวดเดือน</Label>
            <input type="month" value={period} onChange={(e) => handlePeriodChange(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">เลือกและกรอกเลขมิเตอร์ปัจจุบันเฉพาะบ้านที่จะออกบิลรอบนี้ ({includedCount} รายการที่จะบันทึก)</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">กำลังโหลด...</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-400 text-sm">ไม่มีครัวเรือนที่รอออกบิลในงวดนี้ (อาจออกบิลครบแล้วทุกบ้าน)</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                  <th className="py-2 px-2"></th>
                  <th className="py-2 px-2">บ้านเลขที่</th>
                  <th className="py-2 px-2">หมู่</th>
                  <th className="py-2 px-2 text-right">เลขมิเตอร์ครั้งก่อน</th>
                  <th className="py-2 px-2">เลขมิเตอร์ปัจจุบัน</th>
                  <th className="py-2 px-2">เลขที่มิเตอร์</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.householdId} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2">
                      <input type="checkbox" checked={r.include} onChange={(e) => updateRow(r.householdId, { include: e.target.checked })} />
                    </td>
                    <td className="py-2 px-2">{r.houseNo || "-"}</td>
                    <td className="py-2 px-2">{r.moo || "-"}</td>
                    <td className="py-2 px-2 text-right">{r.previousReading.toLocaleString("th-TH")}</td>
                    <td className="py-2 px-2">
                      <input type="number" step="0.01" value={r.currentReading} className={inputClass}
                        onChange={(e) => updateRow(r.householdId, { currentReading: e.target.value, include: e.target.value !== "" ? true : r.include })} />
                    </td>
                    <td className="py-2 px-2">
                      <input value={r.meterNo} className={inputClass} onChange={(e) => updateRow(r.householdId, { meterNo: e.target.value })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => router.push("/waterbilling")} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
            ยกเลิก
          </button>
          <button onClick={handleSubmit} disabled={saving || includedCount === 0} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "กำลังบันทึก..." : `บันทึกและออกบิล (${includedCount} รายการ)`}
          </button>
        </div>
      </ComponentCard>
    </PermissionGuard>
  );
}
