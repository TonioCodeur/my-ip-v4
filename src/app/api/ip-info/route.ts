import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'IP depuis les query params ou utiliser celle de la requête
    const searchParams = request.nextUrl.searchParams;
    const ip = searchParams.get('ip');
    
    // Construire l'URL de l'API IP-API
    const apiUrl = ip 
      ? `http://ip-api.com/json/${ip}`
      : 'http://ip-api.com/json/';
    
    // Faire la requête côté serveur (pas de problème CORS)
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des informations IP' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API IP-Info:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}