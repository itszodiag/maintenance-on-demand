import { useEffect, useMemo, useState } from 'react';
import { Star, Search, Eye, Trash2 } from 'lucide-react';
import { adminApi } from '../api/modules.js';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { extractCollection, formatDate } from '../lib/dashboard.js';

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await adminApi.reviews();
      setReviews(extractCollection(response));
    } catch (error) {
      setFeedback(error.message || 'Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviews;
    const query = searchQuery.toLowerCase();
    return reviews.filter((review) => {
      const reviewerName = (
        review.user?.display_name ||
        review.user?.name ||
        ''
      ).toLowerCase();
      const targetName = (
        review.target?.name ||
        review.target?.title ||
        ''
      ).toLowerCase();
      const content = (review.content || '').toLowerCase();
      return (
        reviewerName.includes(query) ||
        targetName.includes(query) ||
        content.includes(query)
      );
    });
  }, [reviews, searchQuery]);

  const removeReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove this review?')) {
      return;
    }
    try {
      setFeedback('');
      await adminApi.removeReview(reviewId);
      setFeedback('Review removed successfully.');
      await loadReviews();
    } catch (error) {
      setFeedback(error.message || 'Unable to remove review.');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
        }`}
      />
    ));
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  return (
    <DashboardLayout
      title="Review Moderation"
      subtitle="Monitor and moderate all reviews across the platform."
    >
      <div className="space-y-6">
        {feedback && (
          <div
            className={`rounded-[28px] px-6 py-4 text-sm font-semibold ${
              feedback.includes('Error')
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-100">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Total Reviews
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {reviews.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {averageRating}/5
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">All Reviews</h3>
              <p className="mt-1 text-sm text-slate-500">
                Search and moderate user reviews
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-[18px] border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="mt-4 text-sm text-slate-500">
                  Loading reviews...
                </p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                {searchQuery.trim()
                  ? 'No reviews match your search.'
                  : 'No reviews yet.'}
              </p>
            ) : (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {review.user?.display_name ||
                            review.user?.name ||
                            'Anonymous'}
                        </p>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        Review for:{' '}
                        {review.target?.name ||
                          review.target?.title ||
                          'Unknown'}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        {review.content}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeReview(review.id)}
                      className="flex items-center gap-2 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
