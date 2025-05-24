import { supabase } from '../../lib/supabase';
import { Event, UserEventParticipation } from '../../types/gamification.types';
import { pointsService } from '../PointsService';

/**
 * Service for handling event functionality
 */
export class EventService {
  /**
   * Get active events
   * @returns List of active events
   */
  async getActiveEvents(): Promise<Event[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select('*, challenges(*)')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching active events:', error);
        return [];
      }

      return data as Event[];
    } catch (error) {
      console.error('Error in getActiveEvents:', error);
      return [];
    }
  }

  /**
   * Get upcoming events
   * @returns List of upcoming events
   */
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gt('start_date', now)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming events:', error);
        return [];
      }

      return data as Event[];
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error);
      return [];
    }
  }

  /**
   * Get event by ID
   * @param eventId Event ID
   * @returns Event if found
   */
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, challenges(*)')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event by ID:', error);
        return null;
      }

      return data as Event;
    } catch (error) {
      console.error('Error in getEventById:', error);
      return null;
    }
  }

  /**
   * Get user event participations
   * @param userId User ID
   * @returns List of user event participations
   */
  async getUserEventParticipations(userId: string): Promise<UserEventParticipation[]> {
    try {
      const { data, error } = await supabase
        .from('user_event_participations')
        .select('*')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching user event participations:', error);
        return [];
      }

      return data as UserEventParticipation[];
    } catch (error) {
      console.error('Error in getUserEventParticipations:', error);
      return [];
    }
  }

  /**
   * Join an event
   * @param userId User ID
   * @param eventId Event ID
   * @returns Created user event participation
   */
  async joinEvent(userId: string, eventId: string): Promise<UserEventParticipation | null> {
    try {
      // Check if user already joined this event
      const { data: existingParticipation, error: checkError } = await supabase
        .from('user_event_participations')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();

      if (!checkError && existingParticipation) {
        return existingParticipation as UserEventParticipation;
      }

      // Get the event
      const event = await this.getEventById(eventId);
      if (!event || !event.is_active) {
        throw new Error('Event not found or not active');
      }

      // Check if event has started and not ended
      const now = new Date();
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      
      if (now < startDate) {
        throw new Error('Event has not started yet');
      }
      
      if (now > endDate) {
        throw new Error('Event has already ended');
      }

      // Create user event participation
      const { data, error } = await supabase
        .from('user_event_participations')
        .insert([
          {
            user_id: userId,
            event_id: eventId,
            points_earned: 0,
            challenges_completed: 0,
            rewards_claimed: false,
            joined_at: now.toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error joining event:', error);
        return null;
      }

      // Join all event challenges
      for (const challenge of event.challenges) {
        await supabase
          .from('user_challenges')
          .insert([
            {
              user_id: userId,
              challenge_id: challenge.id,
              progress: 0,
              is_completed: false,
              last_progress_date: now.toISOString()
            }
          ]);
      }

      // Record event join activity
      await supabase
        .from('gamification_activities')
        .insert([
          {
            user_id: userId,
            action: 'event_joined',
            target_id: eventId,
            metadata: {
              event_title: event.title,
              event_type: event.type
            }
          }
        ]);

      return data as UserEventParticipation;
    } catch (error) {
      console.error('Error in joinEvent:', error);
      return null;
    }
  }

  /**
   * Update event participation
   * @param userId User ID
   * @param eventId Event ID
   * @param challengeId Challenge ID that was completed
   */
  async updateEventParticipation(
    userId: string,
    eventId: string,
    challengeId: string
  ): Promise<void> {
    try {
      // Get user event participation
      const { data: participation, error } = await supabase
        .from('user_event_participations')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();

      if (error) {
        console.error('Error fetching user event participation:', error);
        return;
      }

      // Get challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('points')
        .eq('id', challengeId)
        .single();

      if (challengeError) {
        console.error('Error fetching challenge:', challengeError);
        return;
      }

      // Update participation
      await supabase
        .from('user_event_participations')
        .update({
          points_earned: participation.points_earned + challenge.points,
          challenges_completed: participation.challenges_completed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', participation.id);

      // Check if all event challenges are completed
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*, challenges(*)')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Error fetching event:', eventError);
        return;
      }

      const { data: completedChallenges, error: completedError } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .in('challenge_id', event.challenges.map((c: any) => c.id));

      if (completedError) {
        console.error('Error fetching completed challenges:', completedError);
        return;
      }

      // If all challenges completed, award event completion rewards
      if (completedChallenges.length === event.challenges.length && !participation.rewards_claimed) {
        await this.awardEventCompletionRewards(userId, eventId);
      }
    } catch (error) {
      console.error('Error in updateEventParticipation:', error);
    }
  }

  /**
   * Award event completion rewards
   * @param userId User ID
   * @param eventId Event ID
   */
  private async awardEventCompletionRewards(userId: string, eventId: string): Promise<void> {
    try {
      // Get event
      const event = await this.getEventById(eventId);
      if (!event) {
        return;
      }

      // Mark rewards as claimed
      await supabase
        .from('user_event_participations')
        .update({
          rewards_claimed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('event_id', eventId);

      // Process each reward
      for (const reward of event.rewards) {
        switch (reward.type) {
          case 'points':
            // Award bonus points
            await pointsService.awardPoints(
              userId,
              Number(reward.value),
              `Completed all challenges in event: ${event.title}`,
              'event_completion',
              eventId
            );
            break;
          
          case 'badge':
            // Award badge (create user achievement)
            if (typeof reward.value === 'string') {
              await supabase
                .from('user_achievements')
                .insert([
                  {
                    user_id: userId,
                    achievement_id: reward.value,
                    unlocked_at: new Date().toISOString()
                  }
                ]);
            }
            break;
          
          case 'title':
            // Award title
            if (typeof reward.value === 'string') {
              await supabase
                .from('user_titles')
                .insert([
                  {
                    user_id: userId,
                    title: reward.value,
                    source: 'event',
                    source_id: eventId,
                    is_active: false,
                    unlocked_at: new Date().toISOString()
                  }
                ]);
            }
            break;
        }
      }

      // Record event completion activity
      await supabase
        .from('gamification_activities')
        .insert([
          {
            user_id: userId,
            action: 'event_completed',
            target_id: eventId,
            metadata: {
              event_title: event.title,
              event_type: event.type,
              rewards: event.rewards
            }
          }
        ]);
    } catch (error) {
      console.error('Error in awardEventCompletionRewards:', error);
    }
  }
}
