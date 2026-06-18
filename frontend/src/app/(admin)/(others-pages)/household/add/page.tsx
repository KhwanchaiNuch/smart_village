"use client"
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Radio from '@/components/form/input/Radio';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Swal from "sweetalert2";
import { useVillage } from "@/context/VillageContext";

interface Province { provinceId: number; nameTh: string; }
interface Amphur   { amphurId: number; nameTh: string; provinceId: number; }
interface Tambon   { tambonId: number; nameTh: string; amphurId: number; zipcode: string | null; }
interface VillageOption  { villageId: number; villageName: string; moo: string | null; }

const DDL = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function HouseHoldAdd() {
  const router = useRouter();
  const { village: activeVillage } = useVillage();
  const [role, setRole] = useState<string | null>(null);
  const [scopeId, setScopeId] = useState<number | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphurs,   setAmphurs]   = useState<Amphur[]>([]);
  const [tambons,   setTambons]   = useState<Tambon[]>([]);
  const [villages,  setVillages]  = useState<VillageOption[]>([]);

  const [selProvince, setSelProvince] = useState<string>("");
  const [selAmphur,   setSelAmphur]   = useState<string>("");
  const [selTambon,   setSelTambon]   = useState<string>("");
  const [selVillage,  setSelVillage]  = useState<string>("");
  const [autoMoo,     setAutoMoo]     = useState<string>("");
  const [autoZipCode, setAutoZipCode] = useState<string>("");

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

  useEffect(() => {
    document.title = "Smart Village | House Hold Add";
    const r   = localStorage.getItem("role");
    const sid = localStorage.getItem("scopeId");
    setRole(r);
    const sidNum = sid && sid !== "null" && sid !== "" ? Number(sid) : null;
    setScopeId(sidNum);

    if (activeVillage) return;

    if (r === "ADMIN") {
      axios.get<Province[]>("/provinces").then(res => setProvinces(res.data)).catch(() => {});
    } else if (r === "PROVINCE" && sidNum) {
      axios.get<Amphur[]>(`/amphurs?provinceId=${sidNum}`).then(res => setAmphurs(res.data)).catch(() => {});
    } else if (r === "AMPHUR" && sidNum) {
      axios.get<Tambon[]>(`/tambons?amphurId=${sidNum}`).then(res => setTambons(res.data)).catch(() => {});
    } else if (r === "TAMBON" && sidNum) {
      axios.get<VillageOption[]>(`/villages?tambonId=${sidNum}`).then(res => setVillages(res.data)).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProvinceChange = (pid: string) => {
    setSelProvince(pid);
    setSelAmphur(""); setSelTambon(""); setSelVillage(""); setAutoMoo(""); setAutoZipCode("");
    setAmphurs([]); setTambons([]); setVillages([]);
    if (pid) axios.get<Amphur[]>(`/amphurs?provinceId=${pid}`).then(res => setAmphurs(res.data)).catch(() => {});
  };

  const onAmphurChange = (aid: string) => {
    setSelAmphur(aid);
    setSelTambon(""); setSelVillage(""); setAutoMoo(""); setAutoZipCode("");
    setTambons([]); setVillages([]);
    if (aid) axios.get<Tambon[]>(`/tambons?amphurId=${aid}`).then(res => setTambons(res.data)).catch(() => {});
  };

  const onTambonChange = (tid: string) => {
    setSelTambon(tid);
    setSelVillage(""); setAutoMoo("");
    setVillages([]);
    const t = tambons.find(t => String(t.tambonId) === tid);
    setAutoZipCode(t?.zipcode ?? "");
    if (tid) axios.get<VillageOption[]>(`/villages?tambonId=${tid}`).then(res => setVillages(res.data)).catch(() => {});
  };

  const onVillageChange = (vid: string) => {
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

  const handleRadioChange = (name: string, value: any) => {
    const rawValue = (value && value.target) ? value.target.value : value;
    const boolValue = rawValue === "true" || rawValue === true;
    setForm(prev => ({ ...prev, [name]: boolValue }));
  };

  const resolveVillageId = (): number | null => {
    if (activeVillage)         return activeVillage.villageId;
    if (role === "VILLAGE")    return scopeId;
    if (selVillage)            return Number(selVillage);
    return null;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const villageId = resolveVillageId();
      if (!villageId) {
        Swal.fire({ icon: "warning", title: "กรุณาเลือกหมู่บ้าน", text: "กรุณาระบุหมู่บ้านสำหรับครัวเรือนนี้" });
        return;
      }

      const householdPayload = {
        householdId: null,
        villageId,
        houseNo: form.house_no,
        moo: (activeVillage?.moo ?? autoMoo) || null,
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

  const renderLocationSection = () => {
    if (activeVillage) {
      return (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <div className="min-w-0">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">เพิ่มครัวเรือนใน</p>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {activeVillage.villageName}{activeVillage.moo ? ` หมู่ ${activeVillage.moo}` : ""}
            </p>
          </div>
        </div>
      );
    }

    if (role === "VILLAGE") {
      return scopeId ? (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-700 dark:text-green-400">
            ครัวเรือนนี้จะถูกบันทึกในหมู่บ้าน ID: <strong>{scopeId}</strong> (สิทธิ์ของบัญชีนี้)
          </p>
        </div>
      ) : null;
    }

    return (
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 space-y-3">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">เลือกที่ตั้งครัวเรือน</p>

        {role === "ADMIN" && (
          <div>
            <Label>จังหวัด <span className="text-red-500">*</span></Label>
            <select value={selProvince} onChange={e => onProvinceChange(e.target.value)} className={DDL}>
              <option value="">-- เลือกจังหวัด --</option>
              {provinces.map(p => <option key={p.provinceId} value={p.provinceId}>{p.nameTh}</option>)}
            </select>
          </div>
        )}

        {(role === "ADMIN" || role === "PROVINCE") && (
          <div>
            <Label>อำเภอ <span className="text-red-500">*</span></Label>
            <select value={selAmphur} onChange={e => onAmphurChange(e.target.value)} disabled={amphurs.length === 0} className={DDL}>
              <option value="">-- เลือกอำเภอ --</option>
              {amphurs.map(a => <option key={a.amphurId} value={a.amphurId}>{a.nameTh}</option>)}
            </select>
          </div>
        )}

        {(role === "ADMIN" || role === "PROVINCE" || role === "AMPHUR") && (
          <div>
            <Label>ตำบล <span className="text-red-500">*</span></Label>
            <select value={selTambon} onChange={e => onTambonChange(e.target.value)} disabled={tambons.length === 0} className={DDL}>
              <option value="">-- เลือกตำบล --</option>
              {tambons.map(t => <option key={t.tambonId} value={t.tambonId}>{t.nameTh}</option>)}
            </select>
          </div>
        )}

        {role !== "VILLAGE" && (
          <div>
            <Label>หมู่บ้าน <span className="text-red-500">*</span></Label>
            <select value={selVillage} onChange={e => onVillageChange(e.target.value)} disabled={villages.length === 0} className={DDL}>
              <option value="">-- เลือกหมู่บ้าน --</option>
              {villages.map(v => (
                <option key={v.villageId} value={v.villageId}>
                  {v.villageName}{v.moo ? ` (หมู่ ${v.moo})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {autoMoo && (
          <p className="text-xs text-blue-600 dark:text-blue-400">หมู่ที่: <strong>{autoMoo}</strong> (ดึงจากหมู่บ้านอัตโนมัติ)</p>
        )}
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

        {renderLocationSection()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>เลขที่บ้าน</Label>
            <Input name="house_no" value={form.house_no} onChange={handleChange} type="text" placeholder="เช่น 123/4" />
          </div>
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
                onChange={(val) => handleRadioChange("house_registration_status", val)}
                label="มี ( Yes )" />
              <Radio id="reg-no" name="house_registration_status" value="false"
                checked={form.house_registration_status === false}
                onChange={(val) => handleRadioChange("house_registration_status", val)}
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
                onChange={(val) => handleRadioChange("internet_access", val)}
                label="มี ( Yes )" />
              <Radio id="reg-no-internet" name="internet_access" value="false"
                checked={form.internet_access === false}
                onChange={(val) => handleRadioChange("internet_access", val)}
                label="ไม่มี ( No )" />
            </div>
          </ComponentCard>

          <ComponentCard title="มีไฟฟ้าหรือไม่">
            <div className="flex gap-6">
              <Radio id="reg-yes-electricity" name="electricity_access" value="true"
                checked={form.electricity_access === true}
                onChange={(val) => handleRadioChange("electricity_access", val)}
                label="มี ( Yes )" />
              <Radio id="reg-no-electricity" name="electricity_access" value="false"
                checked={form.electricity_access === false}
                onChange={(val) => handleRadioChange("electricity_access", val)}
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
  );
}
