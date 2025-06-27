import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Candidate resume PDF/docx upload with AI resume parsing and scoring.
 */
function ResumeUpload() {
  const fileInput = useRef();
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState('');
  const [pendingParse, setPendingParse] = useState(false);

  const getResumeForUser = async () => {
    // Try to fetch most recent resume and AI results for current user
    const user = JSON.parse(localStorage.getItem('hireiq_user'));
    if (!user?.id) return; // Demo user, no resume
    let { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })
      .limit(1);
    if (!error && data && data.length > 0) {
      setResumeUrl(data[0].path);
      // If parsed already, show result
      if (data[0].ai_parse) {
        setAiResult(data[0].ai_parse);
      }
    }
  };

  useEffect(() => {
    getResumeForUser();
  }, []);

  // Simulate AI parsing/scoring. Replace this with real AI API call.
  async function aiParseResume(file) {
    // Simulate network delay for demo UX
    await new Promise(res => setTimeout(res, 1200));
    // We'll use fake parsing; in production this would be an API call
    // For files with 'react' case-insensitive in name, show different output
    const score = Math.floor(Math.random() * 41) + 60; // score 60-100
    return {
      summary: file.name.toLowerCase().includes('react')
        ? 'Front-end developer with strong React experience.'
        : 'Experienced professional in relevant skills.',
      skills: file.name.split('.').shift().replace(/_/g, ' ').split(' '),
      ai_score: score,
      insights: score > 80 ? 'Excellent match for technology roles.' : 'Solid skills, suitable for job screening.'
    };
  }

  async function handleFileUpload(e) {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    // Store resume in Supabase Storage (bucket 'resumes'), userId as filename prefix
    const user = JSON.parse(localStorage.getItem('hireiq_user'));
    const ext = file.name.split('.').pop();
    const filePath = `${user?.id || 'guest'}/${Date.now()}.${ext}`;
    let { error: uploadError } = await supabase.storage.from('resumes').upload(filePath, file, { upsert: true });
    if (!uploadError) {
      // Call the AI parsing logic
      setPendingParse(true);
      try {
        const aiParse = await aiParseResume(file);
        setAiResult(aiParse);
        // Save metadata + ai result to Supabase table 'resumes'
        await supabase.from('resumes').upsert([
          { user_id: user?.id, path: filePath, uploaded_at: new Date().toISOString(), ai_parse: aiParse }
        ]);
        setResumeUrl(filePath);
      } catch (parseError) {
        setError('AI parsing failed. Try again.');
        setAiResult(null);
      } finally {
        setPendingParse(false);
      }
    } else {
      setError('File upload failed. Try again.');
    }
    setUploading(false);
  }

  return (
    <div>
      <h3>Upload Your Resume</h3>
      <input
        type="file"
        accept="application/pdf,.doc,.docx"
        ref={fileInput}
        style={{ marginBottom: 11 }}
        disabled={uploading || pendingParse}
        onChange={handleFileUpload}
      />
      {uploading && <div>Uploading your resume...</div>}
      {pendingParse && <div>Analyzing resume with AI...</div>}
      {error && <div style={{ background: "#fbc6a5", color: "#883500", borderRadius: 7, padding: 8, marginBottom: 8 }}>{error}</div>}
      {resumeUrl && (
        <div>
          <b>Uploaded:</b> <span>{resumeUrl}</span>
          {aiResult && (
            <div style={{ marginTop: 7, background: "#f5a62312", borderRadius: 7, padding: 9 }}>
              <b>AI Resume Insights</b>
              <ul>
                <li><b>Summary:</b> {aiResult.summary}</li>
                <li><b>Extracted Skills:</b> {aiResult.skills && aiResult.skills.length ? aiResult.skills.join(', ') : '—'}</li>
                <li><b>AI Resume Score:</b> <span style={{ color: '#f5a623', fontWeight: 600 }}>{aiResult.ai_score}/100</span></li>
                <li><b>Insight:</b> {aiResult.insights}</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
