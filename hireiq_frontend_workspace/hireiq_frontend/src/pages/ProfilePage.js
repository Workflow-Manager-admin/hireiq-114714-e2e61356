import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../auth/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Candidate Profile page: View and edit all personal/professional data.
 * Supports: name, email, contact, location, skills, education, experience, avatar, resume.
 * - Reads/writes from 'profiles' table (Supabase)
 * - Uploads avatar/resume to storage
 * - Robust error and UI state
 */

const DEFAULT_FIELDS = {
  full_name: "",
  email: "",
  contact: "",
  location: "",
  skills: "",
  education: "",
  experience: "",
  resume_url: "",
  avatar_url: "",
};

function formatSkills(skills) {
  // Accepts array OR comma string
  if (!skills) return "";
  if (Array.isArray(skills)) return skills.join(", ");
  return skills;
}

function parseSkills(skillsStr) {
  // Convert comma-separated string to array
  return (skillsStr || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ ...DEFAULT_FIELDS });
  const [edit, setEdit] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [avatarUploadPending, setAvatarUploadPending] = useState(false);
  const [resumeUploadPending, setResumeUploadPending] = useState(false);

  const avatarInput = useRef();
  const resumeInput = useRef();

  // Helper: Load profile from Supabase
  async function fetchProfile() {
    if (!user?.id) return;
    setPending(true);
    setError('');
    setStatus('');
    // Prefer 'profiles' table. Query by user.id (Supabase UID)
    let { data, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (fetchErr) {
      setError('Could not load profile.');
      setPending(false);
      return;
    }
    // Clean profile: ensure all fields as fallback ""
    setProfile({ ...DEFAULT_FIELDS, ...data });
    setPending(false);
  }

  // On mount: fetch profile
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [user]);

  // Handler: Input change
  function handleChange(e) {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  }

  // Handler: Avatar upload
  async function handleAvatarChange(e) {
    setError('');
    setAvatarUploadPending(true);
    const file = e.target.files[0];
    if (!file) {
      setAvatarUploadPending(false);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Avatar must be an image.");
      setAvatarUploadPending(false);
      return;
    }
    const ext = file.name.split('.').pop();
    // User id/timestamp.ext pattern, in a separate 'avatars' storage bucket
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    let uploadRes = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadRes.error) {
      setError("Avatar upload failed: " + uploadRes.error.message);
      setAvatarUploadPending(false);
      return;
    }
    const avatar_url = filePath; // Store filePath in table
    // Update profile avatar_url
    await supabase.from('profiles').update({ avatar_url }).eq('id', user.id);
    setProfile(p => ({ ...p, avatar_url }));
    setStatus('Avatar updated.');
    setAvatarUploadPending(false);
  }

  // Handler: Resume upload (as file, saves path in profile.resume_url)
  async function handleResumeChange(e) {
    setError('');
    setResumeUploadPending(true);
    const file = e.target.files[0];
    if (!file) {
      setResumeUploadPending(false);
      return;
    }
    // Accept pdf/doc/docx only
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
      && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setError('Resume must be a PDF, DOC, or DOCX file.');
      setResumeUploadPending(false);
      return;
    }
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    let uploadRes = await supabase.storage.from('resumes').upload(filePath, file, { upsert: true });
    if (uploadRes.error) {
      setError("Resume upload failed: " + uploadRes.error.message);
      setResumeUploadPending(false);
      return;
    }
    const resume_url = filePath;
    // Update profile resume_url (for candidate section, separate from resumes table's main logic)
    await supabase.from('profiles').update({ resume_url }).eq('id', user.id);
    setProfile(p => ({ ...p, resume_url }));
    setStatus('Resume attached to profile.');
    setResumeUploadPending(false);
  }

  // PUBLIC_INTERFACE
  // Save/update profile to Supabase
  async function handleProfileSave(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    setPending(true);
    // Clean up fields
    const updated = {
      ...profile,
      skills: parseSkills(profile.skills),
      id: user.id,
      email: user.email || profile.email,
      role: user.role, // role stays as-is (shouldn't be editable)
    };
    // No upsert: just update
    const { error: updErr } = await supabase.from('profiles').update(updated).eq('id', user.id);
    if (updErr) {
      setError("Failed to update profile: " + updErr.message);
      setPending(false);
      return;
    }
    setStatus("Profile updated!");
    setEdit(false);
    setPending(false);
    await fetchProfile();
  }

  // Download avatar/resume using Supabase storage (if present)
  async function downloadFromStorage(bucket, filePath) {
    const { data, error: downErr } = await supabase.storage.from(bucket).download(filePath);
    if (downErr) {
      setError("Failed to download file: " + downErr.message);
      return;
    }
    // Download link
    const blobUrl = window.URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filePath.split('/').pop();
    a.click();
    window.URL.revokeObjectURL(blobUrl);
  }

  // Avatar public URL, fallback to default
  function getAvatarUrl(avatar_url) {
    if (!avatar_url) return 'https://ui-avatars.com/api/?name=User&rounded=true&size=128';
    try {
      // Generate public download URL (Supabase Storage allows public/open read for demo buckets)
      // If RLS/private, would require a signed URL here
      return `${supabase.storage.from('avatars').getPublicUrl(avatar_url).data.publicUrl}`;
    } catch {
      return 'https://ui-avatars.com/api/?name=User&rounded=true&size=128';
    }
  }

  // Resume download link (storage)
  function getResumeUrl(resume_url) {
    if (!resume_url) return '';
    try {
      return `${supabase.storage.from('resumes').getPublicUrl(resume_url).data.publicUrl}`;
    } catch {
      return '';
    }
  }

  // Main render
  return (
    <div style={{ maxWidth: 570, margin: "38px auto 0", background: "#fff", borderRadius: 16, boxShadow: "0 3px 22px #294b9722", padding: "33px 29px 22px", border: "1px solid #e4eef7" }}>
      <h2 style={{ color: "#284DD9", fontWeight: 900, marginBottom: 13 }}>Profile</h2>
      {pending && <div style={{ color: "#008ba6", marginBottom: 9 }}>Loading profile...</div>}
      {error && <div style={{ background: "#fbc6a5", color: "#883500", borderRadius: 7, padding: 8, marginBottom: 10, fontWeight: 600 }}>{error}</div>}
      {status && <div style={{ background: "#e3fcec", color: "#145b39", borderRadius: 7, padding: 8, marginBottom: 10, fontWeight: 600 }}>{status}</div>}

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", margin: "0 0 23px" }}>
        <img
          src={getAvatarUrl(profile.avatar_url)}
          alt="Avatar"
          width={86}
          height={86}
          style={{ borderRadius: "50%", background: "#eee", objectFit: "cover", marginRight: 19, border: "2px solid #e5eaf4" }}
        />
        <div>
          {edit && (
            <label style={{ fontWeight: 600, fontSize: "0.97rem" }}>
              Avatar:
              <input
                type="file"
                accept="image/*"
                style={{ display: "block", maxWidth: 155, marginTop: 8 }}
                ref={avatarInput}
                onChange={handleAvatarChange}
                disabled={avatarUploadPending}
              />
            </label>
          )}
          {!edit && !!profile.avatar_url && (
            <button
              style={{ marginTop: 7, background: "#12b7a6", color: "#fff", border: 0, borderRadius: 6, fontWeight: 700, padding: "4px 16px", fontSize: 14, cursor: "pointer" }}
              onClick={() => downloadFromStorage('avatars', profile.avatar_url)}
            >Download Avatar</button>
          )}
          {avatarUploadPending && <div style={{ color: "#888", fontSize: "0.98rem" }}>Uploading...</div>}
        </div>
      </div>
      <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontWeight: 700 }}>Name:</label>
          {edit
            ? <input name="full_name" value={profile.full_name || ""} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, border: "1px solid #eee" }} required />
            : <span style={{ marginLeft: 7 }}>{profile.full_name || <em style={{ color: '#bbb' }}>—</em>}</span>
          }
        </div>
        <div>
          <label style={{ fontWeight: 700 }}>Email:</label>
          <span style={{ marginLeft: 7 }}>{profile.email || user?.email}</span>
        </div>
        <div>
          <label style={{ fontWeight: 700 }}>Contact:</label>
          {edit
            ? <input name="contact" value={profile.contact || ""} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, border: "1px solid #eee" }} />
            : <span style={{ marginLeft: 7 }}>{profile.contact || <em style={{ color: '#bbb' }}>—</em>}</span>
          }
        </div>
        <div>
          <label style={{ fontWeight: 700 }}>Location:</label>
          {edit
            ? <input name="location" value={profile.location || ""} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, border: "1px solid #eee" }} />
            : <span style={{ marginLeft: 7 }}>{profile.location || <em style={{ color: '#bbb' }}>—</em>}</span>
          }
        </div>
        <div>
          <label style={{ fontWeight: 700 }}>Skills:</label>
          {edit
            ? <input name="skills" value={formatSkills(profile.skills)} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, border: "1px solid #eee" }} placeholder="Comma separated (e.g. React, Node.js, Python)" />
            : <span style={{ marginLeft: 7 }}>{formatSkills(profile.skills) || <em style={{ color: '#bbb' }}>—</em>}</span>
          }
        </div>
        <div>
          <label style={{ fontWeight: 700 }}>Education:</label>
          {edit
            ? <input name="education" value={profile.education || ""} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, border: "1px solid #eee" }} />
            : <span style={{ marginLeft: 7 }}>{profile.education || <em style={{ color: '#bbb' }}>—</em>}</span>
          }
        </div>
        <div>
          <label style={{ fontWeight: 700 }}>Experience:</label>
          {edit
            ? <textarea name="experience" value={profile.experience || ""} onChange={handleChange} style={{ width: "100%", minHeight: 55, padding: 7, borderRadius: 6, border: "1px solid #eee" }} />
            : <span style={{ marginLeft: 7 }}>{profile.experience || <em style={{ color: '#bbb' }}>—</em>}</span>
          }
        </div>
        <div>
          <label style={{ fontWeight: 700, verticalAlign: "middle" }}>Resume Link:</label>
          <div style={{ display: "inline-block", marginLeft: 7 }}>
            {edit ? (
              <span>
                <input
                  type="file"
                  accept="application/pdf,.doc,.docx"
                  ref={resumeInput}
                  style={{ marginRight: 7 }}
                  onChange={handleResumeChange}
                  disabled={resumeUploadPending}
                />
                {resumeUploadPending && <span style={{ color: "#888" }}>Uploading...</span>}
              </span>
            ) : profile.resume_url ? (
              <>
                <a
                  href={getResumeUrl(profile.resume_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0070f3", fontWeight: 600, textDecoration: "underline" }}
                >
                  Download Resume
                </a>
                <button
                  onClick={e => { e.preventDefault(); downloadFromStorage('resumes', profile.resume_url); }}
                  style={{ marginLeft: 13, background: "#12b7a6", color: "#fff", border: 0, borderRadius: 6, fontWeight: 700, padding: "3px 14px", fontSize: 13, cursor: "pointer" }}
                  type="button"
                >
                  Download
                </button>
              </>
            ) : (
              <em style={{ color: '#bbb' }}>—</em>
            )}
          </div>
        </div>
        <div>
          <label style={{ fontWeight: 700 }}>Role:</label>
          <span style={{ marginLeft: 7 }}>{user?.role || profile.role || <em>—</em>}</span>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
          {edit ? (
            <>
              <button
                disabled={pending}
                type="submit"
                style={{ background: "#284DD9", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, padding: "10px 0", minWidth: 120, fontSize: "1.01rem" }}>
                {pending ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                style={{ background: "#eee", color: "#284DD9", border: 0, borderRadius: 8, fontWeight: 600, padding: "10px 0", minWidth: 92 }}
                onClick={() => { setEdit(false); setError(''); setStatus(''); fetchProfile(); }}
                disabled={pending}
              >Cancel</button>
            </>
          ) : (
            <>
              {user?.role === "Candidate" && (
                <button
                  type="button"
                  style={{ background: "#12b7a6", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, padding: "10px 0", minWidth: 120, fontSize: "1.01rem" }}
                  onClick={() => { setEdit(true); setStatus(""); setError(""); }}
                >
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>
      </form>
      <div style={{ color: "#767676", fontSize: 13, marginTop: 19 }}>
        {user?.role === "Candidate"
          ? <span>Your data is securely saved and editable only by you.</span>
          : <span>As an admin/recruiter, your profile is display-only here.</span>
        }
      </div>
    </div>
  );
}

export default ProfilePage;
