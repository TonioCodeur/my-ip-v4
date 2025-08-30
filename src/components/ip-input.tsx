'use client';

import { useState } from 'react';
import { Search, Globe, RefreshCcw } from 'lucide-react';

interface IpInputProps {
  onSearch: (ip: string) => void;
  currentIp?: string | null;
}

export function IpInput({ onSearch, currentIp }: IpInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Fonction pour valider une adresse IP
  const validateIp = (ip: string): boolean => {
    if (!ip) return true; // Vide est valide (utilisera l'IP actuelle)
    
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateIp(inputValue)) {
      onSearch(inputValue || currentIp || '');
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsValid(validateIp(value));
  };

  const handleUseCurrentIp = () => {
    setInputValue('');
    onSearch(currentIp || '');
    setIsValid(true);
  };

  // Exemples d'IPs pour tester
  const exampleIps = [
    { label: 'Google DNS', ip: '8.8.8.8' },
    { label: 'Cloudflare', ip: '1.1.1.1' },
    { label: 'OpenDNS', ip: '208.67.222.222' },
  ];

  const handleExampleClick = (ip: string) => {
    setInputValue(ip);
    setIsValid(true);
    onSearch(ip);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-lg">
      <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
        <Search className="h-5 w-5" />
        Rechercher une adresse IP
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Entrez une adresse IP (ex: 8.8.8.8)"
              className={`flex-1 px-4 py-2 border rounded-md bg-background transition-colors ${
                !isValid 
                  ? 'border-destructive focus:ring-destructive' 
                  : 'border-input focus:ring-primary'
              } focus:outline-none focus:ring-2`}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Rechercher
            </button>
            <button
              type="button"
              onClick={handleUseCurrentIp}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Mon IP
            </button>
          </div>
          {!isValid && (
            <p className="mt-2 text-sm text-destructive">
              Veuillez entrer une adresse IP valide
            </p>
          )}
        </div>

        {/* Exemples d'IPs */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Exemples d&apos;adresses IP :</p>
          <div className="flex flex-wrap gap-2">
            {exampleIps.map((example) => (
              <button
                key={example.ip}
                type="button"
                onClick={() => handleExampleClick(example.ip)}
                className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                <span className="font-semibold">{example.label}:</span> {example.ip}
              </button>
            ))}
          </div>
        </div>

        {currentIp && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Votre IP actuelle : <span className="font-mono font-semibold">{currentIp}</span>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}