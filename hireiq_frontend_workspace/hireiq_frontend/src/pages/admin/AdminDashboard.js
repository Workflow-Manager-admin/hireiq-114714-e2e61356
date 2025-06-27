import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';

// Reusable feedback toast component
function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 30,
        right: 36,
        zIndex: 1011,
        background: type === "error" ? "#ffe4df" : "#e3fcec",
        color: type === "error" ? "#db2222" : "#145b39",
        borderRadius: 7,
        padding: "12px 19px",
        minWidth: 160,
        fontWeight: 600,
        boxShadow: "0 4px 18px #20163323"
      }}
    >
      {message}
      <button
        style={{
          background: "none",
          border: 0,
          color: "#888",
          fontWeight: 700,
          marginLeft: 12,
          fontSize: 14,
          cursor: "pointer"
        }}
        aria-label="Dismiss status"
        onClick={onClose}
      >x</button>
    </div>
  );
}

// Modal for editing user roles/status
function UserEditModal({ user, onClose, onChangeRole, onChangeStatus }) {
  const [editVals, setEditVals] = useState({ role: user.role, active: user.active !== false });
  const [pending, setPending] = useState(false);

  const changeRole = (e) => setEditVals(v => ({ ...v, role: e.target.value }));
  const changeStatus = (e) => setEditVals(v => ({ ...v, active: e.target.value === "true" }));

  async function submit(e) {
    e.preventDefault();
    setPending(true);
    try {
      await onChangeRole(user, editVals.role, editVals.active);
    } finally {
      setPending(false);
      onClose();
    }
  }

  if (!user) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(30,30,50,0.21)', zIndex: 1010, display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 12, minWidth: 280, maxWidth: 340, boxShadow: '0 5px 40px #20163336', padding: '32px 27px 25px' }}>
        <h3 style={{ margin: '0 0 14px 0', color: '#145b39', fontSize: '1.13rem', fontWeight: 700 }}>Edit User</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><b>{user.full_name || user.email || user.id}</b></div>
          <label>
            <span style={{ fontWeight: 500 }}>Role:</span><br />
            <select value={editVals.role} onChange={changeRole} disabled={pending} style={{ marginTop: 3, padding: 7, borderRadius: 6 }}>
              <option value="Candidate">Candidate</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          <label>
            <span style={{ fontWeight: 500 }}>Status:</span><br />
            <select value={editVals.active ? "true" : "false"} onChange={changeStatus} disabled={pending} style={{ marginTop: 3, padding: 7, borderRadius: 6 }}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                background: '#0070f3', color: 'white', border: 0, borderRadius: 6,
                fontWeight: 700, padding: '7px 20px', minWidth: 82
              }}
            >Save</button>
            <button
              type="button"
              onClick={onClose}
              style={{ background: '#eaeaea', color: '#3d314c', border: 0, borderRadius: 6, fontWeight: 500, padding: '7px 18px' }}
              disabled={pending}
            >Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Full Admin Dashboard with user/role management, job moderation, and system oversight.
 */
function AdminDashboard({ section }) {
  // State for users, jobs, status/feedback (toast), etc
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [userAction, setUserAction] = useState({ pending: false, error: '', success: '' });
  const [jobAction, setJobAction] = useState({ pending: false, error: '', success: '' });

  // Success/error toast states
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // For user editing modal/dialog
  const [editUser, setEditUser] = useState(null);

  // Tabs: section=null: summary, users: "users", jobs: "jobs"
  useEffect(() => {
    if (!section || section === "") return;
    if (section === "users") fetchUsers();
    if (section === "jobs") fetchJobs();
    // eslint-disable-next-line
  }, [section]);

  async function fetchUsers() {
    setFetching(true);
    setUserAction({ pending: false, error: '', success: '' });
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    else setUserAction(s => ({ ...s, error: 'Failed to fetch users.' }));
    setFetching(false);
  }

  async function fetchJobs() {
    setFetching(true);
    setJobAction({ pending: false, error: '', success: '' });
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (!error && data) setJobs(data);
    else setJobAction(s => ({ ...s, error: 'Failed to fetch jobs.' }));
    setFetching(false);
  }

  // PUBLIC_INTERFACE
  // Update user role and/or status from modal
  async function handleUserRoleChange(user, newRole, newActive) {
    setUserAction({ pending: true, error: '', success: '' });
    const updates = { role: newRole };
    if (newActive !== undefined) updates.active = newActive;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) {
      setUserAction({ pending: false, error: '', success: 'User updated!' });
      setToast({ message: 'User updated!', type: 'success' });
      setEditUser(null);
      fetchUsers();
    }
    else {
      setUserAction({ pending: false, error: error.message || 'Update failed.', success: '' });
      setToast({ message: error.message || 'User update failed.', type: 'error' });
    }
  }

  // Update ONLY status field for deactivate/reactivate from quick action
  async function handleUserDeactivate(user) {
    await handleUserRoleChange(user, user.role, false);
  }
  async function handleUserReactivate(user) {
    await handleUserRoleChange(user, user.role, true);
  }

  // Job moderation
  async function handleJobDelete(jobId) {
    if (!window.confirm('Are you sure you want to permanently delete this job posting?')) return;
    setJobAction({ pending: true, error: '', success: '' });
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (!error) {
      setJobAction({ pending: false, error: '', success: 'Job deleted.' });
      setToast({ message: 'Job deleted.', type: 'success' });
      fetchJobs();
    } else {
      setJobAction({ pending: false, error: error.message || 'Delete failed', success: '' });
      setToast({ message: error.message || 'Job delete failed.', type: 'error' });
    }
  }

  async function handleJobDeactivate(job) {
    setJobAction({ pending: true, error: '', success: '' });
    const { error } = await supabase.from('jobs').update({ active: false }).eq('id', job.id);
    if (!error) {
      setJobAction({ pending: false, error: '', success: 'Job deactivated.' });
      setToast({ message: 'Job deactivated.', type: 'success' });
      fetchJobs();
    } else {
      setJobAction({ pending: false, error: error.message || 'Update failed', success: '' });
      setToast({ message: error.message || 'Job deactivate failed.', type: 'error' });
    }
  }
  async function handleJobReactivate(job) {
    setJobAction({ pending: true, error: '', success: '' });
    const { error } = await supabase.from('jobs').update({ active: true }).eq('id', job.id);
    if (!error) {
      setJobAction({ pending: false, error: '', success: 'Job reactivated.' });
      setToast({ message: 'Job reactivated.', type: 'success' });
      fetchJobs();
    } else {
      setJobAction({ pending: false, error: error.message || 'Update failed', success: '' });
      setToast({ message: error.message || 'Job reactivate failed.', type: 'error' });
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '26px auto 0', padding: '0 10px' }}>
      {/* Feedback Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Welcome or section entry screen */}
      {(!section || section === "") && (
        <div style={{
          background: '#fff', borderRadius: 18, boxShadow: '0 2px 18px #282c3422',
          padding: '32px 30px 24px 30px', border: '1px solid #e8e8ef'
        }}>
          <h2 style={{ color: '#284DD9', fontWeight: 900 }}>Welcome, Admin!</h2>
          <div>
            <p style={{ color: '#273246', fontSize: '1.11rem', marginTop: 7, marginBottom: 17 }}>
              This is your dashboard. You can:
            </p>
            <ul style={{ margin: '14px 0 0 0', paddingLeft: 23, lineHeight: 1.84, color: '#273246' }}>
              <li>Moderate and manage users, roles, and permissions</li>
              <li>Oversee and moderate job posts</li>
              <li>View analytics for all jobs and site activity</li>
            </ul>
          </div>
        </div>
      )}

      {/* User Management Table */}
      {section === "users" && (
        <div style={{
          background: '#fff', borderRadius: 16, boxShadow: '0 2px 18px #1c314333',
          padding: '32px 35px 28px 35px', border: '1px solid #e8e8ef', minHeight: 480
        }}>
          <h2 style={{ color: '#284DD9', fontWeight: 900, marginBottom: 25 }}>User Management</h2>
          {userAction.success && <div style={{ background: "#e3fcec", color: "#145b39", borderRadius: 6, padding: '7px 10px', fontWeight: 600, marginBottom: 10 }}>{userAction.success}</div>}
          {userAction.error && <div style={{ background: "#ffe4df", color: "#db2222", borderRadius: 6, padding: '7px 10px', fontWeight: 600, marginBottom: 10 }}>{userAction.error}</div>}
          <table style={{ width: '100%', background: '#fafbfc', borderCollapse: 'separate', border: 0, borderRadius: 8, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#efefef', color: '#274671', fontWeight: 700 }}>
                <th style={{ padding: '10px 5px' }}>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "#888", textAlign: 'center', padding: 22 }}>No users found.</td>
                </tr>
              )}
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: 9 }}>{user.full_name || user.username || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.active === false ? <span style={{ color: '#db1122', fontWeight: 600 }}>Inactive</span>
                      : <span style={{ color: '#12b7a6', fontWeight: 600 }}>Active</span>}
                  </td>
                  <td>
                    <button
                      onClick={() => setEditUser(user)}
                      style={{ background: "#0070f3", color: "white", marginRight: 9, border: 0, borderRadius: 6, padding: "4px 10px", fontWeight: 600, fontSize: '0.97rem', cursor: 'pointer' }}
                    >Edit</button>
                    {user.active === false
                      ? <button onClick={() => handleUserReactivate(user)} disabled={userAction.pending}
                          style={{ background: "#12b7a6", color: "white", border: 0, borderRadius: 6, padding: "4px 10px", fontWeight: 600, fontSize: '0.97rem', cursor: 'pointer' }}>Reactivate</button>
                      : <button onClick={() => handleUserDeactivate(user)} disabled={userAction.pending}
                          style={{ background: "#db1122", color: "white", border: 0, borderRadius: 6, padding: "4px 10px", fontWeight: 600, fontSize: '0.97rem', cursor: 'pointer' }}>Deactivate</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {editUser && (
            <UserEditModal
              user={editUser}
              onClose={() => setEditUser(null)}
              onChangeRole={handleUserRoleChange}
              onChangeStatus={(user, status) => handleUserRoleChange(user, user.role, status)}
            />
          )}
          <button
            style={{ marginTop: 24, background: "#eee", color: "#273246", padding: "9px 22px", borderRadius: 8, border: 0, fontWeight: 600 }}
            onClick={fetchUsers}
            disabled={userAction.pending || fetching}>
            Refresh
          </button>
        </div>
      )}

      {/* Job Moderation Table */}
      {section === "jobs" && (
        <div style={{
          background: '#fff', borderRadius: 16, boxShadow: '0 2px 18px #1c314333',
          padding: '32px 35px 28px 35px', border: '1px solid #e8e8ef', minHeight: 480
        }}>
          <h2 style={{ color: '#284DD9', fontWeight: 900, marginBottom: 24 }}>Job Post Moderation</h2>
          {jobAction.success && <div style={{ background: "#e3fcec", color: "#145b39", borderRadius: 6, padding: '7px 10px', fontWeight: 600, marginBottom: 10 }}>{jobAction.success}</div>}
          {jobAction.error && <div style={{ background: "#ffe4df", color: "#db2222", borderRadius: 6, padding: '7px 10px', fontWeight: 600, marginBottom: 10 }}>{jobAction.error}</div>}
          <table style={{ width: '100%', background: '#fafbfc', borderCollapse: 'separate', border: 0, borderRadius: 8, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#efefef', color: '#274671', fontWeight: 700 }}>
                <th style={{ padding: '10px 5px' }}>Title</th>
                <th>Location</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "#888", textAlign: 'center', padding: 22 }}>No jobs found.</td>
                </tr>
              )}
              {jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: 9 }}>{job.title}</td>
                  <td>{job.location}</td>
                  <td>{job.salary}</td>
                  <td>
                    {job.active === false
                      ? <span style={{ color: '#db1122', fontWeight: 600 }}>Inactive</span>
                      : <span style={{ color: '#12b7a6', fontWeight: 600 }}>Active</span>}
                  </td>
                  <td>
                    {job.active === false
                      ? <button onClick={() => handleJobReactivate(job)} disabled={jobAction.pending}
                          style={{ background: "#12b7a6", color: "white", border: 0, borderRadius: 6, padding: "4px 10px", fontWeight: 600, fontSize: '0.97rem', cursor: 'pointer' }}>Reactivate</button>
                      : <button onClick={() => handleJobDeactivate(job)} disabled={jobAction.pending}
                          style={{ background: "#db1122", color: "white", border: 0, borderRadius: 6, padding: "4px 10px", fontWeight: 600, fontSize: '0.97rem', cursor: 'pointer' }}>Deactivate</button>
                    }
                    <button
                      onClick={() => handleJobDelete(job.id)}
                      disabled={jobAction.pending}
                      style={{ background: "#e74c3c", color: "white", border: 0, borderRadius: 6, padding: "4px 10px", fontWeight: 600, fontSize: '0.97rem', cursor: 'pointer', marginLeft: 8 }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            style={{ marginTop: 24, background: "#eee", color: "#273246", padding: "9px 22px", borderRadius: 8, border: 0, fontWeight: 600 }}
            onClick={fetchJobs}
            disabled={jobAction.pending || fetching}>
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
