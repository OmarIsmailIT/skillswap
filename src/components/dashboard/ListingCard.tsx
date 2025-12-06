import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { UpdateListingModal } from './UpdateListingModal';
import { showConfirm, showSuccess, showError } from '@/lib/sweetalert';
import { motion } from 'framer-motion';
import { slideUp } from '@/lib/motion';

interface SkillOffer {
    _id: string;
    title: string;
    description: string;
    category: string;
    costCredits: number;
    durationMinutes: number;
    status: 'active' | 'inactive';
    tags?: string[];
    locationType?: 'online' | 'in_person';
}

interface ListingCardProps {
    offer: SkillOffer;
    onUpdate: () => void;
}

export const ListingCard = ({ offer, onUpdate }: ListingCardProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        const result = await showConfirm({
            title: 'Delete Skill Offer',
            message: `Are you sure you want to delete "<strong>${offer.title}</strong>"?<br><br>This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/offers/${offer._id}`, { method: 'DELETE' });
            if (res.ok) {
                await showSuccess({
                    title: 'Deleted!',
                    message: 'Your skill offer has been deleted successfully.',
                });
                onUpdate();
            } else {
                throw new Error('Failed to delete offer');
            }
        } catch (error) {
            console.error('Failed to delete offer:', error);
            await showError({
                title: 'Error',
                message: 'Failed to delete the offer. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        const isActivating = offer.status === 'inactive';
        const result = await showConfirm({
            title: isActivating ? 'Activate Offer' : 'Deactivate Offer',
            message: isActivating
                ? `Activate "<strong>${offer.title}</strong>"?<br><br>This offer will be visible to users and available for booking.`
                : `Deactivate "<strong>${offer.title}</strong>"?<br><br>This offer will be hidden from users and unavailable for booking.`,
            confirmText: isActivating ? 'Activate' : 'Deactivate',
            cancelText: 'Cancel',
            variant: isActivating ? 'info' : 'warning',
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/offers/${offer._id}`, { method: 'PATCH' });
            if (res.ok) {
                await showSuccess({
                    title: isActivating ? 'Activated!' : 'Deactivated!',
                    message: isActivating
                        ? 'Your offer is now active and visible to users.'
                        : 'Your offer is now inactive and hidden from users.',
                });
                onUpdate();
            } else {
                throw new Error('Failed to toggle status');
            }
        } catch (error) {
            console.error('Failed to toggle status:', error);
            await showError({
                title: 'Error',
                message: 'Failed to update the offer status. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.div
                variants={slideUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{offer.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${offer.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {offer.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="flex flex-col items-end text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{offer.costCredits} Credits</span>
                            <span>{offer.durationMinutes} mins</span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">{offer.description}</p>

                    <div className="flex gap-3">
                        {offer.status === 'active' ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setIsEditModalOpen(true)}
                                isLoading={loading}
                            >
                                Edit
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                onClick={handleToggleStatus}
                                isLoading={loading}
                            >
                                Activate
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={handleDelete}
                            isLoading={loading}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </motion.div>


            <UpdateListingModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                offer={offer}
                onUpdate={onUpdate}
            />
        </>
    );
};
