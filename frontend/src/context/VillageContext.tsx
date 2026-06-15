"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface ActiveVillage {
  villageId: number;
  villageName: string;
  moo: string | null;
}

interface VillageContextType {
  village: ActiveVillage | null;
  loaded: boolean;
  setVillage: (v: ActiveVillage | null) => void;
}

const VillageContext = createContext<VillageContextType | undefined>(undefined);

export const useVillage = () => {
  const ctx = useContext(VillageContext);
  if (!ctx) throw new Error("useVillage must be used within VillageProvider");
  return ctx;
};

export const VillageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [village, setVillageState] = useState<ActiveVillage | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("activeVillage");
    if (raw) {
      try { setVillageState(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  const setVillage = (v: ActiveVillage | null) => {
    setVillageState(v);
    if (v) localStorage.setItem("activeVillage", JSON.stringify(v));
    else localStorage.removeItem("activeVillage");
  };

  return (
    <VillageContext.Provider value={{ village, loaded, setVillage }}>
      {children}
    </VillageContext.Provider>
  );
};
