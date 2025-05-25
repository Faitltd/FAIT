import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import { ArrowLeft, Shield, Clock, CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react';

type WarrantyClaim = Database['public']['Tables']['warranty_claims']['Row'] & {
  booking: Database['public']['Tables']['bookings']['Row'] & {
    service_package: Pick<Database['public']['Tables']['service_packages']['Row'], 'title'>;
  };
};

const ClientWarranty = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarrantyClaims = async () => {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('warranty_claims')
          .select(`
            *,
            booking:bookings(
              *,
              service_package:service_packages(title)
            )
          `)
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setClaims(data as WarrantyClaim[]);
      } catch (error) {
        console.error('Error fetching warranty claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarrantyClaims();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
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
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
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
      <div className="mb-6">
        <Link to="/dashboard/client" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Warranty Claims</h1>
          <Link
            to="/dashboard/client/warranty/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Shield className="mr-2 h-4 w-4" />
            File New Claim
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {claims.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Warranty Claims</h3>
            <p className="text-gray-500 mb-4">
              You haven't filed any warranty claims yet. If you've had a service completed and are experiencing issues,
              you can file a warranty claim.
            </p>
            <Link
              to="/dashboard/client/warranty/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              File a Claim
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {claims.map((claim) => (
              <div key={claim.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {claim.booking.service_package.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <Calendar className="inline-block h-4 w-4 mr-1" />
                      Claim filed on {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Description</h4>
                  <p className="mt-1 text-sm text-gray-600">{claim.description}</p>
                </div>
                {claim.resolution_notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Resolution Notes</h4>
                    <p className="mt-1 text-sm text-gray-600">{claim.resolution_notes}</p>
                  </div>
                )}
                <div className="mt-4">
                  <Link
                    to={`/dashboard/client/bookings/${claim.booking_id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Original Booking
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientWarranty;
