import React from 'react';
import { 
  ShieldCheck, Phone, Mail, MapPin, Clock, 
  ExternalLink, CheckCircle2, AlertTriangle, ArrowRight,
  Sparkles, FileText, Activity, Radio, HelpCircle
} from 'lucide-react';

export default function Footer({ onNavigate, onOpenAuth }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="civic-footer">
      {/* 1. Civic Trust & Rapid Resolution Banner */}
      <div className="footer-trust-banner">
        <div className="trust-item">
          <div className="trust-icon-wrapper">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="trust-title">Direct Municipal Routing</div>
            <div className="trust-subtitle">Zero call-center queues. Incidents dispatched straight to LDA field teams.</div>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon-wrapper">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="trust-title">Audited Resolution SLAs</div>
            <div className="trust-subtitle">Every grievance stamped with GPS coordinates, SLA timers, and field inspection.</div>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon-wrapper">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="trust-title">Accessible Voice Intake</div>
            <div className="trust-subtitle">Multilingual voice dictation in Hindi & English with real-time AI classification.</div>
          </div>
        </div>
      </div>

      {/* 2. Emergency Escalation Strip */}
      <div className="footer-emergency-strip">
        <div className="emergency-badge">
          <AlertTriangle size={14} /> Immediate Hazard Hotline
        </div>
        <div className="emergency-text">
          For life-threatening hazards (exposed high-voltage wires, deep sinkholes, active gas ruptures), call 
          <strong className="emergency-highlight"> 112 (State Emergency)</strong> or LDA 24/7 Control Room: 
          <a href="tel:05222616611" className="emergency-link"> 0522-2616611</a>.
        </div>
      </div>

      {/* 3. Main Footer Directory */}
      <div className="footer-main-grid">
        {/* Brand & Authority Column */}
        <div className="footer-brand-col">
          <div className="footer-brand-header">
            <img 
              src="/lda_logo.jpg" 
              alt="Lucknow Development Authority Official Seal" 
              className="footer-logo-img"
            />
            <div>
              <div className="footer-brand-title">CivicFix AI</div>
              <div className="footer-brand-authority">Lucknow Development Authority</div>
            </div>
          </div>

          <p className="footer-brand-desc">
            Official digital public infrastructure for municipal defect reporting across Lucknow. 
            Empowering citizens to report, track, and solve infrastructure issues with end-to-end transparency.
          </p>

          <div className="footer-status-pill">
            <span className="footer-status-indicator" />
            <span>LDA Command Systems: <strong>Operational</strong></span>
            <span className="footer-status-divider">•</span>
            <span>Avg SLA: <strong>18.4h</strong></span>
          </div>
        </div>

        {/* Citizen Services */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Citizen Services</h4>
          <ul className="footer-links-list">
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onNavigate('citizen')}>
                <FileText size={14} />
                <span>Snap & Report an Issue</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onNavigate('tracker')}>
                <Activity size={14} />
                <span>Track Ticket Status</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onNavigate('home')}>
                <Sparkles size={14} />
                <span>Explore Lucknow Incidents</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onNavigate('municipal')}>
                <Radio size={14} />
                <span>LDA Municipal Dashboard</span>
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={onOpenAuth}>
                <ShieldCheck size={14} />
                <span>Officer & Citizen Portal Login</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Responsible Municipal Wings */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Municipal Wings</h4>
          <ul className="footer-links-list">
            <li>
              <span className="footer-link-static">LDA Engineering & PWD (Roads)</span>
            </li>
            <li>
              <span className="footer-link-static">Electrical & Streetlighting Directorate</span>
            </li>
            <li>
              <span className="footer-link-static">Lucknow Jal Sansthan (Water & Sewage)</span>
            </li>
            <li>
              <span className="footer-link-static">LDA & LMC Solid Waste Directorate</span>
            </li>
            <li>
              <span className="footer-link-static">Urban Drainage & Rapid Flood Unit</span>
            </li>
          </ul>
        </div>

        {/* LDA Headquarters & Helpdesk */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">LDA Central Desk</h4>
          <div className="footer-contact-info">
            <div className="footer-contact-item">
              <MapPin size={15} className="footer-contact-icon" />
              <span>Vipin Khand, Gomti Nagar, Lucknow, UP 226010</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={15} className="footer-contact-icon" />
              <a href="tel:18001800082" className="footer-contact-link">1800-180-0082 (Toll-Free)</a>
            </div>
            <div className="footer-contact-item">
              <Mail size={15} className="footer-contact-icon" />
              <a href="mailto:redressal@lda.up.gov.in" className="footer-contact-link">redressal@lda.up.gov.in</a>
            </div>
            <div className="footer-contact-item">
              <Clock size={15} className="footer-contact-icon" />
              <span>Field Ops: 08:00 AM – 08:00 PM (Emergency 24x7)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Legal, Security & Copyright Strip */}
      <div className="footer-bottom-strip">
        <div className="footer-bottom-text">
          © {currentYear} Lucknow Development Authority (LDA), Government of Uttar Pradesh. All rights reserved.
        </div>

        <div className="footer-bottom-links">
          <span className="footer-bottom-link">Citizen Charter</span>
          <span className="footer-bottom-dot">•</span>
          <span className="footer-bottom-link">Grievance Redressal SLA</span>
          <span className="footer-bottom-dot">•</span>
          <span className="footer-bottom-link">Privacy & Data Governance</span>
          <span className="footer-bottom-dot">•</span>
          <span className="footer-bottom-link">Accessibility Standards</span>
        </div>
      </div>
    </footer>
  );
}
