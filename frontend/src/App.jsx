import React, { useState, useEffect } from 'react';
import { 
  Leaf, Camera, Send, CheckCircle2, Shield, FileText, 
  Activity, Radio, Sparkles, User, LogOut, Home, LogIn, ChevronDown,
  ShieldCheck, RefreshCw, LogIn as LoginIcon, Clock, Users, BarChart3,
  Lock, AlertTriangle
} from 'lucide-react';
import { INITIAL_COMPLAINTS } from './mockData';
import HeroSection from './components/HeroSection';
import CitizenPortal from './components/CitizenPortal';
import TicketTracker from './components/TicketTracker';
import MunicipalDashboard from './components/MunicipalDashboard';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';

export default function App() {
  // Navigation tabs:
  // Citizen: 'home' | 'report' | 'track' | 'impact' | 'about'
  // Official: 'official_dashboard' | 'official_pending' | 'official_dispatch' | 'track' | 'impact'
  const [activeTab, setActiveTab] = useState('home');
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [selectedTicketId, setSelectedTicketId] = useState('CFA-2026-001');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Authentication & Role State
  // Role is strictly derived from authenticated session: 'citizen' | 'official' | null (guest)
  const [currentUser, setCurrentUser] = useState({
    name: 'Priya Sharma',
    role: 'Citizen Snapper (Level 3)',
    actorType: 'citizen',
    locality: 'Hazratganj, Lucknow',
    email: 'priya.sharma@lucknow.in',
    avatar: 'PS'
  });

  // Auth Modal State with URL Synchronization
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // URL routing synchronization (handles browser back/forward and /signin /signup)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path === '/signin' || hash === '#/signin' || hash === '#signin') {
        setAuthModalMode('login');
        setIsAuthOpen(true);
      } else if (path === '/signup' || hash === '#/signup' || hash === '#signup') {
        setAuthModalMode('signup');
        setIsAuthOpen(true);
      } else {
        setIsAuthOpen(false);
      }
    };

    // Check on initial load
    handleUrlChange();

    // Listen for browser back / forward navigation
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Open Auth Modal with Browser History push
  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthOpen(true);
    const targetUrl = mode === 'signup' ? '/signup' : '/signin';
    try {
      window.history.pushState({ auth: mode }, '', targetUrl);
    } catch {
      window.location.hash = targetUrl;
    }
  };

  // Close Auth Modal and revert URL to root cleanly
  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    try {
      if (window.location.pathname === '/signin' || window.location.pathname === '/signup') {
        window.history.pushState({}, '', '/');
      } else if (window.location.hash) {
        window.history.pushState({}, '', window.location.pathname);
      }
    } catch {
      window.location.hash = '';
    }
  };

  // Handler for mode switch inside AuthModal (e.g. Sign In <-> Sign Up)
  const handleAuthModeChange = (newMode) => {
    setAuthModalMode(newMode);
    const targetUrl = newMode === 'signup' ? '/signup' : '/signin';
    try {
      window.history.replaceState({ auth: newMode }, '', targetUrl);
    } catch {
      window.location.hash = targetUrl;
    }
  };

  // Login Success Handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    handleCloseAuth();
    if (user.actorType === 'official') {
      setActiveTab('official_dashboard');
    } else {
      setActiveTab('report');
    }
  };

  // Sign out function
  const handleSignOut = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Handler to add new grievance from Citizen Camera / Upload
  const handleNewComplaint = (newRecord) => {
    setComplaints([newRecord, ...complaints]);
    setSelectedTicketId(newRecord.id);
  };

  // Handler for Official Authority to approve request and dispatch crew
  const handleUpdateStatus = (id, newStatus, assignedCrew) => {
    // Authorization check
    if (currentUser?.actorType !== 'official') {
      alert('Access Denied: Only verified Official Authority (LDA) personnel can approve tenders and dispatch crews.');
      return;
    }

    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const timeNow = "Just now";
        let stepTitle = "In Progress";
        let stepDesc = `Approved by ${currentUser.name} (LDA). Dispatched crew: ${assignedCrew || 'Road Repair Quick Squad 3'}.`;
        
        if (newStatus === 'resolved') {
          stepTitle = "Resolved";
          stepDesc = `Field repair verified by ${currentUser.name}. Defect closed.`;
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

  const pendingApprovalsCount = complaints.filter(c => c.status === 'under_review').length;
  const currentActor = currentUser?.actorType || 'guest';

  return (
    <div className="app-container">
      {/* ==========================================================================
          TOP NAVBAR WITH ROLE-SPECIFIC MENU BAR & AUTH CONTROLS
          ========================================================================== */}
      <header className="mockup-navbar">
        {/* Brand Logo */}
        <div 
          className="mockup-brand" 
          onClick={() => setActiveTab(currentActor === 'official' ? 'official_dashboard' : 'home')}
        >
          <div className="brand-icon-circle">
            <Leaf size={18} />
          </div>
          <span className="brand-name">CivicFix AI</span>
        </div>

        {/* ======================================================================
            ROLE-SPECIFIC SEPARATE MENU BARS ACCORDING TO USER'S ROLE
            ====================================================================== */}
        <nav className="mockup-nav-links">
          {/* 1. CITIZEN MENU BAR */}
          {currentActor === 'citizen' && (
            <>
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
                <Camera size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                Snap & Report
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                Track Complaints
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'impact' ? 'active' : ''}`}
                onClick={() => setActiveTab('impact')}
              >
                Community Impact
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
            </>
          )}

          {/* 2. OFFICIAL AUTHORITY (LDA) MENU BAR */}
          {currentActor === 'official' && (
            <>
              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'official_dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('official_dashboard')}
              >
                <BarChart3 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                Command Dashboard
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'official_pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('official_pending')}
              >
                <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                Pending Approvals ({pendingApprovalsCount})
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'official_dispatch' ? 'active' : ''}`}
                onClick={() => setActiveTab('official_dispatch')}
              >
                <Users size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                Dispatch Fleet
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                Inspect Ticket
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'impact' ? 'active' : ''}`}
                onClick={() => setActiveTab('impact')}
              >
                City Impact
              </button>
            </>
          )}

          {/* 3. GUEST / UNAUTHENTICATED MENU BAR */}
          {currentActor === 'guest' && (
            <>
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
                onClick={() => handleOpenAuth('login')}
              >
                <Camera size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                Snap & Report
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                Track Complaints
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'impact' ? 'active' : ''}`}
                onClick={() => setActiveTab('impact')}
              >
                Community Impact
              </button>

              <button 
                type="button" 
                className={`nav-link-btn ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
            </>
          )}
        </nav>

        {/* ======================================================================
            AUTHENTICATION NAVIGATION & PROFILE STATE IN NAVBAR
            ====================================================================== */}
        <div>
          {currentUser ? (
            /* Authenticated User Profile Pill & Sign Out */
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'var(--bg-surface-raised)', 
                  padding: '5px 14px', 
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--deep-olive)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 800 }}>
                  {currentUser.avatar || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--deep-olive)', lineHeight: '1.2' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: currentActor === 'official' ? 'var(--deep-olive)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {currentActor === 'official' ? 'Official Authority (LDA)' : 'Citizen Snapper'}
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                className="btn-outline-olive" 
                style={{ padding: '6px 12px', fontSize: '0.78rem', color: 'var(--status-high)', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleSignOut}
                title="Sign out of current role"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* Dedicated Sign In & Sign Up Buttons on Nav Bar */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                type="button" 
                className="btn-outline-olive"
                style={{ padding: '7px 16px', fontSize: '0.84rem' }}
                onClick={() => handleOpenAuth('login')}
              >
                Sign In
              </button>

              <button 
                type="button" 
                className="btn-olive"
                style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                onClick={() => handleOpenAuth('signup')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ==========================================================================
          MAIN VIEWS
          ========================================================================== */}
      <main>
        {/* SCREEN 1: Landing Page */}
        {activeTab === 'home' && (
          <HeroSection 
            onStartReport={() => {
              if (currentUser) {
                setActiveTab('report');
              } else {
                handleOpenAuth('login');
              }
            }}
            onTrackReport={() => setActiveTab('track')}
            onSelectCategory={() => {
              if (currentUser) {
                setActiveTab('report');
              } else {
                handleOpenAuth('login');
              }
            }}
          />
        )}

        {/* SCREENS 2 & 3: Citizen Snap & Report with Live Camera */}
        {activeTab === 'report' && (
          currentUser ? (
            <CitizenPortal 
              complaints={complaints}
              onNewComplaint={handleNewComplaint}
              onSelectTicket={handleSelectTicket}
              geminiApiKey={geminiApiKey}
              setGeminiApiKey={setGeminiApiKey}
              currentActor={currentActor}
            />
          ) : (
            <div className="card-white" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--sage-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--deep-olive)' }}>
                <Camera size={26} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--deep-olive)', marginBottom: '8px' }}>
                Sign In to Snap & Report
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
                To record geotagged camera photos, generate multimodal AI analysis, and submit civic issues to Lucknow municipal authorities, please sign in.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button type="button" className="btn-olive" onClick={() => handleOpenAuth('login')}>
                  Sign In
                </button>
                <button type="button" className="btn-outline-olive" onClick={() => handleOpenAuth('signup')}>
                  Create Account
                </button>
              </div>
            </div>
          )
        )}

        {/* SCREENS 4 & 5: Track Your Complaint with Role-Aware Action Station */}
        {activeTab === 'track' && (
          <TicketTracker 
            complaints={complaints}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
            onUpdateStatus={handleUpdateStatus}
            currentActor={currentActor}
            currentUser={currentUser}
          />
        )}

        {/* SCREEN 6: Official Authority Dashboard (Protected View) */}
        {(activeTab === 'official_dashboard' || activeTab === 'official_pending' || activeTab === 'official_dispatch') && (
          currentActor === 'official' ? (
            <MunicipalDashboard 
              complaints={complaints}
              onSelectTicket={handleSelectTicket}
              onUpdateStatus={handleUpdateStatus}
              initialView={
                activeTab === 'official_pending' ? 'pending' : 
                activeTab === 'official_dispatch' ? 'teams' : 'dashboard'
              }
            />
          ) : (
            <div className="card-white" style={{ maxWidth: '620px', margin: '40px auto', padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--status-high)' }}>
                <Lock size={26} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--deep-olive)', marginBottom: '8px' }}>
                Official Authority Access Restricted
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
                The Municipal Command Dashboard is strictly reserved for authorized Lucknow Development Authority (LDA) personnel. Sign in with official credentials to review AI triaged tickets and dispatch crew fleets.
              </p>
              <button 
                type="button" 
                className="btn-olive"
                onClick={() => handleOpenAuth('login')}
              >
                Sign In as Official Authority (LDA)
              </button>
            </div>
          )
        )}

        {/* COMMUNITY / CITY IMPACT VIEW */}
        {activeTab === 'impact' && (
          <MunicipalDashboard 
            complaints={complaints}
            onSelectTicket={handleSelectTicket}
            onUpdateStatus={handleUpdateStatus}
            initialView="dashboard"
          />
        )}

        {/* ABOUT VIEW */}
        {activeTab === 'about' && (
          <div className="card-white" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
            <h2 style={{ color: 'var(--deep-olive)', marginBottom: '12px' }}>About CivicFix AI</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
              CivicFix AI is an advanced municipal artificial intelligence platform built for the Lucknow Development Authority (LDA).
              It seamlessly connects two key civic actors through dedicated role-based portals:
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

      {/* Auth Modal with Role Selection, Official Verification, and URL Synchronization */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        initialMode={authModalMode}
        onModeChange={handleAuthModeChange}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Professional Civic Enterprise Footer */}
      <Footer 
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenAuth={() => handleOpenAuth('login')}
      />
    </div>
  );
}
