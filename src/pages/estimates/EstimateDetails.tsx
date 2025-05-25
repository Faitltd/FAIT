import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  User, 
  Image, 
  ArrowLeft 
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

const EstimateDetails: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { estimateId } = useParams<{ estimateId: string }>();
  const [estimate, setEstimate] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [serviceAgent, setServiceAgent] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserType();
      fetchEstimate();
    }
  }, [user, estimateId]);

  const fetchUserType = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      
      setUserType(data.user_type);
    } catch (err) {
      console.error('Error fetching user type:', err);
    }
  };

  const fetchEstimate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          items:estimate_items(*),
          photos:estimate_photos(*),
          activities:estimate_activities(*)
        `)
        .eq('id', estimateId)
        .single();
      
      if (error) throw error;
      
      // Verify that the current user is either the client or service agent for this estimate
      if (data.client_id !== user?.id && data.service_agent_id !== user?.id) {
        throw new Error('You are not authorized to view this estimate');
      }
      
      setEstimate(data);
      setItems(data.items || []);
      setPhotos(data.photos || []);
      setActivities(data.activities || []);
      
      // Fetch service agent details
      if (data.service_agent_id) {
        const { data: agentData, error: agentError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.service_agent_id)
          .single();
        
        if (!agentError) {
          setServiceAgent(agentData);
        }
      }
      
      // Fetch client details
      if (data.client_id) {
        const { data: clientData, error: clientError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.client_id)
          .single();
        
        if (!clientError) {
          setClient(clientData);
        }
      }
      
      // Fetch activity user details
      if (data.activities && data.activities.length > 0) {
        const userIds = [...new Set(data.activities.map((activity: any) => activity.user_id))];
        
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        
        if (!userError && userData) {
          const userMap = userData.reduce((acc: any, user: any) => {
            acc[user.id] = user;
            return acc;
          }, {});
          
          const activitiesWithUsers = data.activities.map((activity: any) => ({
            ...activity,
            user: userMap[activity.user_id]
          }));
          
          setActivities(activitiesWithUsers);
        }
      }
    } catch (err) {
      console.error('Error fetching estimate:', err);
      setError(err instanceof Error ? err.message : 'Failed to load estimate');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('create_booking_from_estimate', {
        estimate_id: estimateId
      });
      
      if (error) throw error;
      
      navigate(`/booking/${data}`);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEstimate = () => {
    navigate(`/estimates/edit/${estimateId}`);
  };

  const handleBack = () => {
    navigate('/estimates');
  };

  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };

  const nextPhoto = () => {
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  };

  const prevPhoto = () => {
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending Approval
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            Expired
          </span>
        );
      case 'converted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Converted to Booking
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.action) {
      case 'created':
        return 'created this estimate';
      case 'status_changed':
        if (activity.details.new_status === 'approved') {
          return 'approved this estimate';
        } else if (activity.details.new_status === 'rejected') {
          return 'rejected this estimate';
        } else if (activity.details.new_status === 'pending') {
          return 'sent this estimate to the client';
        } else if (activity.details.new_status === 'converted') {
          return 'converted this estimate to a booking';
        } else {
          return `changed status from ${activity.details.old_status} to ${activity.details.new_status}`;
        }
      default:
        return activity.action;
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading estimate</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!estimate) {
    return (
      <ResponsiveLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Estimate not found</h3>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout title="Estimate Details">
      {/* Photo Modal */}
      {showPhotoModal && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-screen p-4">
            <button
              onClick={closePhotoModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <XCircle className="h-6 w-6" />
            </button>
            
            <img
              src={photos[selectedPhotoIndex].public_url}
              alt={photos[selectedPhotoIndex].file_name}
              className="max-h-[80vh] max-w-full object-contain"
            />
            
            {photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-4">
                <button
                  onClick={prevPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                  {selectedPhotoIndex + 1} / {photos.length}
                </div>
                <button
                  onClick={nextPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-900 mr-3">{estimate.title}</h2>
                  {getStatusBadge(estimate.status)}
                </div>
                <p className="text-sm text-gray-500">Estimate #{estimate.id.substring(0, 8)}</p>
              </div>
            </div>
            <div className="mt-2 md:mt-0 flex items-center">
              <div className="text-sm text-gray-500 mr-2">Created:</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDateTime(estimate.created_at)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Estimate details */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Description</h3>
                <div className="bg-gray-50 rounded-md p-4 text-gray-700 whitespace-pre-wrap">
                  {estimate.description}
                </div>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Total row */}
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900 text-right">
                          {formatCurrency(estimate.total_amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {photos.length > 0 && (
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Photos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => openPhotoModal(index)}
                      >
                        <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={photo.public_url}
                            alt={photo.file_name}
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                            <Image className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {estimate.notes && (
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Notes</h3>
                  <div className="bg-gray-50 rounded-md p-4 text-gray-700 whitespace-pre-wrap">
                    {estimate.notes}
                  </div>
                </div>
              )}
              
              {activities.length > 0 && (
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Activity History</h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <ul className="space-y-4">
                      {activities.sort((a: any, b: any) => 
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      ).map((activity: any) => (
                        <li key={activity.id} className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <img
                              src={activity.user?.avatar_url || '/default-avatar.png'}
                              alt={activity.user?.full_name || 'User'}
                              className="h-8 w-8 rounded-full"
                            />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {activity.user?.full_name || 'Unknown User'}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {formatDateTime(activity.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {getActivityDescription(activity)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column - Sidebar info */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Estimate Information</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Status:</dt>
                    <dd className="text-gray-900 font-medium">
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Created:</dt>
                    <dd className="text-gray-900">
                      {formatDateTime(estimate.created_at)}
                    </dd>
                  </div>
                  {estimate.expiration_date && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Expires:</dt>
                      <dd className="text-gray-900">
                        {formatDateTime(estimate.expiration_date)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total Amount:</dt>
                    <dd className="text-gray-900 font-medium">
                      {formatCurrency(estimate.total_amount)}
                    </dd>
                  </div>
                </dl>
              </div>
              
              {client && (
                <div className="bg-gray-50 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Client</h3>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        src={client.avatar_url || '/default-avatar.png'}
                        alt={client.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{client.full_name}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {serviceAgent && (
                <div className="bg-gray-50 rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Service Agent</h3>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        src={serviceAgent.avatar_url || '/default-avatar.png'}
                        alt={serviceAgent.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{serviceAgent.full_name}</p>
                      <p className="text-xs text-gray-500">{serviceAgent.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="space-y-3">
                {userType === 'service_agent' && estimate.status === 'draft' && (
                  <button
                    type="button"
                    onClick={handleEditEstimate}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Estimate
                  </button>
                )}
                
                {userType === 'service_agent' && estimate.status === 'approved' && (
                  <button
                    type="button"
                    onClick={handleCreateBooking}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Convert to Booking
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Estimates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default EstimateDetails;
