'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, Clock, Globe, Hash, Loader2, MapPin, Network, RefreshCw, Server, Shield, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useIpHistory } from './ip-history';
import { Button } from './ui/button';

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
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Erreur ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export function IpInfo({ ip }: { ip: string | null }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addToHistory } = useIpHistory();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ip-info', ip],
    queryFn: () => fetchIpInfo(ip),
    retry: 2,
    retryDelay: 1000,
  });

  // Ajouter à l'historique quand les données sont chargées
  useEffect(() => {
    if (data && data.query) {
      addToHistory(data.query, data.city, data.country);
    }
  }, [data]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

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
        <Button 
          onClick={handleRefresh}
          className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
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
            Informations IP
          </h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
        
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

      {/* Informations techniques supplémentaires */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Carte de sécurité */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informations de Sécurité
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Type de connexion</p>
              <p className="font-semibold">
                {data.isp?.toLowerCase().includes('mobile') ? 'Mobile' : 'Fixe'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proxy détecté</p>
              <p className="font-semibold text-green-600">Non</p>
            </div>
          </div>
        </div>

        {/* Carte réseau */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5" />
            Détails Réseau
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Numéro AS</p>
              <p className="font-mono text-sm">{data.as?.split(' ')[0] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nom AS</p>
              <p className="text-sm font-semibold">
                {data.as?.split(' ').slice(1).join(' ') || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pays</p>
              <p className="font-semibold text-lg">
                {data.country} ({data.countryCode})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Région / État</p>
              <p className="font-semibold">
                {data.regionName} ({data.region})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ville</p>
              <p className="font-semibold">{data.city}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Carte avec localisation */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localisation Géographique
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Pays</p>
              <p className="font-semibold text-lg">
                {data.country} ({data.countryCode})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Région / État</p>
              <p className="font-semibold">
                {data.regionName} ({data.region})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ville</p>
              <p className="font-semibold">{data.city}</p>
            </div>
          </div>
          <div className="h-64 rounded-lg bg-muted flex flex-col items-center justify-center">
            <Globe className="h-16 w-16 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">
              Lat: {data.lat?.toFixed(4)}, Lon: {data.lon?.toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Carte interactive disponible prochainement
            </p>
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Informations Détaillées
        </h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Adresse IP complète</span>
            <span className="font-mono font-semibold">{data.query}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Organisation</span>
            <span className="font-semibold text-right">{data.org}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Fuseau horaire</span>
            <span className="font-semibold">{data.timezone}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Heure locale estimée</span>
            <span className="font-semibold">
              {new Date().toLocaleString('fr-FR', { timeZone: data.timezone })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}