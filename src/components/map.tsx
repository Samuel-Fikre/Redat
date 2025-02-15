"use client"

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getRouteCoordinates } from '@/lib/routing'

interface Station {
  name: string
  location: {
    coordinates: [number, number]
  }
}

interface RouteLeg {
  from: string
  to: string
  price: number
}

interface RouteData {
  route: Station[]
  total_price: number
  legs: RouteLeg[]
}

interface MapComponentProps {
  routeData: RouteData
}

export default function MapComponent({ routeData }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const routeLayerRef = useRef<L.Polyline | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [9.0222, 38.7468],
      zoom: 13,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        })
      ]
    })

    mapRef.current = map

    // Wait for map to be ready
    map.whenReady(() => {
      setIsMapReady(true)
    })

    return () => {
      map.remove()
      mapRef.current = null
      setIsMapReady(false)
    }
  }, [])

  // Handle markers and route
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return

    const map = mapRef.current

    // Clear existing markers and route
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    // Add markers for each station
    const bounds = L.latLngBounds([])
    const points = routeData.route.map(station => {
      const [lng, lat] = station.location.coordinates
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: '🚖',
          className: 'taxi-marker',
          iconSize: [25, 25]
        })
      })
      .bindPopup(`<strong>${station.name}</strong>`)
      .addTo(map)

      markersRef.current.push(marker)
      bounds.extend([lat, lng])
      return { lat, lng }
    })

    // Draw route
    async function drawRoute() {
      try {
        const routeCoordinates = await getRouteCoordinates(points)
        
        // Create a polyline with the route coordinates
        routeLayerRef.current = L.polyline(routeCoordinates, {
          color: '#0066cc',
          weight: 4,
          opacity: 0.8,
          lineJoin: 'round',
          dashArray: '10, 10', // Add dashed line effect
          lineCap: 'round'
        }).addTo(map)

        // Add hover effect to the route line
        routeLayerRef.current.on('mouseover', function() {
          if (routeLayerRef.current) {
            routeLayerRef.current.setStyle({
              weight: 6,
              opacity: 1
            })
          }
        })

        routeLayerRef.current.on('mouseout', function() {
          if (routeLayerRef.current) {
            routeLayerRef.current.setStyle({
              weight: 4,
              opacity: 0.8
            })
          }
        })

        // Add route distance to the first marker's popup
        if (markersRef.current.length > 0) {
          const firstMarker = markersRef.current[0]
          const lastPoint = routeCoordinates[routeCoordinates.length - 1]
          const firstPoint = routeCoordinates[0]
          
          // Calculate total distance in kilometers
          let totalDistance = 0
          for (let i = 1; i < routeCoordinates.length; i++) {
            const prev = L.latLng(routeCoordinates[i - 1].lat, routeCoordinates[i - 1].lng)
            const curr = L.latLng(routeCoordinates[i].lat, routeCoordinates[i].lng)
            totalDistance += prev.distanceTo(curr)
          }
          
          const distanceKm = (totalDistance / 1000).toFixed(1)
          firstMarker.setPopupContent(
            `<strong>${routeData.route[0].name}</strong><br>Total route distance: ${distanceKm} km`
          )
        }
      } catch (error) {
        console.error('Failed to draw route:', error)
      }
    }

    drawRoute()

    // Fit bounds only if we have valid bounds
    if (bounds.isValid()) {
      map.invalidateSize()
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      })
    }
  }, [routeData, isMapReady])

  return (
    <>
      <style jsx global>{`
        .taxi-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          background: none;
          border: none;
        }
        #map-container {
          width: 100%;
          height: 60vh;
          position: relative;
          z-index: 0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .leaflet-container {
          width: 100%;
          height: 100%;
        }
      `}</style>
      <div id="map-container" ref={containerRef} />
    </>
  )
} 