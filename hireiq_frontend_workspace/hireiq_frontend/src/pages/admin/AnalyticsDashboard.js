import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Admin Analytics Dashboard (basic stats for jobs/applications/users) with simple trend chart.
 */
function AnalyticsDashboard() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [{ count: userCount }, { count: jobCount }, { count: appCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ users: userCount || 0, jobs: jobCount || 0, applications: appCount || 0 });
      setLoading(false);
    }
    async function fetchTrends() {
      // Simple: count new jobs posted per week in last 8 weeks
      // We will fetch post counts by week from jobs for demo
      const now = new Date();
      const weeks = [];
      for (let i = 7; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - now.getDay() - 7 * i);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        weeks.push({ start: new Date(start), end: new Date(end) });
      }

      const rows = [];
      for (let w of weeks) {
        // iso format for filter
        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', w.start.toISOString())
          .lt('created_at', w.end.toISOString());
        rows.push(count || 0);
      }
      setTrend(rows);
    }
    fetchStats();
    fetchTrends();
  }, []);

  // Very simple bar chart
  function BarChart({ data = [] }) {
    const max = Math.max(...data, 1);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 60, gap: 5, marginTop: 14 }}>
        {data.map((val, i) => (
          <div key={i} style={{
            height: `${(val / max) * 55 + 3}px`, minWidth: 28,
            background: "#274DD9", borderRadius: 5, display: "flex", alignItems: "end", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 14
          }}>
            <span style={{ marginBottom: -2 }}>{val > 0 ? val : ''}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3>App Analytics Dashboard</h3>
      {loading
        ? <div>Loading stats...</div>
        : (
          <>
            <div style={{ display: 'flex', gap: 36, margin: '18px 0' }}>
              <div><b>Total Users</b> <div style={{ fontSize: 28, color: "#284DD9", fontWeight: 800 }}>{stats.users}</div></div>
              <div><b>Total Jobs Posted</b> <div style={{ fontSize: 28, color: "#145b39", fontWeight: 800 }}>{stats.jobs}</div></div>
              <div><b>Total Applications</b> <div style={{ fontSize: 28, color: "#f5a623", fontWeight: 800 }}>{stats.applications}</div></div>
            </div>
            <div style={{ marginTop: 17 }}>
              <h4 style={{ margin: 0, color: "#274DD9" }}>New Jobs by Week (past 8 weeks)</h4>
              <BarChart data={trend} />
              <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                Most recent week to left; each bar = jobs posted in that week.
              </div>
            </div>
          </>
        )
      }
    </div>
  );
}

export default AnalyticsDashboard;
