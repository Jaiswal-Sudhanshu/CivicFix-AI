import React from 'react';
import { 
  Camera, Cpu, Activity, ArrowRight, CheckCircle2, 
  Layers, AlertTriangle, Sparkles, AlertCircle
} from 'lucide-react';

export default function HeroSection({ onStartReport, onTrackReport, onSelectCategory }) {
  return (
    <div>
      {/* 1. HERO SECTION (Screen 1 in Mockup) */}
      <section className="hero-wrapper">
        <div className="hero-grid">
          <div>
            <div className="hero-pill-tag">
              CLEANER CITIES • SAFER COMMUNITIES
            </div>

            <h1 className="hero-title">
              Your City.<br />
              Your Voice.<br />
              Smarter Solutions.
            </h1>

            <p className="hero-subtitle">
              Report civic issues, get AI-powered recommendations, and track progress towards a cleaner, safer community.
            </p>

            <div className="hero-ctas">
              <button 
                className="btn-olive" 
                onClick={onStartReport}
                style={{ padding: '12px 24px', fontSize: '0.98rem' }}
              >
                <span>Report an Issue</span>
                <ArrowRight size={18} />
              </button>
              
              <button 
                className="btn-outline-olive"
                onClick={onTrackReport}
                style={{ padding: '12px 22px', fontSize: '0.98rem' }}
              >
                Track My Complaint
              </button>
            </div>
          </div>

          {/* Hero Visual with Floating Pothole AI Badge */}
          <div className="hero-image-container">
            <img 
              src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80" 
              alt="Road pothole in Lucknow sector" 
              className="hero-image-pothole"
            />
            
            <div className="floating-pothole-badge">
              <div className="badge-icon">
                <AlertCircle size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--deep-olive)' }}>
                  Pothole reported
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  AI suggests: <strong style={{ color: 'var(--status-high)' }}>High Priority</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP (Screen 1 in Mockup) */}
      <div className="stats-strip">
        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Camera size={22} />
          </div>
          <div>
            <div className="stat-number">1,240</div>
            <div className="stat-label">Issues Reported</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-number">980</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-number">760</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Layers size={22} />
          </div>
          <div>
            <div className="stat-number">15+</div>
            <div className="stat-label">Issue Categories</div>
          </div>
        </div>
      </div>

      {/* 3. HOW IT WORKS (Screen 1 in Mockup) */}
      <div className="how-it-works-panel">
        <h2 className="section-heading">How It Works</h2>
        <div className="steps-three-col">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-circle-num">1</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Camera size={18} style={{ color: 'var(--deep-olive)' }} />
                <h3 className="step-card-title">Report</h3>
              </div>
              <p className="step-card-desc">
                Capture a photo, describe the issue, and mark its location.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-circle-num">2</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Cpu size={18} style={{ color: 'var(--deep-olive)' }} />
                <h3 className="step-card-title">Analyse</h3>
              </div>
              <p className="step-card-desc">
                AI suggests category, priority and possible solutions.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-circle-num">3</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Activity size={18} style={{ color: 'var(--deep-olive)' }} />
                <h3 className="step-card-title">Track</h3>
              </div>
              <p className="step-card-desc">
                Follow updates and see the resolution progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
