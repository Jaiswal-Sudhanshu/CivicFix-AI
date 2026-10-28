import React, { useState } from 'react';
import { 
  LayoutDashboard, ListOrdered, Users, BarChart3, Settings, 
  Calendar, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, 
  ChevronDown, Filter, FileText, Check, ShieldCheck, MapPin,
  HelpCircle, Eye, X, Truck, Navigation
} from 'lucide-react';
import { MOCK_DASHBOARD_STATS } from '../mockData';
import InteractiveMap from './InteractiveMap';
import { submitOfficialReviewDecision } from '../evidenceEngine';

export default function MunicipalDashboard({ 
  complaints, 
  onSelectTicket, 
  onUpdateStatus, 
  initialView = 'dashboard' 
}) {
  const [activeSidebar, setActiveSidebar] = useState(initialView || 'dashboard');
  const [dateRange, setDateRange] = useState('Oct 20, 2026 - Oct 29, 2026');
  const [evidenceFilter, setEvidenceFilter] = useState('all'); // 'all' | 'verified' | 'requires_review' | 'flagged'

  // Selected complaint for deep forensic inspection modal
  const [inspectedComplaint, setInspectedComplaint] = useState(null);
  const [modalDecisionReason, setModalDecisionReason] = useState('');
  const [modalNotice, setModalNotice] = useState(null);

  React.useEffect(() => {
    if (initialView) setActiveSidebar(initialView);
  }, [initialView]);

  // Filter complaints based on sidebar selection and evidence status
  let displayedComplaints = activeSidebar === 'pending'
    ? complaints.filter(c => c.status === 'under_review')
    : activeSidebar === 'teams'
    ? complaints.filter(c => c.status === 'in_progress')
    : complaints;

  if (evidenceFilter === 'verified') {
    displayedComplaints = displayedComplaints.filter(c => c.evidence_record?.evidence_status === 'verified');
  } else if (evidenceFilter === 'requires_review') {
    displayedComplaints = displayedComplaints.filter(c => c.evidence_record?.evidence_status === 'requires_review');
  } else if (evidenceFilter === 'flagged') {
    displayedComplaints = displayedComplaints.filter(c => c.evidence_record?.evidence_status === 'flagged_suspicious');
  }

  // Handle Official Decision from Modal
  const handleModalDecision = async (decision, newStatus = null) => {
    if (!inspectedComplaint) return;
    const reason = modalDecisionReason.trim() || `Official action '${decision}' recorded by Er. Vikramaditya Singh (LDA).`;
    
    await submitOfficialReviewDecision({
      complaintId: inspectedComplaint.id,
      decision,
      reason,
      officerName: "Er. Vikramaditya Singh",
      badgeId: "LDA-EMP-8492",
      newStatus
    });

    if (newStatus && onUpdateStatus) {
      onUpdateStatus(inspectedComplaint.id, newStatus, "Zone 1 Heavy Municipal Squad");
    }

    setModalNotice(`Decision '${decision.replace('_', ' ')}' successfully logged in official audit registry.`);
    setTimeout(() => {
      setModalNotice(null);
      setInspectedComplaint(null);
      setModalDecisionReason('');
    }, 1200);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar (Screen 6 in Mockup) */}
      <aside className="dashboard-sidebar">
        <button 
          className={`sidebar-menu-btn ${activeSidebar === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSidebar('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button 
          className={`sidebar-menu-btn ${activeSidebar === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveSidebar('pending')}
        >
          <Clock size={18} />
          <span>Pending Approvals ({complaints.filter(c => c.status === 'under_review').length})</span>
        </button>

        <button 
          className={`sidebar-menu-btn ${activeSidebar === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveSidebar('teams')}
        >
          <Users size={18} />
          <span>Active Crew Fleet</span>
        </button>

        <button 
          className={`sidebar-menu-btn ${activeSidebar === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSidebar('all')}
        >
          <ListOrdered size={18} />
          <span>All Complaints</span>
        </button>

        <button 
          className={`sidebar-menu-btn ${activeSidebar === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveSidebar('analytics')}
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </button>

        <button 
          className={`sidebar-menu-btn ${activeSidebar === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSidebar('settings')}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main>
        {/* Header Title & Date Range */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--deep-olive)', marginBottom: '4px' }}>
              Municipal Command Dashboard
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Overview of all reported civic defects, AI authenticity verification, and crew deployments.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            <Calendar size={15} style={{ color: 'var(--text-dim)' }} />
            <span>{dateRange}</span>
            <ChevronDown size={14} style={{ color: 'var(--text-dim)' }} />
          </div>
        </div>

        {/* 4 KPI Stat Cards (Screen 6 in Mockup) */}
        <div className="dashboard-stat-row">
          <div className="dash-stat-card">
            <div className="stat-label">Total Complaints</div>
            <div className="stat-number">{MOCK_DASHBOARD_STATS.totalComplaints}</div>
            <div className="stat-change-up">
              <ArrowUpRight size={14} />
              <span>+12% from last week</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="stat-label">Pending Approval</div>
            <div className="stat-number">{complaints.filter(c => c.status === 'under_review').length}</div>
            <div className="stat-change-down">
              <Clock size={14} />
              <span>Awaiting tender decision</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="stat-label">Active Dispatches</div>
            <div className="stat-number">{complaints.filter(c => c.status === 'in_progress').length}</div>
            <div className="stat-change-up">
              <Users size={14} />
              <span>5 squads deployed</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="stat-label">Resolved (This Month)</div>
            <div className="stat-number">{MOCK_DASHBOARD_STATS.resolvedThisMonth}</div>
            <div className="stat-change-up">
              <CheckCircle2 size={14} />
              <span>94.2% verified SLA</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="dashboard-charts-row">
          {/* Chart 1: Complaint Trends */}
          <div className="dash-chart-card">
            <h4 style={{ color: 'var(--deep-olive)', fontWeight: 800, fontSize: '1rem', marginBottom: '16px' }}>
              Complaints Trend
            </h4>
            <svg viewBox="0 0 420 180" style={{ width: '100%', height: '180px', overflow: 'visible' }}>
              <line x1="40" y1="30" x2="400" y2="30" stroke="#e2e4d8" strokeDasharray="3 3" />
              <line x1="40" y1="70" x2="400" y2="70" stroke="#e2e4d8" strokeDasharray="3 3" />
              <line x1="40" y1="110" x2="400" y2="110" stroke="#e2e4d8" strokeDasharray="3 3" />
              <line x1="40" y1="150" x2="400" y2="150" stroke="#cbd0be" strokeWidth="1.5" />
              <polyline fill="none" stroke="#2E3D28" strokeWidth="2.5" strokeLinecap="round" points="50,110 110,90 180,120 250,75 320,85 390,45" />
              <polyline fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" points="50,138 110,132 180,125 250,115 320,105 390,95" />
              <text x="50" y="168" fontSize="9.5" fill="#98a593" textAnchor="middle">20 Oct</text>
              <text x="110" y="168" fontSize="9.5" fill="#98a593" textAnchor="middle">22 Oct</text>
              <text x="180" y="168" fontSize="9.5" fill="#98a593" textAnchor="middle">24 Oct</text>
              <text x="250" y="168" fontSize="9.5" fill="#98a593" textAnchor="middle">26 Oct</text>
              <text x="320" y="168" fontSize="9.5" fill="#98a593" textAnchor="middle">28 Oct</text>
              <text x="390" y="168" fontSize="9.5" fill="#98a593" textAnchor="middle">29 Oct</text>
            </svg>
          </div>

          {/* Chart 2: Category Breakdown */}
          <div className="dash-chart-card">
            <h4 style={{ color: 'var(--deep-olive)', fontWeight: 800, fontSize: '1rem', marginBottom: '16px' }}>
              By Category
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <svg viewBox="0 0 100 100" style={{ width: '110px', height: '110px', flexShrink: 0 }}>
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2E3D28" strokeWidth="18" strokeDasharray="72 168" strokeDashoffset="25" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#A9B887" strokeWidth="18" strokeDasharray="47 193" strokeDashoffset="-47" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray="38 202" strokeDashoffset="-94" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0284c7" strokeWidth="18" strokeDasharray="26 214" strokeDashoffset="-132" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ef4444" strokeWidth="18" strokeDasharray="17 223" strokeDashoffset="-158" />
              </svg>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.78rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E3D28' }} /> Roads & Potholes: 34%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A9B887' }} /> Garbage: 22%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Streetlights: 18%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} /> Water: 12%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Drainage: 8%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            RECENT COMPLAINTS TABLE WITH EVIDENCE STATUS & ACTIONS (Part 13)
            ==================================================================== */}
        <div className="recent-table-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h4 style={{ color: 'var(--deep-olive)', fontWeight: 800, fontSize: '1rem', margin: 0 }}>
              Recent Complaints Registry ({displayedComplaints.length})
            </h4>

            {/* Evidence Status Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-outline-olive"
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.74rem',
                  background: evidenceFilter === 'all' ? 'var(--deep-olive)' : '#ffffff',
                  color: evidenceFilter === 'all' ? '#ffffff' : 'var(--deep-olive)'
                }}
                onClick={() => setEvidenceFilter('all')}
              >
                All Evidence
              </button>

              <button
                type="button"
                className="btn-outline-olive"
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.74rem',
                  background: evidenceFilter === 'verified' ? 'var(--status-resolved-bg)' : '#ffffff',
                  color: evidenceFilter === 'verified' ? 'var(--status-resolved)' : 'var(--deep-olive)',
                  borderColor: evidenceFilter === 'verified' ? 'var(--status-resolved)' : 'var(--border-default)'
                }}
                onClick={() => setEvidenceFilter('verified')}
              >
                Verified (80+)
              </button>

              <button
                type="button"
                className="btn-outline-olive"
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.74rem',
                  background: evidenceFilter === 'requires_review' ? '#fef3c7' : '#ffffff',
                  color: evidenceFilter === 'requires_review' ? '#92400e' : 'var(--deep-olive)',
                  borderColor: evidenceFilter === 'requires_review' ? '#f59e0b' : 'var(--border-default)'
                }}
                onClick={() => setEvidenceFilter('requires_review')}
              >
                Review Needed
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Defect Category</th>
                  <th>Location & Geotag</th>
                  <th>Evidence Score</th>
                  <th>Status</th>
                  <th>Reported On</th>
                  <th>Official Review</th>
                </tr>
              </thead>
              <tbody>
                {displayedComplaints.map((c) => {
                  const ev = c.evidence_record;
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: 'var(--deep-olive)' }}>{c.id}</td>
                      <td>{c.category}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <div>{c.location}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          {c.latitude ? `${c.latitude.toFixed(4)}°N, ${c.longitude.toFixed(4)}°E` : 'Geotagged'}
                          {c.gps_accuracy_meters && ` (±${c.gps_accuracy_meters}m)`}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px', 
                          borderRadius: 'var(--radius-pill)', 
                          fontSize: '0.74rem', 
                          fontWeight: 800,
                          background: ev?.evidence_status === 'verified' ? 'var(--status-resolved-bg)' : '#fef3c7',
                          color: ev?.evidence_status === 'verified' ? 'var(--status-resolved)' : '#92400e'
                        }}>
                          <ShieldCheck size={12} />
                          <span>{ev?.evidence_score || 85}/100</span>
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '3px 8px', 
                          borderRadius: 'var(--radius-pill)', 
                          fontSize: '0.74rem', 
                          fontWeight: 700,
                          background: c.status === 'resolved' ? 'var(--status-resolved-bg)' : c.status === 'in_progress' ? 'var(--status-progress-bg)' : 'var(--status-med-bg)',
                          color: c.status === 'resolved' ? 'var(--status-resolved)' : c.status === 'in_progress' ? 'var(--status-progress)' : 'var(--status-med)'
                        }}>
                          {c.status === 'resolved' ? 'Resolved' : c.status === 'in_progress' ? 'In Progress' : 'Under Review'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button" 
                            className="btn-outline-olive" 
                            style={{ padding: '4px 10px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setInspectedComplaint(c)}
                            title="Inspect AI Authenticity & Geospatial Evidence"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>

                          {c.status === 'under_review' && onUpdateStatus && (
                            <button 
                              type="button" 
                              className="btn-olive" 
                              style={{ padding: '4px 10px', fontSize: '0.76rem', background: 'var(--deep-olive)' }}
                              title="Quick Approve & Dispatch Crew"
                              onClick={() => onUpdateStatus(c.id, 'in_progress', 'Zone 1 Quick Dispatch Crew')}
                            >
                              Dispatch
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ======================================================================
          OFFICIAL FORENSIC & GEOSPATIAL INSPECTION MODAL (Part 13)
          ====================================================================== */}
      {inspectedComplaint && (
        <div className="auth-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setInspectedComplaint(null);
        }}>
          <div className="card-white" style={{ maxWidth: '780px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '24px 28px', position: 'relative' }}>
            <button 
              type="button" 
              onClick={() => setInspectedComplaint(null)}
              style={{ position: 'absolute', right: '18px', top: '18px', background: 'var(--bg-surface-sunken)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={22} style={{ color: 'var(--deep-olive)' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--deep-olive)' }}>
                  Official Evidence Audit: {inspectedComplaint.id}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Category: {inspectedComplaint.category} • Officer: Er. Vikramaditya Singh (LDA)
                </div>
              </div>
            </div>

            {modalNotice && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--status-resolved-bg)', color: 'var(--status-resolved)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '14px' }}>
                {modalNotice}
              </div>
            )}

            {/* Photo & Forensic Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', marginBottom: '18px' }}>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '160px' }}>
                <img src={inspectedComplaint.photoUrl} alt="Inspection" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.86rem', color: 'var(--deep-olive)' }}>Forensic Confidence Score</strong>
                  <span style={{ background: 'var(--deep-olive)', color: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontSize: '0.78rem', fontWeight: 800 }}>
                    {inspectedComplaint.evidence_record?.evidence_score || 87.5}/100
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <div>• <strong>Detector Model:</strong> CivicFix-Forensic-Vision-Engine v2.4.0 (CPU Validated)</div>
                  <div>• <strong>Authenticity:</strong> Authentic photograph (sensor gradients & lighting natural)</div>
                  <div>• <strong>Semantic Match:</strong> Visual content matches description</div>
                  <div>• <strong>Hardware GPS:</strong> {inspectedComplaint.gps_accuracy_meters ? `Locked within ±${inspectedComplaint.gps_accuracy_meters}m` : 'Citizen confirmed pin'}</div>
                </div>
              </div>
            </div>

            {/* Map Preview of Location */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--deep-olive)', marginBottom: '6px' }}>
                Reported Incident Location & Spatial Sector
              </div>
              <InteractiveMap 
                initialLat={inspectedComplaint.latitude || 26.8467}
                initialLon={inspectedComplaint.longitude || 80.9462}
                initialAddress={inspectedComplaint.location}
                nearbyComplaints={complaints.filter(c => c.id !== inspectedComplaint.id)}
                readOnly={true}
              />
            </div>

            {/* Decision Reason Input */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>
                Official Decision Reason & Engineering Directives
              </label>
              <input 
                type="text"
                className="mockup-input"
                placeholder="e.g. Verified pothole photo; deploy Zone 1 Asphalt squad immediately"
                value={modalDecisionReason}
                onChange={(e) => setModalDecisionReason(e.target.value)}
                style={{ fontSize: '0.84rem' }}
              />
            </div>

            {/* Official Action Decision Buttons (Part 13) */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-outline-olive"
                style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                onClick={() => handleModalDecision('request_additional_evidence')}
              >
                Request Additional Photo
              </button>

              <button
                type="button"
                className="btn-outline-olive"
                style={{ fontSize: '0.8rem', padding: '8px 14px', color: '#d97706' }}
                onClick={() => handleModalDecision('flag_for_inspection')}
              >
                Flag for Field Inspection
              </button>

              <button
                type="button"
                className="btn-olive"
                style={{ fontSize: '0.8rem', padding: '8px 18px', background: 'var(--deep-olive)' }}
                onClick={() => handleModalDecision('approve_evidence', 'in_progress')}
              >
                <Truck size={14} />
                <span>Approve Evidence & Dispatch Crew</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
