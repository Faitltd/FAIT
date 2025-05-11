# FAIT Co-op Gamification System

This document provides an overview of the gamification system implemented in the FAIT Co-op platform to enhance user engagement and retention.

## Overview

The gamification system is designed to reward users for their activities on the platform, encourage regular usage, and foster a sense of community. It includes various elements such as challenges, events, leaderboards, levels, and teams.

## Key Components

### Challenges

Challenges are tasks that users can complete to earn points, badges, titles, and other rewards. They are categorized by:

- **Difficulty**: Easy, Medium, Hard, Expert
- **Category**: Profile, Service, Community, Referral, Activity, Special, etc.
- **User Type**: Client, Service Agent, or Common challenges

Challenges can be one-time or repeatable with cooldown periods.

### Events

Events are time-limited activities that include multiple challenges. They provide special rewards upon completion and create a sense of urgency and excitement. Events can be:

- **Seasonal**: Tied to specific seasons or times of year
- **Special**: One-time or irregular events
- **Community**: Focused on community engagement
- **Promotional**: Marketing-focused events

### Daily Tasks

Daily tasks reset every day and provide small rewards for regular platform usage. They are tailored to different user types and encourage consistent engagement.

### Levels

Users progress through levels as they earn points. Each level unlocks new features, titles, and rewards, providing a sense of progression and achievement.

### Streaks

Streaks track consecutive days of activity, encouraging users to use the platform regularly. Maintaining streaks provides bonus points and special rewards.

### Teams

Teams allow users to collaborate, compete together on leaderboards, and complete team challenges. They foster community and social connections within the platform.

### Leaderboards

Leaderboards showcase top users in various categories, creating friendly competition. They include:

- **Points Leaderboards**: Weekly, Monthly, All-Time
- **Achievement Leaderboards**: Most challenges completed, etc.
- **Specialized Leaderboards**: Service Provider ratings, Community contributions, etc.
- **Team Leaderboards**: Ranking teams by points and achievements

## Technical Implementation

### Database Structure

The gamification system uses the following main tables:

- `challenges`: Stores challenge definitions
- `challenge_requirements`: Defines requirements for completing challenges
- `challenge_rewards`: Specifies rewards for completing challenges
- `user_challenges`: Tracks user progress on challenges
- `events`: Stores event definitions
- `event_challenges`: Links challenges to events
- `event_rewards`: Specifies rewards for completing events
- `user_event_participations`: Tracks user participation in events
- `daily_tasks`: Defines daily tasks
- `user_daily_tasks`: Tracks user progress on daily tasks
- `level_definitions`: Defines levels and requirements
- `level_rewards`: Specifies rewards for reaching levels
- `user_levels`: Tracks user level progress
- `streaks`: Tracks user activity streaks
- `teams`: Stores team information
- `team_members`: Links users to teams
- `team_challenges`: Tracks team progress on challenges
- `leaderboards`: Defines leaderboard configurations
- `user_titles`: Tracks titles earned by users
- `gamification_settings`: Stores user preferences for gamification

### Services

The gamification functionality is implemented through several service classes:

- `GamificationService`: Main service that coordinates all gamification functionality
- `ChallengeService`: Manages challenges and user progress
- `EventService`: Handles events and user participation
- `LeaderboardService`: Manages leaderboards and rankings
- `LevelService`: Handles user level progression
- `DailyTaskService`: Manages daily tasks and resets
- `StreakService`: Tracks and updates user streaks
- `TeamService`: Handles team creation, management, and challenges

### Integration Points

The gamification system integrates with the platform through:

1. **Activity Tracking**: Platform actions trigger gamification updates
2. **User Interface**: Gamification elements are displayed throughout the UI
3. **Notifications**: Users receive notifications about challenges, events, and rewards
4. **User Profiles**: Gamification achievements are displayed on user profiles

## User Experience

### Client Experience

Clients are rewarded for:
- Completing their profiles
- Exploring and booking services
- Participating in the community forum
- Referring friends to the platform
- Providing feedback and reviews

### Service Agent Experience

Service agents are rewarded for:
- Creating and maintaining service listings
- Completing verification processes
- Providing excellent service (high ratings)
- Responding quickly to inquiries
- Sharing knowledge in the community forum

### Admin Tools

Administrators can:
- Create and manage challenges and events
- Monitor user engagement metrics
- Adjust gamification parameters
- Create special rewards and promotions

## Deployment

To deploy the gamification system:

1. Run the database migrations in the `supabase/migrations` directory
2. Seed initial data using the scripts in the `supabase/seed` directory
3. Configure scheduled tasks for daily resets and leaderboard updates

## Future Enhancements

Planned enhancements for the gamification system include:

- **Achievement System**: A comprehensive achievement system with badges and milestones
- **Reward Store**: Allow users to spend earned points on rewards
- **Personalized Challenges**: Dynamically generated challenges based on user behavior
- **Social Sharing**: Enable users to share achievements on social media
- **Advanced Analytics**: More detailed tracking of gamification effectiveness
- **Seasonal Themes**: Themed challenges and events tied to seasons and holidays

## Conclusion

The gamification system is designed to enhance user engagement, encourage platform usage, and build community. By rewarding users for their activities and providing clear progression paths, it aims to increase user retention and satisfaction with the FAIT Co-op platform.
