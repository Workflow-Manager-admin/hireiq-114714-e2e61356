import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '../../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Candidate resume upload with real/pluggable AI parsing and scoring,
 * robust status/error UI, and storing/retrieving results via Supabase.
 */
function ResumeUpload() {
  const fileInput = useRef();
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState('');
  const [pendingParse, setPendingParse] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('hireiq_user'));

  // PUBLIC_INTERFACE
  // Fetch most recent resume and AI results for user from Supabase
  const getResumeForUser = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    let { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })
      .limit(1);
    if (error) {
      setError('Could not load resume data.');
      setLoading(false);
      return;
    }
    if (data && data.length > 0) {
      setResumeUrl(data[0].path);
      setLastUpdated(data[0].uploaded_at);
      if (data[0].ai_parse) {
        setAiResult(data[0].ai_parse);
      } else {
        setAiResult(null);
      }
    } else {
      setResumeUrl('');
      setAiResult(null);
      setLastUpdated('');
    }
    setLoading(false);
  };

  useEffect(() => {
    getResumeForUser();
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE
  // Call the AI backend for parsing and scoring
  async function aiParseResume(fileOrUrl) {
    // TODO: Replace this stub with your actual AI backend. To use an external API,
    // uncomment the fetch/axios code, e.g.:
    //
    // let formData = new FormData();
    // formData.append("file", fileOrUrl);
    // const response = await fetch('https://your-ai-backend/api/parse', {
    //   method: 'POST', body: formData
    // });
    // if (!response.ok) throw new Error("AI backend error: " + (await response.text()));
    // return await response.json();
    //
    // For now: fallback to mock.
    await new Promise(res => setTimeout(res, 1200));
    const score = Math.floor(Math.random() * 41) + 60;
    return {
      summary: fileOrUrl.name
        ? fileOrUrl.name.toLowerCase().includes('react')
          ? 'Front-end developer with strong React experience.'
          : 'Experienced professional in relevant skills.'
        : 'Experienced professional.',
      skills: fileOrUrl.name
        ? fileOrUrl.name.split('.').shift().replace(/_/g, ' ').split(' ')
        : ['Skill', 'AI', 'Demo'],
      ai_score: score,
      insights: score > 80
        ? 'Excellent match for technology roles.'
        : 'Solid skills, suitable for job screening.',
      feedback: score > 85
        ? "Your resume makes you stand out for top roles. Consider highlighting specific projects."
        : "Good fit for many jobs. Fine-tune your summary for higher scores.",
    };
  }

  // PUBLIC_INTERFACE
  // Handle file upload (Supabase Storage) and AI parse/store flow
  async function handleFileUpload(e) {
    setError('');
    setAiResult(null);
    setResumeUrl('');
    setLastUpdated('');
    const file = e.target.files[0];
    if (!file) return;
    // Quick client-side check for allowed types
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) &&
        !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setError('Only PDF or DOC/DOCX resumes are supported.');
      return;
    }
    setUploading(true);

    // File path pattern: userId/timestamp.ext
    const ext = file.name.split('.').pop();
    const filePath = `${user?.id || 'guest'}/${Date.now()}.${ext}`;
    let uploadResponse = await supabase
      .storage
      .from('resumes')
      .upload(filePath, file, { upsert: true });

    if (uploadResponse.error) {
      setError('Resume upload failed. Try again: ' + uploadResponse.error.message);
      setUploading(false);
      return;
    }

    // Call AI backend for parsing/scoring
    setPendingParse(true);
    try {
      const aiParse = await aiParseResume(file); // Replace with real API for production!
      setAiResult(aiParse);

      // Save file + results to Supabase
      const now = new Date().toISOString();
      await supabase.from('resumes').upsert([
        {
          user_id: user?.id,
          path: filePath,
          uploaded_at: now,
          ai_parse: aiParse
        }
      ]);
      setResumeUrl(filePath);
      setLastUpdated(now);
    } catch (parseError) {
      setError('AI parsing failed. Please try again or contact support.');
      setAiResult(null);
    } finally {
      setPendingParse(false);
      setUploading(false);
    }
  }

  // PUBLIC_INTERFACE
  // Download resume file from Supabase Storage (if needed)
  async function handleResumeDownload() {
    if (!resumeUrl) return;
    setError('');
    setLoading(true);
    const { data, error } = await supabase.storage.from('resumes').download(resumeUrl);
    setLoading(false);
    if (error) {
      setError('Error downloading resume.');
      return;
    }
    // Create object URL and trigger download
    const blobUrl = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = resumeUrl.split('/').pop();
    a.click();
    window.URL.revokeObjectURL(blobUrl);
  }

  // UI portion
  return (
    <div style={{ maxWidth: 525, margin: 'auto' }}>
      <h3>Upload Your Resume</h3>
      <input
        type="file"
        accept="application/pdf,.doc,.docx"
        ref={fileInput}
        style={{ marginBottom: 11 }}
        disabled={uploading || pendingParse}
        onChange={handleFileUpload}
        aria-label="Upload resume file"
      />
      {uploading && <div>Uploading your resume...</div>}
      {pendingParse && <div>Analyzing resume with AI...</div>}
      {loading && <div>Loading...</div>}
      {error && <div style={{ background: "#fbc6a5", color: "#883500", borderRadius: 7, padding: 8, marginBottom: 8, marginTop: 7 }}>{error}</div>}
      {resumeUrl && (
        <div style={{ marginTop: 7 }}>
          <b>Uploaded path:</b>{" "}
          <span style={{ fontFamily: "monospace", color: "#0070f3" }}>{resumeUrl}</span>
          <button
            onClick={handleResumeDownload}
            style={{ marginLeft: 14, background: "#12b7a6", color: "#fff", border: 0, borderRadius: 6, padding: "3px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            disabled={loading}
          >
            Download
          </button>
          <span style={{ marginLeft: 12, fontSize: 13, color: "#888" }}>
            {lastUpdated && <>Last updated: {lastUpdated.slice(0,19).replace('T',' ')}</>}
          </span>
          {aiResult && (
            <div style={{ marginTop: 13, background: "#f5a62312", borderRadius: 7, padding: 14 }}>
              <b>AI Resume Insights</b>
              <ul>
                <li><b>Summary:</b> {aiResult.summary}</li>
                <li><b>Extracted Skills:</b>{" "}
                  {aiResult.skills && aiResult.skills.length ? aiResult.skills.join(', ') : '—'}
                </li>
                <li><b>AI Resume Score:</b>{" "}
                  <span style={{
                    color:
                      aiResult.ai_score > 85 ? '#19b14c'
                        : aiResult.ai_score >= 70 ? '#f5a623'
                        : '#cc3535',
                    fontWeight: 600
                  }}>
                    {aiResult.ai_score}/100
                  </span>
                </li>
                <li><b>Insight:</b> {aiResult.insights}</li>
                {aiResult.feedback && <li><b>Feedback:</b> {aiResult.feedback}</li>}
              </ul>
            </div>
          )}
        </div>
      )}
      {!resumeUrl && (
        <div style={{ color: "#888", fontStyle: "italic", marginTop: 8 }}>
          No resume on file. Upload your resume above for AI analysis and job matching.
        </div>
      )}
      <div style={{ marginTop: 18, color: "#555", fontSize: 13 }}>
        * Resume files are processed securely. AI scoring/insights are for guidance only.<br />
        Contact support if you have any issues uploading or parsing files.
      </div>
    </div>
  );
}

export default ResumeUpload;
