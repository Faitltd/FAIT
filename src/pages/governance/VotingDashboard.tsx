import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Vote,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  BarChart,
  AlertTriangle,
  Filter,
  ChevronDown,
  Search,
  PlusCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Vote = {
  id: string;
  user_id: string;
  proposal_id: string;
  vote: 'for' | 'against';
  created_at: string;
};
type Proposal = {
  id: string;
  title: string;
  description: string;
  category: 'policy' | 'feature' | 'community' | 'other';
  status: 'active' | 'passed' | 'failed' | 'pending';
  created_by: string;
  created_at: string;
  ends_at: string;
  min_points_required: number;
  votes_for: number;
  votes_against: number;
  creator: Profile;
  user_vote?: Vote;
};

const VotingDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Proposal['category'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Proposal['status'] | 'all'>('all');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: 'policy' as Proposal['category'],
    minPoints: 100,
    durationDays: 7,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch user's points
        const { data: transactions, error: pointsError } = await supabase
          .from('points_transactions')
          .select('*')
          .eq('user_id', user.id);

        if (pointsError) throw pointsError;

        const totalPoints = transactions?.reduce((sum, transaction) => {
          return transaction.transaction_type === 'earned'
            ? sum + transaction.points_amount
            : sum - transaction.points_amount;
        }, 0) || 0;

        setUserPoints(totalPoints);

        // Fetch proposals with votes
        const { data: proposalsData, error: proposalsError } = await supabase
          .from('governance_proposals')
          .select(`
            *,
            creator:profiles(*),
            user_vote:governance_votes(*)
          `)
          .order('created_at', { ascending: false });

        if (proposalsError) throw proposalsError;
        setProposals(proposalsData as Proposal[]);
      } catch (err) {
        console.error('Error fetching governance data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load governance data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleVote = async (proposalId: string, vote: 'for' | 'against') => {
    try {
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) return;

      if (userPoints < proposal.min_points_required) {
        setError(`You need at least ${proposal.min_points_required} points to vote on this proposal`);
        return;
      }

      const { error: voteError } = await supabase
        .from('governance_votes')
        .upsert({
          user_id: user?.id,
          proposal_id: proposalId,
          vote,
        });

      if (voteError) throw voteError;

      // Update local state
      setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          const oldVote = p.user_vote?.vote;
          return {
            ...p,
            votes_for: vote === 'for' 
              ? p.votes_for + (oldVote === 'against' ? 2 : oldVote ? 0 : 1)
              : p.votes_for - (oldVote === 'for' ? 1 : 0),
            votes_against: vote === 'against'
              ? p.votes_against + (oldVote === 'for' ? 2 : oldVote ? 0 : 1)
              : p.votes_against - (oldVote === 'against' ? 1 : 0),
            user_vote: { ...p.user_vote, vote },
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error voting:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (userPoints < 500) {
        setError('You need at least 500 points to create a proposal');
        return;
      }

      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + newProposal.durationDays);

      const { data, error: proposalError } = await supabase
        .from('governance_proposals')
        .insert({
          title: newProposal.title,
          description: newProposal.description,
          category: newProposal.category,
          created_by: user?.id,
          min_points_required: newProposal.minPoints,
          ends_at: endsAt.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Update local state
      setProposals(prev => [data as Proposal, ...prev]);
      setShowProposalForm(false);
      setNewProposal({
        title: '',
        description: '',
        category: 'policy',
        minPoints: 100,
        durationDays: 7,
      });
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || proposal.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'passed':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Passed
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Failed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Vote className="w-4 h-4 mr-1" />
            Active
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Governance</h1>
            <p className="mt-1 text-sm text-gray-500">
              Vote on proposals and help shape the future of FAIT Co-Op
            </p>
          </div>
          <button
            onClick={() => setShowProposalForm(!showProposalForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Proposal
          </button>
        </div>

        <div className="mt-4 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Your Voting Power</h2>
              <p className="mt-1 text-3xl font-bold text-blue-600">{userPoints} points</p>
            </div>
            <Users className="h-12 w-12 text-blue-600" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showProposalForm && (
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Proposal</h2>
          <form onSubmit={handleCreateProposal} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newProposal.title}
                onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={newProposal.description}
                onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  value={newProposal.category}
                  onChange={(e) => setNewProposal(prev => ({ 
                    ...prev, 
                    category: e.target.value as Proposal['category']
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="policy">Policy</option>
                  <option value="feature">Feature</option>
                  <option value="community">Community</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="minPoints" className="block text-sm font-medium text-gray-700">
                  Minimum Points Required
                </label>
                <input
                  type="number"
                  id="minPoints"
                  value={newProposal.minPoints}
                  onChange={(e) => setNewProposal(prev => ({ 
                    ...prev, 
                    minPoints: parseInt(e.target.value) 
                  }))}
                  min="100"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (days)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={newProposal.durationDays}
                  onChange={(e) => setNewProposal(prev => ({ 
                    ...prev, 
                    durationDays: parseInt(e.target.value) 
                  }))}
                  min="1"
                  max="30"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowProposalForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Proposal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search proposals..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as Proposal['category'] | 'all')}
                  className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="policy">Policy</option>
                  <option value="feature">Feature</option>
                  <option value="community">Community</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Proposal['status'] | 'all')}
                  className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="divide-y divide-gray-200">
          {filteredProposals.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              No proposals found
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <div key={proposal.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-medium text-gray-900">{proposal.title}</h3>
                      {getStatusBadge(proposal.status)}
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {proposal.category}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <span>By {proposal.creator.full_name}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Ends {new Date(proposal.ends_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{proposal.description}</p>

                    <div className="mt-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${
                                  proposal.votes_for + proposal.votes_against > 0
                                    ? (proposal.votes_for / (proposal.votes_for + proposal.votes_against)) * 100
                                    : 0
                                }%`
                              }}
                            />
                          </div>
                          <div className="mt-2 flex justify-between text-sm text-gray-600">
                            <span>{proposal.votes_for} For</span>
                            <span>{proposal.votes_against} Against</span>
                          </div>
                        </div>
                        {proposal.status === 'active' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleVote(proposal.id, 'for')}
                              className={`px-4 py-2 rounded-md text-sm font-medium ${
                                proposal.user_vote?.vote === 'for'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Vote For
                            </button>
                            <button
                              onClick={() => handleVote(proposal.id, 'against')}
                              className={`px-4 py-2 rounded-md text-sm font-medium ${
                                proposal.user_vote?.vote === 'against'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Vote Against
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingDashboard;