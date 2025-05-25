-- Initial Teams Seed Data

-- Create team challenges
INSERT INTO challenges (title, description, category, difficulty, points, start_date, end_date, is_active, is_repeatable, cooldown_days)
VALUES
  ('Team Collaboration', 'Have all team members complete at least one service booking', 'team', 'medium', 100, '2024-01-01', NULL, true, true, 30),
  ('Team Referrals', 'Have team members refer a total of 5 new users', 'team', 'medium', 150, '2024-01-01', NULL, true, true, 30),
  ('Community Team', 'Have team members create a total of 10 forum posts', 'team', 'medium', 120, '2024-01-01', NULL, true, true, 30),
  ('Service Excellence', 'Have service provider team members maintain an average rating of 4.5+ for a month', 'team', 'hard', 200, '2024-01-01', NULL, true, true, 30),
  ('Team Challenge Masters', 'Have all team members complete at least 3 individual challenges', 'team', 'hard', 250, '2024-01-01', NULL, true, true, 30);

-- Add requirements for team challenges
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Team Collaboration'), 'team', 'team_booking_all_members', 1, NULL),
  ((SELECT id FROM challenges WHERE title = 'Team Referrals'), 'team', 'team_referrals', 5, NULL),
  ((SELECT id FROM challenges WHERE title = 'Community Team'), 'team', 'team_forum_posts', 10, NULL),
  ((SELECT id FROM challenges WHERE title = 'Service Excellence'), 'team', 'team_service_rating', 1, NULL),
  ((SELECT id FROM challenges WHERE title = 'Team Challenge Masters'), 'team', 'team_challenges_per_member', 3, NULL);

-- Add rewards for team challenges
INSERT INTO challenge_rewards (challenge_id, type, value, metadata)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Team Collaboration'), 'badge', 'team_collaborator', '{"name": "Team Collaborator", "description": "Your team had all members complete a service booking"}'),
  ((SELECT id FROM challenges WHERE title = 'Team Referrals'), 'badge', 'team_networker', '{"name": "Team Networker", "description": "Your team referred 5 new users to the platform"}'),
  ((SELECT id FROM challenges WHERE title = 'Community Team'), 'badge', 'team_contributor', '{"name": "Team Contributor", "description": "Your team created 10 forum posts"}'),
  ((SELECT id FROM challenges WHERE title = 'Service Excellence'), 'badge', 'team_excellence', '{"name": "Team Excellence", "description": "Your service provider team maintained a 4.5+ rating for a month"}'),
  ((SELECT id FROM challenges WHERE title = 'Team Challenge Masters'), 'badge', 'team_achievers', '{"name": "Team Achievers", "description": "All team members completed at least 3 individual challenges"}');

-- Create function to create sample teams
CREATE OR REPLACE FUNCTION create_sample_teams()
RETURNS void AS $$
DECLARE
    v_client_users UUID[];
    v_service_agent_users UUID[];
    v_team_id UUID;
    v_leader_id UUID;
    v_member_id UUID;
    v_team_names TEXT[] := ARRAY[
        'Home Improvement Heroes', 
        'Renovation Rockstars', 
        'Maintenance Masters', 
        'Service Superstars', 
        'Community Champions',
        'Project Pros',
        'Contractor Crew',
        'DIY Dynamos',
        'Repair Rangers',
        'Building Buddies'
    ];
    v_team_descriptions TEXT[] := ARRAY[
        'A team dedicated to home improvement projects and services',
        'Experts in renovation projects working together',
        'Specialists in home maintenance and upkeep',
        'Top service providers collaborating for excellence',
        'Community-focused team helping others with their projects',
        'Professional project managers and contractors',
        'A crew of skilled contractors working together',
        'DIY enthusiasts helping each other with projects',
        'Specialists in repair services across multiple domains',
        'Building professionals collaborating on construction projects'
    ];
    v_team_count INTEGER := 0;
BEGIN
    -- Get client users
    SELECT ARRAY_AGG(id) INTO v_client_users
    FROM profiles
    WHERE user_type = 'client'
    LIMIT 50;
    
    -- Get service agent users
    SELECT ARRAY_AGG(id) INTO v_service_agent_users
    FROM profiles
    WHERE user_type IN ('service_agent', 'contractor')
    LIMIT 50;
    
    -- Create client teams
    FOR i IN 1..5 LOOP
        IF v_client_users IS NULL OR array_length(v_client_users, 1) < i * 3 THEN
            EXIT;
        END IF;
        
        -- Select a leader
        v_leader_id := v_client_users[i];
        
        -- Create team
        INSERT INTO teams (name, description, leader_id, member_count, total_points)
        VALUES (
            v_team_names[i],
            v_team_descriptions[i],
            v_leader_id,
            3, -- Start with 3 members
            FLOOR(RANDOM() * 500)::INTEGER -- Random initial points
        )
        RETURNING id INTO v_team_id;
        
        -- Add leader as member
        INSERT INTO team_members (team_id, user_id, role, points_contributed, joined_at)
        VALUES (
            v_team_id,
            v_leader_id,
            'leader',
            FLOOR(RANDOM() * 200)::INTEGER,
            NOW() - (RANDOM() * INTERVAL '30 days')
        );
        
        -- Add other members
        FOR j IN 1..2 LOOP
            v_member_id := v_client_users[i * 3 + j];
            
            INSERT INTO team_members (team_id, user_id, role, points_contributed, joined_at)
            VALUES (
                v_team_id,
                v_member_id,
                'member',
                FLOOR(RANDOM() * 150)::INTEGER,
                NOW() - (RANDOM() * INTERVAL '20 days')
            );
        END LOOP;
        
        v_team_count := v_team_count + 1;
    END LOOP;
    
    -- Create service agent teams
    FOR i IN 1..5 LOOP
        IF v_service_agent_users IS NULL OR array_length(v_service_agent_users, 1) < i * 3 THEN
            EXIT;
        END IF;
        
        -- Select a leader
        v_leader_id := v_service_agent_users[i];
        
        -- Create team
        INSERT INTO teams (name, description, leader_id, member_count, total_points)
        VALUES (
            v_team_names[i + 5],
            v_team_descriptions[i + 5],
            v_leader_id,
            3, -- Start with 3 members
            FLOOR(RANDOM() * 500)::INTEGER -- Random initial points
        )
        RETURNING id INTO v_team_id;
        
        -- Add leader as member
        INSERT INTO team_members (team_id, user_id, role, points_contributed, joined_at)
        VALUES (
            v_team_id,
            v_leader_id,
            'leader',
            FLOOR(RANDOM() * 200)::INTEGER,
            NOW() - (RANDOM() * INTERVAL '30 days')
        );
        
        -- Add other members
        FOR j IN 1..2 LOOP
            v_member_id := v_service_agent_users[i * 3 + j];
            
            INSERT INTO team_members (team_id, user_id, role, points_contributed, joined_at)
            VALUES (
                v_team_id,
                v_member_id,
                'member',
                FLOOR(RANDOM() * 150)::INTEGER,
                NOW() - (RANDOM() * INTERVAL '20 days')
            );
        END LOOP;
        
        v_team_count := v_team_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Created % teams', v_team_count;
END;
$$ LANGUAGE plpgsql;

-- Create team leaderboard
INSERT INTO leaderboards (name, description, type, period, is_active)
VALUES
  ('Top Teams', 'Teams with the most points', 'team_points', 'all_time', true);

-- Update the team leaderboard with a custom query
UPDATE leaderboards
SET metadata = jsonb_build_object(
    'query', 'SELECT 
        t.id as team_id,
        t.name as team_name,
        t.logo_url,
        t.member_count,
        t.total_points as score,
        p.first_name as leader_first_name,
        p.last_name as leader_last_name,
        ROW_NUMBER() OVER (ORDER BY t.total_points DESC) as rank
    FROM 
        teams t
    JOIN
        profiles p ON t.leader_id = p.id
    ORDER BY 
        score DESC, t.name
    LIMIT {limit} OFFSET {offset}'
)
WHERE name = 'Top Teams';
