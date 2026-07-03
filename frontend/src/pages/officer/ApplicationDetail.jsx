import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import {
  ArrowLeft, User, DollarSign, Briefcase, FileText,
  CheckCircle2, XCircle, CheckSquare
} from 'lucide-react';
import RiskGauge from '../../components/common/RiskGauge';
import Button from '../../components/common/Button';

// Maps backend RuleResult.recommendedStatus to a display label
const getRuleLabel = (recommendedStatus) => {
  if (!recommendedStatus) return 'Rule Check';
  return recommendedStatus.replace(/_/g, ' ');
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
      // Backend AddNoteRequest expects field name "content"
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
        // Backend expects request body: { "reason": "..." }
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
  if (!app) return <div className="text-sm text-ink-500">Application not found.</div>;

  const isActionable =
    app.status === 'PENDING' ||
    app.status === 'MANUAL_REVIEW' ||
    app.status === 'UNDER_REVIEW';

  // Parse ruleResultsJson — backend fields: passed (bool), reason (string),
  // recommendedStatus (string), riskScoreImpact (int)
  let ruleResults = [];
  try {
    if (app.ruleResultsJson) {
      ruleResults = JSON.parse(app.ruleResultsJson);
    }
  } catch (e) {
    console.warn('Failed to parse ruleResultsJson', e);
  }

  // Three-state credit score color: danger < 650, warning 650–699, success >= 700
  const creditScoreColor =
    app.creditScore < 650
      ? 'text-danger'
      : app.creditScore < 700
      ? 'text-warning'
      : 'text-success';

  return (
    <div className="space-y-6 max-w-[1080px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-[13px] font-semibold text-ink-500 hover:text-ink-900 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Queue
      </button>

      <div className="flex justify-between items-center bg-surface-card p-6 rounded-card shadow-card border border-border">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 flex items-center">
            Application{' '}
            <span className="font-mono text-ink-300 font-normal ml-3 text-lg">
              #{app.id.substring(0, 8)}
            </span>
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Submitted on <span className="font-mono">{formatDate(app.createdAt)}</span>
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Applicant Info */}
          <div className="bg-surface-card rounded-card shadow-card border border-border p-6">
            <h2 className="font-display text-base font-semibold border-b border-border pb-3 mb-5 flex items-center text-ink-900">
              <User className="h-5 w-5 mr-2 text-accent" /> Applicant Information
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[13px] font-medium text-ink-500 mb-1">Full Name</p>
                <p className="font-medium text-ink-900">{app.applicant?.fullName}</p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink-500 mb-1">Email Address</p>
                <p className="font-medium text-ink-900">{app.applicant?.email}</p>
              </div>
            </div>
          </div>

          {/* Loan Request */}
          <div className="bg-surface-card rounded-card shadow-card border border-border p-6">
            <h2 className="font-display text-base font-semibold border-b border-border pb-3 mb-5 flex items-center text-ink-900">
              <DollarSign className="h-5 w-5 mr-2 text-accent" /> Loan Request
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[13px] font-medium text-ink-500 mb-1">Requested Amount</p>
                <p className="font-mono text-lg font-semibold text-ink-900">
                  {formatCurrency(app.loanAmount)}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink-500 mb-1">Loan Term</p>
                <p className="font-mono text-base font-medium text-ink-900">
                  {app.loanTermMonths}{' '}
                  <span className="font-sans text-sm font-normal text-ink-500">Months</span>
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[13px] font-medium text-ink-500 mb-1">Purpose</p>
                <p className="font-medium text-ink-900">{app.loanPurpose}</p>
              </div>
            </div>
          </div>

          {/* Financial Profile */}
          <div className="bg-surface-card rounded-card shadow-card border border-border p-6">
            <h2 className="font-display text-base font-semibold border-b border-border pb-3 mb-5 flex items-center text-ink-900">
              <Briefcase className="h-5 w-5 mr-2 text-accent" /> Financial Profile
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[13px] font-medium text-ink-500 mb-1">Annual Income</p>
                <p className="font-mono text-base font-medium text-ink-900">
                  {formatCurrency(app.annualIncome)}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink-500 mb-1">Employment Status</p>
                <p className="font-medium text-ink-900">
                  {app.employmentStatus?.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink-500 mb-1">Debt-to-Income Ratio</p>
                <p className="font-mono text-base font-medium text-ink-900">
                  {app.debtToIncomeRatio}%
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink-500 mb-1">Credit Score</p>
                {/* Three-state color: danger < 650, warning 650–699, success >= 700 */}
                <p className={`font-mono text-base font-bold ${creditScoreColor}`}>
                  {app.creditScore}
                </p>
              </div>
            </div>
          </div>

          {/* Rule Engine Results */}
          {ruleResults.length > 0 && (
            <div className="bg-surface-card rounded-card shadow-card border border-border p-6">
              <h2 className="font-display text-base font-semibold border-b border-border pb-3 mb-5 flex items-center text-ink-900">
                <CheckSquare className="h-5 w-5 mr-2 text-accent" /> Rule Engine Results
              </h2>
              <div className="space-y-3">
                {ruleResults.map((rule, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 bg-surface flex items-start justify-between ${
                      rule.passed ? 'border-l-success' : 'border-l-danger'
                    }`}
                  >
                    <div>
                      {/* Backend field: recommendedStatus (e.g. "APPROVED", "REJECTED", "MANUAL_REVIEW") */}
                      <h4 className="text-sm font-semibold text-ink-900">
                        {getRuleLabel(rule.recommendedStatus)}
                      </h4>
                      {/* Backend field: reason (the human-readable explanation) */}
                      <p className="text-[13px] text-ink-700 mt-1">{rule.reason}</p>
                      <p className="text-[11px] text-ink-300 mt-1">
                        Risk impact: +{rule.riskScoreImpact} pts
                      </p>
                    </div>
                    {rule.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Risk Gauge */}
          <div className="bg-surface-card rounded-card shadow-card border border-border p-8 flex flex-col items-center">
            <h2 className="font-display text-base font-semibold text-ink-900 w-full text-center mb-8">
              Risk Assessment
            </h2>
            <RiskGauge score={app.riskScore || 0} />
            {app.rejectionReason && (
              <div className="mt-8 p-4 bg-danger-soft border border-danger/20 rounded-xl w-full">
                <p className="text-xs uppercase tracking-wider font-semibold text-danger mb-1">
                  System Note
                </p>
                <p className="text-sm font-medium text-danger/90 leading-relaxed">
                  {app.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Officer Actions */}
          {isActionable && (
            <div className="bg-surface-card rounded-card shadow-card border border-border p-6">
              <h2 className="font-display text-base font-semibold text-ink-900 mb-5">
                Officer Actions
              </h2>
              {app.status === 'PENDING' || app.status === 'MANUAL_REVIEW' ? (
                <Button onClick={() => handleAction('review')} className="w-full">
                  Start Review Process
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="success"
                    onClick={() => handleAction('approve')}
                    className="w-full"
                  >
                    Approve Application
                  </Button>
                  {!showRejectInput ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectInput(true)}
                      className="w-full !border-danger !text-danger hover:!bg-danger-soft"
                    >
                      Reject Application
                    </Button>
                  ) : (
                    <div className="space-y-3 mt-5 pt-5 border-t border-border">
                      <label className="block text-[13px] font-medium text-ink-700">
                        Rejection Reason
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-3 focus:ring-accent-soft focus:border-accent"
                        rows="3"
                        placeholder="Specify why..."
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          onClick={() => handleAction('reject')}
                          className="flex-1"
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setShowRejectInput(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timeline + Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {/* Timeline */}
        <div className="bg-surface-card rounded-card shadow-card border border-border p-6">
          <h2 className="font-display text-base font-semibold border-b border-border pb-3 mb-5 flex items-center text-ink-900">
            <FileText className="h-5 w-5 mr-2 text-accent" /> Application Timeline
          </h2>
          <div className="space-y-5">
            {timeline.length === 0 ? (
              <p className="text-sm text-ink-500">No events recorded yet.</p>
            ) : (
              timeline.map((event, index) => (
                <div
                  key={event.id || index}
                  className="relative pl-7 pb-5 border-l-2 border-border last:pb-0 last:border-0"
                >
                  <div className="absolute w-3.5 h-3.5 bg-accent rounded-full -left-[8px] top-1 border-2 border-white" />
                  <p className="text-[13px] font-semibold uppercase tracking-wider text-ink-900">
                    {event.eventType?.replace(/_/g, ' ')}
                  </p>
                  <p className="font-mono text-xs text-ink-300 mt-0.5 mb-1.5">
                    {formatDate(event.createdAt)}
                  </p>
                  <p className="text-sm text-ink-700">{event.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Internal Notes */}
        <div className="bg-surface-card rounded-card shadow-card border border-border p-6 flex flex-col h-full">
          <h2 className="font-display text-base font-semibold border-b border-border pb-3 mb-5 flex items-center text-ink-900">
            <User className="h-5 w-5 mr-2 text-accent" /> Internal Notes
          </h2>
          <div className="space-y-4 mb-5 flex-1 overflow-y-auto max-h-[300px] pr-2">
            {notes.length === 0 ? (
              <p className="text-ink-500 text-sm">No internal notes.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-surface p-4 rounded-xl border border-border">
                  <div className="flex justify-between items-center mb-2">
                    {/* Backend field: authorName */}
                    <span className="text-[13px] font-semibold text-ink-900">
                      {note.authorName}
                    </span>
                    <span className="font-mono text-[11px] text-ink-300">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  {/* Backend field: content */}
                  <p className="text-sm text-ink-700 leading-relaxed">{note.content}</p>
                </div>
              ))
            )}
          </div>
          <form
            onSubmit={handleAddNote}
            className="flex flex-col space-y-3 mt-auto pt-4 border-t border-border"
          >
            <textarea
              className="w-full px-4 py-3 border border-border rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-3 focus:ring-accent-soft focus:border-accent"
              rows="2"
              placeholder="Add an internal note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Button type="submit" className="self-end">
              Post Note
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
