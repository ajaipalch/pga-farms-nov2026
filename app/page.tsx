'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Unsplash high-res background image slides for PGA / Agriculture theme
const carouselImages = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80'
]

export default function Home() {
  const router = useRouter()
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  // Auto-rotate background slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('1. Attempting Supabase Auth for:', adminEmail)

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })

    if (authError) {
      console.error('Auth Error:', authError.message)
      setError(authError.message)
      setLoading(false)
      return
    }

    const userId = authData.user?.id
    console.log('2. Auth successful. User ID:', userId)

    // 2. Check if user exists in the separate ADMINS table
    const { data: adminRecord, error: adminQueryError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    console.log('3. Admin query result:', { adminRecord, adminQueryError })

    if (adminRecord) {
  console.log('4. User is an ADMIN. Redirecting to /admin...')
  setIsAdminModalOpen(false) // <--- Changed from setIsLoginModalOpen
  router.push('/admin')
  setLoading(false)
  return
}
   

    // 3. Otherwise, check standard member profile status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', userId)
      .maybeSingle()

    console.log('5. Profile query result:', { profile, profileError })

    if (!profile) {
      console.error('No profile found in profiles table.')
      setError('No profile found for this account.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (profile.status === 'pending') {
      setError('Your account is still pending admin approval.')
      await supabase.auth.signOut()
    } else if (profile.status === 'rejected') {
      setError('Your account application was rejected.')
      await supabase.auth.signOut()
    } else {
  console.log('6. Member approved. Redirecting to /mem_dashboard...')
  setIsAdminModalOpen(false) // <--- Changed from setIsLoginModalOpen
  router.push('/mem_dashboard')
    }

    setLoading(false)
  }
  

  return (
    <div className="bg-slate-900 font-sans text-white antialiased min-h-screen flex flex-col">

      {/* ==================== NAVIGATION BAR ==================== */}
      <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold tracking-wider">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">
            MembersPortal, PGAkheti.org
          </span>
        </div>

        <button
          onClick={() => setIsAdminModalOpen(true)}
          className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full font-medium transition duration-200 border border-white/20 text-sm"
        >
          PGA Admin Login
        </button>
      </nav>

      {/* ==================== HERO SLIDESHOW BACKDROP ==================== */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Carousel Background Images */}
        {carouselImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            } transform transition-transform duration-[6000ms]`}
            style={{ backgroundImage: `url('${img}')` }}
          />
        ))}

        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs" />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl px-6 pt-20">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Connected Community, <span className="text-indigo-400">Simplified Management.</span>
          </h1>

          <p className="text-lg text-slate-300 mb-8 max-w-lg mx-auto">
            Welcome to the official PGAkheti.org directory. Register below to apply, or Login for membership access. Admin verification is required for security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 duration-150 text-center"
            >
              Register / Apply Here
            </Link>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-lg px-8 py-4 rounded-xl transition duration-150"
            >
              Member Sign In
            </button>
          </div>

          {/* Carousel Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-12">
            {carouselImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-white/40'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ==================== NOTICE BOARD SECTION ==================== */}
      <div className="bg-slate-950 border-y border-slate-800 py-16 px-6">
        <div className="max-w-3xl mx-auto bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 shadow-xl">
          
          <div className="flex items-center space-x-2 mb-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Important Notice
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-3 tracking-tight">
            Latest Community Updates & Guidance
          </h2>

          <p className="text-slate-300 leading-relaxed text-base">
            Attention all applicants and current community members: Please ensure that your uploaded profile image clearly displays your face on a plain background before submitting your application. Standard verification reviews are processed within 48 hours. Once approved by our team, your temporary portal access pass will be delivered securely to the mobile phone number you provided during registration. For any login discrepancies or group tier updates, please utilize our formal support channel listed below.
          </p>
        </div>
      </div>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-900 py-12 text-center text-sm text-slate-500 border-t border-slate-800 mt-auto">
        <p>© 2026 PGAkheti.org Portal Directory. Need urgent help? Contact admin@pgakheti.org</p>
      </footer>

      {/* ==================== ADMIN / LOGIN MODAL ==================== */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-indigo-500/30 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              {/* SVG Close Button Fix */}
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
</svg>
              
            </button>

            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Admin Access
            </h2>

            {error && (
  <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg mb-4 text-center">
    {error}
  </div>
)}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="admin@pgakheti.org"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-indigo-600/30 transition duration-150 mt-4"
              >
                Secure Login
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}