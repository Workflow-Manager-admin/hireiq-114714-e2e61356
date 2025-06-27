import React, { useRef, useState } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Candidate resume PDF/docx upload + AI resume parsing placeholder.
 */
function ResumeUpload() {
  const fileInput = useRef();
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [aiParse, setAiParse] = useState(null);

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    // Store resume in Supabase Storage (bucket 'resumes'), userId as filename prefix
    const user = JSON.parse(localStorage.getItem('hireiq_user'));
    const ext = file.name.split('.').pop();
    const filePath = `${user?.id || 'guest'}/${Date.now()}.${ext}`;
    let { error } = await supabase.storage.from('resumes').upload(filePath, file, { upsert: true });
    if (!error) {
      // Save metadata to Supabase table 'resumes'
      await supabase.from('resumes').upsert([{ user_id: user?.id, path: filePath, uploaded_at: new Date().toISOString() }]);
      setResumeUrl(filePath);
      // AI parse stub
      setAiParse({
        skills: ['AI parsing stub: JavaScript', 'React', 'Soft Skills...'],
        summary: 'This is a placeholder for parsed resume summary using AI.',
      });
    }
    setUploading(false);
  }

  return (
    <div>
      <h3>Upload Your Resume</h3>
      <input type="file" accept="application/pdf,.doc,.docx" ref={fileInput} style={{ marginBottom: 11 }}
        disabled={uploading} onChange={handleFileUpload}
      />
      {uploading && <div>Uploading your resume...</div>}
      {resumeUrl && (
        <div>
          <b>Uploaded:</b> <span>{resumeUrl}</span>
          {aiParse && (
            <div style={{ marginTop: 7, background: "#f5a62312", borderRadius: 7, padding: 9 }}>
              <b>AI Resume Insights (stub):</b>
              <ul>
                <li>Summary: {aiParse.summary}</li>
                <li>Extracted Skills: {aiParse.skills.join(', ')}</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
