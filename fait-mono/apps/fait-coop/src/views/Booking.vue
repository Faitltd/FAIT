<script setup lang="ts">
import { ref, computed } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'
import Badge from '../components/ui/Badge.vue'

// Available services
const services = ref([
  {
    id: 1,
    name: 'Home Inspection',
    description: 'Comprehensive inspection of your home to identify potential issues.',
    duration: 120,
    price: 250,
    category: 'inspection'
  },
  {
    id: 2,
    name: 'Plumbing Repair',
    description: 'Fix leaky pipes, clogged drains, and other plumbing issues.',
    duration: 90,
    price: 150,
    category: 'repair'
  },
  {
    id: 3,
    name: 'Electrical Work',
    description: 'Installation and repair of electrical systems and fixtures.',
    duration: 120,
    price: 200,
    category: 'electrical'
  },
  {
    id: 4,
    name: 'HVAC Maintenance',
    description: 'Regular maintenance of heating, ventilation, and air conditioning systems.',
    duration: 60,
    price: 120,
    category: 'maintenance'
  },
  {
    id: 5,
    name: 'Roof Inspection',
    description: 'Thorough inspection of your roof to identify damage or potential issues.',
    duration: 90,
    price: 180,
    category: 'inspection'
  },
  {
    id: 6,
    name: 'Painting Services',
    description: 'Interior and exterior painting services for your home.',
    duration: 240,
    price: 350,
    category: 'renovation'
  }
])

// Form data
const formData = ref({
  service: '',
  date: '',
  time: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  notes: ''
})

// Form errors
const formErrors = ref({
  service: '',
  date: '',
  time: '',
  name: '',
  email: '',
  phone: ''
})

// Form state
const currentStep = ref(1)
const isSubmitting = ref(false)
const isSubmitted = ref(false)

// Available time slots
const timeSlots = ref([
  '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
])

// Selected service
const selectedService = computed(() => {
  if (!formData.value.service) return null
  return services.value.find(service => service.id.toString() === formData.value.service)
})

// Format price
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`
}

// Format duration
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins} minutes`
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`
}

// Go to next step
const nextStep = () => {
  // Validate current step
  if (currentStep.value === 1) {
    formErrors.value.service = !formData.value.service ? 'Please select a service' : ''
    formErrors.value.date = !formData.value.date ? 'Please select a date' : ''
    formErrors.value.time = !formData.value.time ? 'Please select a time' : ''
    
    if (formErrors.value.service || formErrors.value.date || formErrors.value.time) {
      return
    }
  } else if (currentStep.value === 2) {
    formErrors.value.name = !formData.value.name ? 'Please enter your name' : ''
    formErrors.value.email = !formData.value.email ? 'Please enter your email' : ''
    formErrors.value.phone = !formData.value.phone ? 'Please enter your phone number' : ''
    
    if (formErrors.value.name || formErrors.value.email || formErrors.value.phone) {
      return
    }
  }
  
  currentStep.value++
}

// Go to previous step
const prevStep = () => {
  currentStep.value--
}

// Submit booking
const submitBooking = async () => {
  isSubmitting.value = true
  
  try {
    // In a real app, you would send the booking data to a server here
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show success message
    isSubmitted.value = true
  } catch (error) {
    console.error('Error submitting booking:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <MainLayout>
    <!-- Hero Section -->
    <section class="py-16 bg-primary-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="heading-1 mb-6 text-primary-900">Book a Service</h1>
          <p class="text-body mb-8">
            Schedule a service with one of our trusted professionals. We'll match you with the right person for the job.
          </p>
        </div>
      </div>
    </section>
    
    <!-- Booking Section -->
    <section class="py-16 bg-white">
      <div class="container-wide">
        <div class="max-w-4xl mx-auto">
          <!-- Progress Steps -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div :class="[
                  'flex items-center justify-center w-10 h-10 rounded-full text-white font-medium',
                  currentStep >= 1 ? 'bg-primary-600' : 'bg-neutral-300'
                ]">
                  1
                </div>
                <div class="ml-2">
                  <p :class="[
                    'font-medium',
                    currentStep >= 1 ? 'text-primary-600' : 'text-neutral-500'
                  ]">Select Service</p>
                </div>
              </div>
              
              <div class="flex-1 mx-4 h-1 bg-neutral-200">
                <div :class="[
                  'h-full bg-primary-600 transition-all duration-300',
                  currentStep >= 2 ? 'w-full' : currentStep >= 1 ? 'w-1/2' : 'w-0'
                ]"></div>
              </div>
              
              <div class="flex items-center">
                <div :class="[
                  'flex items-center justify-center w-10 h-10 rounded-full text-white font-medium',
                  currentStep >= 2 ? 'bg-primary-600' : 'bg-neutral-300'
                ]">
                  2
                </div>
                <div class="ml-2">
                  <p :class="[
                    'font-medium',
                    currentStep >= 2 ? 'text-primary-600' : 'text-neutral-500'
                  ]">Your Details</p>
                </div>
              </div>
              
              <div class="flex-1 mx-4 h-1 bg-neutral-200">
                <div :class="[
                  'h-full bg-primary-600 transition-all duration-300',
                  currentStep >= 3 ? 'w-full' : currentStep >= 2 ? 'w-1/2' : 'w-0'
                ]"></div>
              </div>
              
              <div class="flex items-center">
                <div :class="[
                  'flex items-center justify-center w-10 h-10 rounded-full text-white font-medium',
                  currentStep >= 3 ? 'bg-primary-600' : 'bg-neutral-300'
                ]">
                  3
                </div>
                <div class="ml-2">
                  <p :class="[
                    'font-medium',
                    currentStep >= 3 ? 'text-primary-600' : 'text-neutral-500'
                  ]">Confirmation</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Success Message -->
          <div v-if="isSubmitted" class="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-2xl font-bold text-neutral-900 mb-2">Booking Confirmed!</h2>
            <p class="text-neutral-600 mb-6">Your service has been scheduled successfully. We'll send you a confirmation email with all the details.</p>
            <Button to="/" variant="primary">Return to Home</Button>
          </div>
          
          <!-- Booking Form -->
          <Card v-else variant="outline" padding="lg">
            <!-- Step 1: Select Service -->
            <div v-if="currentStep === 1">
              <h2 class="text-2xl font-bold text-neutral-900 mb-6">Select a Service</h2>
              
              <div class="mb-6">
                <label class="block text-sm font-medium text-neutral-700 mb-1">Service Type</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="service in services"
                    :key="service.id"
                    :class="[
                      'border rounded-lg p-4 cursor-pointer transition-all duration-200',
                      formData.service === service.id.toString()
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    ]"
                    @click="formData.service = service.id.toString()"
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-medium text-neutral-900">{{ service.name }}</h3>
                        <p class="text-sm text-neutral-500 mt-1">{{ service.description }}</p>
                        <div class="flex items-center mt-2">
                          <Badge variant="outline" size="sm" class="mr-2">{{ formatDuration(service.duration) }}</Badge>
                          <Badge variant="primary" size="sm">{{ formatPrice(service.price) }}</Badge>
                        </div>
                      </div>
                      <div :class="[
                        'w-5 h-5 rounded-full border flex items-center justify-center',
                        formData.service === service.id.toString()
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-neutral-300'
                      ]">
                        <svg v-if="formData.service === service.id.toString()" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-if="formErrors.service" class="mt-1 text-sm text-red-600">{{ formErrors.service }}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label for="date" class="block text-sm font-medium text-neutral-700 mb-1">Date</label>
                  <input
                    id="date"
                    v-model="formData.date"
                    type="date"
                    :min="new Date().toISOString().split('T')[0]"
                    class="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  <p v-if="formErrors.date" class="mt-1 text-sm text-red-600">{{ formErrors.date }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Time</label>
                  <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <button
                      v-for="slot in timeSlots"
                      :key="slot"
                      type="button"
                      :class="[
                        'py-2 px-3 text-sm rounded-md border focus:outline-none',
                        formData.time === slot
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                      ]"
                      @click="formData.time = slot"
                    >
                      {{ slot }}
                    </button>
                  </div>
                  <p v-if="formErrors.time" class="mt-1 text-sm text-red-600">{{ formErrors.time }}</p>
                </div>
              </div>
              
              <div class="flex justify-end">
                <Button @click="nextStep" variant="primary">Continue</Button>
              </div>
            </div>
            
            <!-- Step 2: Your Details -->
            <div v-else-if="currentStep === 2">
              <h2 class="text-2xl font-bold text-neutral-900 mb-6">Your Details</h2>
              
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Input
                    v-model="formData.name"
                    label="Full Name"
                    placeholder="Enter your full name"
                    :error="formErrors.name"
                    required
                    fullWidth
                  />
                </div>
                
                <div>
                  <Input
                    v-model="formData.email"
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    :error="formErrors.email"
                    required
                    fullWidth
                  />
                </div>
                
                <div>
                  <Input
                    v-model="formData.phone"
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    :error="formErrors.phone"
                    required
                    fullWidth
                  />
                </div>
                
                <div>
                  <Input
                    v-model="formData.address"
                    label="Service Address"
                    placeholder="Enter the service address"
                    fullWidth
                  />
                </div>
                
                <div class="sm:col-span-2">
                  <label for="notes" class="block text-sm font-medium text-neutral-700 mb-1">Additional Notes</label>
                  <textarea
                    id="notes"
                    v-model="formData.notes"
                    rows="4"
                    class="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Any specific details or requirements for the service"
                  ></textarea>
                </div>
              </div>
              
              <div class="mt-6 flex justify-between">
                <Button @click="prevStep" variant="outline">Back</Button>
                <Button @click="nextStep" variant="primary">Review Booking</Button>
              </div>
            </div>
            
            <!-- Step 3: Confirmation -->
            <div v-else-if="currentStep === 3">
              <h2 class="text-2xl font-bold text-neutral-900 mb-6">Review Your Booking</h2>
              
              <div class="bg-neutral-50 rounded-lg p-6 mb-6">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="font-semibold text-lg">{{ selectedService?.name }}</h3>
                    <p class="text-neutral-600">{{ selectedService?.description }}</p>
                  </div>
                  <Badge variant="primary">{{ formatPrice(selectedService?.price || 0) }}</Badge>
                </div>
                
                <div class="border-t border-neutral-200 pt-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-neutral-500">Date</p>
                      <p class="font-medium">{{ formData.date }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-neutral-500">Time</p>
                      <p class="font-medium">{{ formData.time }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-neutral-500">Duration</p>
                      <p class="font-medium">{{ formatDuration(selectedService?.duration || 0) }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-neutral-500">Service Type</p>
                      <p class="font-medium">{{ selectedService?.category }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-neutral-50 rounded-lg p-6 mb-6">
                <h3 class="font-semibold mb-4">Contact Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-neutral-500">Name</p>
                    <p class="font-medium">{{ formData.name }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-neutral-500">Email</p>
                    <p class="font-medium">{{ formData.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-neutral-500">Phone</p>
                    <p class="font-medium">{{ formData.phone }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-neutral-500">Address</p>
                    <p class="font-medium">{{ formData.address || 'Not provided' }}</p>
                  </div>
                </div>
                
                <div v-if="formData.notes" class="mt-4">
                  <p class="text-sm text-neutral-500">Additional Notes</p>
                  <p class="font-medium">{{ formData.notes }}</p>
                </div>
              </div>
              
              <div class="flex items-center mb-6">
                <input id="terms" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded" required />
                <label for="terms" class="ml-2 block text-sm text-neutral-700">
                  I agree to the <a href="#" class="text-primary-600 hover:text-primary-500">terms and conditions</a> and <a href="#" class="text-primary-600 hover:text-primary-500">privacy policy</a>.
                </label>
              </div>
              
              <div class="flex justify-between">
                <Button @click="prevStep" variant="outline">Back</Button>
                <Button @click="submitBooking" variant="primary" :loading="isSubmitting" :disabled="isSubmitting">
                  Confirm Booking
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
