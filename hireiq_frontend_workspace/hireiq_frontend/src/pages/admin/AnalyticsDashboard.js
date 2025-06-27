import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Admin Analytics Dashboard (basic stats for jobs/applications/users)
 */
function AnalyticsDashboard() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [{ count: userCount }, { count: jobCount }, { count: appCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ users: userCount || 0, jobs: jobCount || 0, applications: appCount || 0 });
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h3>App Analytics Dashboard</h3>
      <div style={{ display: 'flex', gap: 24 }}>
        <div><b>Total Users</b> <div>{stats.users}</div></div>
        <div><b>Total Jobs Posted</b> <div>{stats.jobs}</div></div>
        <div><b>Total Applications</b> <div>{stats.applications}</div></div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
