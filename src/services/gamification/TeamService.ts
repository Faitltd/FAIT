import { supabase } from '../../lib/supabase';
import { Team, TeamMember, TeamChallenge } from '../../types/gamification.types';

/**
 * Service for handling team functionality
 */
export class TeamService {
  /**
   * Get all teams
   * @param limit Number of teams to return
   * @param offset Offset for pagination
   * @returns List of teams
   */
  async getTeams(limit: number = 20, offset: number = 0): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('total_points', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching teams:', error);
        return [];
      }

      return data as Team[];
    } catch (error) {
      console.error('Error in getTeams:', error);
      return [];
    }
  }

  /**
   * Get team by ID
   * @param teamId Team ID
   * @returns Team if found
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) {
        console.error('Error fetching team by ID:', error);
        return null;
      }

      return data as Team;
    } catch (error) {
      console.error('Error in getTeamById:', error);
      return null;
    }
  }

  /**
   * Get team members
   * @param teamId Team ID
   * @returns List of team members
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*, user:profiles(id, first_name, last_name, avatar_url, user_type)')
        .eq('team_id', teamId)
        .order('role', { ascending: true })
        .order('points_contributed', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      return data as TeamMember[];
    } catch (error) {
      console.error('Error in getTeamMembers:', error);
      return [];
    }
  }

  /**
   * Get user's team
   * @param userId User ID
   * @returns User's team if found
   */
  async getUserTeam(userId: string): Promise<Team | null> {
    try {
      // Check if user is in a team
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId)
        .single();

      if (memberError) {
        if (memberError.code === 'PGRST116') {
          // User is not in a team
          return null;
        }
        console.error('Error fetching user team membership:', memberError);
        return null;
      }

      // Get the team
      return this.getTeamById(teamMember.team_id);
    } catch (error) {
      console.error('Error in getUserTeam:', error);
      return null;
    }
  }

  /**
   * Create a new team
   * @param userId User ID (team leader)
   * @param name Team name
   * @param description Team description
   * @param logoUrl Team logo URL (optional)
   * @returns Created team
   */
  async createTeam(
    userId: string,
    name: string,
    description: string,
    logoUrl?: string
  ): Promise<Team | null> {
    try {
      // Check if user is already in a team
      const userTeam = await this.getUserTeam(userId);
      if (userTeam) {
        throw new Error('User is already in a team');
      }

      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([
          {
            name,
            description,
            logo_url: logoUrl,
            leader_id: userId,
            member_count: 1,
            total_points: 0
          }
        ])
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        return null;
      }

      // Add user as team leader
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: team.id,
            user_id: userId,
            role: 'leader',
            points_contributed: 0,
            joined_at: new Date().toISOString()
          }
        ]);

      if (memberError) {
        console.error('Error adding user as team leader:', memberError);
        // Clean up team if member creation fails
        await supabase.from('teams').delete().eq('id', team.id);
        return null;
      }

      // Record team creation activity
      await supabase
        .from('gamification_activities')
        .insert([
          {
            user_id: userId,
            action: 'team_created',
            target_id: team.id,
            metadata: {
              team_name: name
            }
          }
        ]);

      return team as Team;
    } catch (error) {
      console.error('Error in createTeam:', error);
      return null;
    }
  }

  /**
   * Join a team
   * @param userId User ID
   * @param teamId Team ID
   * @returns Created team membership
   */
  async joinTeam(userId: string, teamId: string): Promise<TeamMember | null> {
    try {
      // Check if user is already in a team
      const userTeam = await this.getUserTeam(userId);
      if (userTeam) {
        throw new Error('User is already in a team');
      }

      // Get the team
      const team = await this.getTeamById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      // Add user as team member
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: teamId,
            user_id: userId,
            role: 'member',
            points_contributed: 0,
            joined_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (memberError) {
        console.error('Error joining team:', memberError);
        return null;
      }

      // Update team member count
      await supabase
        .from('teams')
        .update({
          member_count: team.member_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId);

      // Record team join activity
      await supabase
        .from('gamification_activities')
        .insert([
          {
            user_id: userId,
            action: 'team_joined',
            target_id: teamId,
            metadata: {
              team_name: team.name
            }
          }
        ]);

      return member as TeamMember;
    } catch (error) {
      console.error('Error in joinTeam:', error);
      return null;
    }
  }

  /**
   * Leave a team
   * @param userId User ID
   * @returns Success status
   */
  async leaveTeam(userId: string): Promise<boolean> {
    try {
      // Get user's team membership
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select('*, team:teams(*)')
        .eq('user_id', userId)
        .single();

      if (memberError) {
        console.error('Error fetching user team membership:', memberError);
        return false;
      }

      // Check if user is the team leader
      if (teamMember.role === 'leader') {
        // Check if there are other members
        const { data: otherMembers, error: otherError } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', teamMember.team_id)
          .neq('user_id', userId);

        if (otherError) {
          console.error('Error fetching other team members:', otherError);
          return false;
        }

        if (otherMembers.length > 0) {
          // Find a co-leader or the member with the most points
          let newLeader = otherMembers.find(m => m.role === 'co-leader');
          if (!newLeader) {
            // Sort by points and get the top member
            otherMembers.sort((a, b) => b.points_contributed - a.points_contributed);
            newLeader = otherMembers[0];
          }

          // Promote the new leader
          await supabase
            .from('team_members')
            .update({
              role: 'leader'
            })
            .eq('id', newLeader.id);

          // Update team leader
          await supabase
            .from('teams')
            .update({
              leader_id: newLeader.user_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', teamMember.team_id);
        } else {
          // No other members, delete the team
          await supabase
            .from('teams')
            .delete()
            .eq('id', teamMember.team_id);
        }
      }

      // Remove user from team
      const { error: removeError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', userId)
        .eq('team_id', teamMember.team_id);

      if (removeError) {
        console.error('Error removing user from team:', removeError);
        return false;
      }

      // Update team member count and points
      if (teamMember.role !== 'leader' || teamMember.team.member_count > 1) {
        await supabase
          .from('teams')
          .update({
            member_count: teamMember.team.member_count - 1,
            total_points: teamMember.team.total_points - teamMember.points_contributed,
            updated_at: new Date().toISOString()
          })
          .eq('id', teamMember.team_id);
      }

      // Record team leave activity
      await supabase
        .from('gamification_activities')
        .insert([
          {
            user_id: userId,
            action: 'team_left',
            target_id: teamMember.team_id,
            metadata: {
              team_name: teamMember.team.name
            }
          }
        ]);

      return true;
    } catch (error) {
      console.error('Error in leaveTeam:', error);
      return false;
    }
  }

  /**
   * Update team member points
   * @param userId User ID
   * @param points Points to add
   */
  async updateTeamMemberPoints(userId: string, points: number): Promise<void> {
    try {
      // Get user's team membership
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (memberError) {
        // User is not in a team
        return;
      }

      // Update member points
      await supabase
        .from('team_members')
        .update({
          points_contributed: teamMember.points_contributed + points
        })
        .eq('id', teamMember.id);

      // Update team total points
      await supabase
        .from('teams')
        .update({
          total_points: supabase.rpc('increment_counter', {
            row_id: teamMember.team_id,
            counter_name: 'total_points',
            increment_by: points
          }),
          updated_at: new Date().toISOString()
        })
        .eq('id', teamMember.team_id);
    } catch (error) {
      console.error('Error in updateTeamMemberPoints:', error);
    }
  }

  /**
   * Get team challenges
   * @param teamId Team ID
   * @returns List of team challenges
   */
  async getTeamChallenges(teamId: string): Promise<TeamChallenge[]> {
    try {
      const { data, error } = await supabase
        .from('team_challenges')
        .select('*, challenge:challenges(*)')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team challenges:', error);
        return [];
      }

      return data as TeamChallenge[];
    } catch (error) {
      console.error('Error in getTeamChallenges:', error);
      return [];
    }
  }
}
