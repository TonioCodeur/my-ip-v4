'use client';

import { useState, useEffect } from 'react';
import { Clock, Trash2, MapPin } from 'lucide-react';
import { useI18n } from '../../locales/client';

interface IpHistoryItem {
  ip: string;
  city?: string;
  country?: string;
  timestamp: string;
}

interface IpHistoryProps {
  onSelectIp: (ip: string) => void;
}

export function IpHistory({ onSelectIp }: IpHistoryProps) {
  const t = useI18n();
  const [history, setHistory] = useState<IpHistoryItem[]>([]);

  useEffect(() => {
    // Charger l'historique depuis le localStorage
    const storedHistory = localStorage.getItem('ip-history');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ip-history');
  };

  const removeFromHistory = (ip: string) => {
    const newHistory = history.filter(h => h.ip !== ip);
    setHistory(newHistory);
    localStorage.setItem('ip-history', JSON.stringify(newHistory));
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('ipHistory.title')}
        </h3>
        <button
          onClick={clearHistory}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          {t('ipHistory.clearAll')}
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.ip}
            className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
            onClick={() => onSelectIp(item.ip)}
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-mono font-semibold text-sm">{item.ip}</p>
                {item.city && item.country && (
                  <p className="text-xs text-muted-foreground">
                    {item.city}, {item.country}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromHistory(item.ip);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook pour gérer l'historique
export function useIpHistory() {
  const addToHistory = (ip: string, city?: string, country?: string) => {
    const item: IpHistoryItem = {
      ip,
      city,
      country,
      timestamp: new Date().toISOString(),
    };

    const storedHistory = localStorage.getItem('ip-history');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    const newHistory = [item, ...history.filter((h: IpHistoryItem) => h.ip !== ip)].slice(0, 10);
    localStorage.setItem('ip-history', JSON.stringify(newHistory));
  };

  return { addToHistory };
}