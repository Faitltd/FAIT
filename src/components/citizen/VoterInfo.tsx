import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner';

// Types
interface Address {
  locationName?: string;
  line1?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface PollingLocation {
  address: Address;
  pollingHours?: string;
  startDate?: string;
  endDate?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

interface Contest {
  type: string;
  office?: string;
  ballotTitle?: string;
  district?: {
    name: string;
    scope?: string;
  };
  candidates?: {
    name: string;
    party?: string;
    candidateUrl?: string;
    phone?: string;
    email?: string;
  }[];
  referendumTitle?: string;
  referendumText?: string;
  referendumBallotResponses?: string[];
}

interface VoterInfoResponse {
  pollingLocations?: PollingLocation[];
  dropOffLocations?: PollingLocation[];
  earlyVoteSites?: PollingLocation[];
  contests?: Contest[];
  normalizedInput?: Address;
  election?: {
    id: string;
    name: string;
    electionDay: string;
  };
}

interface VoterInfoProps {
  apiKey: string;
}

const VoterInfo: React.FC<VoterInfoProps> = ({ apiKey }) => {
  const [address, setAddress] = useState('');
  const [electionId, setElectionId] = useState('');
  const [voterInfo, setVoterInfo] = useState<VoterInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elections, setElections] = useState<Array<{id: string, name: string, electionDay: string}>>([]);
  const [loadingElections, setLoadingElections] = useState(false);

  // Fetch elections when component mounts
  React.useEffect(() => {
    const fetchElections = async () => {
      setLoadingElections(true);
      try {
        const response = await fetch(
          `https://www.googleapis.com/civicinfo/v2/elections?key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch elections');
        }
        
        const data = await response.json();
        setElections(data.elections || []);
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError('Failed to load elections. Please try again later.');
      } finally {
        setLoadingElections(false);
      }
    };
    
    fetchElections();
  }, [apiKey]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }
    
    if (!electionId) {
      setError('Please select an election');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/civicinfo/v2/voterinfo?key=${apiKey}&address=${encodeURIComponent(address)}&electionId=${electionId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch voter information');
      }
      
      const data = await response.json();
      setVoterInfo(data);
    } catch (err) {
      console.error('Error fetching voter information:', err);
      setError('Failed to find voter information. Please check your address and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render polling locations
  const renderPollingLocations = () => {
    if (!voterInfo?.pollingLocations || voterInfo.pollingLocations.length === 0) {
      return <p className="text-gray-600 italic">No polling locations found for this address.</p>;
    }
    
    return (
      <div className="space-y-4">
        {voterInfo.pollingLocations.map((location, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-semibold text-lg text-blue-700">
              {location.address.locationName || 'Polling Location'}
            </h4>
            <p className="text-gray-700">
              {location.address.line1}<br />
              {location.address.city}, {location.address.state} {location.address.zip}
            </p>
            {location.pollingHours && (
              <p className="mt-2 text-gray-600">
                <span className="font-medium">Hours:</span> {location.pollingHours}
              </p>
            )}
            {location.startDate && location.endDate && (
              <p className="text-gray-600">
                <span className="font-medium">Dates:</span> {new Date(location.startDate).toLocaleDateString()} - {new Date(location.endDate).toLocaleDateString()}
              </p>
            )}
            {location.latitude && location.longitude && (
              <a
                href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                View on Map
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render contests (ballot items)
  const renderContests = () => {
    if (!voterInfo?.contests || voterInfo.contests.length === 0) {
      return <p className="text-gray-600 italic">No contest information available for this election.</p>;
    }
    
    return (
      <div className="space-y-6">
        {voterInfo.contests.map((contest, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="font-semibold text-lg text-blue-700">
              {contest.ballotTitle || contest.office || contest.referendumTitle || 'Contest'}
            </h4>
            {contest.district && (
              <p className="text-gray-600">
                <span className="font-medium">District:</span> {contest.district.name}
                {contest.district.scope && ` (${contest.district.scope})`}
              </p>
            )}
            
            {contest.type === 'General' && contest.candidates && (
              <div className="mt-3">
                <h5 className="font-medium text-gray-800 mb-2">Candidates:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contest.candidates.map((candidate, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="font-medium">{candidate.name}</p>
                      {candidate.party && <p className="text-gray-600">{candidate.party}</p>}
                      {candidate.candidateUrl && (
                        <a 
                          href={candidate.candidateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Campaign Website
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {contest.type === 'Referendum' && (
              <div className="mt-3">
                {contest.referendumText && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-800 mb-1">Description:</h5>
                    <p className="text-gray-700">{contest.referendumText}</p>
                  </div>
                )}
                {contest.referendumBallotResponses && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Options:</h5>
                    <ul className="list-disc list-inside">
                      {contest.referendumBallotResponses.map((response, idx) => (
                        <li key={idx} className="text-gray-700">{response}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-blue-50 rounded-lg p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-blue-800 mb-4">Find Your Voting Information</h3>
      <p className="text-gray-700 mb-6">
        Enter your registered address and select an upcoming election to find your polling location, 
        ballot information, and more.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Your Registered Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your full address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="election" className="block text-sm font-medium text-gray-700 mb-1">
            Select an Election
          </label>
          {loadingElections ? (
            <div className="py-2">Loading elections...</div>
          ) : (
            <select
              id="election"
              value={electionId}
              onChange={(e) => setElectionId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select an Election --</option>
              {elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.name} ({new Date(election.electionDay).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
          >
            {loading ? 'Searching...' : 'Find Voting Information'}
          </button>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </div>
      </form>
      
      {loading && <LoadingSpinner />}
      
      {voterInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {voterInfo.normalizedInput && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-semibold text-lg text-blue-700 mb-2">Registered Address</h4>
              <p className="text-gray-700">
                {voterInfo.normalizedInput.line1}<br />
                {voterInfo.normalizedInput.city}, {voterInfo.normalizedInput.state} {voterInfo.normalizedInput.zip}
              </p>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold text-xl text-blue-800 mb-3">Polling Locations</h4>
            {renderPollingLocations()}
          </div>
          
          <div>
            <h4 className="font-semibold text-xl text-blue-800 mb-3">What's On Your Ballot</h4>
            {renderContests()}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoterInfo;
