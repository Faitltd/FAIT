<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import Input from '../components/ui/Input.vue'

// Form data
const formData = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

// Form errors
const formErrors = ref({
  name: '',
  email: '',
  message: ''
})

// Form state
const isSubmitting = ref(false)
const isSubmitted = ref(false)

// Handle form submission
const handleSubmit = async () => {
  // Reset errors
  formErrors.value = {
    name: '',
    email: '',
    message: ''
  }
  
  // Validate form
  let isValid = true
  
  if (!formData.value.name) {
    formErrors.value.name = 'Name is required'
    isValid = false
  }
  
  if (!formData.value.email) {
    formErrors.value.email = 'Email is required'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
    formErrors.value.email = 'Invalid email format'
    isValid = false
  }
  
  if (!formData.value.message) {
    formErrors.value.message = 'Message is required'
    isValid = false
  }
  
  if (!isValid) return
  
  // Submit form
  isSubmitting.value = true
  
  try {
    // In a real app, you would send the form data to a server here
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show success message
    isSubmitted.value = true
    
    // Reset form
    formData.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    console.error('Error submitting form:', error)
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
          <h1 class="heading-1 mb-6 text-primary-900">Contact Us</h1>
          <p class="text-body mb-8">
            Have questions about FAIT Co-op? We're here to help. Reach out to our team using the form below or through our contact information.
          </p>
        </div>
      </div>
    </section>
    
    <!-- Contact Section -->
    <section class="py-16 bg-white">
      <div class="container-wide">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Contact Information -->
          <div class="lg:col-span-1">
            <Card variant="outline" padding="lg" class="h-full">
              <h2 class="text-2xl font-bold text-neutral-900 mb-6">Get in Touch</h2>
              
              <div class="space-y-6">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-lg font-medium text-neutral-900">Phone</h3>
                    <p class="mt-1 text-neutral-600">(555) 123-4567</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-lg font-medium text-neutral-900">Email</h3>
                    <p class="mt-1 text-neutral-600">info@faitcoop.org</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-lg font-medium text-neutral-900">Address</h3>
                    <p class="mt-1 text-neutral-600">
                      123 Main Street<br>
                      Denver, CO 80202
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="mt-8">
                <h3 class="text-lg font-medium text-neutral-900 mb-4">Follow Us</h3>
                <div class="flex space-x-4">
                  <a href="#" class="text-neutral-400 hover:text-primary-600 transition-colors duration-200">
                    <span class="sr-only">Facebook</span>
                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" class="text-neutral-400 hover:text-primary-600 transition-colors duration-200">
                    <span class="sr-only">Instagram</span>
                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" class="text-neutral-400 hover:text-primary-600 transition-colors duration-200">
                    <span class="sr-only">Twitter</span>
                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" class="text-neutral-400 hover:text-primary-600 transition-colors duration-200">
                    <span class="sr-only">LinkedIn</span>
                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clip-rule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </Card>
          </div>
          
          <!-- Contact Form -->
          <div class="lg:col-span-2">
            <Card variant="outline" padding="lg">
              <div v-if="isSubmitted" class="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-2xl font-bold text-neutral-900 mb-2">Thank You!</h2>
                <p class="text-neutral-600 mb-6">Your message has been sent successfully. We'll get back to you as soon as possible.</p>
                <Button @click="isSubmitted = false" variant="primary">Send Another Message</Button>
              </div>
              
              <form v-else @submit.prevent="handleSubmit" class="space-y-6">
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Input
                      v-model="formData.name"
                      label="Your Name"
                      placeholder="Enter your name"
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
                      placeholder="Enter your phone number (optional)"
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <Input
                      v-model="formData.subject"
                      label="Subject"
                      placeholder="What is this regarding?"
                      fullWidth
                    />
                  </div>
                  
                  <div class="sm:col-span-2">
                    <label for="message" class="block text-sm font-medium text-neutral-700 mb-1">
                      Message
                      <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      v-model="formData.message"
                      rows="6"
                      :class="[
                        'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
                        formErrors.message ? 'border-red-300' : 'border-neutral-300'
                      ]"
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                    <p v-if="formErrors.message" class="mt-1 text-sm text-red-600">{{ formErrors.message }}</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input id="privacy-policy" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded" required />
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="privacy-policy" class="font-medium text-neutral-700">I agree to the privacy policy</label>
                    <p class="text-neutral-500">Your information will be used to contact you about your inquiry.</p>
                  </div>
                </div>
                
                <div>
                  <Button type="submit" variant="primary" :loading="isSubmitting" :disabled="isSubmitting" fullWidth>
                    Send Message
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Map Section -->
    <section class="py-16 bg-neutral-50">
      <div class="container-wide">
        <h2 class="text-2xl font-bold text-neutral-900 mb-6 text-center">Find Us</h2>
        <div class="bg-white rounded-lg shadow overflow-hidden h-96">
          <!-- In a real app, you would embed a map here -->
          <div class="w-full h-full bg-neutral-200 flex items-center justify-center">
            <p class="text-neutral-600">Map would be displayed here</p>
          </div>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
