'use client';

import { useState } from 'react';
import { IpInfo } from './ip-info';
import { IpInput } from './ip-input';
import { IpStats } from './ip-stats';
import { IpHistory } from './ip-history';

interface IpDashboardProps {
  initialIp: string | null;
}

export function IpDashboard({ initialIp }: IpDashboardProps) {
  const [currentIp] = useState<string | null>(initialIp);
  const [searchedIp, setSearchedIp] = useState<string | null>(initialIp);

  const handleIpSearch = (ip: string) => {
    setSearchedIp(ip || currentIp);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <IpStats />
      
      {/* Barre de recherche */}
      <IpInput onSearch={handleIpSearch} currentIp={currentIp} />
      
      {/* Historique des recherches */}
      <IpHistory onSelectIp={handleIpSearch} />
      
      {/* Informations de l'IP */}
      <IpInfo ip={searchedIp} />
    </div>
  );
}