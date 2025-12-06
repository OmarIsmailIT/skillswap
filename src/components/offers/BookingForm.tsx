'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  skillOfferId: string;
  costCredits: number;
  durationMinutes: number;
}

export const BookingForm = ({ skillOfferId, costCredits, durationMinutes }: BookingFormProps) => {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleBooking = async () => {
    setError('');
    setSuccess(false);

    if (!date || !time) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);

    try {
      // Construct dateStart and dateEnd
      const dateStart = new Date(`${date}T${time}`);
      const dateEnd = new Date(dateStart.getTime() + durationMinutes * 60000);

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillOfferId,
          dateStart: dateStart.toISOString(),
          dateEnd: dateEnd.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setSuccess(true);
      // Reset form
      setDate('');
      setTime('');
      
      // Show success message for 3 seconds then maybe redirect or just stay
      setTimeout(() => {
        setSuccess(false);
        router.refresh(); // Refresh to update bookings count if displayed
      }, 5000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {costCredits} {costCredits === 1 ? 'Credit' : 'Credits'}
        </div>
        <div className="text-sm text-gray-600">/ Session</div>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-green-900 mb-2">Booking Requested!</h3>
          <p className="text-green-700 text-sm">
            Your session request has been sent. Waiting for instructor acceptance.
          </p>
          <Button 
            className="mt-4 w-full bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
            onClick={() => setSuccess(false)}
          >
            Book Another
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select time</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <Button
            onClick={handleBooking}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Requesting...' : 'Request Session'}
          </Button>
        </div>
      )}
    </div>
  );
};
