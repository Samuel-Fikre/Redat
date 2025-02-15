import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  totalPrice: number
  route?: string
}

const FORMSPREE_FORM_ID = 'movqvqbp'

export function FeedbackModal({ isOpen, onClose, totalPrice, route }: FeedbackModalProps) {
  const [step, setStep] = useState<'initial' | 'feedback' | 'thanks'>("initial")
  const [isAccurate, setIsAccurate] = useState<boolean | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      console.log('Submitting feedback to Formspree...')
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          priceAccurate: 'No',
          feedback,
          totalPrice,
          route,
          timestamp: new Date().toISOString(),
        }),
      })

      const responseData = await response.json()
      console.log('Formspree response:', responseData)

      if (response.ok) {
        setStep('thanks')
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        console.error('Formspree error:', responseData)
        throw new Error(responseData.error || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Failed to submit feedback. Please try again.'
      )
    }
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setStep('initial')
    setIsAccurate(null)
    setFeedback("")
    setSubmitError(null)
    onClose()
  }

  const handleAccuracyResponse = (accurate: boolean) => {
    setIsAccurate(accurate)
    if (accurate) {
      // If user selects "Yes", just show thank you message
      setStep('thanks')
      setTimeout(() => {
        handleClose()
      }, 1500)
    } else {
      // If user selects "No", show feedback form
      setStep('feedback')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 'initial' ? 'Price Accuracy Feedback' : 
             step === 'feedback' ? 'Tell Us More' : 
             'Thank You'}
          </DialogTitle>
        </DialogHeader>
        
        {step === 'thanks' ? (
          <div className="py-6 text-center">
            <p className="text-green-600 dark:text-green-400 font-medium">
              Thank you for your feedback!
            </p>
          </div>
        ) : step === 'initial' ? (
          <div className="space-y-4">
            <p className="text-center">Was the price information accurate?</p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => handleAccuracyResponse(true)}
                disabled={isSubmitting}
              >
                Yes
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAccuracyResponse(false)}
                disabled={isSubmitting}
              >
                No
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Please tell us why the price was not accurate:</p>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
            />
            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!feedback.trim() || isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 