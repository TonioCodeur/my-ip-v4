import { useQuery } from '@tanstack/react-query';

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
  const endpoint = ip 
    ? `/api/ip-info?ip=${encodeURIComponent(ip)}` 
    : '/api/ip-info';
  
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des informations IP');
  }
  
  return response.json();
}

export function useIpInfo(ip: string | null) {
  return useQuery({
    queryKey: ['ip-info', ip],
    queryFn: () => fetchIpInfo(ip),
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
  });
}