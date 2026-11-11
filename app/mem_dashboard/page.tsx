'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
  id: string;
  email: string;
  prefix: string | null;
  name: string | null;
  gender: string | null;
  phone: string | null;
  dob: string | null;
  interest: string | null;
  location_1: string | null;
  location_2: string | null;
  location_3: string | null;
  status: string;
  is_editor: boolean;
  is_moderator: boolean;
}

export default function MemberDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable form state
  const [formData, setFormData] = useState({
    prefix: '',
    name: '',
    phone: '',
    dob: '',
    interest: '',
    location_1: '',
    location_2: '',
    location_3: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    // Check if user is an admin
    const { data: adminCheck } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (adminCheck) setIsAdmin(true);

    // Fetch profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setFormData({
        prefix: profileData.prefix || '',
        name: profileData.name || '',
        phone: profileData.phone || '',
        dob: profileData.dob || '',
        interest: profileData.interest || '',
        location_1: profileData.location_1 || '',
        location_2: profileData.location_2 || '',
        location_3: profileData.location_3 || '',
      });
    }
    setLoading(false);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({
        prefix: formData.prefix,
        name: formData.name,
        phone: formData.phone,
        dob: formData.dob,
        interest: formData.interest,
        location_1: formData.location_1,
        location_2: formData.location_2,
        location_3: formData.location_3,
      })
      .eq('id', profile.id);

    if (error) {
      setMessage(`Failed to update profile: ${error.message}`);
    } else {
      setMessage('Profile updated successfully!');
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
      {/* Navigation Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            P
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>PGAkheti Member Portal</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAdmin && (
            <Link href="/admin" style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              🛡️ Admin Dashboard
            </Link>
          )}
          <button onClick={handleSignOut} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        {message && (
          <div style={{ padding: '12px 16px', marginBottom: '20px', backgroundColor: message.includes('success') ? '#ecfdf5' : '#fef2f2', color: message.includes('success') ? '#065f46' : '#991b1b', borderRadius: '8px', border: `1px solid ${message.includes('success') ? '#a7f3d0' : '#ef4444'}` }}>
            {message}
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {profile?.prefix} {profile?.name || 'Member Dashboard'}
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '6px' }}>{profile?.email}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#d1fae5', color: '#065f46' }}>
                STATUS: {profile?.status?.toUpperCase()}
              </span>
              {profile?.is_editor && <span style={{ padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#b45309' }}>EDITOR</span>}
              {profile?.is_moderator && <span style={{ padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#fce7f3', color: '#db2777' }}>MODERATOR</span>}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Profile Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{ padding: '6px 14px', backgroundColor: isEditing ? '#f3f4f6' : '#4f46e5', color: isEditing ? '#374151' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              {isEditing ? 'Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Prefix</label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="Mr / Ms / Dr"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Primary Interest</label>
                <input
                  type="text"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Location 1</label>
                <input
                  type="text"
                  value={formData.location_1}
                  onChange={(e) => setFormData({ ...formData, location_1: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Location 2</label>
                <input
                  type="text"
                  value={formData.location_2}
                  onChange={(e) => setFormData({ ...formData, location_2: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>Location 3</label>
                <input
                  type="text"
                  value={formData.location_3}
                  onChange={(e) => setFormData({ ...formData, location_3: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', fontSize: '14px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <strong style={{ color: '#4b5563' }}>Phone:</strong> {profile?.phone || 'Not provided'}
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <strong style={{ color: '#4b5563' }}>Date of Birth:</strong> {profile?.dob || 'Not provided'}
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <strong style={{ color: '#4b5563' }}>Primary Interest:</strong> {profile?.interest || 'General'}
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <strong style={{ color: '#4b5563' }}>Farming Locations:</strong> {[profile?.location_1, profile?.location_2, profile?.location_3].filter(Boolean).join(', ') || 'None'}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}