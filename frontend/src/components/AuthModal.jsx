import React, { useState, useEffect } from 'react';
import { 
  X, Camera, ShieldCheck, User, Mail, Lock, 
  ArrowRight, CheckCircle2, Sparkles, Building2, Truck,
  KeyRound, RefreshCw, Check, ArrowLeft, Shield, Leaf, HeartHandshake,
  AlertTriangle, BadgeCheck, MapPin, Briefcase
} from 'lucide-react';

// Mock Source of Truth Database
const MOCK_ACCOUNTS = {
  officials: [
    {
      email: 'vikram.singh@lda.up.gov.in',
      password: 'official123',
      name: 'Er. Vikramaditya Singh',
      role: 'LDA Senior Executive Officer',
      actorType: 'official',
      locality: 'LDA Headquarters, Gomti Nagar',
      designation: 'Senior Executive Engineer',
      department: 'Roads & Infrastructure Wing',
      badgeId: 'LDA-EMP-8492',
      avatar: 'VS'
    },
    {
      email: 'admin@lda.up.gov.in',
      password: 'official123',
      name: 'Dr. Alok Verma',
      role: 'Municipal Chief Commissioner',
      actorType: 'official',
      locality: 'Municipal Corporation HQ, Hazratganj',
      designation: 'Municipal Chief Commissioner',
      department: 'Executive Administration',
      badgeId: 'LDA-EMP-001',
      avatar: 'AV'
    }
  ],
  citizens: [
    {
      email: 'priya.sharma@lucknow.in',
      password: 'citizen123',
      name: 'Priya Sharma',
      role: 'Citizen Snapper (Level 3)',
      actorType: 'citizen',
      locality: 'Hazratganj, Lucknow',
      ward: 'Ward 14 (Hazratganj)',
      avatar: 'PS'
    }
  ]
};

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  initialMode = 'login',
  onModeChange
}) {
  // Mode: 'login' | 'signup' | 'forgot' | 'otp_verify' | 'reset_success'
  const [mode, setMode] = useState(initialMode || 'login');
  
  // Selected Actor Role: 'citizen' | 'official'
  const [selectedRole, setSelectedRole] = useState('citizen');

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [locality, setLocality] = useState('Hazratganj, Lucknow');
  
  // Official-Specific Fields
  const [designation, setDesignation] = useState('Executive Engineer (Civic)');
  const [department, setDepartment] = useState('Roads & Infrastructure Wing');
  const [badgeId, setBadgeId] = useState('');

  // Password Reset States
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback States
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Synchronize mode when initialMode changes & reset states
  useEffect(() => {
    if (isOpen) {
      const targetMode = initialMode === 'signup' ? 'signup' : 'login';
      setMode(targetMode);
      setError('');
      setNotice('');
    }
  }, [isOpen, initialMode]);

  // Handle ESC key to close pop dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mode switch handler with URL callback
  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setNotice('');
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  if (!isOpen) return null;

  // Auto-fill demo credentials for easy judging
  const handleFillDemo = (roleType) => {
    setSelectedRole(roleType);
    setError('');
    setNotice('');
    if (roleType === 'citizen') {
      setEmail('priya.sharma@lucknow.in');
      setPassword('citizen123');
    } else {
      setEmail('vikram.singh@lda.up.gov.in');
      setPassword('official123');
    }
  };

  // Instant One-Click Login
  const handleRoleQuickLogin = (roleType) => {
    if (roleType === 'citizen') {
      const citizenUser = MOCK_ACCOUNTS.citizens[0];
      onLoginSuccess(citizenUser);
    } else {
      const officialUser = MOCK_ACCOUNTS.officials[0];
      onLoginSuccess(officialUser);
    }
    onClose();
  };

  // Handle Standard Form Submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    // --- 1. SIGN IN FLOW ---
    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password.');
        return;
      }

      const cleanEmail = email.trim().toLowerCase();

      // Official Role Validation
      if (selectedRole === 'official') {
        const foundOfficial = MOCK_ACCOUNTS.officials.find(
          u => u.email.toLowerCase() === cleanEmail
        );

        // Security check: Reject citizen email trying to login as Official
        const isCitizenEmail = MOCK_ACCOUNTS.citizens.some(
          c => c.email.toLowerCase() === cleanEmail
        );

        if (isCitizenEmail) {
          setError('Access Denied: This account is registered as a Citizen. Citizens cannot access Official Authority (LDA) administrative tools.');
          return;
        }

        if (foundOfficial) {
          if (foundOfficial.password !== password) {
            setError('Invalid credentials for LDA official portal. Demo password is: official123');
            return;
          }
          onLoginSuccess(foundOfficial);
          onClose();
          return;
        } else {
          // If valid gov domain, allow demo signin
          if (cleanEmail.includes('lda') || cleanEmail.includes('.gov.in')) {
            const newOfficial = {
              name: 'LDA Officer ' + cleanEmail.split('@')[0],
              role: 'LDA Municipal Officer',
              actorType: 'official',
              locality: 'Lucknow Municipal Command Center',
              email: cleanEmail,
              designation: 'Field Inspection Officer',
              department: 'Municipal Operations',
              badgeId: 'LDA-DEMO-' + Math.floor(1000 + Math.random() * 9000),
              avatar: 'LO'
            };
            onLoginSuccess(newOfficial);
            onClose();
            return;
          }

          setError('Unauthorized Account: Official authority access is restricted to verified LDA municipal officers with @lda.up.gov.in domain.');
          return;
        }
      }

      // Citizen Role Validation
      if (selectedRole === 'citizen') {
        const foundCitizen = MOCK_ACCOUNTS.citizens.find(
          u => u.email.toLowerCase() === cleanEmail
        );

        if (foundCitizen) {
          if (foundCitizen.password !== password) {
            setError('Invalid password. Demo password is: citizen123');
            return;
          }
          onLoginSuccess(foundCitizen);
          onClose();
          return;
        } else {
          // Allow custom citizen login for testing
          const newCitizen = {
            name: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
            role: 'Citizen Snapper (Level 1)',
            actorType: 'citizen',
            locality: 'Lucknow, Uttar Pradesh',
            email: cleanEmail,
            avatar: cleanEmail.substring(0, 2).toUpperCase()
          };
          onLoginSuccess(newCitizen);
          onClose();
          return;
        }
      }
    }

    // --- 2. SIGN UP FLOW ---
    if (mode === 'signup') {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all mandatory fields.');
        return;
      }

      const cleanEmail = email.trim().toLowerCase();

      if (selectedRole === 'official') {
        if (!badgeId.trim()) {
          setError('Official Authority registration requires an LDA Employee/Badge ID.');
          return;
        }

        if (!cleanEmail.includes('.gov.in') && !cleanEmail.includes('lda')) {
          setError('Official registration requires an official government domain (e.g. officer@lda.up.gov.in).');
          return;
        }

        const newOfficialUser = {
          name: fullName.trim(),
          role: `${designation} (LDA)`,
          actorType: 'official',
          locality: 'Lucknow Development Authority HQ',
          email: cleanEmail,
          designation: designation,
          department: department,
          badgeId: badgeId.trim(),
          avatar: fullName.substring(0, 2).toUpperCase()
        };

        MOCK_ACCOUNTS.officials.push({
          ...newOfficialUser,
          password: password
        });

        onLoginSuccess(newOfficialUser);
        onClose();
        return;
      }

      // Citizen Sign Up
      const newCitizenUser = {
        name: fullName.trim(),
        role: 'Citizen Snapper (Level 1)',
        actorType: 'citizen',
        locality: locality,
        email: cleanEmail,
        avatar: fullName.substring(0, 2).toUpperCase()
      };

      MOCK_ACCOUNTS.citizens.push({
        ...newCitizenUser,
        password: password
      });

      onLoginSuccess(newCitizenUser);
      onClose();
      return;
    }

    // --- 3. FORGOT PASSWORD FLOWS ---
    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Enter your registered email to receive the reset code.');
        return;
      }
      setNotice(`Verification OTP sent to ${email}! Demo code is: 4291`);
      setMode('otp_verify');
      return;
    }

    if (mode === 'otp_verify') {
      if (!otp.trim()) {
        setError('Enter the 4-digit code (use demo code: 4291)');
        return;
      }
      setNotice('Identity verified successfully! Set your new password.');
      setMode('reset_success');
      return;
    }

    if (mode === 'reset_success') {
      if (!newPassword.trim() || newPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setNotice('Password reset successfully! Please sign in with your new password.');
      setMode('login');
      setPassword('');
      return;
    }
  };

  return (
    <div 
      className="auth-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ======================================================================
          INSTANT POP DIALOG BOX CARD
          ====================================================================== */}
      <div className="auth-pop-dialog" role="dialog" aria-modal="true">
        {/* Close (X) Button */}
        <button 
          type="button"
          className="auth-close-btn"
          onClick={onClose}
          title="Close dialog (Esc)"
        >
          <X size={16} />
        </button>

        {/* Dialog Header with Brand Leaf */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '50%', 
            background: 'var(--deep-olive)', 
            color: 'var(--soft-white)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 8px',
            boxShadow: '0 4px 12px rgba(46, 61, 40, 0.2)' 
          }}>
            <Leaf size={22} style={{ color: 'var(--sage-green)' }} />
          </div>
          
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--deep-olive)', marginBottom: '3px' }}>
            {mode === 'forgot' || mode === 'otp_verify' || mode === 'reset_success'
              ? 'Password Recovery'
              : 'CivicFix AI Gateway'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {mode === 'forgot' || mode === 'otp_verify' || mode === 'reset_success'
              ? 'Recover access to your civic or municipal account'
              : 'Lucknow Urban Governance & AI Verification Portal'}
          </p>
        </div>

        {/* POP DIALOG MODE SWITCHER TABS (Sign In vs Sign Up) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="dialog-mode-tabs">
            <button
              type="button"
              className={`dialog-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`dialog-tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('signup')}
            >
              Create Account
            </button>
          </div>
        )}

        {/* FORGOT PASSWORD WORKFLOW */}
        {(mode === 'forgot' || mode === 'otp_verify' || mode === 'reset_success') ? (
          <form onSubmit={handleFormSubmit}>
            {notice && (
              <div style={{ background: 'var(--sage-green-light)', border: '1px solid var(--sage-green)', color: 'var(--deep-olive)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 600 }}>
                <Check size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                {notice}
              </div>
            )}

            {mode === 'forgot' && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.84rem' }}>Registered Email or Phone</label>
                <input 
                  type="text"
                  className="mockup-input"
                  placeholder="e.g. priya.sharma@lucknow.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div style={{ marginTop: '16px' }}>
                  <button type="submit" className="btn-olive" style={{ width: '100%', padding: '11px' }}>
                    Send Recovery Code
                  </button>
                </div>
              </div>
            )}

            {mode === 'otp_verify' && (
              <div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem' }}>Enter 4-Digit Verification OTP</label>
                  <input 
                    type="text"
                    className="mockup-input"
                    placeholder="Enter 4291"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                <button type="submit" className="btn-olive" style={{ width: '100%', padding: '11px' }}>
                  Verify OTP Code
                </button>
              </div>
            )}

            {mode === 'reset_success' && (
              <div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem' }}>New Password</label>
                  <input 
                    type="password"
                    className="mockup-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.84rem' }}>Confirm New Password</label>
                  <input 
                    type="password"
                    className="mockup-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-olive" style={{ width: '100%', padding: '11px' }}>
                  Reset Password & Sign In
                </button>
              </div>
            )}

            {error && (
              <div style={{ color: 'var(--status-high)', fontSize: '0.8rem', marginTop: '10px' }}>
                {error}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => handleSwitchMode('login')}
                className="btn-outline-olive" 
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              >
                <ArrowLeft size={13} /> Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD SIGN IN / SIGN UP POP DIALOG FORM */
          <div>
            {/* Role Selection Cards */}
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                Select Role to Continue:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Citizen Card */}
                <div 
                  style={{
                    border: `2px solid ${selectedRole === 'citizen' ? 'var(--deep-olive)' : 'var(--border-subtle)'}`,
                    background: selectedRole === 'citizen' ? 'var(--sage-green-light)' : 'var(--bg-surface-raised)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => {
                    setSelectedRole('citizen');
                    setError('');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--deep-olive)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={12} />
                    </div>
                    <strong style={{ fontSize: '0.86rem', color: 'var(--deep-olive)' }}>Citizen</strong>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    Snap photos, geotag & track civic complaints.
                  </p>
                </div>

                {/* Official Card */}
                <div 
                  style={{
                    border: `2px solid ${selectedRole === 'official' ? 'var(--deep-olive)' : 'var(--border-subtle)'}`,
                    background: selectedRole === 'official' ? 'var(--sage-green-light)' : 'var(--bg-surface-raised)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => {
                    setSelectedRole('official');
                    setError('');
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--deep-olive)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={12} />
                    </div>
                    <strong style={{ fontSize: '0.86rem', color: 'var(--deep-olive)' }}>Official (LDA)</strong>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    Verify AI evidence, audit & dispatch crews.
                  </p>
                </div>
              </div>
            </div>

            {/* Instant 1-Click Role Login for Quick Testing */}
            {mode === 'login' && (
              <div style={{ marginBottom: '14px' }}>
                <button 
                  type="button" 
                  className="btn-olive"
                  style={{ width: '100%', padding: '9px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => handleRoleQuickLogin(selectedRole)}
                >
                  <span>1-Click Login: {selectedRole === 'citizen' ? 'Citizen (Priya Sharma)' : 'Official (Er. Vikramaditya)'}</span>
                  <ArrowRight size={14} />
                </button>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('citizen')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.74rem', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Fill Citizen Demo
                  </button>
                  <span style={{ color: 'var(--border-subtle)' }}>•</span>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('official')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.74rem', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Fill Official Demo
                  </button>
                </div>
              </div>
            )}

            {/* Official Registration Notice Banner */}
            {mode === 'signup' && selectedRole === 'official' && (
              <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertTriangle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.74rem', color: '#92400e', lineHeight: '1.3' }}>
                  <strong>Official Authority Notice:</strong> Access is reserved for LDA municipal officers. Badge authentication is required for crew dispatch privileges.
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit}>
              {mode === 'signup' && (
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Full Name *</label>
                  <input 
                    type="text"
                    className="mockup-input"
                    placeholder={selectedRole === 'citizen' ? 'e.g. Rahul Verma' : 'e.g. Er. Vikramaditya Singh'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              {/* Role-Specific Sign Up Fields */}
              {mode === 'signup' && selectedRole === 'official' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Designation *</label>
                      <input 
                        type="text"
                        className="mockup-input"
                        placeholder="e.g. Executive Engineer"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>LDA Badge ID *</label>
                      <input 
                        type="text"
                        className="mockup-input"
                        placeholder="e.g. LDA-EMP-8492"
                        value={badgeId}
                        onChange={(e) => setBadgeId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Department / Wing *</label>
                    <select 
                      className="mockup-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="Roads & Infrastructure Wing">Roads & Infrastructure Wing</option>
                      <option value="Solid Waste Management Division">Solid Waste Management Division</option>
                      <option value="Electrical & Street Lighting Wing">Electrical & Street Lighting Wing</option>
                      <option value="Urban Drainage & Desilting Wing">Urban Drainage & Desilting Wing</option>
                      <option value="Park Maintenance & Greenery Wing">Park Maintenance & Greenery Wing</option>
                    </select>
                  </div>
                </>
              )}

              {mode === 'signup' && selectedRole === 'citizen' && (
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Locality / Municipal Ward</label>
                  <input 
                    type="text"
                    className="mockup-input"
                    placeholder="e.g. Hazratganj, Ward 14"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  {selectedRole === 'official' ? 'Official Govt Email (@lda.up.gov.in) *' : 'Email Address *'}
                </label>
                <input 
                  type="email"
                  className="mockup-input"
                  placeholder={selectedRole === 'citizen' ? 'priya.sharma@lucknow.in' : 'vikram.singh@lda.up.gov.in'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', margin: 0 }}>Password *</label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setMode('forgot');
                        setError('');
                        setNotice('');
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--deep-olive)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input 
                  type="password"
                  className="mockup-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div style={{ color: 'var(--status-high)', fontSize: '0.78rem', marginBottom: '12px', background: '#fee2e2', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #f87171' }}>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-olive" 
                style={{ width: '100%', padding: '11px', fontSize: '0.88rem' }}
              >
                {mode === 'login' ? `Sign In as ${selectedRole === 'citizen' ? 'Citizen' : 'Official Authority'}` : 'Submit Registration'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
