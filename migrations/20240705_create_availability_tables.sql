-- Create service_agent_availability table
CREATE TABLE IF NOT EXISTS public.service_agent_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  UNIQUE(service_agent_id, day_of_week, start_time, end_time)
);

-- Create service_agent_unavailable_dates table for specific dates
CREATE TABLE IF NOT EXISTS public.service_agent_unavailable_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_agent_id, date)
);

-- Create service_availability table for specific services
CREATE TABLE IF NOT EXISTS public.service_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  UNIQUE(service_id, day_of_week, start_time, end_time)
);

-- Create RLS policies for service_agent_availability
ALTER TABLE public.service_agent_availability ENABLE ROW LEVEL SECURITY;

-- Service agents can view their own availability
CREATE POLICY "Service agents can view their own availability" 
ON public.service_agent_availability FOR SELECT 
USING (auth.uid() = service_agent_id);

-- Service agents can insert their own availability
CREATE POLICY "Service agents can insert their own availability" 
ON public.service_agent_availability FOR INSERT 
WITH CHECK (auth.uid() = service_agent_id);

-- Service agents can update their own availability
CREATE POLICY "Service agents can update their own availability" 
ON public.service_agent_availability FOR UPDATE 
USING (auth.uid() = service_agent_id);

-- Service agents can delete their own availability
CREATE POLICY "Service agents can delete their own availability" 
ON public.service_agent_availability FOR DELETE 
USING (auth.uid() = service_agent_id);

-- Clients can view service agent availability
CREATE POLICY "Clients can view service agent availability" 
ON public.service_agent_availability FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'client'
  )
);

-- Admins can view all service agent availability
CREATE POLICY "Admins can view all service agent availability" 
ON public.service_agent_availability FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Create RLS policies for service_agent_unavailable_dates
ALTER TABLE public.service_agent_unavailable_dates ENABLE ROW LEVEL SECURITY;

-- Service agents can view their own unavailable dates
CREATE POLICY "Service agents can view their own unavailable dates" 
ON public.service_agent_unavailable_dates FOR SELECT 
USING (auth.uid() = service_agent_id);

-- Service agents can insert their own unavailable dates
CREATE POLICY "Service agents can insert their own unavailable dates" 
ON public.service_agent_unavailable_dates FOR INSERT 
WITH CHECK (auth.uid() = service_agent_id);

-- Service agents can update their own unavailable dates
CREATE POLICY "Service agents can update their own unavailable dates" 
ON public.service_agent_unavailable_dates FOR UPDATE 
USING (auth.uid() = service_agent_id);

-- Service agents can delete their own unavailable dates
CREATE POLICY "Service agents can delete their own unavailable dates" 
ON public.service_agent_unavailable_dates FOR DELETE 
USING (auth.uid() = service_agent_id);

-- Clients can view service agent unavailable dates
CREATE POLICY "Clients can view service agent unavailable dates" 
ON public.service_agent_unavailable_dates FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'client'
  )
);

-- Admins can view all service agent unavailable dates
CREATE POLICY "Admins can view all service agent unavailable dates" 
ON public.service_agent_unavailable_dates FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Create RLS policies for service_availability
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;

-- Service agents can view availability for their services
CREATE POLICY "Service agents can view their service availability" 
ON public.service_availability FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.services
    WHERE id = service_id AND service_agent_id = auth.uid()
  )
);

-- Service agents can insert availability for their services
CREATE POLICY "Service agents can insert their service availability" 
ON public.service_availability FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.services
    WHERE id = service_id AND service_agent_id = auth.uid()
  )
);

-- Service agents can update availability for their services
CREATE POLICY "Service agents can update their service availability" 
ON public.service_availability FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.services
    WHERE id = service_id AND service_agent_id = auth.uid()
  )
);

-- Service agents can delete availability for their services
CREATE POLICY "Service agents can delete their service availability" 
ON public.service_availability FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.services
    WHERE id = service_id AND service_agent_id = auth.uid()
  )
);

-- Clients can view service availability
CREATE POLICY "Clients can view service availability" 
ON public.service_availability FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'client'
  )
);

-- Admins can view all service availability
CREATE POLICY "Admins can view all service availability" 
ON public.service_availability FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Create function to check availability when booking
CREATE OR REPLACE FUNCTION public.check_service_agent_availability(
  p_service_agent_id UUID,
  p_service_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  day_num INTEGER;
  is_available BOOLEAN;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_num := EXTRACT(DOW FROM p_service_date);
  
  -- Check if date is marked as unavailable
  IF EXISTS (
    SELECT 1 FROM public.service_agent_unavailable_dates
    WHERE service_agent_id = p_service_agent_id AND date = p_service_date
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if there's a booking conflict
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE service_agent_id = p_service_agent_id
      AND service_date = p_service_date
      AND status IN ('confirmed', 'pending')
      AND (
        (start_time <= p_start_time AND end_time > p_start_time) OR
        (start_time < p_end_time AND end_time >= p_end_time) OR
        (start_time >= p_start_time AND end_time <= p_end_time)
      )
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if time slot is within service agent's availability
  SELECT EXISTS (
    SELECT 1 FROM public.service_agent_availability
    WHERE service_agent_id = p_service_agent_id
      AND day_of_week = day_num
      AND start_time <= p_start_time
      AND end_time >= p_end_time
  ) INTO is_available;
  
  RETURN is_available;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get available time slots for a service
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  p_service_id UUID,
  p_date DATE
)
RETURNS TABLE (
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_service_agent_id UUID;
  day_num INTEGER;
BEGIN
  -- Get service agent ID
  SELECT service_agent_id INTO v_service_agent_id
  FROM public.services
  WHERE id = p_service_id;
  
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_num := EXTRACT(DOW FROM p_date);
  
  -- Check if date is marked as unavailable
  IF EXISTS (
    SELECT 1 FROM public.service_agent_unavailable_dates
    WHERE service_agent_id = v_service_agent_id AND date = p_date
  ) THEN
    RETURN;
  END IF;
  
  -- Get available time slots
  RETURN QUERY
  WITH service_times AS (
    -- Get service-specific availability if it exists
    SELECT start_time, end_time
    FROM public.service_availability
    WHERE service_id = p_service_id AND day_of_week = day_num
    
    UNION ALL
    
    -- If no service-specific availability, use service agent's general availability
    SELECT sa.start_time, sa.end_time
    FROM public.service_agent_availability sa
    WHERE sa.service_agent_id = v_service_agent_id
      AND sa.day_of_week = day_num
      AND NOT EXISTS (
        SELECT 1 FROM public.service_availability
        WHERE service_id = p_service_id AND day_of_week = day_num
      )
  ),
  time_slots AS (
    -- Generate 1-hour time slots within available times
    SELECT 
      t.start_time + (INTERVAL '1 hour' * n) AS slot_start,
      t.start_time + (INTERVAL '1 hour' * (n + 1)) AS slot_end
    FROM service_times t
    CROSS JOIN generate_series(0, EXTRACT(HOUR FROM t.end_time)::INTEGER - EXTRACT(HOUR FROM t.start_time)::INTEGER - 1) AS n
  )
  SELECT 
    ts.slot_start::TIME,
    ts.slot_end::TIME,
    NOT EXISTS (
      SELECT 1 FROM public.bookings
      WHERE service_agent_id = v_service_agent_id
        AND service_date = p_date
        AND status IN ('confirmed', 'pending')
        AND (
          (start_time <= ts.slot_start AND end_time > ts.slot_start) OR
          (start_time < ts.slot_end AND end_time >= ts.slot_end) OR
          (start_time >= ts.slot_start AND end_time <= ts.slot_end)
        )
    ) AS is_available
  FROM time_slots ts
  ORDER BY ts.slot_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
