"use client"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useCallback } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// พิกัดกลางแผนที่ — ปรับให้ตรงกับหมู่บ้านจริงได้ทีหลัง
const DEFAULT_CENTER = { lat: 15.87, lng: 100.99 };
const DEFAULT_ZOOM = 14;

export interface HouseholdMarker {
  householdId: number;
  houseNo: string;
  moo?: string;
  lat: number;
  lng: number;
  // สถานะสำหรับกำหนดสีจุด
  hasBedridden: boolean;
  hasElderly: boolean;
  hasDisabled: boolean;
}

interface Props {
  markers: HouseholdMarker[];
}

// กำหนดสีของ marker ตามกลุ่มเปราะบาง
function getMarkerColor(m: HouseholdMarker): string {
  if (m.hasBedridden || m.hasDisabled) return "red";    // 🔴 กลุ่มเปราะบาง
  if (m.hasElderly) return "orange";                    // 🟡 ต้องติดตาม
  return "green";                                        // 🟢 ปกติ
}

// สร้าง SVG marker icon แบบวงกลมสี
function buildMarkerIcon(color: string) {
  const colors: Record<string, string> = {
    red: "#ef4444",
    orange: "#f59e0b",
    green: "#10b981",
  };
  const hex = colors[color] ?? "#10b981";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="${hex}" stroke="white" stroke-width="2"/>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 24, height: 24 } as google.maps.Size,
  };
}

export default function VillageMap({ markers }: Props) {
  const [selected, setSelected] = useState<HouseholdMarker | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    // ถ้ามี marker ให้ auto-fit bounds
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      map.fitBounds(bounds);
    }
  }, [markers]);

  // ยังไม่ใส่ API key
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center p-6">
        <span className="text-4xl mb-3">🗺️</span>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          แผนที่หมู่บ้าน
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          รอใส่ Google Maps API Key
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-3 font-mono">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">โหลดแผนที่ไม่สำเร็จ — ตรวจสอบ API Key</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse">
        <p className="text-sm text-gray-400">กำลังโหลดแผนที่...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-xs">
        <span className="font-medium text-gray-600 dark:text-gray-400">สีบ้าน:</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />ปกติ</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-yellow-400 inline-block" />ต้องติดตาม (ผู้สูงอายุ)</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500 inline-block" />กลุ่มเปราะบาง (ติดเตียง/พิการ)</span>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {markers.map((m) => (
          <Marker
            key={m.householdId}
            position={{ lat: m.lat, lng: m.lng }}
            icon={buildMarkerIcon(getMarkerColor(m))}
            onClick={() => setSelected(m)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="text-sm p-1">
              <p className="font-semibold">บ้านเลขที่ {selected.houseNo}{selected.moo ? ` หมู่ ${selected.moo}` : ""}</p>
              <p className="text-xs text-gray-500 mt-1">
                {selected.hasBedridden && "🔴 มีผู้ป่วยติดเตียง "}
                {selected.hasDisabled && "🟣 มีผู้พิการ "}
                {selected.hasElderly && !selected.hasBedridden && !selected.hasDisabled && "🟡 มีผู้สูงอายุ"}
                {!selected.hasBedridden && !selected.hasDisabled && !selected.hasElderly && "🟢 ปกติ"}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
