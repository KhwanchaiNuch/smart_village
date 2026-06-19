"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
//import "leaflet/dist/leaflet.css";
import type { HouseholdMarker } from "./VillageMap";
import { tierColor, tierLabel } from "./VillageMap";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api").replace(/\/api$/, "");
function resolveImg(url?: string): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : API_ORIGIN + url;
}

// ── Fix default icon path ที่ webpack break ──────────────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Convex hull (Gift-wrapping) เพื่อวาดขอบเขตหมู่บ้าน ───────────────────────
type Pt = [number, number]; // [lat, lng]

function cross(O: Pt, A: Pt, B: Pt): number {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
}

function convexHull(points: Pt[]): Pt[] {
  if (points.length < 3) return points;
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
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

// ── สีของจุดบ้าน (5 ระดับ) ───────────────────────────────────────────────────
function markerColor(m: HouseholdMarker): string {
  return tierColor(m.healthTier);
}

function makeCircleIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

interface Props {
  markers: HouseholdMarker[];
}

export default function VillageMapLeaflet({ markers }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!divRef.current) return;
    if (mapRef.current) {
      // cleanup เดิมก่อน re-render
      mapRef.current.remove();
      mapRef.current = null;
    }

    // ── ศูนย์กลาง = centroid ของทุก marker ────────────────────────────────
    const latAvg = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
    const lngAvg = markers.reduce((s, m) => s + m.lng, 0) / markers.length;

    const map = L.map(divRef.current, {
      center: [latAvg, lngAvg],
      zoom: 16,
      zoomControl: true,
    });
    mapRef.current = map;

    // ── OpenStreetMap tiles ────────────────────────────────────────────────
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // ── ขอบเขตหมู่บ้านแยกแต่ละหมู่บ้าน (convex hull polygons) ─────────────────────
    const groups: Record<number, HouseholdMarker[]> = {};
    for (const m of markers) {
      const vid = m.villageId ?? 0;
      if (!groups[vid]) groups[vid] = [];
      groups[vid].push(m);
    }

    Object.entries(groups).forEach(([vidStr, gMarkers]) => {
      if (gMarkers.length >= 3) {
        const pts: Pt[] = gMarkers.map((m) => [m.lat, m.lng]);
        const hull = convexHull(pts);
        const vName = gMarkers[0].villageName || `หมู่บ้าน #${vidStr}`;
        const poly = L.polygon(hull as [number, number][], {
          color: "#3b82f6",
          weight: 2,
          fillColor: "#3b82f6",
          fillOpacity: 0.08,
          dashArray: "6 4",
        });
        poly.bindTooltip(vName, { sticky: true });
        poly.addTo(map);
      }
    });

    // ── Markers บ้านแต่ละหลัง ──────────────────────────────────────────────
    const group = L.layerGroup();
    for (const m of markers) {
      const color = markerColor(m);
      const icon = makeCircleIcon(color);
      const label = tierLabel(m.healthTier);
      const imgUrl = resolveImg(m.houseImageUrl);
      const imgHtml = imgUrl
        ? `<img src="${imgUrl}" style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:8px;display:block"/>`
        : `<div style="width:100%;height:70px;background:#f3f4f6;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;font-size:26px">🏠</div>`;
      const btnStyle = "display:inline-block;padding:3px 10px;border-radius:6px;font-size:12px;text-decoration:none;cursor:pointer";
      const popupHtml = `
        <div style="font-family:sans-serif;font-size:13px;line-height:1.6;width:200px">
          ${imgHtml}
          <b>บ้านเลขที่ ${m.houseNo}${m.moo ? " หมู่ " + m.moo : ""}</b><br/>
          <span style="color:${color}">● ${label}</span><br/>
          <span style="color:#9ca3af;font-size:11px">${m.lat.toFixed(6)}, ${m.lng.toFixed(6)}</span>
          <div style="display:flex;gap:6px;margin-top:8px">
            <a href="/household/detail?id=${m.householdId}" style="${btnStyle};background:#3b82f6;color:#fff;flex:1;text-align:center">ดูข้อมูล</a>
            <a href="/household/edit?id=${m.householdId}" style="${btnStyle};background:#f3f4f6;color:#374151;flex:1;text-align:center">แก้ไข / รูป</a>
          </div>
        </div>`;

      let clickTimer: ReturnType<typeof setTimeout> | null = null;
      const marker = L.marker([m.lat, m.lng], { icon }).bindPopup(popupHtml, { maxWidth: 230 });
      marker.on("click", () => {
        clickTimer = setTimeout(() => marker.openPopup(), 250);
      });
      marker.on("dblclick", (e) => {
        if (clickTimer) clearTimeout(clickTimer);
        L.DomEvent.stop(e);
        window.location.href = "/household/detail?id=" + m.householdId;
      });
      marker.addTo(group);
    }
    group.addTo(map);

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [markers]);

  return (
    <div
      ref={divRef}
      style={{ height: "700px", width: "100%", background: "#f3f4f6" }}
    />
  );
}
