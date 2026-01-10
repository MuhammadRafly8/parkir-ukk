'use client'

import { useState } from 'react'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sistem Parkir
            </h2>
            <p className="text-gray-600">Masuk ke akun Anda</p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorAlert message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Masukkan username"
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
