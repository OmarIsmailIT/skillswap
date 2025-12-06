'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface OnboardingFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const OnboardingForm = ({ onSuccess, className }: OnboardingFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [topSkills, setTopSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatar) return null;

    try {
      // Get signature
      const sigRes = await fetch('/api/upload/signature');
      const sigData = await sigRes.json();

      const formData = new FormData();
      formData.append('file', avatar);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);

      // Upload to Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const uploadData = await uploadRes.json();
      return uploadData.secure_url;
    } catch (err) {
      console.error('Upload error:', err);
      throw new Error('Image upload failed');
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !topSkills.includes(skill) && topSkills.length < 5) {
      setTopSkills([...topSkills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setTopSkills(topSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await uploadAvatar();
      }

      const res = await fetch('/api/users/me/onboarding', {
        method: 'PATCH', // Changed from POST to PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarUrl,
          bio,
          topSkills,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Onboarding failed');
      }

      // Success - call onSuccess callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-lg mx-auto ${className || ''}`}>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="h-28 w-28 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-md">
              {preview ? (
                <div className="relative h-full w-full">
                  <Image
                    src={preview}
                    alt="Avatar preview"
                    className="object-cover"
                    fill
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <label className="cursor-pointer bg-white py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
              <span>Upload Photo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
              placeholder="Tell us a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Top Skills - Advanced Tag Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top Skills <span className="text-gray-400 font-normal text-xs">(Press Enter to add)</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
              {topSkills.map(skill => (
                <span key={skill} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-indigo-600 hover:text-indigo-900 focus:outline-none font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={topSkills.length === 0 ? "e.g. Guitar, Coding, Cooking..." : ""}
                className="flex-1 min-w-[100px] outline-none bg-transparent text-gray-900 placeholder-gray-400"
                disabled={topSkills.length >= 5}
              />
            </div>
            {topSkills.length >= 5 && (
              <p className="mt-1 text-xs text-gray-500">Maximum 5 skills reached</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            isLoading={loading}
          >
            Complete Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
