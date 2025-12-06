'use client';

import { useEffect, useState, useCallback } from 'react';
import { BookingTabs } from '@/components/bookings/BookingTabs';
import { NewBookingCard } from '@/components/bookings/NewBookingCard';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { useSocket } from '@/contexts/SocketContext';
import { showConfirm, showSuccess, showError } from '@/lib/sweetalert';
import { Clock, CheckCircle, XCircle, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/motion';

// Define the shape of the booking data from the API
interface ApiBooking {
  _id: string;
  skillOffer: {
    title: string;
  };
  requester: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  provider: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  dateStart: string;
  status: 'pending' | 'accepted' | 'completed' | 'canceled' | 'rejected';
  cancellationReason?: string;
}

// Define the shape used by the UI component
interface UiBooking {
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

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<'provider' | 'requester'>('provider');
  const [bookings, setBookings] = useState<UiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<UiBooking | null>(null);

  // WebSocket integration
  const { socket } = useSocket();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?role=${activeTab}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();

      // Transform API data to UI data
      const transformedBookings: UiBooking[] = (data.bookings || []).map((b: ApiBooking) => {
        const isProvider = activeTab === 'provider';
        const otherUser = isProvider ? b.requester : b.provider;

        return {
          _id: b._id,
          offerTitle: b.skillOffer?.title || 'Unknown Offer',
          date: b.dateStart,
          status: b.status,
          otherUser: {
            name: otherUser?.name || 'Unknown User',
            avatarUrl: otherUser?.avatarUrl
          },
          cancellationReason: b.cancellationReason
        };
      });

      setBookings(transformedBookings);
    } catch (err) {
      console.error(err);
      await showError({
        title: 'Failed to Load',
        message: 'Unable to load bookings. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Listen for real-time booking updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdate = () => {

      fetchBookings();
    };

    socket.on('booking-updated', handleBookingUpdate);

    return () => {
      socket.off('booking-updated', handleBookingUpdate);
    };
  }, [socket, fetchBookings]);

  const handleAccept = async (bookingId: string) => {
    const result = await showConfirm({
      title: 'Accept Booking?',
      message: 'Are you sure you want to accept this booking request?',
      confirmText: 'Yes, Accept',
      variant: 'info',
    });

    if (!result.isConfirmed) return;

    setProcessingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to accept booking');
      }

      await showSuccess({
        title: 'Booking Accepted!',
        message: 'The booking has been successfully accepted.',
      });

      fetchBookings();
    } catch (err: any) {
      await showError({
        title: 'Failed',
        message: err.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    const result = await showConfirm({
      title: 'Decline Booking?',
      message: 'Are you sure you want to decline this booking? You can optionally provide a reason.',
      confirmText: 'Yes, Decline',
      variant: 'danger',
      input: 'textarea',
      inputPlaceholder: 'Reason for declining (optional)...',
    });

    if (!result.isConfirmed) return;

    const cancellationReason = result.value || 'Declined by provider';

    setProcessingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'canceled', cancellationReason }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to decline booking');
      }

      await showSuccess({
        title: 'Booking Declined',
        message: 'The booking has been declined.',
      });

      fetchBookings();
    } catch (err: any) {
      await showError({
        title: 'Failed',
        message: err.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    const result = await showConfirm({
      title: 'Mark as Completed?',
      message: 'Has the session with the requester finished?',
      confirmText: 'Yes, Complete',
      variant: 'info',
    });

    if (!result.isConfirmed) return;

    setProcessingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to complete booking');
      }

      await showSuccess({
        title: 'Booking Completed!',
        message: 'The session has been marked as completed.',
      });

      fetchBookings();
    } catch (err: any) {
      await showError({
        title: 'Failed',
        message: err.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openReviewModal = (booking: UiBooking) => {
    setSelectedBookingForReview(booking);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedBookingForReview) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingForReview._id,
          rating,
          text: comment
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      await showSuccess({
        title: 'Review Submitted!',
        message: 'Thank you for your feedback.',
      });
    } catch (err: any) {
      await showError({
        title: 'Failed',
        message: err.message,
      });
      throw err;
    }
  };

  // Group bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => b.status === 'accepted');
  const historyBookings = bookings.filter(b => ['completed', 'canceled', 'rejected'].includes(b.status));

  const renderSection = (title: string, items: UiBooking[], icon: React.ReactNode, emptyMessage: string) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        {icon}
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4"
        >
          {items.map((booking) => (
            <NewBookingCard
              key={booking._id}
              booking={booking}
              role={activeTab}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onComplete={handleComplete}
              onReview={openReviewModal}
              isProcessing={processingId === booking._id}
            />
          ))}
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your upcoming sessions and history</p>
        </div>
        <BookingTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Pending Section */}
          {renderSection(
            'Pending Requests',
            pendingBookings,
            <AlertCircle className="w-5 h-5 text-orange-500" />,
            "No pending requests at the moment."
          )}

          {/* Upcoming Section */}
          {renderSection(
            'Upcoming Sessions',
            upcomingBookings,
            <Calendar className="w-5 h-5 text-purple-600" />,
            "No upcoming sessions scheduled."
          )}

          {/* History Section */}
          {renderSection(
            'Booking History',
            historyBookings,
            <Clock className="w-5 h-5 text-gray-500" />,
            "No past bookings found."
          )}
        </div>
      )}

      {selectedBookingForReview && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleSubmitReview}
          bookingTitle={selectedBookingForReview.offerTitle}
          providerName={selectedBookingForReview.otherUser.name}
        />
      )}
    </div>
  );
}
