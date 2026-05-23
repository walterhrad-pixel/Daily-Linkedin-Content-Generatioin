"use client";

import React, { useState } from 'react';

// Mock Data
const MOCK_TODAY_POST = "Data syncing shouldn't be a part-time job. Background syncing saves you 2 hours a day. Don't take my word for it—Sarah J. says 'It feels like magic!' Stop wasting time, start shipping.";
const MOCK_HISTORY = [
  { date: "Oct 24, 2026", snippet: "Slow feedback loops kill motivation. Our new preview deployment feature..." },
  { date: "Oct 23, 2026", snippet: "Is your team spending more time debugging than shipping? It's time to rethink..." },
  { date: "Oct 22, 2026", snippet: "Scaling too fast is a myth. Breaking under load is real. The solution..." },
  { date: "Oct 21, 2026", snippet: "Burnout isn't from hard work. It's from doing repetitive tasks. Automate..." },
  { date: "Oct 20, 2026", snippet: "Every click you remove from a user journey increases conversion by 12%..." },
];

export default function YayaDailyPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_TODAY_POST);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const manualTrigger = () => {
    setLoading(true);
    // Mock firing the Go orchestrator via API
    setTimeout(() => {
      alert("Manual trigger completed! Go Orchestrator finished.");
      setLoading(false);
    }, 1500);
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      {/* Top Left History Toggle */}
      <button 
        className="history-toggle"
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
        History
      </button>

      <div className={`history-drawer ${drawerOpen ? 'open' : ''}`}>
        <h2 style={{marginTop: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)'}}>Past 7 Days</h2>
        <div className="history-list">
          {MOCK_HISTORY.map((item, i) => (
            <div key={i} className="history-item">
              <h4 style={{ color: 'var(--text-primary)' }}>{item.date}</h4>
              <p style={{ color: 'var(--text-secondary)' }}>{item.snippet}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="glass-panel animate-in" style={{ maxWidth: '680px', width: '90%', margin: '2rem', background: 'var(--glass-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <img 
            src="/logo.png" 
            alt="Yaya AI Logo" 
            style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-color)' }}>
              Yaya AI Daily LinkedIn Content Generation
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
              This is a contextual based content generator for marketing the 'Yaya AI' SaaS Application. It pulls data from sources like Yaya AI project documentation, investor pitches, onboarding materials, and YouTube tutorials.
            </p>
          </div>
        </div>
        
        <div style={{
          fontSize: '1.15rem',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          fontWeight: 400,
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '8px',
          borderLeft: '4px solid var(--accent-color)',
          border: '1px solid var(--glass-border)',
          whiteSpace: 'pre-wrap',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}>
          {MOCK_TODAY_POST}
        </div>

        <button className="btn-primary" onClick={handleCopy}>
          {copied ? (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy to Clipboard
            </>
          )}
        </button>
      </div>

      {/* Dev Settings Gear */}
      <div 
        className="dev-gear" 
        onClick={manualTrigger}
        title="Manual Trigger: Force Go Orchestrator to run"
      >
        {loading ? (
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>...</span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        )}
      </div>
    </main>
  );
}
