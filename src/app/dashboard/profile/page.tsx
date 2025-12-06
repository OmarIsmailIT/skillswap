'use client';

import { useEffect, useState, useRef } from 'react';
import { Edit3, Save, X, Star, Award, BookOpen, Mail, User as UserIcon, Camera } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { showError, showSuccess } from '@/lib/sweetalert';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  credits: number;
  reservedCredits: number;
  ratingAvg: number;
  reviewsCount: number;
  skills: string[];
  skillsOffered: Array<{
    title: string;
    costCredits: number;
    status: string;
  }>;
}

export default function MyProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    topSkills: '',
    avatarUrl: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (status !== 'authenticated') return;

      try {
        const res = await fetch('/api/users/me');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        setProfile({
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          bio: data.user.bio || '',
          avatarUrl: data.user.avatarUrl || '',
          credits: data.user.credits || 0,
          reservedCredits: data.user.reservedCredits || 0,
          ratingAvg: data.user.ratingAvg || 0,
          reviewsCount: data.user.reviewsCount || 0,
          skills: data.user.skills || [],
          skillsOffered: data.user.skillsOffered || [],
        });

        setEditData({
          name: data.user.name,
          bio: data.user.bio || '',
          topSkills: (data.user.skills || []).join(', '),
          avatarUrl: data.user.avatarUrl || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (profile) {
      setEditData({
        name: profile.name,
        bio: profile.bio,
        topSkills: profile.skills.join(', '),
        avatarUrl: profile.avatarUrl,
      });
    }
    setIsEditMode(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      await showError({
        title: 'Invalid File Type',
        message: 'Please upload an image file (PNG, JPG, GIF, etc.).',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      await showError({
        title: 'File Too Large',
        message: 'Image size must be less than 5MB. Please choose a smaller file.',
      });
      return;
    }

    setUploadingImage(true);

    try {
      // For now, create a data URL
      // In production, you'd upload to a service like Cloudinary, S3, etc.
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setEditData({ ...editData, avatarUrl: dataUrl });
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      await showError({
        title: 'Upload Failed',
        message: 'Failed to upload image. Please try again.',
      });
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          bio: editData.bio,
          topSkills: editData.topSkills.split(',').map(s => s.trim()).filter(Boolean),
          avatarUrl: editData.avatarUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      // Refresh profile data
      const refreshRes = await fetch('/api/users/me');
      const refreshData = await refreshRes.json();
      setProfile({
        ...profile!,
        name: refreshData.user.name,
        bio: refreshData.user.bio || '',
        skills: refreshData.user.skills || [],
        avatarUrl: refreshData.user.avatarUrl || '',
      });

      await showSuccess({
        title: 'Profile Updated!',
        message: 'Your profile has been updated successfully.',
      });

      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      await showError({
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile not found</h3>
        <p className="text-sm text-gray-500">Unable to load your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        {!isEditMode ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-300 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with Upload */}
            <div className="relative">
              <img
                src={editData.avatarUrl || profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(editData.name || profile.name)}&background=8B5CF6&color=fff&size=200`}
                alt={editData.name || profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />

              {isEditMode && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingImage ? (
                    <div className="animate-spin h-8 w-8 border-3 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </button>
              )}

              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left text-white space-y-4">
              {/* Name - Editable */}
              {isEditMode ? (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full max-w-md rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-2xl font-bold"
                    placeholder="Your name"
                  />
                </div>
              ) : (
                <h2 className="text-3xl font-bold">{profile.name}</h2>
              )}

              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-white/90">{profile.email}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    <span className="font-bold">{profile.ratingAvg.toFixed(1)}</span>
                    <span className="text-sm text-white/80">({profile.reviewsCount} reviews)</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span className="font-bold">{profile.credits}</span>
                    <span className="text-sm text-white/80">Credits</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-bold">{profile.skillsOffered.filter(s => s.status === 'active').length}</span>
                    <span className="text-sm text-white/80">Active Offers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-purple-600" />
          About Me
        </h3>

        {isEditMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed">
            {profile.bio || 'No bio provided yet. Click "Edit Profile" to add one!'}
          </p>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Top Skills
        </h3>

        {isEditMode ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={editData.topSkills}
              onChange={(e) => setEditData({ ...editData, topSkills: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="e.g. React, Node.js, Design"
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No skills added yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
