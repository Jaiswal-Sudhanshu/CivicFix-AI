import React, { useState } from 'react';
import {
  Leaf, Camera, Send, CheckCircle2, Shield, FileText,
  Activity, Radio, Sparkles, User, LogOut, Home, LogIn, ChevronDown,
  ShieldCheck, RefreshCw, LogIn as LoginIcon
} from 'lucide-react';
import { INITIAL_COMPLAINTS } from './mockData';
import HeroSection from './components/HeroSection';
import CitizenPortal from './components/CitizenPortal';
import TicketTracker from './components/TicketTracker';
import MunicipalDashboard from './components/MunicipalDashboard';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';

export default function App() {
  // Navigation tabs: 'home' | 'report' | 'track' | 'impact' | 'about'
  const [activeTab, setActiveTab] = useState('home');
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [selectedTicketId, setSelectedTicketId] = useState('CFA-2026-001');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Dual Actor Role State: 'citizen' | 'official'
  const [currentActor, setCurrentActor] = useState('citizen');

  // Logged-in User State (defaults to Citizen for realistic onboarding)
  const [currentUser, setCurrentUser] = useState({
    name: 'Sudhanshu Jaiswal',
    role: 'Citizen Snapper (Level 3)',
    actorType: 'citizen',
    locality: 'Hazratganj, Lucknow',
    email: 'Sudhanshu.Jaiswal@lucknow.in',
    avatar: 'PS'
  });

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handler to add new grievance from Citizen Camera / Upload
  const handleNewComplaint = (newRecord) => {
    setComplaints([newRecord, ...complaints]);
    setSelectedTicketId(newRecord.id);
  };

  // Handler for Official Authority to approve request and dispatch crew
  const handleUpdateStatus = (id, newStatus, assignedCrew) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const timeNow = "Just now";
        let stepTitle = "In Progress";
        let stepDesc = `Approved by Er. Vikramaditya Singh (LDA). Dispatched crew: ${assignedCrew || 'Road Repair Quick Squad 3'}.`;

        if (newStatus === 'resolved') {
          stepTitle = "Resolved";
          stepDesc = "Field repair verified by LDA Municipal Inspector. Defect closed.";
        }

        return {
          ...c,
          status: newStatus,
          assignedOfficer: assignedCrew || c.assignedOfficer,
          timeline: [
            ...c.timeline,
            { step: stepTitle, time: timeNow, desc: stepDesc }
          ]
        };
      }
      return c;
    }));
  };

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    setActiveTab('track');
  };

  // Switch Actor Function
  const handleSwitchActor = (actorType) => {
    setCurrentActor(actorType);
    if (actorType === 'official') {
      setCurrentUser({
        name: 'Er. Vikramaditya Singh',
        role: 'LDA Senior Executive Officer',
        actorType: 'official',
        locality: 'LDA Headquarters, Gomti Nagar',
        email: 'vikram.singh@lda.up.gov.in',
        avatar: 'VS'
      });
      setActiveTab('impact');
    } else {
      setCurrentUser({
        name: 'Priya Sharma',
        role: 'Citizen Snapper (Level 3)',
        actorType: 'citizen',
        locality: 'Hazratganj, Lucknow',
        email: 'priya.sharma@lucknow.in',
        avatar: 'PS'
      });
      setActiveTab('report');
    }
  };

  return (
    <div className="app-container">
      {/* ==========================================================================
          TOP ACTOR SWITCHER BANNER (Instant Role Selection)
          ========================================================================== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--deep-olive)', color: 'var(--soft-white)', padding: '6px 18px', borderRadius: 'var(--radius-pill)', marginBottom: '14px', fontSize: '0.82rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 800, color: 'var(--sage-green)' }}>ACTIVE ROLE:</span>
          <span>{currentActor === 'citizen' ? 'Citizen Snapper — Priya Sharma (Reporting with Camera)' : 'Official Authority — Er. Vikramaditya Singh (Approving & Dispatching Crews)'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.76rem', opacity: 0.8 }}>Select Role:</span>
          <button
            type="button"
            className="btn-olive"
            style={{
              background: currentActor === 'citizen' ? 'var(--sage-green)' : 'rgba(255,255,255,0.15)',
              color: currentActor === 'citizen' ? 'var(--deep-olive)' : '#ffffff',
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}
            onClick={() => handleSwitchActor('citizen')}
          >
            <Camera size={13} />
            <span>Citizen (Camera Snapper)</span>
          </button>

          <button
            type="button"
            className="btn-olive"
            style={{
              background: currentActor === 'official' ? 'var(--sage-green)' : 'rgba(255,255,255,0.15)',
              color: currentActor === 'official' ? 'var(--deep-olive)' : '#ffffff',
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}
            onClick={() => handleSwitchActor('official')}
          >
            <ShieldCheck size={13} />
            <span>Official Authority (LDA Dispatch)</span>
          </button>
        </div>
      </div>

      {/* ==========================================================================
          TOP NAVBAR (Mockup Style)
          ========================================================================== */}
      {/* ==========================================================================
          TOP NAVBAR (Mockup Style with Responsive Mobile Architecture)
          ========================================================================== */}
      <header className="mockup-navbar">
        {/* Logo */}
        <div className="mockup-brand" onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}>
          <div className="brand-icon-circle">
            <Leaf size={18} />
          </div>
          <span className="brand-name">CivicFix AI</span>
        </div>

        {/* Mockup Nav Links: Home | Report | Track | Impact | About (Desktop) */}
        <nav className="mockup-nav-links desktop-only">
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            Report
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => setActiveTab('track')}
          >
            Track
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'impact' ? 'active' : ''}`}
            onClick={() => setActiveTab('impact')}
          >
            Impact
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </nav>

        {/* User Profile & Role Selector (Desktop) + Hamburger (Mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="desktop-only">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-surface-raised)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsAuthOpen(true)}
                  title="Click to Switch Role or Sign In"
                >
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--deep-olive)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                    {currentUser.avatar || 'A'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--deep-olive)' }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {currentUser.actorType === 'official' ? 'Official Authority (LDA)' : 'Citizen Snapper'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-outline-olive"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  onClick={() => setIsAuthOpen(true)}
                >
                  Switch Role
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-login-pill"
                onClick={() => setIsAuthOpen(true)}
              >
                Sign In / Select Role
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="brand-icon-circle" style={{ width: '26px', height: '26px' }}>
                  <Leaf size={14} />
                </div>
                <strong style={{ color: 'var(--deep-olive)', fontSize: '1rem' }}>CivicFix AI Menu</strong>
              </div>
              <button 
                type="button" 
                className="btn-close-drawer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Active Role Card inside Mobile Drawer */}
            <div style={{ padding: '12px', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '6px' }}>
                Logged-in Session
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--deep-olive)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                  {currentUser?.avatar || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--deep-olive)' }}>
                    {currentUser?.name || 'Citizen User'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {currentActor === 'official' ? 'Official Authority (LDA)' : 'Citizen Snapper'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-outline-olive"
                style={{ width: '100%', marginTop: '10px', padding: '6px 12px', fontSize: '0.82rem', justifyContent: 'center' }}
                onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
              >
                Switch Role / Change Profile
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="mobile-drawer-links">
              <button
                type="button"
                className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
              >
                <Home size={18} />
                <span>Home Page</span>
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeTab === 'report' ? 'active' : ''}`}
                onClick={() => { setActiveTab('report'); setIsMobileMenuOpen(false); }}
              >
                <Camera size={18} />
                <span>Report Civic Issue (Camera)</span>
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => { setActiveTab('track'); setIsMobileMenuOpen(false); }}
              >
                <Activity size={18} />
                <span>Track Complaints & SLAs</span>
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeTab === 'impact' ? 'active' : ''}`}
                onClick={() => { setActiveTab('impact'); setIsMobileMenuOpen(false); }}
              >
                <BarChart3 size={18} />
                <span>Municipal Impact & Map</span>
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => { setActiveTab('about'); setIsMobileMenuOpen(false); }}
              >
                <ShieldCheck size={18} />
                <span>About LDA Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          MAIN VIEWS (Matching the 6 Mockup Screens)
          ========================================================================== */}
      <main>
        {/* SCREEN 1: Landing Page */}
        {activeTab === 'home' && (
          <HeroSection
            onStartReport={() => setActiveTab('report')}
            onTrackReport={() => setActiveTab('track')}
            onSelectCategory={() => setActiveTab('report')}
          />
        )}

        {/* SCREENS 2 & 3: Report an Issue & AI Analysis Result (Citizen with Live Camera) */}
        {activeTab === 'report' && (
          <CitizenPortal
            complaints={complaints}
            onNewComplaint={handleNewComplaint}
            onSelectTicket={handleSelectTicket}
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={setGeminiApiKey}
            currentActor={currentActor}
          />
        )}

        {/* SCREENS 4 & 5: Track Your Complaint & Complaint Details (With Official Approval & Crew Dispatch) */}
        {activeTab === 'track' && (
          <TicketTracker
            complaints={complaints}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
            onUpdateStatus={handleUpdateStatus}
            currentActor={currentActor}
          />
        )}

        {/* SCREEN 6: Municipal / Admin Dashboard (Official Authority Oversight & Dispatch) */}
        {activeTab === 'impact' && (
          <MunicipalDashboard
            complaints={complaints}
            onSelectTicket={handleSelectTicket}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* ABOUT VIEW */}
        {activeTab === 'about' && (
          <div className="card-white" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
            <h2 style={{ color: 'var(--deep-olive)', marginBottom: '12px' }}>About CivicFix AI</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
              CivicFix AI is an advanced municipal artificial intelligence platform built for the Lucknow Development Authority (LDA).
              It seamlessly connects two key civic actors:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px', marginBottom: '24px' }}>
              <div className="info-sub-box">
                <strong style={{ color: 'var(--deep-olive)' }}>1. Citizen Snapper</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Captures civic defects via live camera photo, receives real-time LLM categorization, and tracks resolution step-by-step.
                </p>
              </div>
              <div className="info-sub-box">
                <strong style={{ color: 'var(--deep-olive)' }}>2. Official Authority (LDA)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Reviews AI-triaged requests, selects and dispatches municipal road/sanitation crews, and verifies resolution audits.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal with Interactive Role Selector */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentActor(user.actorType || 'citizen');
          if (user.actorType === 'official') {
            setActiveTab('impact');
          } else {
            setActiveTab('report');
          }
        }}
      />

      {/* Professional Civic Enterprise Footer */}
      <Footer
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Mobile Fixed Bottom Navigation Bar (iOS / Android Native Feel) */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`mobile-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
          onClick={() => { setActiveTab('track'); setIsMobileMenuOpen(false); }}
        >
          <Activity size={20} />
          <span>Track</span>
        </button>

        {/* Center Primary Action: Camera / Snap Report */}
        <button
          type="button"
          className="mobile-center-snap-btn"
          onClick={() => { setActiveTab('report'); setIsMobileMenuOpen(false); }}
          title="Snap Civic Issue"
        >
          <div className="snap-btn-inner">
            <Camera size={22} />
          </div>
          <span>Report</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeTab === 'impact' ? 'active' : ''}`}
          onClick={() => { setActiveTab('impact'); setIsMobileMenuOpen(false); }}
        >
          <BarChart3 size={20} />
          <span>{currentActor === 'official' ? 'Command' : 'Impact'}</span>
        </button>

        <button
          type="button"
          className="mobile-tab-btn"
          onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
