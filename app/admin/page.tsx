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
  status: 'pending' | 'approved' | 'rejected';
  is_editor: boolean;
  is_moderator: boolean;
  created_at: string;
}

export default function AdminPortal() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    // 1. Verify current user is in the dedicated admins table
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (!adminRecord) {
      setError('Access Denied: You do not have administrator privileges.');
      setLoading(false);
      return;
    }

    // 2. Fetch all admins list
    const { data: adminsList } = await supabase.from('admins').select('user_id');
    setAdminUserIds(adminsList ? adminsList.map(a => a.user_id) : []);

    // 3. Fetch all member profiles
    const { data: profilesData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProfiles(profilesData || []);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setActionLoading(id);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id);

    if (updateError) {
      alert(`Failed to update status: ${updateError.message}`);
    } else {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    }
    setActionLoading(null);
  }

  async function toggleAdminRole(userId: string, isCurrentlyAdmin: boolean) {
    const confirmMsg = isCurrentlyAdmin 
      ? 'Revoke admin privileges from this user?' 
      : 'Promote this user to Admin?';
    if (!confirm(confirmMsg)) return;

    setActionLoading(userId);
    if (isCurrentlyAdmin) {
      const { error } = await supabase.from('admins').delete().eq('user_id', userId);
      if (error) alert(error.message);
      else setAdminUserIds(prev => prev.filter(id => id !== userId));
    } else {
      const { error } = await supabase.from('admins').insert([{ user_id: userId }]);
      if (error) alert(error.message);
      else setAdminUserIds(prev => [...prev, userId]);
    }
    setActionLoading(null);
  }

  async function toggleFlag(id: string, field: 'is_editor' | 'is_moderator', currentValue: boolean) {
    setActionLoading(id);
    const newValue = !currentValue;
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: newValue })
      .eq('id', id);

    if (error) {
      alert(`Failed to update flag: ${error.message}`);
    } else {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, [field]: newValue } : p));
    }
    setActionLoading(null);
  }

  const filteredProfiles = profiles.filter(p => {
    const fullName = `${p.prefix || ''} ${p.name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = profiles.filter(p => p.status === 'pending').length;
  const approvedCount = profiles.filter(p => p.status === 'approved').length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              A
            </div>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>PGAkheti Admin Command Center</span>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/mem_dashboard" style={{ padding: '8px 14px', backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            My Member Profile
          </Link>
          <button onClick={fetchAdminData} style={{ padding: '8px 14px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            🔄 Refresh
          </button>
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Community Management & Privileges</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Decoupled admin architecture: Admins remain safe even if member records are reset.</p>
        </div>

        {error ? (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', padding: '16px', borderRadius: '8px' }}>
            {error}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Members</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{profiles.length}</div>
              </div>
              <div style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                <div style={{ fontSize: '14px', color: '#b45309' }}>Pending Approvals</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706' }}>{pendingCount}</div>
              </div>
              <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '14px', color: '#047857' }}>Approved Members</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>{approvedCount}</div>
              </div>
              <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '14px', color: '#1d4ed8' }}>Active Admins</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>{adminUserIds.length}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Search members by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: '240px', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}
              />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', fontSize: '14px' }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Only</option>
                <option value="approved">Approved Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading system records...</div>
            ) : (
              <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                      <th style={{ padding: '12px 16px' }}>Member</th>
                      <th style={{ padding: '12px 16px' }}>Contact</th>
                      <th style={{ padding: '12px 16px' }}>Farming Interest & Location</th>
                      <th style={{ padding: '12px 16px' }}>Roles & Privileges</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No profiles found.</td>
                      </tr>
                    ) : (
                      filteredProfiles.map((p) => {
                        const isAdmin = adminUserIds.includes(p.id);
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px 16px', fontWeight: '500', color: '#111827' }}>
                              {p.prefix} {p.name || 'Unnamed'}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div>{p.email}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.phone || 'No phone'}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: '500', color: '#059669' }}>{p.interest || 'General'}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>{[p.location_1, p.location_2].filter(Boolean).join(', ') || 'No locations'}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => toggleAdminRole(p.id, isAdmin)}
                                  disabled={actionLoading === p.id}
                                  style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', backgroundColor: isAdmin ? '#eff6ff' : '#f3f4f6', borderColor: isAdmin ? '#3b82f6' : '#d1d5db', color: isAdmin ? '#1d4ed8' : '#374151' }}
                                >
                                  {isAdmin ? '🛡️ Admin' : '+ Make Admin'}
                                </button>
                                <button
                                  onClick={() => toggleFlag(p.id, 'is_editor', p.is_editor)}
                                  disabled={actionLoading === p.id}
                                  style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', backgroundColor: p.is_editor ? '#fef3c7' : '#f3f4f6', borderColor: p.is_editor ? '#f59e0b' : '#d1d5db', color: p.is_editor ? '#b45309' : '#374151' }}
                                >
                                  {p.is_editor ? '✍️ Editor' : '+ Editor'}
                                </button>
                                <button
                                  onClick={() => toggleFlag(p.id, 'is_moderator', p.is_moderator)}
                                  disabled={actionLoading === p.id}
                                  style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', backgroundColor: p.is_moderator ? '#fce7f3' : '#f3f4f6', borderColor: p.is_moderator ? '#ec4899' : '#d1d5db', color: p.is_moderator ? '#db2777' : '#374151' }}
                                >
                                  {p.is_moderator ? '🛡️ Mod' : '+ Mod'}
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: p.status === 'approved' ? '#d1fae5' : p.status === 'rejected' ? '#fee2e2' : '#fef3c7', color: p.status === 'approved' ? '#065f46' : p.status === 'rejected' ? '#991b1b' : '#92400e' }}>
                                {p.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                {p.status !== 'approved' && (
                                  <button onClick={() => updateStatus(p.id, 'approved')} disabled={actionLoading === p.id} style={{ padding: '6px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Approve</button>
                                )}
                                {p.status !== 'rejected' && (
                                  <button onClick={() => updateStatus(p.id, 'rejected')} disabled={actionLoading === p.id} style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Reject</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}