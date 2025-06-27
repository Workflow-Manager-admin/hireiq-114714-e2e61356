import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Candidate dashboard with AI-assisted screening/results and navigation
 */
function CandidateDashboard({ section }) {
  return (
    <div>
      <h2>Welcome, Candidate!</h2>
      {(!section || section === "") && (
        <div>
          <p>This is your dashboard. You can:</p>
          <ul>
            <li>View available job listings</li>
            <li>Track your applications</li>
            <li>See AI recommendations for your profile</li>
          </ul>
        </div>
      )}
      {section === "jobs" && (
        <div>
          <h3>Job Listings</h3>
          <p>Available job posts will be displayed here.</p>
        </div>
      )}
      {section === "applications" && (
        <div>
          <h3>My Applications</h3>
          <p>All your job applications and statuses appear here.</p>
        </div>
      )}
    </div>
  );
}

export default CandidateDashboard;
