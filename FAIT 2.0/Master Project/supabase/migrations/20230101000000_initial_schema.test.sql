BEGIN;

-- Test presence of all tables
DO $$
BEGIN
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'), 
        'profiles table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verification_documents'), 
        'verification_documents table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services'), 
        'services table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings'), 
        'bookings table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'warranty_claims'), 
        'warranty_claims table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'token_transactions'), 
        'token_transactions table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'events'), 
        'events table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_rsvps'), 
        'event_rsvps table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'governance_proposals'), 
        'governance_proposals table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proposal_votes'), 
        'proposal_votes table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vendor_discounts'), 
        'vendor_discounts table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_rooms'), 
        'chat_rooms table should exist';
    ASSERT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_messages'), 
        'chat_messages table should exist';

    -- Test column constraints and defaults
    ASSERT (SELECT count(*) FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles') = 11, 
            'profiles should have 11 columns';
            
    ASSERT (SELECT data_type FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'token_balance') = 'integer', 
            'token_balance should be integer';
            
    ASSERT (SELECT column_default FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'token_balance') = '0', 
            'token_balance default should be 0';
            
    -- Test enum constraints
    ASSERT (SELECT count(*) FROM pg_constraint 
            WHERE conname LIKE '%profiles_user_type%' AND contype = 'c') = 1, 
            'profiles should have user_type check constraint';
            
    ASSERT (SELECT count(*) FROM pg_constraint 
            WHERE conname LIKE '%verification_documents_status%' AND contype = 'c') = 1, 
            'verification_documents should have status check constraint';

    -- Test foreign key relationships
    ASSERT (SELECT count(*) FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'verification_documents') = 1, 
            'verification_documents should have 1 foreign key';
            
    ASSERT (SELECT count(*) FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'bookings') = 3, 
            'bookings should have 3 foreign keys';
            
    -- Test unique constraints
    ASSERT (SELECT count(*) FROM information_schema.table_constraints 
            WHERE constraint_type = 'UNIQUE' AND table_name = 'event_rsvps') = 1, 
            'event_rsvps should have 1 unique constraint';
            
    ASSERT (SELECT count(*) FROM information_schema.table_constraints 
            WHERE constraint_type = 'UNIQUE' AND table_name = 'proposal_votes') = 1, 
            'proposal_votes should have 1 unique constraint';
            
END $$;

ROLLBACK;