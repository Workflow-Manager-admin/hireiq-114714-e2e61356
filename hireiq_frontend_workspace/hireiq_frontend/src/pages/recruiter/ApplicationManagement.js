import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Recruiter Applications: View/manage applications with AI resume parsing & scoring.
 */
function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [resumeDataByCandidate, setResumeDataByCandidate] = useState({});

  useEffect(() => {
    fetchApplications();
  }, []);

  // Fetch all applications (with candidate details). Also gather resume AI results by candidate.
  async function fetchApplications() {
    let { data: apps, error } = await supabase
      .from('applications')
      .select('*, job:jobs(*), candidate:profiles(*)')
      .order('created_at', { ascending: false });

    if (!error && apps) {
      setApplications(apps);

      // Get all candidate IDs
      const uniqueCandidates = Array.from(new Set(apps.map(a => a.candidate_id)));
      // Fetch resumes for all candidates in one go
      let { data: resumes, error: rerr } = await supabase
        .from('resumes')
        .select('*')
        .in('user_id', uniqueCandidates);
      // Map (user_id -> ai_parse from most recent uploaded resume)
      if (!rerr && resumes) {
        const byCandidate = {};
        for (const uid of uniqueCandidates) {
          // Find latest resume for the candidate
          const candidateResumes = resumes.filter(r => r.user_id === uid);
          if (candidateResumes.length) {
            const mostRecent = candidateResumes.reduce((a, b) =>
              new Date(a.uploaded_at) > new Date(b.uploaded_at) ? a : b
            );
            if (mostRecent.ai_parse) byCandidate[uid] = mostRecent.ai_parse;
          }
        }
        setResumeDataByCandidate(byCandidate);
      }
    }
  }

  function readableScore(score) {
    if (score > 85) return <span style={{ color: '#19b14c', fontWeight: 600 }}>{score}/100</span>;
    if (score >= 70) return <span style={{ color: '#f5a623', fontWeight: 600 }}>{score}/100</span>;
    return <span style={{ color: '#cc3535', fontWeight: 600 }}>{score}/100</span>;
  }

  return (
    <div>
      <h3>All Candidate Applications</h3>
      <ul>
        {applications.map(app => {
          const ai = resumeDataByCandidate[app.candidate_id];
          return (
            <li key={app.id} style={{ borderBottom: '1px solid #eaeaea', marginBottom: 13, paddingBottom: 7 }}>
              <div>
                <b>Candidate:</b> {app.candidate?.full_name || app.candidate?.email || app.candidate_id}
                <span style={{ marginLeft: 12, color: '#888', fontSize: 12 }}>for <b>{app.job?.title || 'Unknown Job'}</b></span>
              </div>
              <div><b>Status:</b> {app.status}</div>
              <div>
                <b>AI Resume Score:</b>{" "}
                {ai?.ai_score !== undefined
                  ? readableScore(ai.ai_score)
                  : <span style={{ color: '#aaa' }}>N/A</span>
                }
              </div>
              {ai && (
                <div style={{ margin: "7px 0", background: "#f5a62311", borderRadius: 7, padding: "7px 12px" }}>
                  <b>Summary:</b> {ai.summary}<br />
                  <b>Skills:</b> {ai.skills && ai.skills.length ? ai.skills.join(', ') : '—'}<br />
                  <b>Insights:</b> {ai.insights}
                </div>
              )}
              <div style={{ fontSize: '0.92rem', color: '#888', marginTop: 1 }}>Applied: {app.created_at?.slice(0, 10)}</div>
            </li>
          );
        })}
        {applications.length === 0 && <li>No applications found.</li>}
      </ul>
    </div>
  );
}

export default ApplicationManagement;
