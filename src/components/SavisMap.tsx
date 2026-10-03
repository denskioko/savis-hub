"use client";

import { useEffect, useRef } from "react";

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
  onSelect?: (provider: SavisMapProvider) => void;
};

export default function SavisMap({ center, providers, fullScreen = false, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

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
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
      }

      const map = mapRef.current;
      map.setView([center.latitude, center.longitude], map.getZoom(), { animate: true });

      layerRef.current.clearLayers();

      const userIcon = L.divIcon({
        className: "savis-user-pin",
        html: '<span class="savis-user-dot"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([center.latitude, center.longitude], { icon: userIcon })
        .bindTooltip("Your location", { direction: "top", offset: [0, -10] })
        .addTo(layerRef.current);

      providers.forEach((provider) => {
        if (provider.latitude == null || provider.longitude == null) return;

        const icon = L.divIcon({
          className: "savis-provider-pin",
          html: '<span class="savis-provider-pulse"></span><span class="savis-provider-core">●</span>',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([provider.latitude, provider.longitude], { icon });
        marker.bindTooltip(
          `<strong>${provider.name}</strong><br/>${provider.skill} · ${provider.km.toFixed(1)} km`,
          { direction: "top", offset: [0, -16], opacity: 0.96 }
        );
        marker.on("click", () => onSelect?.(provider));
        marker.addTo(layerRef.current);
      });

      setTimeout(() => map.invalidateSize(), 50);
    }

    mount();
    return () => { disposed = true; };
  }, [center.latitude, center.longitude, providers, onSelect]);

  return (
    <div
      ref={hostRef}
      className={fullScreen ? "fixed inset-0 z-[80] h-screen w-screen" : "h-72 w-full"}
      aria-label="Interactive SAVIS provider map"
    />
  );
}
