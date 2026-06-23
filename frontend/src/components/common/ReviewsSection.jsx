import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { CheckBadgeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => {
      const Icon = star <= value ? StarSolid : StarOutline;
      return (
        <button key={star} type="button" onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none">
          <Icon className={`w-8 h-8 ${star <= value ? 'text-amber-400' : 'text-gray-300'}`} />
        </button>
      );
    })}
  </div>
);

const RatingBar = ({ label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-gray-600 font-medium">{label}</span>
      <StarSolid className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-gray-500 text-xs">{count}</span>
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const name = review.customer
    ? `${review.customer.firstName} ${review.customer.lastName}`
    : 'Customer';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(s => {
          const Icon = s <= review.rating ? StarSolid : StarOutline;
          return <Icon key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`} />;
        })}
      </div>
      {review.title && (
        <p className="font-semibold text-navy-800 text-sm leading-snug">"{review.title}"</p>
      )}
      <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-4">{review.body}</p>
      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        {review.customer?.avatar ? (
          <img src={review.customer.avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
          <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
        </div>
        {review.isVerified && (
          <CheckBadgeIcon className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" title="Verified customer" />
        )}
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [reviews, setReviews]     = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({ rating: 0, title: '', body: '' });

  useEffect(() => {
    api.get('/service-reviews').then(({ data }) => {
      setReviews(data.data || []);
      setSummary(data.summary);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('Please select a rating'); return; }
    if (!form.body.trim()) { toast.error('Please write your review'); return; }
    setSubmitting(true);
    try {
      await api.post('/service-reviews', form);
      toast.success('Review submitted — it will appear after approval');
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const avg = summary?.average || 0;
  const total = summary?.count || 0;

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-14">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-brand-purple font-semibold text-sm tracking-widest uppercase">What our customers say</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-navy-800 mt-1">Customer Reviews</h2>
          </div>
          {isAuthenticated && !submitted && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 bg-navy-700 hover:bg-navy-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Write a Review
            </button>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="flex items-center gap-2 border border-navy-200 hover:border-navy-400 text-navy-700 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <PencilSquareIcon className="w-4 h-4" />
              Sign in to review
            </Link>
          )}
        </div>

        {/* Stats + Form row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

          {/* Rating summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-navy-800 font-display leading-none">{avg || '—'}</p>
                <div className="flex justify-center gap-0.5 mt-2">
                  {[1,2,3,4,5].map(s => {
                    const Icon = s <= Math.round(avg) ? StarSolid : StarOutline;
                    return <Icon key={s} className={`w-4 h-4 ${s <= Math.round(avg) ? 'text-amber-400' : 'text-gray-200'}`} />;
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">{total} {total === 1 ? 'review' : 'reviews'}</p>
              </div>
              <div className="flex-1 space-y-1.5">
                <RatingBar label="5" count={summary?.five || 0} total={total} />
                <RatingBar label="4" count={summary?.four || 0} total={total} />
                <RatingBar label="3" count={summary?.three || 0} total={total} />
                <RatingBar label="2" count={summary?.two || 0} total={total} />
                <RatingBar label="1" count={summary?.one || 0} total={total} />
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">Based on verified customer experiences</p>
          </div>

          {/* Submit form (spans 2 cols when visible) */}
          {showForm ? (
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-navy-100">
              <h3 className="font-display font-bold text-navy-800 text-lg mb-4">Share your experience</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Your Rating *</label>
                  <StarPicker value={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Title <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="Summarise your experience"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Your Review *</label>
                  <textarea
                    rows={4}
                    required
                    maxLength={1000}
                    placeholder="Tell us about your shopping experience — delivery, quality, service..."
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    className="input w-full resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{form.body.length}/1000</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 btn-secondary py-2.5 text-sm">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 btn-primary py-2.5 text-sm font-semibold">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <div>
                <div className="flex justify-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <StarSolid key={s} className="w-6 h-6 text-amber-300" />)}
                </div>
                <p className="text-gray-600 font-medium mb-1">Enjoyed shopping with us?</p>
                <p className="text-sm text-gray-400">
                  {isAuthenticated
                    ? 'Click "Write a Review" to share your experience'
                    : 'Sign in to leave a review and help other shoppers'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <div key={j} className="w-4 h-4 bg-gray-200 rounded" />)}</div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded mb-1" />
                <div className="h-3 bg-gray-100 rounded mb-1 w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No reviews yet — be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
