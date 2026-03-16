'use client';

import { useState, useEffect } from 'react';
import { ATMLocation, UserLocation } from '../types/atm';

interface SidebarProps {
  selectedATM: ATMLocation | null;
  userLocation: UserLocation | null;
  onClose: () => void;
}

export default function Sidebar({ selectedATM, userLocation, onClose }: SidebarProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    comment: '',
    cashAvailable: true,
    workingStatus: 'working' as 'working' | 'not_working' | 'partially_working'
  });

  // Fetch reviews when ATM is selected
  useEffect(() => {
    if (selectedATM) {
      fetchReviews();
    }
  }, [selectedATM?.id]);

  if (!selectedATM) return null;

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews?atmId=${selectedATM.id}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atmId: selectedATM.id,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        // Reset form and refresh reviews
        setFormData({
          userName: '',
          comment: '',
          cashAvailable: true,
          workingStatus: 'working'
        });
        setShowReviewForm(false);
        fetchReviews();
      } else {
        alert(data.error || 'Failed to post review');
      }
    } catch (error) {
      console.error('Error posting review:', error);
      alert('Failed to post review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to open Google Maps navigation
  const openGoogleMapsNavigation = () => {
    if (!userLocation) {
      alert('User location not available. Please enable location services.');
      return;
    }

    const origin = `${userLocation.lat},${userLocation.lon}`;
    const destination = `${selectedATM.lat},${selectedATM.lon}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />
      
      {/* Sidebar panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto" style={{ zIndex: 9999 }}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 flex justify-between items-center shadow-md">
          <h2 className="text-lg font-bold">ATM Details</h2>
          <button 
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">

          {/* Data Source Badge */}
          {selectedATM.source && (
            <div className="flex justify-end mb-2">
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                selectedATM.source === 'google' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                Powered by {selectedATM.source === 'google' ? '🗺️ Google Maps' : '🗺️ OpenStreetMap'}
              </span>
            </div>
          )}

          {/* Operator/Bank Name */}
          {selectedATM.operator && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Operator
              </h3>
              <p className="text-sm text-gray-900">
                {selectedATM.operator}
              </p>
            </div>
          )}

          {/* Name */}
          {selectedATM.name && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Name
              </h3>
              <p className="text-sm text-gray-900">
                {selectedATM.name}
              </p>
            </div>
          )}

          {/* Address */}
          {selectedATM.address && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Address
              </h3>
              <p className="text-sm text-gray-900">
                {selectedATM.address}
              </p>
            </div>
          )}

          {/* Coordinates */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Coordinates
            </h3>
            <div className="space-y-0.5">
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Lat:</span> {selectedATM.lat.toFixed(6)}
              </p>
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Lon:</span> {selectedATM.lon.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Navigation Button */}
          <button
            onClick={openGoogleMapsNavigation}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-sm">Navigate with Google Maps</span>
          </button>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-900">Reviews & Status</h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {showReviewForm ? 'Cancel' : 'Write Review'}
              </button>
            </div>

            {/* Stats Summary */}
            {stats && stats.totalReviews > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3 border border-blue-200">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-gray-600">Reviews</p>
                    <p className="text-lg font-bold text-blue-600">{stats.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Cash</p>
                    <p className="text-sm font-semibold text-green-600">{stats.cashAvailableCount}/{stats.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Working</p>
                    <p className="text-sm font-semibold text-green-600">{stats.workingCount}/{stats.totalReviews}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200 space-y-3">
                {/* Warning Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-yellow-900 mb-1">Please Provide Accurate Information</p>
                    <p className="text-xs text-yellow-800">
                      This is a helpful website to assist others in finding working ATMs. Please do not provide false or misleading information. Your honest review helps the community!
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Working Status</label>
                  <select
                    value={formData.workingStatus}
                    onChange={(e) => setFormData({ ...formData, workingStatus: e.target.value as any })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  >
                    <option value="working">✅ Working</option>
                    <option value="partially_working">⚠️ Partially Working</option>
                    <option value="not_working">❌ Not Working</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.cashAvailable}
                      onChange={(e) => setFormData({ ...formData, cashAvailable: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-gray-700">Cash Available</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Comment</label>
                  <textarea
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    rows={2}
                    maxLength={500}
                    placeholder="Share your experience..."
                  />
                  <p className="text-xs text-gray-500 mt-0.5">{formData.comment.length}/500</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-2">
              {isLoadingReviews ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">No reviews within 48 hours!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{review.userName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(review.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          review.workingStatus === 'working' ? 'bg-green-100 text-green-700' :
                          review.workingStatus === 'not_working' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {review.workingStatus === 'working' ? '✅ Working' :
                           review.workingStatus === 'not_working' ? '❌ Not Working' :
                           '⚠️ Partial'}
                        </span>
                        {review.cashAvailable && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">💵 Cash OK</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 mt-1.5">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
