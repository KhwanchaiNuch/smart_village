"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polygon,
  HeatmapLayer,
} from "@react-google-maps/api";
import type { HouseholdMarker } from "./VillageMap";
import { tierColor, tierLabel } from "./VillageMap";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api").replace(/\/api$/, "");
function resolveImg(url?: string): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : API_ORIGIN + url;
}

type Pt = { lat: number; lng: number };

function cross(O: Pt, A: Pt, B: Pt): number {
  return (A.lat - O.lat) * (B.lng - O.lng) - (A.lng - O.lng) * (B.lat - O.lat);
}

function convexHull(points: Pt[]): Pt[] {
  if (points.length < 3) return points;
  const pts = [...points].sort((a, b) => a.lat - b.lat || a.lng - b.lng);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function markerColorHex(m: HouseholdMarker): string {
  return tierColor(m.healthTier);
}

function svgPin(color: string): string {
  const parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">',
    '<path d="M14 0C6.27 0 0 6.27 0 14c0 9.63 14 22 14 22S28 23.63 28 14C28 6.27 21.73 0 14 0z"',
    ' fill="' + color + '" stroke="#fff" stroke-width="2"/>',
    '<circle cx="14" cy="14" r="5" fill="#fff"/>',
    "</svg>",
  ];
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(parts.join(""));
}

type ViewMode = "roadmap" | "satellite" | "3d";
interface Props { markers: HouseholdMarker[]; apiKey: string; }

const VIEW_BUTTONS: { id: ViewMode; label: string }[] = [
  { id: "roadmap",   label: "แผนที่"   },
  { id: "satellite", label: "ดาวเทียม" },
  { id: "3d",        label: "3D"        },
];

const POLY_2D = { fillColor: "#3b82f6", fillOpacity: 0.08, strokeColor: "#3b82f6", strokeOpacity: 0.7, strokeWeight: 2 };
const POLY_3D = { fillColor: "#3b82f6", fillOpacity: 0.15, strokeColor: "#93c5fd", strokeOpacity: 0.9, strokeWeight: 2 };

interface Props {
  markers: HouseholdMarker[];
  apiKey: string;
  mapMode?: "normal" | "heatmap";
}

export default function VillageMapGoogle({ markers, apiKey, mapMode = "normal" }: Props) {
  const router = useRouter();
  const [libraries] = useState<("visualization")[]>(["visualization"]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "village-map-script",
    version: "weekly",
    libraries: libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selected, setSelected] = useState<HouseholdMarker | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("satellite");

  const center = useMemo(() => ({
    lat: markers.reduce((s, m) => s + m.lat, 0) / markers.length,
    lng: markers.reduce((s, m) => s + m.lng, 0) / markers.length,
  }), [markers]);

  const hullPaths = useMemo(() => {
    const groups: Record<number, Pt[]> = {};
    for (const m of markers) {
      const vid = m.villageId ?? 0;
      if (!groups[vid]) groups[vid] = [];
      groups[vid].push({ lat: m.lat, lng: m.lng });
    }

    const paths: { villageId: number; path: Pt[] }[] = [];
    Object.entries(groups).forEach(([vidStr, pts]) => {
      if (pts.length >= 3) {
        paths.push({
          villageId: Number(vidStr),
          path: convexHull(pts),
        });
      }
    });
    return paths;
  }, [markers]);

  const heatmapData = useMemo(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google) return [];
    return markers.map((m) => {
      const intensity = m.healthTier >= 4 ? 10 : m.healthTier === 3 ? 8 : m.healthTier === 2 ? 5 : m.healthTier === 1 ? 3 : 0.5;
      return {
        location: new window.google.maps.LatLng(m.lat, m.lng),
        weight: intensity,
      };
    });
  }, [markers, isLoaded]);

  const staticOptions = useMemo<google.maps.MapOptions>(() => ({
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    rotateControl: true,
    gestureHandling: "greedy",
    mapTypeId: "hybrid",
    tilt: 0,
    renderingType: "VECTOR" as unknown as google.maps.RenderingType,
  }), []); 

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
    map.fitBounds(bounds, 40);
  }, [markers]);

  const switchView = (mode: ViewMode) => {
    setViewMode(mode);
    const map = mapRef.current;
    if (!map) return;
    if (mode === "roadmap") {
      map.setMapTypeId("roadmap");
      map.setTilt(0);
    } else if (mode === "satellite") {
      map.setMapTypeId("hybrid");
      map.setTilt(0);
    } else {
      map.setMapTypeId("hybrid");
      map.setTilt(45);
      const z = map.getZoom() ?? 16;
      if (z < 18) map.setZoom(18);
    }
  };

  if (loadError) {
    return React.createElement(
      "div",
      { className: "h-[700px] flex items-center justify-center text-red-500 text-sm" },
      "Google Maps error: " + loadError.message
    );
  }

  if (!isLoaded) {
    return React.createElement(
      "div",
      { className: "h-[700px] bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center" },
      React.createElement("p", { className: "text-sm text-gray-400" }, "กำลังโหลด Google Maps...")
    );
  }

  const is3D = viewMode === "3d";
  const btnBase = "px-3 py-1.5 rounded-full text-xs font-medium transition-all";
  const btnActive = btnBase + " bg-blue-500 text-white shadow-sm";
  const btnInactive = btnBase + " text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";

  return React.createElement(
    "div",
    { className: "relative" },
    React.createElement(
      "div",
      { className: "absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-700 p-1" },
      VIEW_BUTTONS.map(function(btn) {
        return React.createElement(
          "button",
          { key: btn.id, onClick: function() { switchView(btn.id); }, className: viewMode === btn.id ? btnActive : btnInactive },
          btn.label
        );
      })
    ),
    is3D && React.createElement(
      "div",
      { className: "absolute bottom-8 left-3 z-10 bg-black/60 text-white text-xs rounded-lg px-3 py-2 backdrop-blur-sm pointer-events-none space-y-0.5" },
      React.createElement("p", null, "คลิกขวาค้าง + ลาก เพื่อหมุน"),
      React.createElement("p", null, "Ctrl + เลื่อน เพื่อปรับมุมเงย")
    ),
    React.createElement(
      GoogleMap,
      {
        mapContainerStyle: { width: "100%", height: "700px" },
        center: center,
        zoom: 16,
        onLoad: onLoad,
        options: staticOptions,
      },
      hullPaths.map(function(hp) {
        return React.createElement(Polygon, {
          key: hp.villageId,
          paths: hp.path,
          options: is3D ? POLY_3D : POLY_2D,
        });
      }),
      markers.map(function(m) {
        return React.createElement(Marker, {
          key: m.householdId,
          position: { lat: m.lat, lng: m.lng },
          icon: {
            url: svgPin(markerColorHex(m)),
            scaledSize: new window.google.maps.Size(28, 36),
            anchor: new window.google.maps.Point(14, 36),
          },
          onClick: function() {
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
            clickTimerRef.current = setTimeout(() => setSelected(m), 250);
          },
          onDblClick: function() {
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
            router.push("/household/detail?id=" + m.householdId);
          },
        });
      }),
      selected && React.createElement(
        InfoWindow,
        { position: { lat: selected.lat, lng: selected.lng }, onCloseClick: function() { setSelected(null); } },
        React.createElement(
          "div",
          { style: { fontFamily: "sans-serif", fontSize: "13px", lineHeight: "1.6", width: "210px" } },
          // รูปบ้าน หรือ placeholder (ได้รับการแก้ไขการซ้อนทับของ Ternary Operator แล้ว)
          resolveImg(selected.houseImageUrl)
            ? React.createElement("img", {
                src: resolveImg(selected.houseImageUrl) as string,
                alt: "house",
                style: { width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px", display: "block" },
              })
            : React.createElement("div", {
                style: {
                  width: "100%", height: "80px", background: "#f3f4f6", borderRadius: "6px",
                  marginBottom: "8px", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "28px",
                },
              }, String.fromCodePoint(0x1F3E0)),
          React.createElement("b", null,
            "บ้านเลขที่ " + selected.houseNo + (selected.moo ? " หมู่ " + selected.moo : "")
          ),
          React.createElement("br"),
          React.createElement(
            "span",
            { style: { color: tierColor(selected.healthTier) } },
            "● " + tierLabel(selected.healthTier)
          ),
          React.createElement("br"),
          React.createElement(
            "span",
            { style: { color: "#9ca3af", fontSize: "11px" } },
            selected.lat.toFixed(6) + ", " + selected.lng.toFixed(6)
          ),
          React.createElement(
            "div",
            { style: { display: "flex", gap: "6px", marginTop: "8px" } },
            React.createElement("a", {
              href: "/household/detail?id=" + selected.householdId,
              onClick: function(e: React.MouseEvent) { e.preventDefault(); router.push("/household/detail?id=" + selected.householdId); },
              style: { flex: 1, textAlign: "center" as const, padding: "4px 0", borderRadius: "6px", background: "#3b82f6", color: "#fff", fontSize: "12px", textDecoration: "none", cursor: "pointer" },
            }, "ดูข้อมูล"),
            React.createElement("a", {
              href: "/household/edit?id=" + selected.householdId,
              onClick: function(e: React.MouseEvent) { e.preventDefault(); router.push("/household/edit?id=" + selected.householdId); },
              style: { flex: 1, textAlign: "center" as const, padding: "4px 0", borderRadius: "6px", background: "#f3f4f6", color: "#374151", fontSize: "12px", textDecoration: "none", cursor: "pointer" },
            }, "แก้ไข / รูป")
          )
        )
      )
    )
  );
}
