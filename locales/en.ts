// locales/en.ts
export default {
  welcome: "Welcome to our application!",
  utilisation: "Application usage numbers: ",
  "app.title": "IP Analyzer",
  "app.description":
    "Discover detailed information about any IP address: geolocation, ISP, connection type and more.",

  // IpInfo component
  "ipInfo.loading": "Loading IP information...",
  "ipInfo.error": "Error:",
  "ipInfo.errorMessage": "Unable to retrieve IP information",
  "ipInfo.retry": "Retry",
  "ipInfo.title": "IP Information",
  "ipInfo.refresh": "Refresh",
  "ipInfo.ipAddress": "IP Address",
  "ipInfo.notAvailable": "Not available",
  "ipInfo.location": "Location",
  "ipInfo.coordinates": "Coordinates",
  "ipInfo.timezone": "Time Zone",
  "ipInfo.isp": "Internet Service Provider (ISP)",
  "ipInfo.as": "Autonomous System (AS)",
  "ipInfo.zipCode": "Zip Code:",
  "ipInfo.securityInfo": "Security Information",
  "ipInfo.connectionType": "Connection Type",
  "ipInfo.mobile": "Mobile",
  "ipInfo.fixed": "Fixed",
  "ipInfo.proxyDetected": "Proxy detected",
  "ipInfo.no": "No",
  "ipInfo.networkDetails": "Network Details",
  "ipInfo.asNumber": "AS Number",
  "ipInfo.asName": "AS Name",
  "ipInfo.country": "Country",
  "ipInfo.regionState": "Region / State",
  "ipInfo.city": "City",
  "ipInfo.geographicLocation": "Geographic Location",
  "ipInfo.mapAvailable": "Interactive map available soon",
  "ipInfo.detailedInfo": "Detailed Information",
  "ipInfo.fullIpAddress": "Full IP Address",
  "ipInfo.organization": "Organization",
  "ipInfo.estimatedLocalTime": "Estimated Local Time",

  // IpInput component
  "ipInput.title": "Search an IP address",
  "ipInput.placeholder": "Enter an IP address (e.g. 8.8.8.8)",
  "ipInput.search": "Search",
  "ipInput.myIp": "My IP",
  "ipInput.invalidIp": "Please enter a valid IP address",
  "ipInput.examples": "Example IP addresses:",
  "ipInput.currentIp": "Your current IP:",
  "ipInput.googleDns": "Google DNS",
  "ipInput.cloudflare": "Cloudflare",
  "ipInput.openDns": "OpenDNS",

  // IpHistory component
  "ipHistory.title": "Search History",
  "ipHistory.clearAll": "Clear all",

  // IpStats component
  "ipStats.totalQueries": "Total Queries",
  "ipStats.uniqueCountries": "Unique Countries",
  "ipStats.responseTime": "Response Time",
  "ipStats.activeUsers": "Active Users",
} as const;
