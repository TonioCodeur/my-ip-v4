'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, Globe2, Activity } from 'lucide-react';

interface IpStats {
  totalQueries: number;
  uniqueCountries: number;
  averageResponseTime: number;
  lastUpdated: string;
}

// Fonction simulée pour obtenir des statistiques
async function fetchIpStats(): Promise<IpStats> {
  // Dans un cas réel, cela ferait un appel API
  return {
    totalQueries: Math.floor(Math.random() * 10000) + 1000,
    uniqueCountries: Math.floor(Math.random() * 195) + 1,
    averageResponseTime: Math.random() * 500 + 100,
    lastUpdated: new Date().toISOString(),
  };
}

export function IpStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['ip-stats'],
    queryFn: fetchIpStats,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  if (isLoading || !data) {
    return null;
  }

  const stats = [
    {
      label: 'Requêtes totales',
      value: data.totalQueries.toLocaleString('fr-FR'),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Pays uniques',
      value: data.uniqueCountries.toString(),
      icon: Globe2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Temps de réponse',
      value: `${data.averageResponseTime.toFixed(0)}ms`,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Utilisateurs actifs',
      value: Math.floor(Math.random() * 100 + 10).toString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}