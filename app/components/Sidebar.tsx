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
        alert('Review posted successfully!');
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
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center shadow-md">
          <h2 className="text-xl font-bold">ATM Details</h2>
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
        <div className="p-6 space-y-6">
          {/* ATM ID */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              ATM Identifier
            </h3>
            <p className="text-lg font-mono text-gray-900 break-all">
              {selectedATM.id}
            </p>
          </div>

          {/* Operator/Bank Name */}
          {selectedATM.operator && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Operator
              </h3>
              <p className="text-lg text-gray-900">
                {selectedATM.operator}
              </p>
            </div>
          )}

          {/* Name */}
          {selectedATM.name && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Name
              </h3>
              <p className="text-lg text-gray-900">
                {selectedATM.name}
              </p>
            </div>
          )}

          {/* Address */}
          {selectedATM.address && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Address
              </h3>
              <p className="text-lg text-gray-900">
                {selectedATM.address}
              </p>
            </div>
          )}

          {/* Coordinates */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Coordinates
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Latitude:</span> {selectedATM.lat.toFixed(6)}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Longitude:</span> {selectedATM.lon.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Navigation Button */}
          <button
            onClick={openGoogleMapsNavigation}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Navigate with Google Maps</span>
          </button>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Reviews & Status</h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {showReviewForm ? 'Cancel' : 'Write Review'}
              </button>
            </div>

            {/* Stats Summary */}
            {stats && stats.totalReviews > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cash Available</p>
                    <p className="text-lg font-semibold text-green-600">{stats.cashAvailableCount}/{stats.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Working</p>
                    <p className="text-lg font-semibold text-green-600">{stats.workingCount}/{stats.totalReviews}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Working Status</label>
                  <select
                    value={formData.workingStatus}
                    onChange={(e) => setFormData({ ...formData, workingStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Cash Available</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Comment</label>
                  <textarea
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={3}
                    maxLength={500}
                    placeholder="Share your experience..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/500 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-3">
              {isLoadingReviews ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.userName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
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
                    <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
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
