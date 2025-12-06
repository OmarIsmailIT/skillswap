'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { showSuccess, showError } from '@/lib/sweetalert';

interface SkillOffer {
    _id: string;
    title: string;
    description: string;
    category: string;
    costCredits: number;
    durationMinutes: number;
    tags?: string[];
    status: 'active' | 'inactive';
    locationType?: 'online' | 'in_person';
}

interface UpdateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    offer: SkillOffer;
    onUpdate: () => void;
}

export const UpdateListingModal = ({ isOpen, onClose, offer, onUpdate }: UpdateListingModalProps) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        costCredits: 0,
        durationMinutes: 0,
        status: '',
        locationType: '',
    });
    const [tagsArray, setTagsArray] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (offer && isOpen) {
            // Normalize location type to handle potential database inconsistencies
            let normalizedLocationType = (offer.locationType as string) || 'online';
            if (normalizedLocationType === 'in-person') {
                normalizedLocationType = 'in_person';
            }

            setFormData({
                title: offer.title,
                description: offer.description,
                category: offer.category,
                costCredits: offer.costCredits,
                durationMinutes: offer.durationMinutes,
                status: offer.status || 'active',
                locationType: normalizedLocationType,
            });
            setTagsArray(offer.tags || []);
        }
    }, [offer, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/offers/${offer._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    costCredits: Number(formData.costCredits),
                    durationMinutes: Number(formData.durationMinutes),
                    tags: tagsArray,
                    locationType: formData.locationType,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update offer');
            }

            await showSuccess({
                title: 'Offer Updated!',
                message: 'Your skill offer has been updated successfully.',
            });

            onUpdate();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            await showError({
                title: 'Update Failed',
                message: err.message || 'Failed to update offer. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Panel */}
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200 border border-gray-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Edit Offer</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Update your skill listing details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-5 py-5 max-h-[calc(95vh-140px)] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100 flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-7">
                                <Input
                                    label="Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Advanced React Patterns"
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 py-2 text-sm"
                                />
                            </div>
                            <div className="col-span-5">
                                <Input
                                    label="Category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    placeholder="e.g. Tech"
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all min-h-[60px] resize-none placeholder:text-gray-400"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Describe what you'll teach..."
                                rows={2}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
                            <div className="min-h-[38px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent focus-within:bg-white transition-all">
                                <div className="flex flex-wrap gap-2">
                                    {tagsArray.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => setTagsArray(tagsArray.filter((_, i) => i !== index))}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && tagInput.trim()) {
                                                e.preventDefault();
                                                setTagsArray([...tagsArray, tagInput.trim()]);
                                                setTagInput('');
                                            }
                                        }}
                                        placeholder={tagsArray.length === 0 ? 'Add...' : ''}
                                        className="flex-1 min-w-[60px] bg-transparent outline-none text-gray-900 placeholder:text-gray-400 h-6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Cost (Credits)"
                                type="number"
                                min="0"
                                value={formData.costCredits}
                                onChange={(e) => setFormData({ ...formData, costCredits: Number(e.target.value) })}
                                required
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-all text-gray-900 py-2 text-sm"
                            />
                            <Input
                                label="Duration (Min)"
                                type="number"
                                min="15"
                                step="15"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                                required
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-all text-gray-900 py-2 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Location Type */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Location Type</label>
                                <div className="flex gap-2 h-10 items-center">
                                    <label className="flex items-center gap-2 cursor-pointer mr-4">
                                        <input
                                            type="radio"
                                            name="locationType"
                                            value="online"
                                            checked={formData.locationType === 'online'}
                                            onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">Online</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="locationType"
                                            value="in_person"
                                            checked={formData.locationType === 'in_person'}
                                            onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">In-person</span>
                                    </label>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'active' })}
                                        className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${formData.status === 'active'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'inactive' })}
                                        className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${formData.status === 'inactive'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3 border-t border-gray-50">
                            <button
                                type="button"
                                className="flex-1 h-10 flex items-center justify-center px-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all shadow-sm text-sm"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="flex-1 h-10 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};
