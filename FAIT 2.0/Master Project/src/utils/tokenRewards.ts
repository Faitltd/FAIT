import { SupabaseClient } from '@supabase/supabase-js';

export enum RewardAction {
  COMPLETE_JOB = 'complete_job',
  WRITE_REVIEW = 'write_review',
  REFER_MEMBER = 'refer_member',
  ATTEND_EVENT = 'attend_event',
  CIVIC_PARTICIPATION = 'civic_participation'
}

interface RewardConfig {
  [key: string]: number;
}

// Token reward amounts for different actions
const rewardAmounts: RewardConfig = {
  [RewardAction.COMPLETE_JOB]: 50,
  [RewardAction.WRITE_REVIEW]: 10,
  [RewardAction.REFER_MEMBER]: 100,
  [RewardAction.ATTEND_EVENT]: 15,
  [RewardAction.CIVIC_PARTICIPATION]: 25
};

export async function awardTokens(
  supabase: SupabaseClient,
  userId: string,
  action: RewardAction,
  referenceId?: string,
  description?: string
): Promise<boolean> {
  const amount = rewardAmounts[action];
  
  if (!amount) {
    console.error(`Invalid reward action: ${action}`);
    return false;
  }
  
  try {
    // Start a transaction
    const { data, error } = await supabase.rpc('award_tokens', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: action,
      p_reference_id: referenceId || null,
      p_description: description || null
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error awarding tokens:', error);
    return false;
  }
}

export async function getUserTokenBalance(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('token_balance')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data.token_balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

export async function getTokenTransactionHistory(
  supabase: SupabaseClient,
  userId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching token history:', error);
    return [];
  }
}