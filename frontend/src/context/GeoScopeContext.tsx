"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "@/lib/axios";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
export interface GeoProvince { provinceId: number; nameTh: string }
export interface GeoAmphur   { amphurId: number;   provinceId: number; nameTh: string }
export interface GeoTambon   { tambonId: number;   amphurId: number;   nameTh: string }
export interface GeoVillage  { villageId: number;  tambonId: number;   villageName: string; moo: string | null }

interface GeoScopeContextValue {
  role: string | null;

  // ──── lists ────
  provinces: GeoProvince[];
  amphurs:   GeoAmphur[];
  tambons:   GeoTambon[];
  villages:  GeoVillage[];

  // ──── selected ────
  selectedProvince: GeoProvince | null;
  selectedAmphur:   GeoAmphur   | null;
  selectedTambon:   GeoTambon   | null;
  selectedVillage:  GeoVillage  | null;

  // ──── setters (cascade-clear) ────
  setSelectedProvince: (p: GeoProvince | null) => void;
  setSelectedAmphur:   (a: GeoAmphur   | null) => void;
  setSelectedTambon:   (t: GeoTambon   | null) => void;
  setSelectedVillage:  (v: GeoVillage  | null) => void;

  /** villageId ที่ควรส่งเป็น filter (null = ไม่กรอง) */
  activeVillageId: number | null;
  /** tambonId ที่ควรใช้กรอง (เฉพาะ TAMBON role ที่ยังไม่เลือก village) */
  activeTambonId:  number | null;
  /** amphurId ที่ควรใช้กรอง */
  activeAmphurId:  number | null;
  /** provinceId ที่ควรใช้กรอง */
  activeProvinceId: number | null;
}

const GeoScopeContext = createContext<GeoScopeContextValue>({
  role: null,
  provinces: [], amphurs: [], tambons: [], villages: [],
  selectedProvince: null, selectedAmphur: null, selectedTambon: null, selectedVillage: null,
  setSelectedProvince: () => {}, setSelectedAmphur: () => {},
  setSelectedTambon: () => {},   setSelectedVillage: () => {},
  activeVillageId: null, activeTambonId: null, activeAmphurId: null, activeProvinceId: null,
});

const STORAGE_KEY = "geoScope";

function loadCache() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveCache(data: object) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export const GeoScopeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [scopeId, setScopeId] = useState<number | null>(null);

  const [provinces, setProvinces] = useState<GeoProvince[]>([]);
  const [amphurs,   setAmphurs]   = useState<GeoAmphur[]>([]);
  const [tambons,   setTambons]   = useState<GeoTambon[]>([]);
  const [villages,  setVillages]  = useState<GeoVillage[]>([]);

  const [selectedProvince, setSelectedProvinceState] = useState<GeoProvince | null>(null);
  const [selectedAmphur,   setSelectedAmphurState]   = useState<GeoAmphur   | null>(null);
  const [selectedTambon,   setSelectedTambonState]   = useState<GeoTambon   | null>(null);
  const [selectedVillage,  setSelectedVillageState]  = useState<GeoVillage  | null>(null);

  // ──── init role + scopeId ────
  useEffect(() => {
    const r = localStorage.getItem("role");
    const s = localStorage.getItem("scopeId");
    setRole(r);
    setScopeId(s ? Number(s) : null);
  }, []);

  // ──── load provinces (always needed for ADMIN / PROVINCE) ────
  useEffect(() => {
    if (!role) return;
    if (role === "VILLAGE") return; // VILLAGE ไม่ต้องโหลด geo list
    axios.get<GeoProvince[]>("/provinces").then(r => setProvinces(r.data)).catch(() => {});
  }, [role]);

  // ──── auto-init from scopeId + cache ────
  useEffect(() => {
    if (!role || !scopeId) return;

    const cache = loadCache();

    const initFromCache = () => {
      if (cache.province) setSelectedProvinceState(cache.province);
      if (cache.amphur)   setSelectedAmphurState(cache.amphur);
      if (cache.tambon)   setSelectedTambonState(cache.tambon);
      if (cache.village)  setSelectedVillageState(cache.village);
    };

    if (role === "PROVINCE") {
      // lock to province — fetch province object from scopeId
      if (cache.province?.provinceId === scopeId) {
        setSelectedProvinceState(cache.province);
      } else {
        axios.get<GeoProvince>(`/provinces/${scopeId}`)
          .then(r => { setSelectedProvinceState(r.data); saveCache({ province: r.data }); })
          .catch(() => {});
      }
    } else if (role === "AMPHUR") {
      if (cache.amphur?.amphurId === scopeId) {
        initFromCache();
        // load province for parent label
        if (!cache.province) {
          axios.get<GeoAmphur[]>(`/amphurs?provinceId=0`).catch(() => {}); // will fail; just load amphur by id
        }
      } else {
        // fetch amphur → need provinceId → fetch /amphurs/all isn't available, use /amphurs/all
        // load via /tambons works only downward; let's get all amphurs to find ours
        axios.get<GeoAmphur[]>(`/amphurs/all`)
          .then(r => {
            const a = r.data.find(x => x.amphurId === scopeId);
            if (a) {
              setSelectedAmphurState(a);
              // fetch parent province
              axios.get<GeoProvince>(`/provinces/${a.provinceId}`)
                .then(pr => {
                  setSelectedProvinceState(pr.data);
                  saveCache({ province: pr.data, amphur: a });
                }).catch(() => {});
            }
          }).catch(() => {});
      }
    } else if (role === "TAMBON") {
      if (cache.tambon?.tambonId === scopeId) {
        initFromCache();
      } else {
        axios.get<GeoTambon>(`/tambons/${scopeId}`)
          .then(r => {
            const t = r.data;
            setSelectedTambonState(t);
            // fetch amphur parent
            axios.get<GeoAmphur[]>(`/amphurs/all`)
              .then(ar => {
                const a = ar.data.find(x => x.amphurId === t.amphurId);
                if (a) {
                  setSelectedAmphurState(a);
                  axios.get<GeoProvince>(`/provinces/${a.provinceId}`)
                    .then(pr => {
                      setSelectedProvinceState(pr.data);
                      saveCache({ province: pr.data, amphur: a, tambon: t });
                    }).catch(() => {});
                }
              }).catch(() => {});
          }).catch(() => {});
      }
    }
    // ADMIN → restore from cache only (no scopeId lock)
    else if (role === "ADMIN") {
      initFromCache();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, scopeId]);

  // ──── cascade load amphurs when province selected ────
  useEffect(() => {
    if (!selectedProvince) { setAmphurs([]); return; }
    axios.get<GeoAmphur[]>(`/amphurs?provinceId=${selectedProvince.provinceId}`)
      .then(r => setAmphurs(r.data)).catch(() => setAmphurs([]));
  }, [selectedProvince]);

  // ──── cascade load tambons when amphur selected ────
  useEffect(() => {
    if (!selectedAmphur) { setTambons([]); return; }
    axios.get<GeoTambon[]>(`/tambons?amphurId=${selectedAmphur.amphurId}`)
      .then(r => setTambons(r.data)).catch(() => setTambons([]));
  }, [selectedAmphur]);

  // ──── cascade load villages when tambon selected ────
  useEffect(() => {
    if (!selectedTambon) { setVillages([]); return; }
    axios.get<GeoVillage[]>(`/villages?tambonId=${selectedTambon.tambonId}`)
      .then(r => setVillages(r.data)).catch(() => setVillages([]));
  }, [selectedTambon]);

  // ──── setters with cascade-clear + cache persist ────
  const setSelectedProvince = useCallback((p: GeoProvince | null) => {
    setSelectedProvinceState(p);
    setSelectedAmphurState(null);
    setSelectedTambonState(null);
    setSelectedVillageState(null);
    setAmphurs([]); setTambons([]); setVillages([]);
    saveCache({ province: p });
  }, []);

  const setSelectedAmphur = useCallback((a: GeoAmphur | null) => {
    setSelectedAmphurState(a);
    setSelectedTambonState(null);
    setSelectedVillageState(null);
    setTambons([]); setVillages([]);
    saveCache({ province: selectedProvince, amphur: a });
  }, [selectedProvince]);

  const setSelectedTambon = useCallback((t: GeoTambon | null) => {
    setSelectedTambonState(t);
    setSelectedVillageState(null);
    setVillages([]);
    saveCache({ province: selectedProvince, amphur: selectedAmphur, tambon: t });
  }, [selectedProvince, selectedAmphur]);

  const setSelectedVillage = useCallback((v: GeoVillage | null) => {
    setSelectedVillageState(v);
    // sync กับ localStorage "activeVillage" เดิม (VillageContext ใช้)
    if (v) {
      localStorage.setItem("activeVillage", JSON.stringify({ villageId: v.villageId, villageName: v.villageName, moo: v.moo }));
    } else {
      localStorage.removeItem("activeVillage");
    }
    saveCache({ province: selectedProvince, amphur: selectedAmphur, tambon: selectedTambon, village: v });
  }, [selectedProvince, selectedAmphur, selectedTambon]);

  // ──── active IDs for API filtering ────
  const activeVillageId  = selectedVillage?.villageId  ?? null;
  const activeTambonId   = !selectedVillage ? (selectedTambon?.tambonId   ?? null) : null;
  const activeAmphurId   = !selectedTambon  ? (selectedAmphur?.amphurId   ?? null) : null;
  const activeProvinceId = !selectedAmphur  ? (selectedProvince?.provinceId ?? null) : null;

  return (
    <GeoScopeContext.Provider value={{
      role,
      provinces, amphurs, tambons, villages,
      selectedProvince, selectedAmphur, selectedTambon, selectedVillage,
      setSelectedProvince, setSelectedAmphur, setSelectedTambon, setSelectedVillage,
      activeVillageId, activeTambonId, activeAmphurId, activeProvinceId,
    }}>
      {children}
    </GeoScopeContext.Provider>
  );
};

export function useGeoScope() {
  return useContext(GeoScopeContext);
}
