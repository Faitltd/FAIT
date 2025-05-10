import { useState, useCallback } from 'react';

export interface BookingState {
  step: number;
  selectedService: string | null;
  selectedServiceAgent: string | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  specialInstructions: string;
  totalAmount: number;
}

interface UseBookingStateOptions {
  initialStep?: number;
  initialService?: string | null;
  initialServiceAgent?: string | null;
  onStepChange?: (step: number) => void;
}

/**
 * Custom hook for managing booking state across wizard steps
 */
export function useBookingState(options: UseBookingStateOptions = {}) {
  const {
    initialStep = 1,
    initialService = null,
    initialServiceAgent = null,
    onStepChange
  } = options;

  // Initialize booking state
  const [bookingState, setBookingState] = useState<BookingState>({
    step: initialStep,
    selectedService: initialService,
    selectedServiceAgent: initialServiceAgent,
    scheduledDate: null,
    scheduledTime: null,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    specialInstructions: '',
    totalAmount: 0
  });

  // Update a specific field in the booking state
  const updateField = useCallback(<K extends keyof BookingState>(
    field: K,
    value: BookingState[K]
  ) => {
    setBookingState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Navigate to the next step
  const nextStep = useCallback(() => {
    const newStep = bookingState.step + 1;
    setBookingState(prev => ({
      ...prev,
      step: newStep
    }));
    if (onStepChange) {
      onStepChange(newStep);
    }
  }, [bookingState.step, onStepChange]);

  // Navigate to the previous step
  const prevStep = useCallback(() => {
    if (bookingState.step > 1) {
      const newStep = bookingState.step - 1;
      setBookingState(prev => ({
        ...prev,
        step: newStep
      }));
      if (onStepChange) {
        onStepChange(newStep);
      }
    }
  }, [bookingState.step, onStepChange]);

  // Go to a specific step
  const goToStep = useCallback((step: number) => {
    setBookingState(prev => ({
      ...prev,
      step
    }));
    if (onStepChange) {
      onStepChange(step);
    }
  }, [onStepChange]);

  // Set date and time
  const setDateTime = useCallback((date: string, time: string) => {
    setBookingState(prev => ({
      ...prev,
      scheduledDate: date,
      scheduledTime: time
    }));
  }, []);

  // Set location details
  const setLocation = useCallback((address: string, city: string, state: string, zipCode: string) => {
    setBookingState(prev => ({
      ...prev,
      address,
      city,
      state,
      zipCode
    }));
  }, []);

  // Reset the booking state
  const resetBooking = useCallback(() => {
    setBookingState({
      step: initialStep,
      selectedService: initialService,
      selectedServiceAgent: initialServiceAgent,
      scheduledDate: null,
      scheduledTime: null,
      address: '',
      city: '',
      state: '',
      zipCode: '',
      specialInstructions: '',
      totalAmount: 0
    });
  }, [initialStep, initialService, initialServiceAgent]);

  return {
    bookingState,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    setDateTime,
    setLocation,
    resetBooking
  };
}

export default useBookingState;
