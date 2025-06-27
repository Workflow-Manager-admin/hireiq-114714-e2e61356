import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Candidate dashboard with AI-assisted screening/results and navigation
 */
function CandidateDashboard({ section }) {
  return (
    <div style={{maxWidth:660, margin:'26px auto 0', padding:'0 10px'}}>
      <div style={{background:'#fff', borderRadius:18, boxShadow:'0 2px 18px #282c3422', padding:'32px 30px 24px 30px', border:'1px solid #e8e8ef'}}>
        <h2 style={{color:'#284DD9', fontWeight:900}}>Welcome, Candidate!</h2>
        {(!section || section === "") && (
          <div>
            <p style={{color:'#273246',fontSize:'1.11rem',marginTop:7,marginBottom:17}}>This is your dashboard. You can:</p>
            <ul style={{margin:'14px 0 0 0',paddingLeft:23,lineHeight:1.84, color:'#273246'}}>
              <li>View available job listings</li>
              <li>Track your applications</li>
              <li>See AI recommendations for your profile</li>
            </ul>
          </div>
        )}
        {section === "jobs" && (
          <div>
            <h3 style={{marginTop:24}}>Job Listings</h3>
            <p>Available job posts will be displayed here.</p>
          </div>
        )}
        {section === "applications" && (
          <div>
            <h3 style={{marginTop:24}}>My Applications</h3>
            <p>All your job applications and statuses appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateDashboard;
