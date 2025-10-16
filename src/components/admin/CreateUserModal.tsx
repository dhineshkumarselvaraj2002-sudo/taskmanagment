'use client'

import { useState, useEffect } from 'react'
import { UserFormData } from '@/types'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Name and email' },
  { id: 2, title: 'Security', description: 'Password' }
]

interface CreateUserModalProps {
  onClose?: () => void
  onSave?: () => void
}

export default function CreateUserModal({ onClose, onSave }: CreateUserModalProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER', // Will be set automatically by API
    isActive: true, // Will be set automatically by API
    emailNotifications: true // Will be set automatically by API
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  // Step navigation functions
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const goToStep = (step: number) => {
    if (step <= currentStep || validateCurrentStep()) {
      setCurrentStep(step)
    }
  }

  // Step validation
  const validateCurrentStep = () => {
    setError('')
    
    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.name.trim()) {
          setError('Name is required')
          return false
        }
        if (!formData.email.trim()) {
          setError('Email is required')
          return false
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address')
          return false
        }
        return true
      
      case 2: // Security
        if (!formData.password.trim()) {
          setError('Password is required')
          return false
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Final validation before submission
    if (!formData.name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }
    if (!formData.password.trim()) {
      setError('Password is required')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "User Created Successfully",
          description: `${formData.name} has been added to the system.`,
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        })
        onSave?.()
        handleClose()
      } else {
        setError(data.error || 'Failed to create user')
        toast({
          title: "Error Creating User",
          description: data.error || 'Failed to create user',
          variant: "destructive",
        })
      }
    } catch (error) {
      setError('Failed to create user')
      toast({
        title: "Error Creating User",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      nextStep()
    } else {
      // If on last step, submit the form
      handleSubmit(new Event('submit') as any)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Step components
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                    placeholder="Enter full name"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                    placeholder="Enter email address"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-3">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-4 pr-12 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                    placeholder="Enter secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                </div>
                <p className="mt-2 text-sm text-gray-500">Password must be at least 6 characters long</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen || !isClient) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Modern backdrop with enhanced blur */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300" 
        onClick={handleClose}
      />
      
      {/* Modern Modal Content with glassmorphism */}
      <div 
        className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 w-full max-w-4xl max-h-[95vh] flex flex-col animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Modern Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-8 pt-8 pb-6 flex-shrink-0 border-b border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Create New User
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                    Step {currentStep} of {STEPS.length}
                  </span>
                  <span className="text-sm text-gray-600">{STEPS[currentStep - 1]?.title}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="group rounded-xl p-3 text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200 hover:shadow-lg"
              >
                <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Modern Progress Steps */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center space-y-3">
                    <button
                      type="button"
                      onClick={() => goToStep(step.id)}
                      className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                        currentStep === step.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                          : currentStep > step.id
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </button>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-900">{step.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Modern Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="mx-8 mb-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Modern Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8">
            <div className="py-8">
              <div className="max-w-2xl mx-auto">
                {renderStepContent()}
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          <div className="bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border-t border-gray-200/50 px-8 py-6 flex justify-between items-center flex-shrink-0">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="group flex items-center space-x-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-sm font-semibold text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/80 hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="group flex items-center space-x-2 px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                suppressHydrationWarning
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === STEPS.length ? 'Create User' : 'Next'}</span>
                    {currentStep < STEPS.length && <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
