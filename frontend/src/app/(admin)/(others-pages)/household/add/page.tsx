"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Radio from '@/components/form/input/Radio';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import PermissionGuard from "@/components/common/PermissionGuard";

interface Province { provinceId: number; nameTh: string; }
interface Amphur   { amphurId: number; nameTh: string; provinceId: number; }
interface Tambon   { tambonId: number; nameTh: string; amphurId: number; zipcode: string | null; }
interface Village  { villageId: number; villageName: string; moo: string | null; }

const DDL = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function HouseHoldAdd() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [scopeId, setScopeId] = useState<number | null>(null);

  // cascade state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphurs,   setAmphurs]   = useState<Amphur[]>([]);
  const [tambons,   setTambons]   = useState<Tambon[]>([]);
  const [villages,  setVillages]  = useState<Village[]>([]);

  const [selProvince, setSelProvince] = useState<string>("");
  const [selAmphur,   setSelAmphur]   = useState<string>("");
  const [selTambon,   setSelTambon]   = useState<string>("");
  const [selVillage,  setSelVillage]  = useState<string>("");
  const [autoMoo,     setAutoMoo]     = useState<string>("");   // auto-filled from village
  const [autoZipCode, setAutoZipCode] = useState<string>("");  // auto-filled from tambon

  const [form, setForm] = useState({
    house_no: "",
    house_registration_status: true,
    house_registration_type: "",
    gps_lat: "",
    gps_lng: "",
    house_condition: "",
    water_system: "",
    internet_access: true,
    electricity_access: true,
    remark: "",
  });
  const [loading, setLoading] = useState(false);

  // ── initial load ──────────────────────────────────────────────────────
  useEffect(() => {
    document.title = "Smart Village | House Hold Add";
    const r   = localStorage.getItem("role");
    const sid = localStorage.getItem("scopeId");
    setRole(r);
    const sidNum = sid && sid !== "null" && sid !== "" ? Number(sid) : null;
    setScopeId(sidNum);

    if (r === "ADMIN") {
      // ADMIN: load all provinces
      axios.get<Province[]>("/provinces").then(res => setProvinces(res.data)).catch(() => {});
    } else if (r === "PROVINCE" && sidNum) {
      // PROVINCE: pre-load amphurs for their province
      axios.get<Amphur[]>(`/amphurs?provinceId=${sidNum}`).then(res => setAmphurs(res.data)).catch(() => {});
    } else if (r === "AMPHUR" && sidNum) {
      // AMPHUR: pre-load tambons for their amphur
      axios.get<Tambon[]>(`/tambons?amphurId=${sidNum}`).then(res => setTambons(res.data)).catch(() => {});
    } else if (r === "TAMBON" && sidNum) {
      // TAMBON: pre-load villages for their tambon
      axios.get<Village[]>(`/villages?tambonId=${sidNum}`).then(res => setVillages(res.data)).catch(() => {});
    }
  }, []);

  // ── cascade handlers ──────────────────────────────────────────────────
  const onProvinceChange = (pid: string) => {
    setSelProvince(pid);
    setSelAmphur(""); setSelTambon(""); setSelVillage(""); setAutoMoo(""); setAutoZipCode("");
    setAmphurs([]); setTambons([]); setVillages([]);
    if (pid) {
      axios.get<Amphur[]>(`/amphurs?provinceId=${pid}`).then(res => setAmphurs(res.data)).catch(() => {});
    }
  };

  const onAmphurChange = (aid: string) => {
    setSelAmphur(aid);
    setSelTambon(""); setSelVillage(""); setAutoMoo(""); setAutoZipCode("");
    setTambons([]); setVillages([]);
    if (aid) {
      axios.get<Tambon[]>(`/tambons?amphurId=${aid}`).then(res => setTambons(res.data)).catch(() => {});
    }
  };

  const onTambonChange = (tid: string) => {
    setSelTambon(tid);
    setSelVillage(""); setAutoMoo("");
    setVillages([]);
    const t = tambons.find(t => String(t.tambonId) === tid);
    setAutoZipCode(t?.zipcode ?? "");
    if (tid) {
      axios.get<Village[]>(`/villages?tambonId=${tid}`).then(res => setVillages(res.data)).catch(() => {});
    }
  };

  const onVillageChange = (vid: string) => {
    setSelVillage(vid);
    const v = villages.find(v => String(v.villageId) === vid);
    setAutoMoo(v?.moo ?? "");
  };

  // ── สำหรับ TAMBON ที่ load villages ล่วงหน้าแล้ว ─────────────────────
  const onTambonVillageChange = (vid: string) => {
    setSelVillage(vid);
    const v = villages.find(v => String(v.villageId) === vid);
    setAutoMoo(v?.moo ?? "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (value: string) => {
    setForm(prev => ({ ...prev, remark: value }));
  };

  // ── validate + submit ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // non-VILLAGE ต้องเลือก village
      if (role !== "VILLAGE" && !selVillage) {
        Swal.fire({ icon: "warning", title: "กรุณาเลือกหมู่บ้าน", text: "กรุณาระบุหมู่บ้านสำหรับครัวเรือนนี้" });
        return;
      }

      const householdPayload = {
        householdId: null,
        villageId: role !== "VILLAGE" ? Number(selVillage) : scopeId,
        houseNo: form.house_no,
        moo: autoMoo || null,
        houseRegistrationStatus: form.house_registration_status,
        houseRegistrationType: form.house_registration_type,
        gpsLat: form.gps_lat ? parseFloat(form.gps_lat) : null,
        gpsLng: form.gps_lng ? parseFloat(form.gps_lng) : null,
        houseCondition: form.house_condition,
        waterSystem: form.water_system,
        internetAccess: form.internet_access,
        electricityAccess: form.electricity_access,
        remark: form.remark,
      };

      await axios.post(`/households/add`, householdPayload);

      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "เพิ่มข้อมูลครัวเรือนเรียบร้อยแล้ว",
        timer: 1800,
        showConfirmButton: false,
      });
      router.push("/household");
    } catch (err: any) {
      console.error("บันทึกครัวเรือนล้มเหลว:", err);
      Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: err?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── helpers ───────────────────────────────────────────────────────────
  const renderCascade = () => {
    if (role === "VILLAGE") {
      // VILLAGE: แสดง banner เท่านั้น
      return scopeId ? (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-700 dark:text-green-400">
            ครัวเรือนนี้จะถูกบันทึกในหมู่บ้าน ID: <strong>{scopeId}</strong> (สิทธิ์ของบัญชีนี้)
          </p>
        </div>
      ) : null;
    }

    return (
      <PermissionGuard menuUrl="/household" action="add">
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 space-y-3">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">เลือกที่ตั้งครัวเรือน</p>

        {/* Province — ADMIN only */}
        {role === "ADMIN" && (
          <div>
            <Label>จังหวัด <span className="text-red-500">*</span></Label>
            <select value={selProvince} onChange={e => onProvinceChange(e.target.value)} className={DDL}>
              <option value="">-- เลือกจังหวัด --</option>
              {provinces.map(p => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
            </select>
          </div>
        )}

        {/* Amphur — ADMIN + PROVINCE */}
        {(role === "ADMIN" || role === "PROVINCE") && (
          <div>
            <Label>อำเภอ <span className="text-red-500">*</span></Label>
            <select
              value={selAmphur}
              onChange={e => onAmphurChange(e.target.value)}
              disabled={amphurs.length === 0}
              className={DDL}
            >
              <option value="">-- เลือกอำเภอ --</option>
              {amphurs.map(a => <option key={a.amphurId} value={a.amphurId}>{a.nameTh}</option>)}
            </select>
          </div>
        )}

        {/* Tambon — ADMIN + PROVINCE + AMPHUR */}
        {(role === "ADMIN" || role === "PROVINCE" || role === "AMPHUR") && (
          <div>
            <Label>ตำบล <span className="text-red-500">*</span></Label>
            <select
              value={selTambon}
              onChange={e => onTambonChange(e.target.value)}
              disabled={tambons.length === 0}
              className={DDL}
            >
              <option value="">-- เลือกตำบล --</option>
              {tambons.map(t => <option key={t.tambonId} value={t.tambonId}>{t.nameTh}</option>)}
            </select>
          </div>
        )}

        {/* Village — all non-VILLAGE */}
        <div>
          <Label>หมู่บ้าน <span className="text-red-500">*</span></Label>
          <select
            value={selVillage}
            onChange={e => role === "TAMBON" ? onTambonVillageChange(e.target.value) : onVillageChange(e.target.value)}
            disabled={villages.length === 0}
            className={DDL}
          >
            <option value="">-- เลือกหมู่บ้าน --</option>
            {villages.map(v => (
              <option key={v.villageId} value={v.villageId}>
                {v.villageName}{v.moo ? ` (หมู่ ${v.moo})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* หมู่ที่ auto-fill */}
        {autoMoo && (
          <p className="text-xs text-blue-600 dark:text-blue-400">หมู่ที่: <strong>{autoMoo}</strong> (ดึงจากหมู่บ้านอัตโนมัติ)</p>
        )}

        {/* รหัสไปรษณีย์ auto-fill จากตำบล */}
        {autoZipCode && (
          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2">
            <span>📮</span>
            <span>รหัสไปรษณีย์: <strong className="text-base">{autoZipCode}</strong> (ดึงจากตำบลที่เลือกอัตโนมัติ)</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ComponentCard title="รหัสครัวเรือน ( HouseHold )">

        {/* Cascade location selection */}
        {renderCascade()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>เลขที่บ้าน</Label>
            <Input name="house_no" value={form.house_no} onChange={handleChange} type="text" placeholder="เช่น 123/4" />
          </div>
          {/* หมู่ที่ถูกลบออก — auto-fill จากหมู่บ้านที่เลือก */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>สภาพบ้าน (ดี/ปานกลาง/ทรุดโทรม)</Label>
            <Input name="house_condition" value={form.house_condition} onChange={handleChange} type="text" placeholder="เช่น ดี, ปานกลาง, ทรุดโทรม" />
          </div>
          <div>
            <Label>ประเภททะเบียนบ้าน/ลักษณะการอยู่อาศัย (ท.ร.14/หอพัก/เช่า ฯลฯ)</Label>
            <Input name="house_registration_type" value={form.house_registration_type} onChange={handleChange} type="text" placeholder="เช่น ท.ร.14, หอพัก, เช่า" />
          </div>
          <div>
            <Label>แหล่งน้ำใช้ (ประปา/บ่อบาดาล/น้ำฝน ฯลฯ)</Label>
            <Input name="water_system" value={form.water_system} onChange={handleChange} type="text" placeholder="เช่น ประปา, บ่อบาดาล, น้ำฝน" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentCard title="มีชื่ออยู่ทะเบียนบ้านในหมู่บ้านหรือไม่">
            <div className="flex gap-6">
              <Radio id="reg-yes" name="house_registration_status" value="true"
                checked={form.house_registration_status === true}
                onChange={(value) => setForm(prev => ({ ...prev, house_registration_status: value === "true" }))}
                label="มี ( Yes )" />
              <Radio id="reg-no" name="house_registration_status" value="false"
                checked={form.house_registration_status === false}
                onChange={(value) => setForm(prev => ({ ...prev, house_registration_status: value === "true" }))}
                label="ไม่มี ( No )" />
            </div>
          </ComponentCard>

          <ComponentCard title="พิกัดบ้าน (ทำแผนที่/ลงพื้นที่)">
            <div className="flex gap-6">
              <div className="w-full">
                <Label>พิกัดละติจูดบ้าน</Label>
                <Input className="w-full" name="gps_lat" value={form.gps_lat} onChange={handleChange} placeholder="เช่น 15.870032" />
              </div>
              <div className="w-full">
                <Label>พิกัดลองจิจูดบ้าน</Label>
                <Input className="w-full" name="gps_lng" value={form.gps_lng} onChange={handleChange} type="text" placeholder="เช่น 100.992541" />
              </div>
            </div>
          </ComponentCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentCard title="มีอินเทอร์เน็ตหรือไม่">
            <div className="flex gap-6">
              <Radio id="reg-yes-internet" name="internet_access" value="true"
                checked={form.internet_access === true}
                onChange={(value) => setForm(prev => ({ ...prev, internet_access: value === "true" }))}
                label="มี ( Yes )" />
              <Radio id="reg-no-internet" name="internet_access" value="false"
                checked={form.internet_access === false}
                onChange={(value) => setForm(prev => ({ ...prev, internet_access: value === "true" }))}
                label="ไม่มี ( No )" />
            </div>
          </ComponentCard>

          <ComponentCard title="มีไฟฟ้าหรือไม่">
            <div className="flex gap-6">
              <Radio id="reg-yes-electricity" name="electricity_access" value="true"
                checked={form.electricity_access === true}
                onChange={(value) => setForm(prev => ({ ...prev, electricity_access: value === "true" }))}
                label="มี ( Yes )" />
              <Radio id="reg-no-electricity" name="electricity_access" value="false"
                checked={form.electricity_access === false}
                onChange={(value) => setForm(prev => ({ ...prev, electricity_access: value === "true" }))}
                label="ไม่มี ( No )" />
            </div>
          </ComponentCard>
        </div>

        <div>
          <Label>หมายเหตุ</Label>
          <TextArea value={form.remark} onChange={handleTextAreaChange} rows={3} placeholder="ข้อมูลเพิ่มเติม..." />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </ComponentCard>
    </>
  </PermissionGuard>
  );
}
