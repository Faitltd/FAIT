import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  FileText, 
  Check,
  Calendar,
  Upload,
  Download
} from 'lucide-react';
import { BylawsVersion, BylawsAcknowledgment as BylawsAck } from '../../types/governance';
import { governanceService } from '../../services/GovernanceService';

interface BylawsAcknowledgmentProps {
  memberId: string;
  isAdmin?: boolean;
}

const BylawsAcknowledgment: React.FC<BylawsAcknowledgmentProps> = ({ 
  memberId, 
  isAdmin = false 
}) => {
  const [bylaws, setBylaws] = useState<BylawsVersion | null>(null);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [acknowledgmentSuccess, setAcknowledgmentSuccess] = useState(false);
  const [showFullBylaws, setShowFullBylaws] = useState(false);

  useEffect(() => {
    fetchBylaws();
    checkAcknowledgment();
  }, [memberId]);

  const fetchBylaws = async () => {
    try {
      setLoading(true);
      const data = await governanceService.getLatestBylawsVersion();
      setBylaws(data);
      setError(null);
    } catch (err) {
      setError('Failed to load bylaws');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkAcknowledgment = async () => {
    try {
      const acknowledged = await governanceService.hasAcknowledgedLatestBylaws(memberId);
      setHasAcknowledged(acknowledged);
    } catch (err) {
      console.error('Failed to check bylaws acknowledgment:', err);
    }
  };

  const handleAcknowledgeBylaws = async () => {
    if (!bylaws) return;
    
    try {
      setIsAcknowledging(true);
      const acknowledgment = await governanceService.acknowledgeBylaws(bylaws.id);
      
      if (acknowledgment) {
        setHasAcknowledged(true);
        setAcknowledgmentSuccess(true);
        setTimeout(() => {
          setAcknowledgmentSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to acknowledge bylaws:', err);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const downloadBylaws = () => {
    if (!bylaws) return;
    
    const element = document.createElement('a');
    const file = new Blob([bylaws.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${bylaws.title} - ${bylaws.version}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!bylaws) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-gray-500 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          <span>No bylaws have been published yet.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Bylaws Acknowledgment</h3>
        <button
          onClick={downloadBylaws}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start">
          <div className="mr-3">
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <h4 className="text-sm font-medium text-gray-900">{bylaws.title}</h4>
              <span className="text-xs text-gray-500">Version {bylaws.version}</span>
            </div>
            
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Effective: {formatDate(bylaws.effective_date)}</span>
            </div>
            
            <div className="mt-4">
              <div className="prose prose-sm max-w-none">
                {showFullBylaws ? (
                  <div className="whitespace-pre-wrap">{bylaws.content}</div>
                ) : (
                  <div className="whitespace-pre-wrap">{bylaws.content.substring(0, 500)}...</div>
                )}
              </div>
              
              <button
                onClick={() => setShowFullBylaws(!showFullBylaws)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {showFullBylaws ? 'Show Less' : 'Show More'}
              </button>
            </div>
            
            {hasAcknowledged ? (
              <div className="mt-4 p-3 bg-green-50 rounded-md flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    You have acknowledged these bylaws
                  </p>
                  <p className="text-xs text-green-700">
                    Thank you for reviewing and accepting our cooperative bylaws.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-700 mb-3">
                  Please review the bylaws carefully and acknowledge that you have read and agree to abide by them.
                </p>
                
                <button
                  onClick={handleAcknowledgeBylaws}
                  disabled={isAcknowledging}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isAcknowledging ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isAcknowledging ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      I Acknowledge These Bylaws
                    </>
                  )}
                </button>
                
                {acknowledgmentSuccess && (
                  <div className="mt-3 p-2 bg-green-50 rounded-md">
                    <p className="text-sm text-green-700">
                      Bylaws successfully acknowledged!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BylawsAcknowledgment;
