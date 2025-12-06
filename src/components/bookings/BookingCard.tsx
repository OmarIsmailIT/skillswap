import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Booking {
  _id: string;
  offerTitle: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  otherUser: {
    name: string;
    avatarUrl?: string;
  };
}

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            {booking.otherUser.avatarUrl ? (
              <img src={booking.otherUser.avatarUrl} alt={booking.otherUser.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500 font-bold">
                {booking.otherUser.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{booking.offerTitle}</h4>
            <p className="text-xs text-gray-500">with {booking.otherUser.name} on {booking.date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
          {booking.status === 'pending' && (
            <div className="space-x-2">
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200">Decline</Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">Accept</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
