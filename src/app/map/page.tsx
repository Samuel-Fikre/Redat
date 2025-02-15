"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'
import { API_BASE_URL } from '@/config/api'
import { FeedbackModal } from '@/components/feedback-modal'

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <div className="w-full h-[60vh] bg-gray-100 animate-pulse" />
})

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

// Separate client component for search params
function MapContent() {
  const searchParams = useSearchParams()
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [error, setError] = useState<string>('')
  const [stations, setStations] = useState<Station[]>([])
  const [showFeedback, setShowFeedback] = useState(false)

  // Fetch all stations when component mounts
  useEffect(() => {
    const fetchStations = async () => {
      try {
        console.log('Fetching stations...');
        const response = await fetch(`${API_BASE_URL}/stations`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json()
        console.log('Raw stations data:', data);

        if (Array.isArray(data)) {
          console.log('Stations loaded successfully:', data.length, 'stations');
          setStations(data)
        } else if (data.stations && Array.isArray(data.stations)) {
          console.log('Stations loaded from nested data:', data.stations.length, 'stations');
          setStations(data.stations)
        } else {
          console.error('Invalid stations data format. Expected array or object with stations array:', data)
          setError('Unable to load station data - invalid format')
          setStations([])
        }
      } catch (error) {
        console.error('Error fetching stations:', error)
        setError('Unable to load station data - fetch failed')
        setStations([])
      }
    }
    fetchStations()
  }, [])

  useEffect(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      setError('Missing from or to parameters')
      return
    }

    const fetchRoute = async () => {
      try {
        // First verify if stations are loaded
        if (stations.length === 0) {
          console.log('No stations loaded yet, retrying station fetch');
          const stationResponse = await fetch(`${API_BASE_URL}/stations`);
          if (!stationResponse.ok) {
            throw new Error(`HTTP error! status: ${stationResponse.status}`);
          }
          const stationData = await stationResponse.json();
          console.log('Retry raw stations data:', stationData);

          if (Array.isArray(stationData)) {
            console.log('Stations loaded on retry:', stationData.length, 'stations');
            setStations(stationData);
          } else if (stationData.stations && Array.isArray(stationData.stations)) {
            console.log('Stations loaded from nested data on retry:', stationData.stations.length, 'stations');
            setStations(stationData.stations);
          } else {
            console.error('Invalid stations data format on retry:', stationData);
            setError('Unable to load station data - invalid format on retry')
            return;
          }
          return; // Will retry route fetch after stations are loaded
        }

        const response = await fetch(`${API_BASE_URL}/route-map?from=${from} Station&to=${to} Station`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json()
        setRouteData(data)
      } catch (error) {
        setError('Error fetching route data')
      }
    }

    fetchRoute()
  }, [searchParams, stations])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-destructive">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!routeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading route data...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 relative">
        <MapComponent routeData={routeData} />
      </div>
      
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Redat Fare Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Fare</p>
              <p className="text-2xl font-bold">{routeData.total_price} Birr</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Route</p>
              <p className="text-sm">{routeData.route.map(s => s.name).join(' → ')}</p>
            </div>
            
            {routeData.legs.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Journey Segments</p>
                <div className="space-y-2">
                  {routeData.legs.map((leg, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">{leg.from} → {leg.to}</span>
                      <span className="font-medium">{leg.price} Birr</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <button
                onClick={() => setShowFeedback(true)}
                className="w-full px-4 py-2 text-sm font-medium text-center text-muted-foreground hover:text-foreground border border-input rounded-md hover:bg-accent transition-colors"
              >
                Was this price accurate? Share your feedback
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FeedbackModal 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        totalPrice={routeData?.total_price || 0}
        route={routeData?.route.map(s => s.name).join(' → ')}
      />
    </div>
  )
}

// Main page component with Suspense
export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <MapContent />
    </Suspense>
  )
} 
