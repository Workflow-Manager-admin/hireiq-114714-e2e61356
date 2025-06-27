import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Candidate Application Tracking (shows all applications and statuses)
 */
function ApplicationTracking() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    let { data, error } = await supabase
      .from('applications')
      .select('*, job:jobs(*)')
      .order('created_at', { ascending: false });
    if (!error) setApplications(data);
  }

  return (
    <div>
      <h3>My Applications</h3>
      <ul>
        {applications.map(app => (
          <li key={app.id} style={{ borderBottom: '1px solid #eaeaea', marginBottom: 13, paddingBottom: 7 }}>
            <div>
              <b>Job:</b> {app.job?.title || app.job_id}
              <span style={{ marginLeft: 12, color: '#888', fontSize: 12 }}>Applied: {app.created_at?.slice(0, 10)}</span>
            </div>
            <div><b>Status:</b> {app.status}</div>
            {/* Future: AI screening or feedback here */}
          </li>
        ))}
        {applications.length === 0 && <li>You have not applied for any jobs yet.</li>}
      </ul>
    </div>
  );
}

export default ApplicationTracking;
