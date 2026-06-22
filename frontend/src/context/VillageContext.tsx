"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useGeoScope } from "./GeoScopeContext";

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
  const { selectedVillage, setSelectedVillage } = useGeoScope();
  const [village, setVillageState] = useState<ActiveVillage | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Sync selectedVillage from GeoScopeContext to VillageContext
  useEffect(() => {
    if (selectedVillage) {
      setVillageState({
        villageId: selectedVillage.villageId,
        villageName: selectedVillage.villageName,
        moo: selectedVillage.moo,
      });
    } else {
      setVillageState(null);
    }
    setLoaded(true);
  }, [selectedVillage]);

  const setVillage = (v: ActiveVillage | null) => {
    setVillageState(v);
    if (v) {
      localStorage.setItem("activeVillage", JSON.stringify(v));
      if (selectedVillage?.villageId !== v.villageId) {
        setSelectedVillage({
          villageId: v.villageId,
          villageName: v.villageName,
          moo: v.moo,
          tambonId: selectedVillage?.tambonId ?? 0,
        });
      }
    } else {
      localStorage.removeItem("activeVillage");
      if (selectedVillage) {
        setSelectedVillage(null);
      }
    }
  };

  return (
    <VillageContext.Provider value={{ village, loaded, setVillage }}>
      {children}
    </VillageContext.Provider>
  );
};
