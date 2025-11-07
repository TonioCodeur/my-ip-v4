// locales/fr.ts
export default {
  welcome: "Bienvenue dans notre application !",
  utilisation: "Nombres d'utilisation de l'application : ",
  "app.title": "Analyseur d'IP",
  "app.description":
    "Découvrez des informations détaillées sur n'importe quelle adresse IP : géolocalisation, FAI, type de connexion et plus encore.",

  // IpInfo component
  "ipInfo.loading": "Chargement des informations IP...",
  "ipInfo.error": "Erreur:",
  "ipInfo.errorMessage": "Impossible de récupérer les informations IP",
  "ipInfo.retry": "Réessayer",
  "ipInfo.title": "Informations IP",
  "ipInfo.refresh": "Actualiser",
  "ipInfo.ipAddress": "Adresse IP",
  "ipInfo.notAvailable": "Non disponible",
  "ipInfo.location": "Localisation",
  "ipInfo.coordinates": "Coordonnées",
  "ipInfo.timezone": "Fuseau horaire",
  "ipInfo.isp": "Fournisseur Internet (FAI)",
  "ipInfo.as": "Système Autonome (AS)",
  "ipInfo.zipCode": "Code postal:",
  "ipInfo.securityInfo": "Informations de Sécurité",
  "ipInfo.connectionType": "Type de connexion",
  "ipInfo.mobile": "Mobile",
  "ipInfo.fixed": "Fixe",
  "ipInfo.proxyDetected": "Proxy détecté",
  "ipInfo.no": "Non",
  "ipInfo.networkDetails": "Détails Réseau",
  "ipInfo.asNumber": "Numéro AS",
  "ipInfo.asName": "Nom AS",
  "ipInfo.country": "Pays",
  "ipInfo.regionState": "Région / État",
  "ipInfo.city": "Ville",
  "ipInfo.geographicLocation": "Localisation Géographique",
  "ipInfo.mapAvailable": "Carte interactive disponible prochainement",
  "ipInfo.detailedInfo": "Informations Détaillées",
  "ipInfo.fullIpAddress": "Adresse IP complète",
  "ipInfo.organization": "Organisation",
  "ipInfo.estimatedLocalTime": "Heure locale estimée",

  // IpInput component
  "ipInput.title": "Rechercher une adresse IP",
  "ipInput.placeholder": "Entrez une adresse IP (ex: 8.8.8.8)",
  "ipInput.search": "Rechercher",
  "ipInput.myIp": "Mon IP",
  "ipInput.invalidIp": "Veuillez entrer une adresse IP valide",
  "ipInput.examples": "Exemples d'adresses IP :",
  "ipInput.currentIp": "Votre IP actuelle :",
  "ipInput.googleDns": "Google DNS",
  "ipInput.cloudflare": "Cloudflare",
  "ipInput.openDns": "OpenDNS",

  // IpHistory component
  "ipHistory.title": "Historique des recherches",
  "ipHistory.clearAll": "Effacer tout",

  // IpStats component
  "ipStats.totalQueries": "Requêtes totales",
  "ipStats.uniqueCountries": "Pays uniques",
  "ipStats.responseTime": "Temps de réponse",
  "ipStats.activeUsers": "Utilisateurs actifs",
} as const;
