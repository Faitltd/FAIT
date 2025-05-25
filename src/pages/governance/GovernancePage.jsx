import React, { useState } from 'react';
import { useAuth } from '../../contexts/UnifiedAuthContext';

const GovernancePage = () => {
  const { user, userType } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for governance
  const mockProposals = [
    {
      id: 1,
      title: 'Increase Service Provider Commission',
      description: 'Proposal to increase the commission rate for service providers from 10% to 12%.',
      status: 'active',
      votes: { yes: 24, no: 8, abstain: 3 },
      deadline: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      author: 'Board of Directors'
    },
    {
      id: 2,
      title: 'Add New Service Category',
      description: 'Proposal to add "Smart Home Installation" as a new service category.',
      status: 'active',
      votes: { yes: 18, no: 2, abstain: 1 },
      deadline: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
      author: 'Technology Committee'
    },
    {
      id: 3,
      title: 'Revise Membership Requirements',
      description: 'Proposal to update the membership requirements to include background checks for all service providers.',
      status: 'closed',
      votes: { yes: 32, no: 5, abstain: 2 },
      deadline: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      result: 'passed',
      author: 'Membership Committee'
    },
    {
      id: 4,
      title: 'Quarterly Dividend Distribution',
      description: 'Proposal to distribute quarterly dividends to all members based on participation.',
      status: 'closed',
      votes: { yes: 12, no: 28, abstain: 5 },
      deadline: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
      result: 'failed',
      author: 'Finance Committee'
    }
  ];

  const mockCommittees = [
    {
      id: 1,
      name: 'Board of Directors',
      description: 'Oversees the overall direction and strategy of the cooperative.',
      members: 7,
      nextMeeting: new Date(Date.now() + 86400000 * 14).toISOString() // 14 days from now
    },
    {
      id: 2,
      name: 'Finance Committee',
      description: 'Manages the financial aspects of the cooperative, including budgeting and financial reporting.',
      members: 5,
      nextMeeting: new Date(Date.now() + 86400000 * 7).toISOString() // 7 days from now
    },
    {
      id: 3,
      name: 'Membership Committee',
      description: 'Handles membership applications, reviews, and membership-related policies.',
      members: 4,
      nextMeeting: new Date(Date.now() + 86400000 * 10).toISOString() // 10 days from now
    },
    {
      id: 4,
      name: 'Technology Committee',
      description: 'Oversees the technological infrastructure and digital strategy of the cooperative.',
      members: 6,
      nextMeeting: new Date(Date.now() + 86400000 * 5).toISOString() // 5 days from now
    }
  ];

  const mockDocuments = [
    {
      id: 1,
      title: 'Bylaws',
      description: 'The official bylaws of the cooperative.',
      lastUpdated: new Date(Date.now() - 86400000 * 90).toISOString(), // 90 days ago
      type: 'legal'
    },
    {
      id: 2,
      title: 'Membership Agreement',
      description: 'The agreement that all members must sign upon joining.',
      lastUpdated: new Date(Date.now() - 86400000 * 60).toISOString(), // 60 days ago
      type: 'legal'
    },
    {
      id: 3,
      title: 'Annual Report 2023',
      description: 'The annual report for the fiscal year 2023.',
      lastUpdated: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
      type: 'financial'
    },
    {
      id: 4,
      title: 'Strategic Plan 2023-2025',
      description: 'The strategic plan for the cooperative for the next three years.',
      lastUpdated: new Date(Date.now() - 86400000 * 120).toISOString(), // 120 days ago
      type: 'planning'
    }
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'passed':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Cooperative Governance
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Participate in the democratic governance of our cooperative
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="overview">Overview</option>
            <option value="proposals">Proposals</option>
            <option value="committees">Committees</option>
            <option value="documents">Documents</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
                onClick={() => setActiveTab('proposals')}
                className={`${
                  activeTab === 'proposals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Proposals
              </button>
              <button
                onClick={() => setActiveTab('committees')}
                className={`${
                  activeTab === 'committees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Committees
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Documents
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Cooperative Governance Overview
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Learn about how our cooperative is governed and how you can participate.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Governance Model
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Democratic member control with one member, one vote
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Board of Directors
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Elected by the membership to oversee the cooperative's operations
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Committees
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Specialized groups that focus on specific aspects of the cooperative
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Proposals
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Members can submit and vote on proposals to shape the cooperative's future
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Annual General Meeting
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Held once a year to review the cooperative's performance and elect board members
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Proposals
              </h3>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit New Proposal
              </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {mockProposals.map((proposal) => (
                  <li key={proposal.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {proposal.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(proposal.status)}`}>
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </p>
                          {proposal.result && (
                            <p className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(proposal.result)}`}>
                              {proposal.result.charAt(0).toUpperCase() + proposal.result.slice(1)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {proposal.description}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {proposal.status === 'active' ? (
                              <>Deadline: {new Date(proposal.deadline).toLocaleDateString()}</>
                            ) : (
                              <>Closed: {new Date(proposal.deadline).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <p className="text-sm text-gray-500">
                          By: {proposal.author}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="mr-2">Votes:</span>
                          <span className="text-green-600 mr-2">Yes: {proposal.votes.yes}</span>
                          <span className="text-red-600 mr-2">No: {proposal.votes.no}</span>
                          <span className="text-gray-600">Abstain: {proposal.votes.abstain}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'committees' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Committees
              </h3>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Join a Committee
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {mockCommittees.map((committee) => (
                <div key={committee.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {committee.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {committee.description}
                    </p>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Members:</span> {committee.members}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Next Meeting:</span> {new Date(committee.nextMeeting).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                        View Committee Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Governance Documents
              </h3>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {mockDocuments.map((document) => (
                  <li key={document.id}>
                    <a href="#" className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {document.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {document.description}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Last Updated: {new Date(document.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernancePage;
