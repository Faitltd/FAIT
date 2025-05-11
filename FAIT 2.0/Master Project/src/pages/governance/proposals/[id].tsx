import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '../../../components/Button';

const ProposalDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const supabase = useSupabaseClient();
  const user = useUser();
  
  const [proposal, setProposal] = useState<any>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState({ yes: 0, no: 0, abstain: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchProposal = async () => {
      setIsLoading(true);
      
      try {
        // Fetch proposal details
        const { data: proposalData, error: proposalError } = await supabase
          .from('governance_proposals')
          .select('*, proposed_by(full_name)')
          .eq('id', id)
          .single();
          
        if (proposalError) throw proposalError;
        setProposal(proposalData);
        
        // Fetch vote counts
        const { data: voteData, error: voteError } = await supabase
          .from('proposal_votes')
          .select('vote, count(*)')
          .eq('proposal_id', id)
          .group('vote');
          
        if (voteError) throw voteError;
        
        const counts = { yes: 0, no: 0, abstain: 0 };
        voteData.forEach((item: any) => {
          counts[item.vote as keyof typeof counts] = item.count;
        });
        setVoteCounts(counts);
        
        // Check if user has already voted
        if (user) {
          const { data: userVoteData, error: userVoteError } = await supabase
            .from('proposal_votes')
            .select('vote')
            .eq('proposal_id', id)
            .eq('user_id', user.id)
            .single();
            
          if (!userVoteError) {
            setUserVote(userVoteData.vote);
          }
        }
      } catch (error) {
        console.error('Error fetching proposal:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProposal();
  }, [id, supabase, user]);
  
  const handleVote = async (vote: string) => {
    if (!user || !proposal) return;
    
    setIsVoting(true);
    
    try {
      // Check if voting period is active
      const now = new Date();
      const startDate = new Date(proposal.voting_starts_at);
      const endDate = new Date(proposal.voting_ends_at);
      
      if (now < startDate || now > endDate) {
        alert('Voting is not currently active for this proposal');
        return;
      }
      
      // Submit vote
      if (userVote) {
        // Update existing vote
        await supabase
          .from('proposal_votes')
          .update({ vote })
          .eq('proposal_id', id)
          .eq('user_id', user.id);
      } else {
        // Insert new vote
        await supabase
          .from('proposal_votes')
          .insert({
            proposal_id: id,
            user_id: user.id,
            vote
          });
      }
      
      setUserVote(vote);
      
      // Refresh vote counts
      const { data: voteData } = await supabase
        .from('proposal_votes')
        .select('vote, count(*)')
        .eq('proposal_id', id)
        .group('vote');
        
      const counts = { yes: 0, no: 0, abstain: 0 };
      voteData.forEach((item: any) => {
        counts[item.vote as keyof typeof counts] = item.count;
      });
      setVoteCounts(counts);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsVoting(false);
    }
  };
  
  if (isLoading) {
    return <div className="text-center p-8">Loading proposal...</div>;
  }
  
  if (!proposal) {
    return <div className="text-center p-8">Proposal not found</div>;
  }
  
  const totalVotes = voteCounts.yes + voteCounts.no + voteCounts.abstain;
  const yesPercentage = totalVotes > 0 ? (voteCounts.yes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (voteCounts.no / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (voteCounts.abstain / totalVotes) * 100 : 0;
  
  const now = new Date();
  const startDate = new Date(proposal.voting_starts_at);
  const endDate = new Date(proposal.voting_ends_at);
  const isVotingActive = now >= startDate && now <= endDate;
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
      <div className="mb-6">
        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          Status: {proposal.status}
        </span>
        <span className="ml-4 text-gray-600">
          Proposed by: {proposal.proposed_by.full_name}
        </span>
      </div>
      
      <div className="prose max-w-none mb-8">
        {proposal.description}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Voting Results</h2>
        <div className="bg-gray-100 p-4 rounded">
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span>Yes ({voteCounts.yes} votes)</span>
              <span>{yesPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${yesPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span>No ({voteCounts.no} votes)</span>
              <span>{noPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2.5">
              <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${noPercentage}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>Abstain ({voteCounts.abstain} votes)</span>
              <span>{abstainPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2.5">
              <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: `${abstainPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Total votes: {totalVotes}
          </div>
        </div>
      </div>
      
      {user && isVotingActive && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
          <div className="flex space-x-4">
            <Button 
              onClick={() => handleVote('yes')}
              variant={userVote === 'yes' ? 'primary' : 'outline'}
              disabled={isVoting}
            >
              Vote Yes
            </Button>
            <Button 
              onClick={() => handleVote('no')}
              variant={userVote === 'no' ? 'primary' : 'outline'}
              disabled={isVoting}
            >
              Vote No
            </Button>
            <Button 
              onClick={() => handleVote('abstain')}
              variant={userVote === 'abstain' ? 'primary' : 'outline'}
              disabled={isVoting}
            >
              Abstain
            </Button>
          </div>
          {userVote && (
            <div className="mt-2 text-sm text-gray-600">
              You have voted: <span className="font-semibold">{userVote}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        {isVotingActive ? (
          <p>Voting period: Active until {endDate.toLocaleDateString()}</p>
        ) : now < startDate ? (
          <p>Voting begins on {startDate.toLocaleDateString()}</p>
        ) : (
          <p>Voting ended on {endDate.toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
};

export default ProposalDetailPage;