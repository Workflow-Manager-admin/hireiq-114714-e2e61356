import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Admin dashboard for user/job post management.
 */
function AdminDashboard({ section }) {
  return (
    <div style={{maxWidth:660, margin:'26px auto 0', padding:'0 10px'}}>
      <div style={{background:'#fff', borderRadius:18, boxShadow:'0 2px 18px #282c3422', padding:'32px 30px 24px 30px', border:'1px solid #e8e8ef'}}>
        <h2 style={{color:'#284DD9', fontWeight:900}}>Welcome, Admin!</h2>
        {(!section || section === "") && (
          <div>
            <p style={{color:'#273246',fontSize:'1.11rem',marginTop:7,marginBottom:17}}>This is your dashboard. You can:</p>
            <ul style={{margin:'14px 0 0 0',paddingLeft:23,lineHeight:1.84, color:'#273246'}}>
              <li>Manage users (activate/deactivate roles)</li>
              <li>Create/edit job posts</li>
              <li>View app analytics</li>
            </ul>
          </div>
        )}
        {section === "users" && (
          <div>
            <h3 style={{marginTop:24}}>User Management</h3>
            <p>See all users and manage their roles here.</p>
          </div>
        )}
        {section === "jobs" && (
          <div>
            <h3 style={{marginTop:24}}>Job Post Management</h3>
            <p>Create and manage open job posts here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
