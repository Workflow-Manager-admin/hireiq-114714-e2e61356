import React, { useState, useEffect } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Recruiter Job Management: Create, view, edit, and list job postings.
 */
function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', salary: '' });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetchJobs();
    // Populate a few dummy jobs on first load ONLY if jobs are empty (demo use)
    // Delay a bit to allow Supabase setup in CI environments.
    setTimeout(async () => {
      let { data, error } = await supabase.from('jobs').select('*').limit(1);
      if (!error && data.length === 0) {
        await supabase.from('jobs').insert([
          {
            title: 'Frontend React Developer',
            description: 'Build modern UIs with React. Collaborate with designers and backend engineers.',
            location: 'Remote',
            salary: '95000',
          },
          {
            title: 'AI/ML Engineer',
            description: 'Research and implement ML algorithms for smart candidate screening.',
            location: 'San Francisco, CA',
            salary: '160000',
          },
          {
            title: 'Technical Recruiter',
            description: 'Find and engage top technical talent, manage the full recruitment life-cycle.',
            location: 'New York, NY',
            salary: '85000',
          }
        ]);
        fetchJobs();
      }
    }, 800);
  }, []);

  async function fetchJobs() {
    let { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (!error) setJobs(data);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setPending(true);
    const { title, description, location, salary } = form;
    const { data, error } = await supabase.from('jobs').insert([{ title, description, location, salary }]);
    if (!error) {
      setForm({ title: '', description: '', location: '', salary: '' });
      setShowCreate(false);
      fetchJobs();
    }
    setPending(false);
  }

  return (
    <div>
      <h3>Job Posts</h3>
      <button onClick={() => setShowCreate(!showCreate)}>
        {showCreate ? 'Cancel' : 'Create New Job'}
      </button>
      {showCreate && (
        <form onSubmit={handleCreate} style={{ margin: '18px 0' }}>
          <input value={form.title} required onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Job Title" />
          <input value={form.location} required onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" />
          <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="Salary" />
          <textarea value={form.description} required onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <button type="submit" disabled={pending}>{pending ? 'Creating...' : 'Post Job'}</button>
        </form>
      )}
      <hr />
      <ul>
        {jobs.map(job => (
          <li key={job.id} style={{ marginBottom: 16, borderBottom: '1px solid #f5a62333', paddingBottom: 12 }}>
            <div><b>{job.title}</b> <span style={{ color: '#666', fontSize: 13 }}>({job.location})</span></div>
            <div>{job.description}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 3 }}>
              Salary: {job.salary || 'N/A'}
            </div>
          </li>
        ))}
        {jobs.length === 0 && <li>No jobs found.</li>}
      </ul>
    </div>
  );
}

export default JobManagement;
