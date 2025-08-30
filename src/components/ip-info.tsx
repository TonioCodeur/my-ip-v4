'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Globe, Network, Wifi, Building2, Clock } from 'lucide-react';

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
    : '/api/ip-info';
  
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des informations IP');
  }
  
  return response.json();
}

export function IpInfo({ ip }: { ip: string | null }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ip-info', ip],
    queryFn: () => fetchIpInfo(ip),
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des informations IP...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-destructive">
          Erreur: {error instanceof Error ? error.message : 'Impossible de récupérer les informations IP'}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
          <Network className="h-6 w-6" />
          Informations IP
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Adresse IP */}
          <div className="flex items-start gap-3">
            <Wifi className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Adresse IP</p>
              <p className="font-mono font-semibold">{data.query || ip || 'Non disponible'}</p>
            </div>
          </div>

          {/* Localisation */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Localisation</p>
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
              <p className="text-sm text-muted-foreground">Coordonnées</p>
              <p className="font-mono text-sm">
                Lat: {data.lat?.toFixed(4)}, Lon: {data.lon?.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Fuseau horaire */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Fuseau horaire</p>
              <p className="font-semibold">{data.timezone}</p>
            </div>
          </div>

          {/* FAI */}
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Fournisseur Internet (FAI)</p>
              <p className="font-semibold">{data.isp}</p>
              <p className="text-sm text-muted-foreground">{data.org}</p>
            </div>
          </div>

          {/* AS */}
          <div className="flex items-start gap-3">
            <Network className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Système Autonome (AS)</p>
              <p className="font-mono text-sm">{data.as}</p>
            </div>
          </div>
        </div>

        {/* Code postal si disponible */}
        {data.zip && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Code postal:</span>
              <span className="font-semibold">{data.zip}</span>
            </div>
          </div>
        )}
      </div>

      {/* Carte (optionnel - pourrait être ajoutée plus tard) */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-2 text-lg font-semibold">Carte</h3>
        <p className="text-sm text-muted-foreground">
          Position approximative: {data.city}, {data.country}
        </p>
        <div className="mt-4 h-64 rounded-lg bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">
            Carte interactive (peut être ajoutée avec Leaflet ou Google Maps)
          </p>
        </div>
      </div>
    </div>
  );
}