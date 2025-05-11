-- Create base tables for the application

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    bio TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('client', 'service_agent', 'admin')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0
);

-- Create service_packages table
CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER,
    duration_unit TEXT CHECK (duration_unit IN ('minutes', 'hours', 'days')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    service_package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    address TEXT,
    notes TEXT,
    price DECIMAL(10, 2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY view_own_profile ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Policy for users to update their own profile
CREATE POLICY update_own_profile ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Policy for users to view other profiles
CREATE POLICY view_other_profiles ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for admins to manage all profiles
CREATE POLICY admin_manage_profiles ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Create RLS policies for service_packages
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- Policy for everyone to view active service packages
CREATE POLICY view_active_service_packages ON public.service_packages
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Policy for service agents to manage their own service packages
CREATE POLICY service_agent_manage_service_packages ON public.service_packages
    FOR ALL
    TO authenticated
    USING (service_agent_id = auth.uid());

-- Policy for admins to manage all service packages
CREATE POLICY admin_manage_service_packages ON public.service_packages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Create RLS policies for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy for clients to view their own bookings
CREATE POLICY client_view_bookings ON public.bookings
    FOR SELECT
    TO authenticated
    USING (client_id = auth.uid());

-- Policy for clients to create bookings
CREATE POLICY client_create_bookings ON public.bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (client_id = auth.uid());

-- Policy for clients to update their own bookings
CREATE POLICY client_update_bookings ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (client_id = auth.uid())
    WITH CHECK (client_id = auth.uid());

-- Policy for service agents to view bookings assigned to them
CREATE POLICY service_agent_view_bookings ON public.bookings
    FOR SELECT
    TO authenticated
    USING (service_agent_id = auth.uid());

-- Policy for service agents to update bookings assigned to them
CREATE POLICY service_agent_update_bookings ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (service_agent_id = auth.uid())
    WITH CHECK (service_agent_id = auth.uid());

-- Policy for admins to manage all bookings
CREATE POLICY admin_manage_bookings ON public.bookings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to update updated_at timestamp
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_service_packages_updated_at ON public.service_packages;
CREATE TRIGGER update_service_packages_updated_at
BEFORE UPDATE ON public.service_packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
