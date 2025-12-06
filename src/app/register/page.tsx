'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error formats from the API
        if (data.errors && Array.isArray(data.errors)) {
          // Multiple errors
          setError(data.errors.join(', '));
        } else if (data.error && Array.isArray(data.error)) {
          // Zod validation errors
          setError(data.error.join(', '));
        } else if (data.message) {
          // Single error message
          setError(data.message);
        } else if (data.error) {
          // Single error
          setError(data.error);
        } else {
          setError('Registration failed. Please try again.');
        }
        return;
      }

      // Redirect to login with success message
      router.push('/login?registered=true');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[500px] bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                SkillSwap
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  id="name"
                  type="text"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
                
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />

                <div>
                  <Input
                    id="password"
                    type="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>

                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    isLoading={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5"
                  >
                    Create Account
                  </Button>
                </div>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  By signing up, you agree to our{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white z-10">
          <div className="max-w-md text-center space-y-8">
            <div className="h-20 w-20 bg-white/10 backdrop-blur-lg rounded-2xl mx-auto flex items-center justify-center border border-white/20 shadow-2xl">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              Start Your Journey
            </h2>
            <p className="text-lg text-indigo-100 leading-relaxed">
              "The beautiful thing about learning is that no one can take it away from you."
            </p>
            <p className="text-sm font-medium text-indigo-200 uppercase tracking-widest">
              — B.B. King
            </p>
          </div>
        </div>
        <img
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-20"
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          alt="Library"
        />
      </div>
    </div>
  );
}
