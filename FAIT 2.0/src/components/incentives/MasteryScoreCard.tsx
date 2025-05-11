import React, { useState } from 'react';
import { useFAIT } from '../../contexts/FAITContext';
import { Award, Star, MessageSquare, Clock, Trophy, Target, Users, Book, Wrench, Shield } from 'lucide-react';

interface MasteryScoreCardProps {
  showDetails?: boolean;
  demoMode?: boolean;
}

const MasteryScoreCard: React.FC<MasteryScoreCardProps> = ({ showDetails = true, demoMode = true }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'history'>('overview');

  // Use context data if available, otherwise use demo data
  const contextData = useFAIT();

  // Demo data for development and preview
  const demoMastery = {
    skillScore: 78,
    communicationScore: 92,
    reliabilityScore: 85,
    overallScore: 420
  };

  const demoBadges = [
    {
      id: 'badge-1',
      badges: {
        id: 'badge-type-1',
        name: 'Quality Craftsman',
        description: 'Consistently delivers high-quality work',
        icon_url: '',
        badge_type: 'skill'
      },
      awarded_at: '2023-04-15T10:30:00Z'
    },
    {
      id: 'badge-2',
      badges: {
        id: 'badge-type-2',
        name: 'Prompt Responder',
        description: 'Responds to messages within 2 hours',
        icon_url: '',
        badge_type: 'communication'
      },
      awarded_at: '2023-05-22T14:45:00Z'
    },
    {
      id: 'badge-3',
      badges: {
        id: 'badge-type-3',
        name: 'On-Time Delivery',
        description: 'Completed 10 projects on schedule',
        icon_url: '',
        badge_type: 'reliability'
      },
      awarded_at: '2023-06-10T09:15:00Z'
    },
    {
      id: 'badge-4',
      badges: {
        id: 'badge-type-4',
        name: 'Budget Master',
        description: 'Completed 5 projects within budget',
        icon_url: '',
        badge_type: 'skill'
      },
      awarded_at: '2023-07-05T16:30:00Z'
    },
    {
      id: 'badge-5',
      badges: {
        id: 'badge-type-5',
        name: 'Community Contributor',
        description: 'Actively participates in the FAIT community',
        icon_url: '',
        badge_type: 'participation'
      },
      awarded_at: '2023-08-18T11:20:00Z'
    }
  ];

  const demoHistory = [
    { id: 'hist-1', date: '2023-08-20', points: 25, reason: 'Completed project on time', category: 'reliability' },
    { id: 'hist-2', date: '2023-08-15', points: 15, reason: 'Responded to all messages within 2 hours', category: 'communication' },
    { id: 'hist-3', date: '2023-08-10', points: 30, reason: 'Client gave 5-star review', category: 'skill' },
    { id: 'hist-4', date: '2023-08-05', points: 10, reason: 'Completed training module', category: 'skill' },
    { id: 'hist-5', date: '2023-07-28', points: 20, reason: 'Helped another contractor', category: 'participation' }
  ];

  // Use context data or demo data
  const mastery = demoMode ? demoMastery : contextData.mastery;
  const badges = demoMode ? demoBadges : contextData.badges;

  if (!mastery) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">Mastery score data not available</p>
      </div>
    );
  }

  // Calculate level based on overall score
  const calculateLevel = (score: number) => {
    if (score < 100) return 'Apprentice';
    if (score < 300) return 'Journeyman';
    if (score < 600) return 'Craftsman';
    if (score < 1000) return 'Master';
    return 'Grandmaster';
  };

  const level = calculateLevel(mastery.overallScore);

  // Calculate progress to next level
  const getNextLevelThreshold = (currentLevel: string) => {
    switch (currentLevel) {
      case 'Apprentice': return 100;
      case 'Journeyman': return 300;
      case 'Craftsman': return 600;
      case 'Master': return 1000;
      default: return mastery.overallScore + 500; // For Grandmaster, just show progress to next 500
    }
  };

  const nextLevelThreshold = getNextLevelThreshold(level);
  const previousLevelThreshold = level === 'Apprentice' ? 0 :
    level === 'Journeyman' ? 100 :
    level === 'Craftsman' ? 300 :
    level === 'Master' ? 600 :
    mastery.overallScore - (mastery.overallScore % 500);

  const progressPercentage = Math.min(
    100,
    ((mastery.overallScore - previousLevelThreshold) / (nextLevelThreshold - previousLevelThreshold)) * 100
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{level}</h3>
            <p className="text-gray-500">
              {mastery.overallScore} total points
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="flex justify-between text-sm mb-1">
            <span>{previousLevelThreshold} pts</span>
            <span>{nextLevelThreshold} pts</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {Math.round(nextLevelThreshold - mastery.overallScore)} points to next level
          </p>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 mt-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`${
                  activeTab === 'badges'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Badges
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Point History
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <h4 className="font-medium">Skill Score</h4>
                  </div>
                  <div className="text-2xl font-bold">{mastery.skillScore}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-yellow-500 h-1.5 rounded-full"
                      style={{ width: `${mastery.skillScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Based on project quality and complexity</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="font-medium">Communication Score</h4>
                  </div>
                  <div className="text-2xl font-bold">{mastery.communicationScore}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${mastery.communicationScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Based on responsiveness and clarity</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-purple-500 mr-2" />
                    <h4 className="font-medium">Reliability Score</h4>
                  </div>
                  <div className="text-2xl font-bold">{mastery.reliabilityScore}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{ width: `${mastery.reliabilityScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Based on timeliness and consistency</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium mb-2">How to Improve Your Score</h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  <li>Complete projects on time and within budget</li>
                  <li>Respond promptly to messages and requests</li>
                  <li>Maintain high quality standards in your work</li>
                  <li>Participate actively in the FAIT community</li>
                  <li>Complete training modules to earn skill badges</li>
                </ul>
              </div>
            </>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges && badges.length > 0 ? (
                  badges.map((badge: any) => (
                    <div
                      key={badge.id}
                      className="flex items-start p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        {badge.badges.badge_type === 'skill' && <Wrench className="h-6 w-6 text-blue-600" />}
                        {badge.badges.badge_type === 'communication' && <MessageSquare className="h-6 w-6 text-green-600" />}
                        {badge.badges.badge_type === 'reliability' && <Clock className="h-6 w-6 text-purple-600" />}
                        {badge.badges.badge_type === 'participation' && <Users className="h-6 w-6 text-orange-600" />}
                        {!['skill', 'communication', 'reliability', 'participation'].includes(badge.badges.badge_type) &&
                          <Award className="h-6 w-6 text-blue-600" />
                        }
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{badge.badges.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{badge.badges.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Awarded on {new Date(badge.awarded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-6 bg-gray-50 rounded-lg text-center">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No badges yet</h3>
                    <p className="text-gray-500 mt-1">
                      Complete projects and participate in the community to earn badges.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <h3 className="font-medium mb-2">Available Badges</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <Wrench className="h-5 w-5 text-primary-500 mr-2" />
                    <span className="text-sm">Quality Craftsman</span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <Target className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm">Budget Master</span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <MessageSquare className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Prompt Responder</span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <Clock className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm">On-Time Delivery</span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <Users className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-sm">Community Contributor</span>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <Book className="h-5 w-5 text-indigo-500 mr-2" />
                    <span className="text-sm">Knowledge Seeker</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="mt-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {demoHistory.map((item) => (
                    <li key={item.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              +{item.points} points
                            </p>
                            <div className={`ml-2 flex-shrink-0 flex ${
                              item.category === 'skill' ? 'text-yellow-500' :
                              item.category === 'communication' ? 'text-green-500' :
                              item.category === 'reliability' ? 'text-purple-500' :
                              'text-orange-500'
                            }`}>
                              {item.category === 'skill' && <Star className="h-4 w-4" />}
                              {item.category === 'communication' && <MessageSquare className="h-4 w-4" />}
                              {item.category === 'reliability' && <Clock className="h-4 w-4" />}
                              {item.category === 'participation' && <Users className="h-4 w-4" />}
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {item.date}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="text-sm text-gray-500">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MasteryScoreCard;
