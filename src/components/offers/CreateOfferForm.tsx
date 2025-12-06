'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkillCard } from '@/components/skills/SkillCard';
import { showSuccess } from '@/lib/sweetalert';
import { z } from 'zod';

// Zod schema for validation
const offerSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
    category: z.string().min(1, 'Category is required'),
    durationMinutes: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 4 hours'),
    costCredits: z.number().min(1, 'Cost must be at least 1 credit').max(50, 'Cost cannot exceed 50 credits'),
    locationType: z.enum(['online', 'in_person']),
    tags: z.array(z.string()).min(1, 'Add at least one tag').max(5, 'Maximum 5 tags allowed'),
});

type OfferFormData = z.infer<typeof offerSchema>;

export const CreateOfferForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof OfferFormData, string>>>({});

    // Form State
    const [formData, setFormData] = useState<OfferFormData>({
        title: '',
        description: '',
        category: '',
        durationMinutes: 60,
        costCredits: 1,
        locationType: 'online',
        tags: [],
    });

    // Tag Input State
    const [tagInput, setTagInput] = useState('');

    // Mock User for Preview (In real app, fetch from session)
    const [user, setUser] = useState({
        name: 'You',
        avatarUrl: '', // Will use UI Avatars fallback
        _id: 'preview',
        ratingAvg: 5.0,
        reviewsCount: 0
    });

    useEffect(() => {
        // Fetch current user for preview
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/users/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (e) {
                console.error('Failed to fetch user for preview', e);
            }
        };
        fetchUser();
    }, []);

    const validateField = (name: keyof OfferFormData, value: any) => {
        try {
            (offerSchema.shape as any)[name].parse(value);
            setErrors(prev => ({ ...prev, [name]: undefined }));
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({ ...prev, [name]: error.issues[0].message }));
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const parsedValue = name === 'durationMinutes' || name === 'costCredits' ? Number(value) : value;

        setFormData(prev => ({ ...prev, [name]: parsedValue }));
        validateField(name as keyof OfferFormData, parsedValue);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
            const newTags = [...formData.tags, tag];
            setFormData(prev => ({ ...prev, tags: newTags }));
            setTagInput('');
            validateField('tags', newTags);
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = formData.tags.filter(tag => tag !== tagToRemove);
        setFormData(prev => ({ ...prev, tags: newTags }));
        validateField('tags', newTags);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Validate all
            offerSchema.parse(formData);

            const res = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create offer');
            }

            // Show success alert with SweetAlert2
            await showSuccess({
                title: 'Offer Created!',
                message: `Your skill offer "<strong>${formData.title}</strong>" is now live and ready for bookings.`,
                confirmText: 'View My Listings',
                showCancelButton: true,
                cancelText: 'Create Another Offer',
                onConfirm: () => {
                    router.push('/dashboard/listings');
                },
                onCancel: () => {
                    // Reset form for creating another offer
                    setFormData({
                        title: '',
                        description: '',
                        category: '',
                        durationMinutes: 60,
                        costCredits: 1,
                        locationType: 'online',
                        tags: [],
                    });
                },
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const fieldErrors: any = {};
                error.issues.forEach(err => {
                    if (err.path[0]) fieldErrors[err.path[0]] = err.message;
                });
                setErrors(fieldErrors);
            } else {
                setErrors({ title: error.message }); // General error
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Offer Details</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        id="title"
                        name="title"
                        label="Title"
                        placeholder="e.g. Master Guitar in 30 Days"
                        value={formData.title}
                        onChange={handleChange}
                        error={errors.title}
                        className="text-lg font-medium"
                    />

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={5}
                            className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 resize-none ${errors.description ? 'border-red-500' : 'border-gray-200'
                                }`}
                            placeholder="Describe what you will teach, your methodology, and what students can expect..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            id="category"
                            name="category"
                            label="Category"
                            placeholder="e.g. Music"
                            value={formData.category}
                            onChange={handleChange}
                            error={errors.category}
                        />

                        <div>
                            <label htmlFor="locationType" className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <div className="relative">
                                <select
                                    id="locationType"
                                    name="locationType"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white text-gray-900"
                                    value={formData.locationType}
                                    onChange={handleChange}
                                >
                                    <option value="online">Online (Remote)</option>
                                    <option value="in_person">In Person</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags <span className="text-gray-400 font-normal">(Press Enter to add)</span>
                        </label>
                        <div className={`flex flex-wrap items-center gap-2 p-2 border rounded-xl bg-white ${errors.tags ? 'border-red-500' : 'border-gray-200'}`}>
                            {formData.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-800">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-1.5 text-purple-600 hover:text-purple-900 focus:outline-none"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder={formData.tags.length === 0 ? "Add tags..." : ""}
                                className="flex-1 min-w-[100px] outline-none bg-transparent text-gray-900 placeholder-gray-400"
                                disabled={formData.tags.length >= 5}
                            />
                        </div>
                        {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            id="durationMinutes"
                            name="durationMinutes"
                            type="number"
                            label="Duration (min)"
                            min="15"
                            step="15"
                            value={formData.durationMinutes}
                            onChange={handleChange}
                            error={errors.durationMinutes}
                        />

                        <Input
                            id="costCredits"
                            name="costCredits"
                            type="number"
                            label="Cost (credits)"
                            min="1"
                            value={formData.costCredits}
                            onChange={handleChange}
                            error={errors.costCredits}
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                        >
                            Create Offer
                        </Button>
                    </div>
                </form>
            </div>

            {/* Right Column: Live Preview */}
            <div className="lg:sticky lg:top-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Live Preview</h2>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wide rounded-full">
                        What users see
                    </span>
                </div>

                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                    <SkillCard
                        offer={{
                            _id: 'preview',
                            title: formData.title || 'Your Skill Title',
                            description: formData.description || 'Your skill description will appear here...',
                            category: formData.category || 'Category',
                            costCredits: formData.costCredits,
                            durationMinutes: formData.durationMinutes,
                            owner: user
                        }}
                        isPreview={true}
                    />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <h3 className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pro Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>• Use a catchy, descriptive title.</li>
                        <li>• Be specific about what students will learn.</li>
                        <li>• Add relevant tags to help users find your offer.</li>
                        <li>• Fair pricing attracts more students!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
