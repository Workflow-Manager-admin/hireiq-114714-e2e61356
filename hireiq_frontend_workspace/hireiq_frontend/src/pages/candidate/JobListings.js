import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Candidate Job Listings - browse available jobs, apply.
 */
function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [applied, setApplied] = useState({});
  const [applyPending, setApplyPending] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  async function fetchJobs() {
    let { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (!error) setJobs(data);
  }

  async function fetchAppliedJobs() {
    let { data, error } = await supabase.from('applications').select('job_id');
    if (!error) {
      setApplied(Object.fromEntries((data || []).map(row => [row.job_id, true])));
    }
  }

  async function handleApply(jobId) {
    setApplyPending(true);
    await supabase.from('applications').insert([{ job_id: jobId }]);
    setApplied(prev => ({ ...prev, [jobId]: true }));
    setApplyPending(false);
  }

  return (
    <div>
      <h3>Job Listings</h3>
      <ul>
        {jobs.map(job => (
          <li key={job.id} style={{ marginBottom: 15, borderBottom: '1px solid #f5a62333', paddingBottom: 13 }}>
            <div><b>{job.title}</b> <span style={{ color: '#666', fontSize: 12 }}>({job.location})</span></div>
            <div>{job.description}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 1 }}>Salary: {job.salary || 'N/A'}</div>
            <button
              disabled={!!applied[job.id] || applyPending}
              onClick={() => handleApply(job.id)}
              style={{ marginTop: 4, marginBottom: 2, background: '#0070f3', color: '#fff', border: 0, padding: '6px 14px', borderRadius: 7 }}
            >
              {!!applied[job.id] ? 'Applied' : 'Apply'}
            </button>
          </li>
        ))}
        {jobs.length === 0 && <li>No jobs currently posted.</li>}
      </ul>
      {/* AI-powered job matches coming soon */}
    </div>
  );
}

export default JobListings;
