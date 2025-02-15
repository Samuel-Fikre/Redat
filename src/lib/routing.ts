interface Coordinates {
  lat: number;
  lng: number;
}

export async function getRouteCoordinates(points: Coordinates[]): Promise<Coordinates[]> {
  try {
    // Convert points to OSRM format (longitude,latitude)
    const coordinates = points.map(p => `${p.lng},${p.lat}`).join(';');
    
    // Use the OSRM demo server (for development only)
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch route');
    }

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    // Extract coordinates from the GeoJSON geometry
    const routeCoordinates = data.routes[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );

    return routeCoordinates;
  } catch (error) {
    console.error('Error fetching route:', error);
    // Fallback to straight line if routing fails
    return points;
  }
} 