"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/config/api'

interface Place {
  location: [number, number]
  stations: string[]
  connected: string[] | null
}

interface Places {
  [key: string]: Place
}

export default function Home() {
  const router = useRouter()
  const [places, setPlaces] = useState<Places>({})
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([])
  const [toSuggestions, setToSuggestions] = useState<string[]>([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    async function loadPlaces() {
      try {
        const response = await fetch(`${API_BASE_URL}/places`)
        const data = await response.json()
        setPlaces(data.places)
      } catch (error) {
        console.error('Error loading places:', error)
      }
    }
    loadPlaces()
  }, [])

  const showSuggestions = (value: string, isFrom: boolean) => {
    const suggestions = Object.keys(places)
      .filter(place => place.toLowerCase().includes(value.toLowerCase()))

    if (isFrom) {
      setFromSuggestions(suggestions)
    } else {
      setToSuggestions(suggestions)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    const fromExists = Object.keys(places).some(place => 
      place.toLowerCase() === from.toLowerCase()
    )
    const toExists = Object.keys(places).some(place => 
      place.toLowerCase() === to.toLowerCase()
    )

    if (!fromExists || !toExists) {
      alert('Please select valid locations from the suggestions')
      return
    }

    // Navigate to map page with query parameters
    router.push(`/map?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Redat</h1>
          <p className="text-muted-foreground">Check Taxi Money and Route</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Starting Point"
                className="w-full"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  showSuggestions(e.target.value, true)
                }}
                autoComplete="off"
              />
              {fromSuggestions.length > 0 && from && (
                <div className="absolute w-full bg-popover border rounded-md shadow-lg mt-1 z-50">
                  {fromSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setFrom(suggestion)
                        setFromSuggestions([])
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                type="text"
                placeholder="Where do you want to go?"
                className="w-full"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value)
                  showSuggestions(e.target.value, false)
                }}
                autoComplete="off"
              />
              {toSuggestions.length > 0 && to && (
                <div className="absolute w-full bg-popover border rounded-md shadow-lg mt-1 z-50">
                  {toSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setTo(suggestion)
                        setToSuggestions([])
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full">
              Continue
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/contribute')}
            >
              Contribute Route Data
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
} 
