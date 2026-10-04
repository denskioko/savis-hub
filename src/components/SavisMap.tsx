"use client";

import { useEffect, useMemo, useRef } from "react";

export type SavisMapProvider = {
  id: string;
  name: string;
  skill: string;
  area: string;
  km: number;
  rating: number;
  rate: number;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
};

type Props = {
  center: { latitude: number; longitude: number };
  providers: SavisMapProvider[];
  fullScreen?: boolean;
  radiusKm?: number;
  selectedProviderId?: string | null;
  onSelect?: (provider: SavisMapProvider) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: "#38bdf8",
  Electrical: "#f5c451",
  Masonry: "#fb7185",
  Mechanics: "#a78bfa",
  Cleaning: "#34d399",
  Carpentry: "#fb923c",
  Welding: "#f97316",
  Tailoring: "#f472b6",
  Painting: "#c084fc",
  Hardware: "#94a3b8",
  "Quantity Surveying": "#22d3ee",
  Architecture: "#818cf8",
  Legal: "#facc15",
  Accounting: "#2dd4bf",
  Engineering: "#60a5fa",
  Photography: "#e879f9",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character] || character));
}

function categoryColor(skill: string) {
  return CATEGORY_COLORS[skill] || "#e22227";
}

export default function SavisMap({
  center,
  providers,
  fullScreen = false,
  radiusKm = 10,
  selectedProviderId = null,
  onSelect,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const radarRef = useRef<any>(null);
  const selectedMarkerRef = useRef<any>(null);

  const mappedProviders = useMemo(
    () => providers.filter((provider) => provider.latitude != null && provider.longitude != null),
    [providers],
  );

  useEffect(() => {
    let disposed = false;

    async function mount() {
      if (!hostRef.current) return;
      const L = await import("leaflet");
      if (disposed || !hostRef.current) return;

      if (!mapRef.current) {
        const map = L.map(hostRef.current, {
          center: [center.latitude, center.longitude],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
          touchZoom: true,
          doubleClickZoom: true,
          preferCanvas: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
        radarRef.current = L.layerGroup().addTo(map);
      }

      const map = mapRef.current;
      map.setView([center.latitude, center.longitude], map.getZoom(), { animate: true });
      layerRef.current.clearLayers();
      radarRef.current.clearLayers();
      selectedMarkerRef.current = null;

      const userIcon = L.divIcon({
        className: "savis-user-pin",
        html: '<span class="savis-user-radar"></span><span class="savis-user-dot"></span>',
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      L.marker([center.latitude, center.longitude], { icon: userIcon, zIndexOffset: 1000 })
        .bindTooltip("Your location", { direction: "top", offset: [0, -18] })
        .addTo(layerRef.current);

      L.circle([center.latitude, center.longitude], {
        radius: Math.max(500, radiusKm * 1000),
        color: "#34d399",
        weight: 1,
        opacity: 0.28,
        fillColor: "#34d399",
        fillOpacity: 0.045,
        interactive: false,
      }).addTo(radarRef.current);

      mappedProviders.forEach((provider) => {
        const color = categoryColor(provider.skill);
        const isSelected = provider.id === selectedProviderId;
        const safeName = escapeHtml(provider.name);
        const safeSkill = escapeHtml(provider.skill);
        const icon = L.divIcon({
          className: "savis-provider-pin",
          html: `<span class="savis-provider-pulse" style="--savis-pin:${color}"></span><span class="savis-provider-core ${isSelected ? "is-selected" : ""}" style="--savis-pin:${color}">●</span>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const marker = L.marker([provider.latitude as number, provider.longitude as number], {
          icon,
          zIndexOffset: isSelected ? 700 : 100,
        });

        marker.bindTooltip(
          `<strong>${safeName}</strong><br/>${safeSkill} · ${provider.km.toFixed(1)} km`,
          { direction: "top", offset: [0, -18], opacity: 0.96 },
        );
        marker.on("click", () => onSelect?.(provider));
        marker.addTo(layerRef.current);

        if (isSelected) selectedMarkerRef.current = marker;
      });

      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.openTooltip();
      }

      window.setTimeout(() => map.invalidateSize(), 80);
    }

    void mount();
    return () => {
      disposed = true;
    };
  }, [center.latitude, center.longitude, mappedProviders, radiusKm, selectedProviderId, onSelect]);

  return (
    <div
      ref={hostRef}
      className={fullScreen ? "fixed inset-0 z-[80] h-screen w-screen" : "h-72 w-full"}
      aria-label="Interactive SAVIS provider map"
      role="application"
    />
  );
}
