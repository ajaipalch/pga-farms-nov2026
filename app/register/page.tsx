'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const router = useRouter();

  // Basic Account Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Personal Details
  const [prefix, setPrefix] = useState('Mr.');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [customCountryCode, setCustomCountryCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [interest, setInterest] = useState('General Member');

  // Locations (Optional)
  const [location1, setLocation1] = useState('');
  const [location2, setLocation2] = useState('');
  const [location3, setLocation3] = useState('');

  // UI Toggles & States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!mobileNumber.trim()) {
      setError('Mobile number is required.');
      return;
    }

    if (!dob) {
      setError('Date of birth is required.');
      return;
    }

    setLoading(true);

    // Resolve country code (use custom if 'other' is selected)
    const finalCountryCode = countryCode === 'OTHER' ? customCountryCode.trim() : countryCode;
    const fullPhoneNumber = `${finalCountryCode} ${mobileNumber.trim()}`;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          prefix,
          name: name.trim(),
          gender,
          phone: fullPhoneNumber,
          dob,
          interest,
          location_1: location1.trim() || null,
          location_2: location2.trim() || null,
          location_3: location3.trim() || null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif', paddingBottom: '40px' }}>
      {/* Top Header / Navigation Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => router.back()} 
            style={{ background: 'none', border: '1px solid #d1d5db', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}
          >
            ← Back
          </button>
          
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              P
            </div>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
              PGA Farms
            </span>
          </Link>
        </div>
      </header>

      {/* Registration Card */}
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '520px', backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>Member Registration</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Fill out your details to submit your account for admin approval.</p>

          {success ? (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>Registration Submitted!</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Your account has been created. An admin will review and approve your membership status shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '14px' }}>{error}</div>}

              {/* Full Name with Prefix */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Full Name *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={prefix} 
                    onChange={(e) => setPrefix(e.target.value)}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#f9fafb', fontSize: '14px' }}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Mx.">Mx.</option>
                  </select>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Enter your full name"
                    style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Email Address *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Mobile Number & Country Code (with 'Other' option) */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Mobile Number *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={countryCode} 
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#f9fafb', fontSize: '14px' }}
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="OTHER">Other (+)</option>
                  </select>

                  {countryCode === 'OTHER' && (
                    <input 
                      type="text" 
                      value={customCountryCode} 
                      onChange={(e) => setCustomCountryCode(e.target.value)} 
                      required 
                      placeholder="+X"
                      style={{ width: '70px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  )}

                  <input 
                    type="tel" 
                    value={mobileNumber} 
                    onChange={(e) => setMobileNumber(e.target.value)} 
                    required 
                    placeholder="9876543210"
                    style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Date of Birth *</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Gender Selection (Placed right after DOB) */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Gender *</label>
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', fontSize: '14px' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Primary Interest */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Primary Interest</label>
                <select 
                  value={interest} 
                  onChange={(e) => setInterest(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white', fontSize: '14px' }}
                >
                  <option value="General Member">General Member</option>
                  <option value="Farming / Produce">Farming / Produce</option>
                  <option value="Land Plot Owner">Land Plot Owner</option>
                  <option value="Volunteering">Volunteering</option>
                  <option value="Community Events">Community Events</option>
                </select>
              </div>

              {/* Optional Farming Locations */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Farming Locations (Optional)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={location1} 
                    onChange={(e) => setLocation1(e.target.value)} 
                    placeholder="Location 1 (e.g. Sector 4 Plot A)"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }}
                  />
                  <input 
                    type="text" 
                    value={location2} 
                    onChange={(e) => setLocation2(e.target.value)} 
                    placeholder="Location 2 (Optional)"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }}
                  />
                  <input 
                    type="text" 
                    value={location3} 
                    onChange={(e) => setLocation3(e.target.value)} 
                    placeholder="Location 3 (Optional)"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '10px', paddingRight: '40px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '10px', paddingRight: '40px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ marginTop: '10px', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
              >
                {loading ? 'Submitting Registration...' : 'Submit Registration'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}