import React, { useState } from "react";
import { Star, MessageSquarePlus, Check } from "lucide-react";
import { IListing, IReview } from "../types";
import { useAuth } from "../context/AuthContext";
import { ReviewController } from "../server/controllers/reviewController";

interface ReviewsListProps {
  listing: IListing;
  onReviewAdded: () => void;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ listing, onReviewAdded }) => {
  const { user, setAuthModalOpen } = useAuth();
  const [reviews, setReviews] = useState<IReview[]>(() => {
    const res = ReviewController.getListingReviews(listing._id);
    return res.reviews || [];
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!comment.trim()) return;

    setSubmitting(true);
    const res = ReviewController.createReview(
      {
        listingId: listing._id,
        rating,
        comment,
      },
      user
    );

    if (res.success) {
      setReviews(ReviewController.getListingReviews(listing._id).reviews || []);
      setComment("");
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onReviewAdded();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 pt-8 border-t border-neutral-200">
      {/* Overall Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-current text-neutral-900" />
          <span className="text-xl font-bold text-neutral-900">
            {listing.averageRating.toFixed(2)} · {reviews.length} reviews
          </span>
        </div>

        <button
          onClick={() => {
            if (!user) setAuthModalOpen(true);
            else setShowForm(!showForm);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:border-neutral-900 text-xs font-semibold text-neutral-800 transition"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-rose-500" />
          <span>Write a review</span>
        </button>
      </div>

      {/* Write a review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Share your experience as {user?.name}
          </h4>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-600">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-4 h-4 ${
                      s <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was your stay? Tell future guests about the host, cleanliness, and views..."
            className="w-full p-3 rounded-xl border border-neutral-200 bg-white text-xs font-normal outline-none focus:border-neutral-900"
            required
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-4 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black disabled:opacity-40"
            >
              {submitting ? "Posting..." : "Post Review"}
            </button>
          </div>
        </form>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Thank you! Your verified review has been published.</span>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <div key={rev._id} className="space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={rev.author.avatar}
                alt={rev.author.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-200"
              />
              <div>
                <h5 className="text-xs font-bold text-neutral-900">{rev.author.name}</h5>
                <p className="text-[11px] text-neutral-500">
                  {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < rev.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
