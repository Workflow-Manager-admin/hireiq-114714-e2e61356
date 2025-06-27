import React, { useState, useEffect } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Recruiter Job Management: Full CRUD (create, edit, delete), live update, UI feedback, status/error handling.
 */
function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', salary: '' });
  const [pending, setPending] = useState(false);
  const [editJob, setEditJob] = useState(null); // if editing, holds the job object
  const [status, setStatus] = useState(''); // UI feedback
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setError('');
    setStatus('');
    let { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (!error) setJobs(data);
    else setError('Could not fetch jobs.');
  }

  // PUBLIC_INTERFACE
  // Submit new job or update existing one
  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError('');
    setStatus('');
    const { title, description, location, salary } = form;

    if (editJob) {
      // Update/edit job
      const { error: err } = await supabase
        .from('jobs')
        .update({ title, description, location, salary })
        .eq('id', editJob.id);
      if (!err) {
        setStatus('Job updated!');
        setEditJob(null);
        setShowCreate(false);
        setForm({ title: '', description: '', location: '', salary: '' });
        fetchJobs();
      } else {
        setError('Update failed.');
      }
    } else {
      // Create new job
      const { error: err } = await supabase
        .from('jobs')
        .insert([{ title, description, location, salary }]);
      if (!err) {
        setStatus('Job posted!');
        setForm({ title: '', description: '', location: '', salary: '' });
        setShowCreate(false);
        fetchJobs();
      } else {
        setError('Creation failed.');
      }
    }
    setPending(false);
  }

  // PUBLIC_INTERFACE
  // Start editing an existing job
  function beginEdit(job) {
    setEditJob(job);
    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary || '',
    });
    setShowCreate(true);
    setStatus('');
    setError('');
  }

  // PUBLIC_INTERFACE
  // Cancel job creation/edits
  function handleCancel() {
    setEditJob(null);
    setForm({ title: '', description: '', location: '', salary: '' });
    setShowCreate(false);
    setError('');
    setStatus('');
  }

  // PUBLIC_INTERFACE
  // Delete job
  async function handleDelete(jobId) {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setPending(true);
    setStatus('');
    setError('');
    const { error: err } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    if (!err) {
      setStatus('Job deleted.');
      setEditJob(null);
      fetchJobs();
    } else {
      setError('Delete failed!');
    }
    setPending(false);
  }

  return (
    <div>
      <h3>Manage Job Posts</h3>
      <button
        onClick={() => {
          setShowCreate(v => !v);
          if (editJob) {
            setEditJob(null);
            setForm({ title: '', description: '', location: '', salary: '' });
          }
          setStatus('');
          setError('');
        }}
        style={{
          background: showCreate ? '#e74c3c' : '#0070f3',
          color: '#fff',
          border: 0,
          borderRadius: 6,
          padding: '8px 16px',
          marginBottom: 16,
          fontWeight: 600
        }}
        disabled={pending}
      >
        {showCreate ? "Cancel" : "Create New Job"}
      </button>

      {showCreate && (
        <form onSubmit={handleSubmit} style={{ margin: '18px 0', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>
          <input
            value={form.title}
            required
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Job Title"
            style={{ padding: 9, borderRadius: 6, border: '1px solid #eee', fontWeight: 500 }}
          />
          <input
            value={form.location}
            required
            onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="Location"
            style={{ padding: 9, borderRadius: 6, border: '1px solid #eee' }}
          />
          <input
            value={form.salary}
            onChange={e => setForm({ ...form, salary: e.target.value })}
            placeholder="Salary"
            style={{ padding: 9, borderRadius: 6, border: '1px solid #eee' }}
          />
          <textarea
            value={form.description}
            required
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            style={{ padding: 9, borderRadius: 6, border: '1px solid #eee', minHeight: 60 }}
          />
          <button
            type="submit"
            disabled={pending}
            style={{
              marginTop: 6,
              background: '#0070f3',
              color: '#fff',
              border: 0,
              padding: '9px 0',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 700
            }}
          >
            {pending ? (editJob ? 'Updating...' : 'Creating...') : (editJob ? "Update Job" : "Post Job")}
          </button>
        </form>
      )}
      {status && <div style={{ background: "#e3fcec", color: "#145b39", borderRadius: 6, padding: '6px 10px', marginBottom: 8, marginTop: 5, fontWeight: 600 }}>{status}</div>}
      {error && <div style={{ background: "#ffe4df", color: "#db2222", borderRadius: 6, padding: '6px 10px', marginBottom: 8, marginTop: 5, fontWeight: 600 }}>{error}</div>}
      <hr />
      <ul style={{ padding: 0 }}>
        {jobs.map(job => (
          <li key={job.id} style={{ marginBottom: 16, borderBottom: '1px solid #f5a62333', paddingBottom: 12, textAlign: 'left', listStyle: 'none' }}>
            <div style={{ fontWeight: 700 }}>{job.title} <span style={{ color: '#666', fontSize: 13 }}>({job.location})</span></div>
            <div>{job.description}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 3 }}>
              Salary: {job.salary || 'N/A'}
            </div>
            <div style={{ marginTop: 7 }}>
              <button
                onClick={() => beginEdit(job)}
                style={{
                  background: '#12b7a6',
                  color: '#fff',
                  border: 0,
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontWeight: 600,
                  marginRight: 9,
                  cursor: 'pointer',
                  fontSize: '0.97rem'
                }}>Edit</button>
              <button
                onClick={() => handleDelete(job.id)}
                disabled={pending}
                style={{
                  background: '#e74c3c',
                  color: '#fff',
                  border: 0,
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.97rem'
                }}>Delete</button>
            </div>
          </li>
        ))}
        {jobs.length === 0 && <li style={{ color: "#888" }}>No jobs found.</li>}
      </ul>
    </div>
  );
}

export default JobManagement;
