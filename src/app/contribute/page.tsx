"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { API_BASE_URL } from '@/config/api'


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
  const formRef = useRef<HTMLFormElement>(null)
  const [hasIntermediateStations, setHasIntermediateStations] = useState(false)
  const [intermediateStations, setIntermediateStations] = useState([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [startStationPreview, setStartStationPreview] = useState<string | null>(null)
  const [endStationPreview, setEndStationPreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (preview: string | null) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addIntermediateStation = () => {
    setIntermediateStations([...intermediateStations, ''])
  }

  const removeIntermediateStation = (index: number) => {
    const newStations = intermediateStations.filter((_, i) => i !== index)
    setIntermediateStations(newStations)
  }

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset()
    }
    setHasIntermediateStations(false)
    setIntermediateStations([''])
    setStartStationPreview(null)
    setEndStationPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess(false)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch(`${API_BASE_URL}/api/contribute`, {
        method: "POST",
        body: formData,
        mode: "cors",
        credentials: "same-origin",
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', errorText)
        throw new Error(errorText || "Failed to submit form")
      }

      setSubmitSuccess(true)
      resetForm()
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Contribute Route Data</CardTitle>
          <p className="text-center text-muted-foreground">
            Help us improve by adding new route information
          </p>
          {submitError && (
            <p className="text-center text-red-500 mt-2">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-center text-green-500 mt-2">
              Thank you for your contribution!
            </p>
          )}
        </CardHeader>
        <CardContent>
          <motion.form
            ref={formRef}
            variants={slideIn('left', '', 0, 1)}
            initial="hidden"
            animate="show"
            onSubmit={handleSubmit}
            className="space-y-6"
            encType="multipart/form-data"
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
                <div className="mt-2">
                  <Label htmlFor="startStationImage">Station Image (optional)</Label>
                  <Input
                    id="startStationImage"
                    name="startStationImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setStartStationPreview)}
                    className="mt-1"
                  />
                  {startStationPreview && (
                    <div className="mt-2">
                      <Image
                        src={startStationPreview}
                        alt="Start station preview"
                        width={128}
                        height={128}
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="endStation">End Station</Label>
                <Input
                  id="endStation"
                  name="endStation"
                  placeholder="Enter end station name"
                  required
                />
                <div className="mt-2">
                  <Label htmlFor="endStationImage">Station Image (optional)</Label>
                  <Input
                    id="endStationImage"
                    name="endStationImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setEndStationPreview)}
                    className="mt-1"
                  />
                  {endStationPreview && (
                    <div className="mt-2">
                      <Image
                        src={endStationPreview}
                        alt="End station preview"
                        width={128}
                        height={128}
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Route Data"}
            </Button>
          </motion.form>
        </CardContent>
      </Card>
    </main>
  )
} 