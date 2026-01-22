'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/lib/hooks/useAuth'

// Floating Orbs Component
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Orb 1 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      
      {/* Orb 2 */}
      <div className="absolute -bottom-8 right-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      {/* Orb 3 */}
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-indigo-400 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  )
}

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(username, password)

    if (!result.success) {
      setError(result.error || 'Login gagal')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <FloatingOrbs />

      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md animate-slideInUp">
          {/* Card with Glassmorphism */}
          <div className="relative group">
            {/* Gradient Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Main Card */}
            <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
              
              {/* Header Section */}
              <div className="text-center mb-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-16 h-16 animate-float">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-75"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      🅿️
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Sistem Parkir
                </h1>
                <p className="text-slate-300 text-sm font-medium">Selamat datang kembali</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm animate-slideInUp">
                  <div className="flex items-center">
                    <span className="text-red-400 text-sm">{error}</span>
                    <button
                      onClick={() => setError('')}
                      className="ml-auto text-red-400 hover:text-red-300 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Input */}
                <div className="group relative">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3.5 text-slate-400">👤</div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Masukkan username"
                      autoComplete="username"
                      required
                      className={`w-full pl-10 pr-4 py-3 bg-slate-700/30 border rounded-xl transition duration-300 focus:outline-none text-slate-100 placeholder-slate-500 ${
                        focusedField === 'username'
                          ? 'border-blue-400 shadow-lg shadow-blue-500/20 bg-slate-700/50'
                          : 'border-slate-600/50 hover:border-slate-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group relative">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3.5 text-slate-400">🔒</div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      required
                      className={`w-full pl-10 pr-4 py-3 bg-slate-700/30 border rounded-xl transition duration-300 focus:outline-none text-slate-100 placeholder-slate-500 ${
                        focusedField === 'password'
                          ? 'border-purple-400 shadow-lg shadow-purple-500/20 bg-slate-700/50'
                          : 'border-slate-600/50 hover:border-slate-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl transition duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sedang masuk...
                    </>
                  ) : (
                    <>
                      Masuk
                      <span>→</span>
                    </>
                  )}
                </button>

                {/* Footer Text */}
                <p className="text-center text-slate-400 text-xs mt-4">
                  Akses terbatas untuk pengguna terdaftar
                </p>
              </form>

              {/* Decorative Lines */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-blue-400/20 rounded-tl-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-pink-400/20 rounded-br-3xl pointer-events-none"></div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-slate-400 text-xs">
            <p>© 2026 Sistem Parkir UKK. Semua hak dilindungi.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
