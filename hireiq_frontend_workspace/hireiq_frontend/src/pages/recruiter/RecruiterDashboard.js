import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Recruiter dashboard with AI screen & interview scheduling.
 */
function RecruiterDashboard({ section }) {
  return (
    <div style={{maxWidth:660, margin:'26px auto 0', padding:'0 10px'}}>
      <div style={{background:'#fff', borderRadius:18, boxShadow:'0 2px 18px #282c3422', padding:'32px 30px 24px 30px', border:'1px solid #e8e8ef'}}>
        <h2 style={{color:'#284DD9', fontWeight:900}}>Welcome, Recruiter!</h2>
        {(!section || section === "") && (
          <div>
            <p style={{color:'#273246',fontSize:'1.11rem',marginTop:7,marginBottom:17}}>This is your dashboard. You can:</p>
            <ul style={{margin:'14px 0 0 0',paddingLeft:23,lineHeight:1.84, color:'#273246'}}>
              <li>View candidate applications</li>
              <li>AI-assisted candidate screening</li>
              <li>Schedule interviews</li>
            </ul>
          </div>
        )}
        {section === "applications" && (
          <div>
            <h3 style={{marginTop:24}}>Application Management</h3>
            <p>Manage and rate candidate applications here.</p>
          </div>
        )}
        {section === "interviews" && (
          <div>
            <h3 style={{marginTop:24}}>Interview Scheduling</h3>
            <p>Schedule and manage candidate interviews here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
