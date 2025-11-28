import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Star, Send } from 'lucide-react';
import { useAddFeedback } from '../hooks';
import type { AddFeedbackRequest } from '../types';

/**
 * FeedbackForm Component
 * 
 * Features:
 * - React Hook Form for form management
 * - TanStack Query mutation for submission
 * - Optimistic updates
 * - Star rating widget
 * - Success feedback animation
 */

interface FeedbackFormData extends AddFeedbackRequest {
  rating: number;
}

export default function FeedbackForm() {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const addFeedbackMutation = useAddFeedback();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    defaultValues: {
      rating: 0,
      message: '',
    },
  });

  const rating = watch('rating');

  const onSubmit = async (data: FeedbackFormData) => {
    if (data.rating === 0) {
      return;
    }

    try {
      await addFeedbackMutation.mutateAsync(data);
      setSubmitted(true);
      reset();

      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Feedback</h3>
      <p className="text-gray-600 mb-6">Help us improve DevWell with your insights</p>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-lg text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-semibold text-lg">Thank you for your feedback!</p>
          <p className="text-sm mt-2">Your input helps us make DevWell better for everyone.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {addFeedbackMutation.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {addFeedbackMutation.error.message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate your experience? *
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm text-gray-600">
                {rating === 5 && '⭐ Excellent!'}
                {rating === 4 && '😊 Very Good!'}
                {rating === 3 && '👍 Good'}
                {rating === 2 && '😐 Could be better'}
                {rating === 1 && '😟 Needs improvement'}
              </p>
            )}
            {errors.rating && rating === 0 && (
              <p className="text-center mt-2 text-sm text-red-600">Please select a rating</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              id="message"
              {...register('message')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Tell us what you think about DevWell..."
            />
          </div>

          <button
            type="submit"
            disabled={addFeedbackMutation.isPending || rating === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {addFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}
