import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { ArrowLeft, User, DollarSign, Briefcase, FileText } from 'lucide-react';

const RiskGauge = ({ score }) => {
  // SVG semicircle gauge from 0 to 100
  // Higher score = better (green), lower score = worse (red)
  const radius = 60;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  // Invert score for color mapping (assuming higher score is higher risk visually? Wait. 
  // Let's assume higher score = higher risk for red color, lower = lower risk for green color.
  // The backend uses 0-100 where higher is riskier usually, let's say 100 = max risk (red), 0 = no risk (green).
  const normalizedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = 'stroke-green-500';
  if (normalizedScore > 40) color = 'stroke-yellow-500';
  if (normalizedScore > 70) color = 'stroke-red-500';

  return (
    <div className="flex flex-col items-center">
      <svg className="w-48 h-24 transform rotate-180" viewBox="0 0 140 70">
        <path
          d={`M 10 70 A 60 60 0 0 1 130 70`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M 10 70 A 60 60 0 0 1 130 70`}
          fill="none"
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="text-center -mt-8 mb-4">
        <span className="text-3xl font-bold text-gray-900">{normalizedScore}</span>
        <span className="text-gray-500 text-sm ml-1">/ 100</span>
        <p className="text-xs text-gray-500 font-medium uppercase mt-1">Risk Score</p>
      </div>
    </div>
  );
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/loans/${id}`);
      setApp(response.data);
    } catch (error) {
      console.error('Failed to fetch application', error);
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimelineAndNotes = async () => {
    try {
      const tRes = await api.get(`/loans/${id}/timeline`);
      setTimeline(tRes.data);
      const nRes = await api.get(`/loans/${id}/notes`);
      setNotes(nRes.data);
    } catch (error) {
      console.error('Failed to fetch timeline or notes', error);
    }
  };

  useEffect(() => {
    fetchApplication();
    fetchTimelineAndNotes();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.post(`/loans/${id}/notes`, { content: newNote });
      setNewNote('');
      fetchTimelineAndNotes();
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleAction = async (action) => {
    try {
      if (action === 'review') {
        await api.patch(`/loans/${id}/review`);
        toast.success('Application marked as Under Review');
      } else if (action === 'approve') {
        await api.patch(`/loans/${id}/approve`);
        toast.success('Application Approved!');
      } else if (action === 'reject') {
        if (!rejectReason.trim()) {
          toast.warning('Please provide a rejection reason');
          return;
        }
        await api.patch(`/loans/${id}/reject`, { reason: rejectReason });
        toast.success('Application Rejected.');
        setShowRejectInput(false);
      }
      fetchApplication();
    } catch (error) {
      toast.error(error.response?.data || `Failed to ${action} application`);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!app) return <div>Application not found.</div>;

  const isActionable = app.status === 'PENDING' || app.status === 'MANUAL_REVIEW' || app.status === 'UNDER_REVIEW';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-finBlue mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Queue
      </button>

      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            Application <span className="text-gray-400 font-normal ml-2 text-lg">#{app.id.substring(0,8)}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Submitted on {formatDate(app.createdAt)}</p>
        </div>
        <div>
          <StatusBadge status={app.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applicant Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold border-b pb-3 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-finBlue" /> Applicant Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{app.applicant?.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium text-gray-900">{app.applicant?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold border-b pb-3 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-finBlue" /> Loan Request
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Requested Amount</p>
                <p className="font-medium text-gray-900 text-lg">{formatCurrency(app.loanAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loan Term</p>
                <p className="font-medium text-gray-900">{app.loanTermMonths} Months</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="font-medium text-gray-900">{app.loanPurpose}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold border-b pb-3 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-finBlue" /> Financial Profile
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Annual Income</p>
                <p className="font-medium text-gray-900">{formatCurrency(app.annualIncome)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employment Status</p>
                <p className="font-medium text-gray-900">{app.employmentStatus?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Debt-to-Income Ratio</p>
                <p className="font-medium text-gray-900">{app.debtToIncomeRatio}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Credit Score</p>
                <p className={`font-bold ${app.creditScore < 650 ? 'text-finRed' : 'text-finGreen'}`}>
                  {app.creditScore}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold w-full text-center mb-6">Risk Assessment</h2>
            <RiskGauge score={app.riskScore || 0} />
            
            {app.rejectionReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md w-full">
                <p className="text-xs text-red-800 font-medium">System Note:</p>
                <p className="text-sm text-red-600 mt-1">{app.rejectionReason}</p>
              </div>
            )}
          </div>

          {isActionable && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Officer Actions</h2>
              
              {app.status === 'PENDING' || app.status === 'MANUAL_REVIEW' ? (
                <button 
                  onClick={() => handleAction('review')}
                  className="w-full bg-finBlue hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Start Review Process
                </button>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => handleAction('approve')}
                    className="w-full bg-finGreen hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Approve Application
                  </button>
                  
                  {!showRejectInput ? (
                    <button 
                      onClick={() => setShowRejectInput(true)}
                      className="w-full bg-white text-finRed border border-finRed hover:bg-red-50 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Reject Application
                    </button>
                  ) : (
                    <div className="space-y-2 mt-4 pt-4 border-t">
                      <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-finBlue focus:border-finBlue"
                        rows="3"
                        placeholder="Please specify why this is being rejected..."
                      ></textarea>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleAction('reject')}
                          className="flex-1 bg-finRed text-white py-2 rounded-md hover:bg-red-700"
                        >
                          Confirm Reject
                        </button>
                        <button 
                          onClick={() => setShowRejectInput(false)}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-finBlue" /> Application Timeline
          </h2>
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:pb-0 last:border-0">
                <div className="absolute w-3 h-3 bg-finBlue rounded-full -left-[7px] top-1"></div>
                <p className="text-sm font-semibold text-gray-900">{event.eventType.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-500 mb-1">{formatDate(event.createdAt)}</p>
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes section - errors if forbidden, so we just check if it's there or handle it */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-finBlue" /> Internal Notes
          </h2>
          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
            {notes.length === 0 ? <p className="text-gray-500 text-sm">No internal notes.</p> : notes.map(note => (
              <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold">{note.authorName}</span>
                  <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{note.content}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddNote} className="flex flex-col space-y-2">
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-finBlue focus:border-finBlue"
              rows="2"
              placeholder="Add an internal note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            ></textarea>
            <button type="submit" className="self-end bg-finNavy hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm transition-colors">
              Add Note
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
