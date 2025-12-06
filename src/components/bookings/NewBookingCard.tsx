import React from 'react';
import { Calendar, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { slideUp, hoverScale, tapScale } from '@/lib/motion';

interface Booking {
    _id: string;
    offerTitle: string;
    date: string;
    status: 'pending' | 'accepted' | 'completed' | 'canceled' | 'rejected';
    otherUser: {
        name: string;
        avatarUrl?: string;
    };
    cancellationReason?: string;
}

interface NewBookingCardProps {
    booking: Booking;
    role: 'provider' | 'requester';
    onAccept?: (id: string) => void;
    onDecline?: (id: string) => void;
    onComplete?: (id: string) => void;
    onReview?: (booking: Booking) => void;
    isProcessing?: boolean;
}

export function NewBookingCard({
    booking,
    role,
    onAccept,
    onDecline,
    onComplete,
    onReview,
    isProcessing = false
}: NewBookingCardProps) {
    const statusColors = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        completed: 'bg-blue-50 text-blue-700 border-blue-200',
        canceled: 'bg-red-50 text-red-700 border-red-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    };

    const statusIcons = {
        pending: AlertCircle,
        accepted: CheckCircle,
        completed: CheckCircle,
        canceled: XCircle,
        rejected: XCircle,
    };

    const StatusIcon = statusIcons[booking.status] || AlertCircle;
    const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const showCancellationReason = booking.status === 'canceled' && booking.cancellationReason && role === 'requester';

    return (
        <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="group relative bg-white rounded-2xl border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left Side: Info */}
                <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                        {booking.otherUser.avatarUrl ? (
                            <img
                                src={booking.otherUser.avatarUrl}
                                alt={booking.otherUser.name}
                                className="w-12 h-12 rounded-full object-cover border border-gray-100"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg border border-indigo-100">
                                {booking.otherUser.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 flex-1">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            Booking with {booking.otherUser.name} — ({booking.offerTitle})
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formattedDate}</span>
                        </div>

                        {/* Cancellation Reason for Requesters */}
                        {showCancellationReason && (
                            <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                                <Info className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-red-900">Decline Reason:</p>
                                    <p className="text-xs text-red-700 mt-0.5">{booking.cancellationReason}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Status & Actions */}
                <div className="flex flex-col sm:items-end gap-3">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{booking.status === 'canceled' ? 'Rejected' : booking.status}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Provider Actions for Pending */}
                        {role === 'provider' && booking.status === 'pending' && (
                            <>
                                <motion.button
                                    whileHover={hoverScale}
                                    whileTap={tapScale}
                                    onClick={() => onDecline?.(booking._id)}
                                    disabled={isProcessing}
                                    className="px-4 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                                >
                                    Decline
                                </motion.button>
                                <motion.button
                                    whileHover={hoverScale}
                                    whileTap={tapScale}
                                    onClick={() => onAccept?.(booking._id)}
                                    disabled={isProcessing}
                                    className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50"
                                >
                                    Accept
                                </motion.button>
                            </>
                        )}

                        {/* Provider Complete button for Accepted bookings */}
                        {role === 'provider' && booking.status === 'accepted' && (
                            <motion.button
                                whileHover={hoverScale}
                                whileTap={tapScale}
                                onClick={() => onComplete?.(booking._id)}
                                disabled={isProcessing}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 disabled:opacity-50"
                            >
                                Complete
                            </motion.button>
                        )}

                        {/* Requester Review for Completed - ONLY FOR REQUESTERS */}
                        {role === 'requester' && booking.status === 'completed' && (
                            <button
                                onClick={() => onReview?.(booking)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline decoration-indigo-300 underline-offset-4 transition-all"
                            >
                                Leave Review
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
