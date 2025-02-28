"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const slideIn = (direction: string, type: string, delay: number, duration: number) => ({
  hidden: {
    x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
    y: direction === 'up' ? '100%' : direction === 'down' ? '100%' : 0,
  },
  show: {
    x: 0,
    y: 0,
    transition: {
      type,
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

export default function ContributePage() {
  const [hasIntermediateStations, setHasIntermediateStations] = useState(false)
  const [intermediateStations, setIntermediateStations] = useState([''])

  const addIntermediateStation = () => {
    setIntermediateStations([...intermediateStations, ''])
  }

  const removeIntermediateStation = (index: number) => {
    const newStations = intermediateStations.filter((_, i) => i !== index)
    setIntermediateStations(newStations)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Contribute Route Data</CardTitle>
          <p className="text-center text-muted-foreground">
            Help us improve by adding new route information
          </p>
        </CardHeader>
        <CardContent>
          <motion.form
            variants={slideIn('left', '', 0, 1)}
            initial="hidden"
            animate="show"
            action="https://formspree.io/f/movqvqbp"
            method="POST"
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="startStation">Start Station</Label>
                <Input
                  id="startStation"
                  name="startStation"
                  placeholder="Enter start station name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="endStation">End Station</Label>
                <Input
                  id="endStation"
                  name="endStation"
                  placeholder="Enter end station name"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasIntermediateStations"
                  checked={hasIntermediateStations}
                  onCheckedChange={setHasIntermediateStations}
                />
                <Label htmlFor="hasIntermediateStations">Has intermediate stations</Label>
              </div>

              {hasIntermediateStations && (
                <div className="space-y-4">
                  <Label>Intermediate Stations</Label>
                  {intermediateStations.map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        name={`intermediateStation${index + 1}`}
                        placeholder={`Station ${index + 1}`}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeIntermediateStation(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addIntermediateStation}
                    className="w-full"
                  >
                    Add Station
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="price">Price (in Birr)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Enter route price"
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Any additional information about the route"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Submit Route Data
            </Button>
          </motion.form>
        </CardContent>
      </Card>
    </main>
  )
} 