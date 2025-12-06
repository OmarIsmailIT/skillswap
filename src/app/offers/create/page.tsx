import { CreateOfferForm } from '@/components/offers/CreateOfferForm';

export default function CreateOfferPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Share Your <span className="text-purple-600">Expertise</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create a skill offer and start earning credits by teaching what you love.
          </p>
        </div>
        
        <CreateOfferForm />
      </div>
    </div>
  );
}
