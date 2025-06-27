import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Recruiter Applications: View/manage applications with AI resume parsing & scoring. Includes update status and profile viewer.
 */
function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [resumeDataByCandidate, setResumeDataByCandidate] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, []);

  // Fetch all applications (with candidate/user details and job info). Gather resume AI results as well.
  async function fetchApplications() {
    setStatus('');
    setErr('');
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
      // Map (user_id -> ai_parse from most recent resume)
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
    } else {
      setErr('Unable to load applications');
    }
  }

  function readableScore(score) {
    if (score > 85) return <span style={{ color: '#19b14c', fontWeight: 600 }}>{score}/100</span>;
    if (score >= 70) return <span style={{ color: '#f5a623', fontWeight: 600 }}>{score}/100</span>;
    return <span style={{ color: '#cc3535', fontWeight: 600 }}>{score}/100</span>;
  }

  // PUBLIC_INTERFACE
  // Update status of application (advance stage, etc.)
  async function handleStatusChange(appId, newStatus) {
    setPending(true);
    setErr('');
    setStatus('');
    const { error } = await supabase.from('applications')
      .update({ status: newStatus })
      .eq('id', appId);
    if (!error) {
      setStatus('Status updated!');
      fetchApplications();
    }
    else setErr('Update failed.');
    setPending(false);
  }

  // PUBLIC_INTERFACE
  // Show full candidate profile/details
  function openCandidateProfile(candidate) {
    setSelectedCandidate(candidate);
  }
  function closeCandidateProfile() {
    setSelectedCandidate(null);
  }

  return (
    <div>
      <h3>All Candidate Applications</h3>
      {status && <div style={{color:'#145b39',background:'#e3fcec',borderRadius:6,padding:'6px 10px',fontWeight:600,marginBottom:6}}>{status}</div>}
      {err && <div style={{color:'#db2222',background:'#ffe4df',borderRadius:6,padding:'6px 10px',fontWeight:600,marginBottom:6}}>{err}</div>}
      <ul style={{padding:0}}>
        {applications.map(app => {
          const ai = resumeDataByCandidate[app.candidate_id];
          const appStatuses = ["Applied", "Screened", "Interview", "Offered", "Rejected"];
          const canAdvance = app.status !== 'Offered' && app.status !== 'Rejected';
          return (
            <li key={app.id} style={{ borderBottom: '1px solid #eaeaea', marginBottom: 13, paddingBottom: 7, listStyle: 'none', textAlign: 'left' }}>
              <div>
                <b>Candidate:</b>{' '}
                <button
                  onClick={() => openCandidateProfile(app.candidate)}
                  style={{background:'none',color:'#0070f3',border:0,padding:0,fontWeight:600,cursor:'pointer',textDecoration:'underline'}}
                  title="View candidate profile"
                >
                  {app.candidate?.full_name || app.candidate?.email || app.candidate_id}
                </button>
                <span style={{ marginLeft: 12, color: '#888', fontSize: 12 }}>for <b>{app.job?.title || 'Unknown Job'}</b></span>
              </div>
              <div>
                <b>Status:</b> {app.status}{' '}
                {canAdvance && (
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    disabled={pending}
                    style={{marginLeft:10}}
                  >
                    {appStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
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
        {applications.length === 0 && <li style={{color:'#888'}}>No applications found.</li>}
      </ul>

      {/* Candidate profile modal/aside */}
      {selectedCandidate && (
        <div
          onClick={closeCandidateProfile}
          style={{
            position:"fixed",
            inset:0,
            background:'rgba(0,0,0,0.19)',
            zIndex:1000,
            display:'flex',
            justifyContent:'center',
            alignItems:'center'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:'#fff',
              borderRadius:12,
              padding:'32px 44px 22px 36px',
              minWidth:300,
              maxWidth:430,
              boxShadow:'0 4px 28px #1a1a1a26'
            }}
          >
            <div style={{display:'flex', justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <h2 style={{color:'#284DD9',margin:0,fontWeight:900,fontSize:'1.26rem'}}>Candidate Profile</h2>
              <button onClick={closeCandidateProfile} style={{ fontSize: 22, background: 'none', border:0, color:'#222', cursor:'pointer', margin:-6, padding:0 }} aria-label="Close">×</button>
            </div>
            <div>
              <b>Name:</b> {selectedCandidate.full_name || selectedCandidate.email || selectedCandidate.id}<br/>
              <b>Email:</b> {selectedCandidate.email}<br/>
              <b>Role:</b> {selectedCandidate.role || 'Candidate'}<br/>
            </div>
            {/* Show resume AI parse details if available */}
            <div style={{marginTop:9, background:'#eaf7f5', borderRadius:7, padding:'10px 13px', fontSize:'1rem'}}>
              <b>Last Uploaded Resume:</b><br/>
              {resumeDataByCandidate[selectedCandidate.id] ? (
                <ul style={{marginLeft:17, marginTop:5}}>
                  <li><b>Summary:</b> {resumeDataByCandidate[selectedCandidate.id].summary}</li>
                  <li><b>Skills:</b> {resumeDataByCandidate[selectedCandidate.id].skills.join(", ")}</li>
                  <li><b>AI Resume Score:</b> {readableScore(resumeDataByCandidate[selectedCandidate.id].ai_score)}</li>
                  <li><b>Insights:</b> {resumeDataByCandidate[selectedCandidate.id].insights}</li>
                </ul>
              ) : (
                <span>No resume uploaded.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationManagement;
