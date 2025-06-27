import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Recruiter Applications: View/manage applications with AI screen placeholder.
 */
function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [aiScores, setAiScores] = useState({}); // Placeholder for AI-based scoring

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    let { data, error } = await supabase
      .from('applications')
      .select('*, job:jobs(*), candidate:profiles(*)')
      .order('created_at', { ascending: false });
    if (!error) setApplications(data);
  }

  // Placeholder for future AI logic (stub scoring)
  function aiScoreCandidate(application) {
    // In future, use resume and job description for scoring
    return aiScores[application.id] || Math.floor(Math.random() * 100);
  }

  return (
    <div>
      <h3>All Candidate Applications</h3>
      <ul>
        {applications.map(app => (
          <li key={app.id} style={{ borderBottom: '1px solid #eaeaea', marginBottom: 13, paddingBottom: 7 }}>
            <div>
              <b>Candidate:</b> {app.candidate?.full_name || app.candidate?.email || app.candidate_id}
              <span style={{ marginLeft: 12, color: '#888', fontSize: 12 }}>for <b>{app.job?.title || 'Unknown Job'}</b></span>
            </div>
            <div><b>Status:</b> {app.status}</div>
            <div><b>AI Fit Score (stub):</b> <span style={{ color: '#f5a623', fontWeight: 600 }}>{aiScoreCandidate(app)}%</span></div>
            <div style={{ fontSize: '0.92rem', color: '#888', marginTop: 1 }}>Applied: {app.created_at?.slice(0, 10)}</div>
          </li>
        ))}
        {applications.length === 0 && <li>No applications found.</li>}
      </ul>
    </div>
  );
}

export default ApplicationManagement;
