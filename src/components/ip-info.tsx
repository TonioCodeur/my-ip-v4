"use client";

import { saveIpInfo } from "@/actions/save-ip-info";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Clock,
  Globe,
  Hash,
  Loader2,
  MapPin,
  Network,
  RefreshCw,
  Server,
  Shield,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "../../locales/client";
import { useIpHistory } from "./ip-history";
import { Button } from "./ui/button";

interface IpApiResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

async function fetchIpInfo(ip: string | null): Promise<IpApiResponse> {
  // Utiliser notre route API pour éviter les problèmes de CORS
  const endpoint = ip
    ? `/api/ip-info?ip=${encodeURIComponent(ip)}`
    : "/api/ip-info";

  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error || `Erreur ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

export function IpInfo({ ip }: { ip: string | null }) {
  const t = useI18n();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addToHistory } = useIpHistory();
  const isFirstRenderRef = useRef(true);
  const currentSearchIpRef = useRef<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ip-info", ip],
    queryFn: () => fetchIpInfo(ip),
    retry: 2,
    retryDelay: 1000,
  });

  // Ajouter à l'historique ET sauvegarder en DB quand les données sont chargées
  useEffect(() => {
    if (data && data.query) {
      addToHistory(data.query, data.city, data.country);

      // Sauvegarder en DB de manière asynchrone sans bloquer l'UI
      saveIpInfo(data.query, data)
        .then((result) => {
          if (result.success && !result.skipped) {
            // Invalider le cache des statistiques pour forcer le rafraîchissement
            queryClient.invalidateQueries({ queryKey: ["ip-stats"] });
          }
        })
        .catch((error) => {
          console.error("[IpInfo] Erreur lors de la sauvegarde:", error);
        });
    }
  }, [data, addToHistory, queryClient]);

  // Afficher un toast de chargement au début d'une nouvelle recherche
  useEffect(() => {
    // Skip le premier rendu
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // Nouvelle recherche détectée
    if (isLoading) {
      currentSearchIpRef.current = ip;
      toast.loading(t("toast.search.loading"), {
        id: "ip-search",
      });
    }
  }, [ip, isLoading, t]);

  // Afficher le toast de succès ou d'erreur
  useEffect(() => {
    // Ne rien faire si pas de recherche en cours ou si c'est le premier rendu
    if (isFirstRenderRef.current || !currentSearchIpRef.current) {
      return;
    }

    // Toast de succès
    if (!isLoading && data && currentSearchIpRef.current === ip) {
      toast.success(t("toast.search.success"), {
        id: "ip-search",
        description: `${t("toast.search.successDescriptionPrefix")}${
          data.query
        }${t("toast.search.successDescriptionSuffix")}`,
      });
      currentSearchIpRef.current = null;
    }

    // Toast d'erreur
    if (!isLoading && error && currentSearchIpRef.current === ip) {
      toast.error(t("toast.search.error"), {
        id: "ip-search",
        description: t("toast.search.errorDescription"),
      });
      currentSearchIpRef.current = null;
    }
  }, [ip, isLoading, data, error, t]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t("ipInfo.loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-destructive">
          {t("ipInfo.error")}{" "}
          {error instanceof Error ? error.message : t("ipInfo.errorMessage")}
        </p>
        <Button
          onClick={handleRefresh}
          className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t("ipInfo.retry")}
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Carte principale avec les informations IP */}
      <div className="rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            {t("ipInfo.title")}
          </h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {t("ipInfo.refresh")}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Adresse IP */}
          <div className="flex items-start gap-3">
            <Wifi className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.ipAddress")}
              </p>
              <p className="font-mono font-semibold">
                {data.query || ip || t("ipInfo.notAvailable")}
              </p>
            </div>
          </div>

          {/* Localisation */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.location")}
              </p>
              <p className="font-semibold">
                {data.city}, {data.regionName}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.country} ({data.countryCode})
              </p>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.coordinates")}
              </p>
              <p className="font-mono text-sm">
                Lat: {data.lat?.toFixed(4)}, Lon: {data.lon?.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* Carte interactive */}
        <div className="mt-6 rounded-lg overflow-hidden border shadow-sm">
          <iframe
            width="100%"
            height="400"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              data.lon - 0.1
            },${data.lat - 0.1},${data.lon + 0.1},${
              data.lat + 0.1
            }&layer=mapnik&marker=${data.lat},${data.lon}`}
            title={`Carte de localisation: ${data.city}, ${data.country}`}
            className="w-full border-0"
            style={{ border: 0 }}
          />
          <div className="bg-muted px-4 py-2 text-sm text-muted-foreground flex items-center justify-between">
            <span>
              📍 {data.city}, {data.regionName}, {data.country}
            </span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${data.lat}&mlon=${data.lon}#map=13/${data.lat}/${data.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t("ipInfo.viewLargerMap")}
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {/* Fuseau horaire */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.timezone")}
              </p>
              <p className="font-semibold">{data.timezone}</p>
            </div>
          </div>

          {/* FAI */}
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t("ipInfo.isp")}</p>
              <p className="font-semibold">{data.isp}</p>
              <p className="text-sm text-muted-foreground">{data.org}</p>
            </div>
          </div>

          {/* AS */}
          <div className="flex items-start gap-3">
            <Network className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t("ipInfo.as")}</p>
              <p className="font-mono text-sm">{data.as}</p>
            </div>
          </div>
        </div>

        {/* Code postal si disponible */}
        {data.zip && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("ipInfo.zipCode")}
              </span>
              <span className="font-semibold">{data.zip}</span>
            </div>
          </div>
        )}
      </div>

      {/* Informations techniques supplémentaires */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Carte de sécurité */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("ipInfo.securityInfo")}
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.connectionType")}
              </p>
              <p className="font-semibold">
                {data.isp?.toLowerCase().includes("mobile")
                  ? t("ipInfo.mobile")
                  : t("ipInfo.fixed")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.proxyDetected")}
              </p>
              <p className="font-semibold text-green-600">{t("ipInfo.no")}</p>
            </div>
          </div>
        </div>

        {/* Carte réseau */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5" />
            {t("ipInfo.networkDetails")}
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.asNumber")}
              </p>
              <p className="font-mono text-sm">
                {data.as?.split(" ")[0] || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.asName")}
              </p>
              <p className="text-sm font-semibold">
                {data.as?.split(" ").slice(1).join(" ") || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.country")}
              </p>
              <p className="font-semibold text-lg">
                {data.country} ({data.countryCode})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.regionState")}
              </p>
              <p className="font-semibold">
                {data.regionName} ({data.region})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.city")}
              </p>
              <p className="font-semibold">{data.city}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Carte avec localisation */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t("ipInfo.geographicLocation")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 flex justify-between w-full">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.country")}
              </p>
              <p className="font-semibold text-lg">
                {data.country} ({data.countryCode})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.regionState")}
              </p>
              <p className="font-semibold">
                {data.regionName} ({data.region})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("ipInfo.city")}
              </p>
              <p className="font-semibold">{data.city}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Hash className="h-5 w-5" />
          {t("ipInfo.detailedInfo")}
        </h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">
              {t("ipInfo.fullIpAddress")}
            </span>
            <span className="font-mono font-semibold">{data.query}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">
              {t("ipInfo.organization")}
            </span>
            <span className="font-semibold text-right">{data.org}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">
              {t("ipInfo.timezone")}
            </span>
            <span className="font-semibold">{data.timezone}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">
              {t("ipInfo.estimatedLocalTime")}
            </span>
            <span className="font-semibold">
              {new Date().toLocaleString("fr-FR", { timeZone: data.timezone })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
