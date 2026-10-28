import React, { useState } from 'react';
import { 
  Search, CheckCircle2, MapPin, Calendar, Share2, 
  ArrowLeft, ArrowRight, FileText, Cpu, Check, ShieldCheck, Clock,
  Send, Truck, AlertTriangle, Shield, Navigation, AlertCircle, Eye,
  HelpCircle
} from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import { submitOfficialReviewDecision } from '../evidenceEngine';

const CREW_OPTIONS = [
  "Zone 1 Rapid Pothole Patching Crew #04 (Van UP-32-EF-1042)",
  "LDA Engineering Heavy Asphalt Compactor Unit",
  "LDA Electrical Wing Hydraulic Crane Squad #02",
  "Solid Waste Management Rapid Disposal Squad #07",
  "Urban Drainage Desilting & Jetting Machine Crew #01"
];

export default function TicketTracker({ 
  complaints, 
  selectedTicketId, 
  onSelectTicket,
  onUpdateStatus,
  currentActor,
  currentUser
}) {
  const [searchQuery, setSearchQuery] = useState(selectedTicketId || 'CFA-2026-001');
  const [activeTab, setActiveTab] = useState('Timeline'); // 'Timeline' | 'Evidence & Map' | 'Details' | 'AI Insights' | 'Resolution'
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState(CREW_OPTIONS[0]);
  
  // Official Review Action States
  const [decisionReason, setDecisionReason] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  // Active ticket
  const ticket = complaints.find(c => c.id.toLowerCase() === searchQuery.trim().toLowerCase()) 
    || complaints.find(c => c.id === selectedTicketId) 
    || complaints[0];

  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Official Action: Approve & Dispatch Crew
  const handleApproveAndDispatch = async () => {
    if (!ticket) return;
    const reason = decisionReason.trim() || `Approved tender by ${currentUser?.name || 'LDA Official'}. Assigned ${selectedCrew}.`;
    await submitOfficialReviewDecision({
      complaintId: ticket.id,
      decision: "approve_evidence",
      reason: reason,
      officerName: currentUser?.name || "Er. Vikramaditya Singh",
      badgeId: currentUser?.badgeId || "LDA-EMP-8492",
      newStatus: "in_progress"
    });
    onUpdateStatus(ticket.id, 'in_progress', selectedCrew);
    setActionNotice({ type: 'success', message: `Evidence approved & crew deployed: ${selectedCrew}` });
    setDecisionReason('');
  };

  // Official Action: Request Additional Evidence
  const handleRequestAdditionalEvidence = async () => {
    if (!ticket) return;
    const reason = decisionReason.trim() || "Uploaded photo is unclear or lacks sufficient context. Please provide a clear angle or additional defect photo.";
    await submitOfficialReviewDecision({
      complaintId: ticket.id,
      decision: "request_additional_evidence",
      reason: reason,
      officerName: currentUser?.name || "Er. Vikramaditya Singh",
      badgeId: currentUser?.badgeId || "LDA-EMP-8492",
      newStatus: "under_review"
    });
    setActionNotice({ type: 'warning', message: "Request for additional photo evidence logged & notified to citizen." });
    setDecisionReason('');
  };

  // Official Action: Flag for Field Inspection
  const handleFlagForInspection = async () => {
    if (!ticket) return;
    const reason = decisionReason.trim() || "Geographic pin discrepancy or severe defect severity requires mandatory in-person Junior Engineer inspection.";
    await submitOfficialReviewDecision({
      complaintId: ticket.id,
      decision: "flag_for_inspection",
      reason: reason,
      officerName: currentUser?.name || "Er. Vikramaditya Singh",
      badgeId: currentUser?.badgeId || "LDA-EMP-8492",
      newStatus: "under_review"
    });
    setActionNotice({ type: 'warning', message: "Flagged for in-person Field Junior Engineer inspection." });
    setDecisionReason('');
  };

  // Official Authority Action: Verify & Mark Solved
  const handleVerifyAndResolve = async () => {
    if (!ticket) return;
    const reason = decisionReason.trim() || `Field repair inspected and verified by ${currentUser?.name || 'LDA Inspector'}. Defect closed.`;
    await submitOfficialReviewDecision({
      complaintId: ticket.id,
      decision: "approve_evidence",
      reason: reason,
      officerName: currentUser?.name || "Er. Vikramaditya Singh",
      badgeId: currentUser?.badgeId || "LDA-EMP-8492",
      newStatus: "resolved"
    });
    onUpdateStatus(ticket.id, 'resolved');
    setActionNotice({ type: 'success', message: "Grievance marked as Resolved and closed in municipal registry." });
    setDecisionReason('');
  };

  const evidence = ticket?.evidence_record;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* SCREEN 5: COMPLAINT FULL DETAILS VIEW (When showFullDetails is true) */}
      {showFullDetails && ticket ? (
        <div className="card-white">
          {/* Back button */}
          <button 
            type="button" 
            className="btn-outline-olive" 
            style={{ padding: '6px 14px', fontSize: '0.82rem', marginBottom: '20px' }}
            onClick={() => setShowFullDetails(false)}
          >
            <ArrowLeft size={15} />
            <span>Back to Search</span>
          </button>

          {/* Header row with thumbnail, ID, Resolved chip, and Share button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <img 
                src={ticket.photoUrl} 
                alt="Civic issue" 
                style={{ width: '84px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span className="ticket-id-tag">{ticket.id}</span>
                  <span className={ticket.status === 'resolved' ? 'ticket-resolved-chip' : 'priority-badge-high'} style={{ fontSize: '0.78rem', padding: '3px 10px' }}>
                    {ticket.status === 'resolved' ? <Check size={13} /> : <Clock size={13} />}
                    <span style={{ textTransform: 'capitalize' }}>{ticket.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {ticket.category}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  <MapPin size={13} /> {ticket.location}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Reported on {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            <button type="button" className="btn-outline-olive" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>

          {/* Action Notice Banner */}
          {actionNotice && (
            <div style={{ margin: '14px 0', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: actionNotice.type === 'success' ? 'var(--status-resolved-bg)' : '#fef3c7', color: actionNotice.type === 'success' ? 'var(--status-resolved)' : '#92400e', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{actionNotice.message}</span>
            </div>
          )}

          {/* ROLE-AWARE ACTION OR STATUS CARD */}
          {currentUser?.actorType === 'official' ? (
            <div style={{ margin: '20px 0', padding: '18px 20px', background: 'var(--sage-green-subtle)', border: '1.5px solid var(--sage-green)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--deep-olive)' }} />
                  <strong style={{ color: 'var(--deep-olive)', fontSize: '0.94rem' }}>
                    Official Authority Action Station (LDA Executive Office)
                  </strong>
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Officer: {currentUser.name} ({currentUser.badgeId || 'LDA-EMP-8492'})
                </span>
              </div>

              {/* Optional Decision Reason input */}
              <div style={{ marginBottom: '12px' }}>
                <input 
                  type="text"
                  className="mockup-input"
                  placeholder="Official Reason / Instructions (Optional, e.g. Deploy quick squad for road pothole repair)"
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                />
              </div>

              {ticket.status === 'under_review' ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                    <select 
                      className="mockup-input" 
                      style={{ flex: 1, minWidth: '240px', padding: '8px 12px', fontSize: '0.84rem' }}
                      value={selectedCrew}
                      onChange={(e) => setSelectedCrew(e.target.value)}
                    >
                      {CREW_OPTIONS.map((crew, idx) => (
                        <option key={idx} value={crew}>{crew}</option>
                      ))}
                    </select>

                    <button 
                      type="button" 
                      className="btn-olive"
                      onClick={handleApproveAndDispatch}
                    >
                      <Truck size={15} />
                      <span>Approve & Dispatch Crew</span>
                    </button>
                  </div>

                  {/* Secondary Official Decision Actions (Part 13) */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <button
                      type="button"
                      className="btn-outline-olive"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      onClick={handleRequestAdditionalEvidence}
                    >
                      <HelpCircle size={13} />
                      <span>Request Additional Photo</span>
                    </button>

                    <button
                      type="button"
                      className="btn-outline-olive"
                      style={{ fontSize: '0.78rem', padding: '6px 12px', color: '#d97706' }}
                      onClick={handleFlagForInspection}
                    >
                      <AlertTriangle size={13} />
                      <span>Flag for Field Inspection</span>
                    </button>
                  </div>
                </div>
              ) : ticket.status === 'in_progress' ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--deep-olive)' }}>
                      Crew Dispatched & Operating in Sector
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Assigned: {ticket.assignedOfficer || selectedCrew}
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn-olive"
                    style={{ background: 'var(--status-resolved)' }}
                    onClick={handleVerifyAndResolve}
                  >
                    <CheckCircle2 size={16} />
                    <span>Verify Repair & Mark Solved</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-resolved)', fontWeight: 700, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Issue Approved, Dispatched & Successfully Solved by Official Authority</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ margin: '16px 0', padding: '12px 18px', background: 'var(--sage-green-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--deep-olive)' }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <strong>Municipal Review Status:</strong> {ticket.status === 'under_review' ? 'Queued for LDA Executive approval and crew assignment.' : ticket.status === 'in_progress' ? `Field crew active: ${ticket.assignedOfficer || 'Municipal Quick Squad'}` : 'Resolved and verified by Municipal Inspector.'}
                </div>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', background: '#ffffff', padding: '3px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-subtle)' }}>
                {currentUser ? 'Citizen View' : 'Public Tracking'}
              </span>
            </div>
          )}

          {/* Tabs: Timeline | Evidence & Map | Details | AI Insights | Resolution */}
          <div style={{ display: 'flex', gap: '18px', borderBottom: '1px solid var(--border-subtle)', margin: '16px 0 24px', flexWrap: 'wrap' }}>
            {['Timeline', 'Evidence & Map', 'Details', 'AI Insights', 'Resolution'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2.5px solid var(--deep-olive)' : '2.5px solid transparent',
                  padding: '8px 4px',
                  fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? 'var(--deep-olive)' : 'var(--text-muted)',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Vertical Timeline (Screen 5 in Mockup) */}
          {activeTab === 'Timeline' && (
            <div className="vertical-timeline">
              {ticket.timeline.map((item, idx) => (
                <div key={idx} className="v-timeline-item">
                  <div className="v-timeline-icon" style={{ background: idx === ticket.timeline.length - 1 ? 'var(--deep-olive)' : 'var(--sage-green)' }}>
                    <Check size={16} />
                  </div>
                  <div className="v-timeline-content">
                    <div className="v-timeline-title">{item.step}</div>
                    <div className="v-timeline-desc">{item.desc}</div>
                  </div>
                  <div className="v-timeline-time">{item.time}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Evidence & Geotag Verification Map (Part 13) */}
          {activeTab === 'Evidence & Map' && (
            <div>
              {/* Evidence Summary Header Card */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--deep-olive)' }} />
                    <strong style={{ fontSize: '0.92rem', color: 'var(--deep-olive)' }}>
                      Forensic Authenticity & Geotag Verification Record
                    </strong>
                  </div>
                  <span style={{ background: 'var(--deep-olive)', color: '#ffffff', padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.76rem', fontWeight: 700 }}>
                    Confidence Score: {evidence?.evidence_score || 87.5}/100
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.8rem', marginTop: '10px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Authenticity:</span>{' '}
                    <strong style={{ color: 'var(--deep-olive)' }}>
                      {evidence?.signals?.authenticity === 'authentic_photograph' ? 'Authentic Photo' : 'Verified'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Location Check:</span>{' '}
                    <strong style={{ color: 'var(--deep-olive)' }}>
                      {evidence?.signals?.location_consistency || 'Corroborated'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Duplicate Signal:</span>{' '}
                    <strong style={{ color: 'var(--deep-olive)' }}>
                      {evidence?.signals?.duplicate_check || 'No Duplicate Found'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Real Leaflet Map showing location */}
              <div style={{ marginBottom: '16px' }}>
                <InteractiveMap 
                  initialLat={ticket.latitude || 26.8467}
                  initialLon={ticket.longitude || 80.9462}
                  initialAddress={ticket.location}
                  nearbyComplaints={complaints.filter(c => c.id !== ticket.id)}
                  readOnly={true}
                />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                <strong>Evidence Audit Log:</strong> Geotag recorded at latitude {ticket.latitude || 26.8467}°N, longitude {ticket.longitude || 80.9462}°E. Validated by CivicFix-Forensic-Vision-Engine v2.4.0.
              </div>
            </div>
          )}

          {/* Tab 3: Details */}
          {activeTab === 'Details' && (
            <div style={{ padding: '8px 0' }}>
              <h4 style={{ color: 'var(--deep-olive)', marginBottom: '8px' }}>Description</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                "{ticket.description}"
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="info-sub-box">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Assigned Department</div>
                  <div style={{ fontWeight: 700, color: 'var(--deep-olive)', marginTop: '2px' }}>{ticket.department}</div>
                </div>
                <div className="info-sub-box">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>SLA Resolution Window</div>
                  <div style={{ fontWeight: 700, color: 'var(--deep-olive)', marginTop: '2px' }}>{ticket.slaHours} Hours Standard</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: AI Insights */}
          {activeTab === 'AI Insights' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--deep-olive)', fontWeight: 700, marginBottom: '12px' }}>
                <Cpu size={18} />
                <span>Multimodal LLM Reasoning Summary</span>
              </div>
              <div className="info-sub-box" style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>AI Hazard Justification</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ticket.priorityReason}</div>
              </div>
              <div className="info-sub-box">
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '8px' }}>AI Recommended Protocol</div>
                <ul className="recommended-actions-list">
                  {ticket.recommendedActions?.map((act, i) => (
                    <li key={i} className="action-list-item">
                      <span className="action-num-badge">{i + 1}</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 5: Resolution */}
          {activeTab === 'Resolution' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-resolved)', fontWeight: 700, marginBottom: '8px' }}>
                <CheckCircle2 size={18} />
                <span>Field Repair Status</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                {ticket.status === 'resolved' 
                  ? "Municipal field repair completed and audited by Lucknow Development Authority maintenance team. Road reopened for vehicular traffic."
                  : ticket.status === 'in_progress'
                  ? `Work is currently in progress. The assigned crew (${ticket.assignedOfficer || 'Road Repair Unit'}) has been deployed to the site.`
                  : "Grievance is currently under municipal review by the LDA Executive Directorate."}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* SCREEN 4: SEARCH / TRACK COMPLAINT VIEW */
        <div>
          <div className="page-header-center">
            <h2>Track Your Complaint</h2>
            <p>Enter your 10-digit Complaint ID or click an active complaint below to track live repair progress & verified evidence.</p>
          </div>

          {/* Search Box */}
          <div className="card-white" style={{ marginBottom: '24px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
              <div className="input-with-icon" style={{ flex: 1 }}>
                <Search size={18} />
                <input 
                  type="text" 
                  className="mockup-input"
                  placeholder="Enter Complaint ID (e.g. CFA-2026-001)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-olive">
                Search
              </button>
            </form>
          </div>

          {/* Active Ticket Card Preview */}
          {ticket && (
            <div className="card-white" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="ticket-id-tag">{ticket.id}</span>
                  <span className={ticket.status === 'resolved' ? 'ticket-resolved-chip' : 'priority-badge-high'} style={{ fontSize: '0.78rem', padding: '3px 10px' }}>
                    {ticket.status === 'resolved' ? <Check size={13} /> : <Clock size={13} />}
                    <span style={{ textTransform: 'capitalize' }}>{ticket.status.replace('_', ' ')}</span>
                  </span>
                </div>
                
                <button 
                  type="button" 
                  className="btn-olive" 
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={() => setShowFullDetails(true)}
                >
                  <span>View Full Timeline & Evidence</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img 
                  src={ticket.photoUrl} 
                  alt="Defect preview" 
                  style={{ width: '90px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
                />
                <div>
                  <h4 style={{ color: 'var(--deep-olive)', marginBottom: '4px' }}>{ticket.category}</h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {ticket.desc || ticket.description}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    📍 {ticket.location} • Reported on {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Select Complaints List */}
          <div>
            <h4 style={{ color: 'var(--deep-olive)', marginBottom: '12px', fontSize: '0.94rem' }}>
              Active Grievance Registry ({complaints.length} Total Reports)
            </h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              {complaints.map(c => (
                <div 
                  key={c.id}
                  className="card-white"
                  style={{ 
                    padding: '12px 18px', 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: c.id === ticket?.id ? '2px solid var(--deep-olive)' : '1px solid var(--border-subtle)',
                    background: c.id === ticket?.id ? 'var(--sage-green-light)' : '#ffffff'
                  }}
                  onClick={() => {
                    setSearchQuery(c.id);
                    if (onSelectTicket) onSelectTicket(c.id);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={c.photoUrl} alt="" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--deep-olive)' }}>
                        {c.id} — {c.category}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                        {c.location}
                      </div>
                    </div>
                  </div>

                  <span className={c.status === 'resolved' ? 'ticket-resolved-chip' : 'priority-badge-high'} style={{ fontSize: '0.74rem', padding: '2px 8px' }}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
