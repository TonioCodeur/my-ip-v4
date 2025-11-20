'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, Globe2, Activity } from 'lucide-react';
import { useI18n } from '../../locales/client';

interface IpStats {
  totalQueries: number;
  uniqueCountries: number;
  averageResponseTime: number;
  activeUsers: number;
  lastUpdated: string;
}

/**
 * Récupère les statistiques réelles depuis l'API
 * Connecté à la base de données via server action
 */
async function fetchIpStats(): Promise<IpStats> {
  const response = await fetch('/api/stats', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch IP statistics');
  }

  return response.json();
}

export function IpStats() {
  const t = useI18n();
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
      label: t('ipStats.totalQueries'),
      value: data.totalQueries.toLocaleString('fr-FR'),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: t('ipStats.uniqueCountries'),
      value: data.uniqueCountries.toString(),
      icon: Globe2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: t('ipStats.responseTime'),
      value: `${data.averageResponseTime.toFixed(0)}ms`,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: t('ipStats.activeUsers'),
      value: data.activeUsers.toString(),
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