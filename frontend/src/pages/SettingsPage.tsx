import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Trash2, AlertTriangle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

const S = {
  card:    { background: '#111113', border: '1px solid #27272a', borderRadius: 10, overflow: 'hidden' } as React.CSSProperties,
  label:   { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#52525b', display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  input:   { width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#fafafa', outline: 'none' } as React.CSSProperties,
  btnSave: { padding: '8px 16px', background: '#10b981', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
};

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div style={S.card}>{children}</div>;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '14px 18px', borderBottom: '1px solid #1f1f23' }}>{children}</div>;
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '18px' }}>{children}</div>;
}

function StatusMsg({ status }: { status: { type: 'success' | 'error'; msg: string } | null }) {
  if (!status) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: status.type === 'success' ? '#34d399' : '#f87171', marginTop: 4 }}>
      <CheckCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
      {status.msg}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [passStatus, setPassStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const isGoogleUser = user?.providerData.some((p) => p.providerId === 'google.com');
  const initials = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) return;
    setNameLoading(true); setNameStatus(null);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      setNameStatus({ type: 'success', msg: 'Display name updated.' });
    } catch {
      setNameStatus({ type: 'error', msg: 'Failed to update name.' });
    } finally { setNameLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setPassLoading(true); setPassStatus(null);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
      await updatePassword(user, newPassword);
      setCurrentPassword(''); setNewPassword('');
      setPassStatus({ type: 'success', msg: 'Password updated.' });
    } catch (err: any) {
      const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect.'
        : err.code === 'auth/weak-password' ? 'New password must be at least 6 characters.'
        : 'Failed to update password.';
      setPassStatus({ type: 'error', msg });
    } finally { setPassLoading(false); }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    await sendPasswordResetEmail(auth, user.email);
    setPassStatus({ type: 'success', msg: `Reset email sent to ${user.email}.` });
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      await deleteUser(user); await logout(); navigate('/login');
    } catch { setDeleteLoading(false); setShowDeleteModal(false); }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 620, margin: '0 auto', padding: '44px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #27272a', background: '#111113', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#71717a', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fafafa'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#71717a'; }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
        </button>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#10b981', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 3 }}>Settings</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.025em', margin: 0 }}>Account Settings</h1>
        </div>
      </div>

      <div style={{ height: 1, background: '#27272a', marginBottom: 24 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Profile */}
        <SectionCard>
          <SectionHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fafafa', margin: 0 }}>{user?.displayName || 'No display name'}</p>
                <p style={{ fontSize: 11.5, color: '#52525b', margin: 0 }}>{user?.email}</p>
              </div>
            </div>
          </SectionHeader>
          <SectionBody>
            <p style={{ ...S.label, marginBottom: 10 }}><User style={{ width: 12, height: 12 }} /> Display Name</p>
            <form onSubmit={handleUpdateName} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                style={S.input}
                onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = '#10b981')}
                onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = '#27272a')}
              />
              <StatusMsg status={nameStatus} />
              <div>
                <button type="submit" disabled={nameLoading || !displayName.trim()} style={{ ...S.btnSave, opacity: (nameLoading || !displayName.trim()) ? 0.45 : 1 }}>
                  {nameLoading ? 'Saving…' : 'Save name'}
                </button>
              </div>
            </form>
          </SectionBody>
        </SectionCard>

        {/* Password */}
        {!isGoogleUser ? (
          <SectionCard>
            <SectionHeader>
              <p style={S.label}><Lock style={{ width: 12, height: 12 }} /> Change Password</p>
            </SectionHeader>
            <SectionBody>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password" style={S.input}
                  onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = '#10b981')}
                  onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = '#27272a')}
                />
                <input
                  type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min. 6 characters)" style={S.input}
                  onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = '#10b981')}
                  onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = '#27272a')}
                />
                <StatusMsg status={passStatus} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="submit" disabled={passLoading || !currentPassword || newPassword.length < 6} style={{ ...S.btnSave, opacity: (passLoading || !currentPassword || newPassword.length < 6) ? 0.45 : 1 }}>
                    {passLoading ? 'Updating…' : 'Update password'}
                  </button>
                  <button type="button" onClick={handlePasswordReset} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#71717a', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#10b981')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#71717a')}
                  >
                    <KeyRound style={{ width: 12, height: 12 }} /> Send reset email
                  </button>
                </div>
              </form>
            </SectionBody>
          </SectionCard>
        ) : (
          <SectionCard>
            <SectionHeader><p style={S.label}><Lock style={{ width: 12, height: 12 }} /> Password</p></SectionHeader>
            <SectionBody>
              <p style={{ fontSize: 13.5, color: '#71717a' }}>You're signed in with Google. Manage your password through your Google account.</p>
            </SectionBody>
          </SectionCard>
        )}

        {/* Email */}
        <SectionCard>
          <SectionHeader><p style={S.label}><Mail style={{ width: 12, height: 12 }} /> Email Address</p></SectionHeader>
          <SectionBody>
            <p style={{ fontSize: 13.5, color: '#fafafa', marginBottom: 4 }}>{user?.email}</p>
            <p style={{ fontSize: 12, color: '#3f3f46' }}>Email address cannot be changed in this version.</p>
          </SectionBody>
        </SectionCard>

        {/* Danger Zone */}
        <div style={{ background: '#111113', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
            <p style={{ ...S.label, color: 'rgba(239,68,68,0.6)' }}><AlertTriangle style={{ width: 12, height: 12 }} /> Danger Zone</p>
          </div>
          <div style={{ padding: 18 }}>
            <p style={{ fontSize: 13.5, color: '#71717a', marginBottom: 14 }}>
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)')}
            >
              <Trash2 style={{ width: 13, height: 13 }} /> Delete my account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
          <div style={{ background: '#111113', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: 24, maxWidth: 360, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle style={{ width: 14, height: 14, color: '#f87171' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fafafa', margin: 0 }}>Delete Account</p>
                <p style={{ fontSize: 12, color: '#52525b', margin: 0 }}>This action cannot be undone</p>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: '#71717a', marginBottom: 14 }}>
              Type <span style={{ color: '#fafafa', fontFamily: 'monospace', fontWeight: 700 }}>DELETE</span> to confirm.
            </p>
            <input
              type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              style={{ ...S.input, marginBottom: 14 }}
              onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = '#ef4444')}
              onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = '#27272a')}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                style={{ flex: 1, padding: '9px 0', background: '#18181b', border: '1px solid #27272a', borderRadius: 8, color: '#a1a1aa', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                style={{ flex: 1, padding: '9px 0', background: '#dc2626', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (deleteConfirm !== 'DELETE' || deleteLoading) ? 0.4 : 1 }}
              >
                {deleteLoading ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
