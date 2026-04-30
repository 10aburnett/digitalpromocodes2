'use client';

import React, { useState, useEffect } from 'react';

interface Review {
  id: string;
  username?: string;
  author?: string; // Added for database compatibility
  text?: string;
  content?: string; // Added for database compatibility
  rating: number;
  date?: string;
  verified?: boolean;
}

// Calculate the average rating from reviews
const calculateAverageRating = (reviews: Review[] = []): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};

interface ReviewSectionProps {
  casinoName: string;
  reviews?: Review[];
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ casinoName, reviews: initialReviews = [] }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [newReview, setNewReview] = useState<Partial<Review>>({
    username: '',
    rating: 5,
    text: '',
  });
  const [showForm, setShowForm] = useState(false);
  
  // Load reviews from props and localStorage on component mount
  useEffect(() => {
    // Generate a unique key for each casino's reviews
    const storageKey = `casino_reviews_${casinoName.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Normalize review format
    const normalizedInitialReviews = initialReviews.map(review => ({
      ...review,
      // Ensure we have username (use author as fallback)
      username: review.username || review.author || 'Anonymous',
      // Ensure we have text (use content as fallback)
      text: review.text || review.content || '',
      // Ensure date is present
      date: review.date || new Date().toLocaleDateString(),
    }));
    
    try {
      // Always prefer server-side reviews when available
      if (normalizedInitialReviews.length > 0) {
        // Clear localStorage reviews when we have new server data
        localStorage.removeItem(storageKey);
        setReviews(normalizedInitialReviews);
        console.log(`Loaded ${normalizedInitialReviews.length} reviews from server for ${casinoName}`);
      } else {
        // Only fall back to localStorage if no server reviews
        const savedReviews = localStorage.getItem(storageKey);
        if (savedReviews) {
          const parsedReviews = JSON.parse(savedReviews);
          setReviews(parsedReviews);
          console.log(`Loaded ${parsedReviews.length} reviews from localStorage for ${casinoName}`);
        }
      }
    } catch (error) {
      console.error('Error processing reviews:', error);
      // Fallback to initial reviews if provided
      if (normalizedInitialReviews.length > 0) {
        setReviews(normalizedInitialReviews);
      }
    }
    
    // Generate a fingerprint of current reviews to check for changes
    const reviewsFingerprint = JSON.stringify(normalizedInitialReviews.map(r => r.id));
    console.log(`Reviews fingerprint: ${reviewsFingerprint}`);
    
  }, [casinoName, initialReviews]);
  
  const averageRating = calculateAverageRating(reviews);
  const reviewCount = reviews.length;
  
  // Show only 2 reviews initially, or all if expanded
  const visibleReviews = expanded ? reviews : reviews.slice(0, 2);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewReview({
      ...newReview,
      [e.target.name]: e.target.value,
    });
  };
  
  // Handle star rating selection
  const handleRatingChange = (rating: number) => {
    setNewReview({
      ...newReview,
      rating,
    });
  };
  
  // Handle review submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find casino ID based on name
    let casinoId = "";
    
    try {
      // First, try to fetch the casino by its name
      const casinoResponse = await fetch(`/api/casinos?name=${encodeURIComponent(casinoName)}`);
      const casinos = await casinoResponse.json();
      
      if (casinos && casinos.length > 0) {
        casinoId = casinos[0].id;
      } else {
        // If not found by name, try to find by slug (converting name to slug format)
        const slug = casinoName.toLowerCase().replace(/\s+/g, '-');
        const slugResponse = await fetch(`/api/casinos?slug=${encodeURIComponent(slug)}`);
        const slugCasinos = await slugResponse.json();
        
        if (slugCasinos && slugCasinos.length > 0) {
          casinoId = slugCasinos[0].id;
        } else {
          throw new Error("Casino not found");
        }
      }
      
      // Create a new review object for API submission
      const reviewData = {
        author: newReview.username || 'Anonymous',
        content: newReview.text || '',
        rating: newReview.rating || 5,
        casinoId: casinoId,
      };
      
      // Submit to API for moderation
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      
      // Create a new review object for UI display
      const userReview: Review = {
        id: `user-${Date.now()}`,
        username: newReview.username || 'Anonymous',
        author: newReview.username || 'Anonymous', // Set both for compatibility
        text: newReview.text || '',
        content: newReview.text || '', // Set both for compatibility
        rating: newReview.rating || 5,
        date: 'Just now',
        verified: false,
      };
      
      // Add the new review to the reviews list
      const updatedReviews = [userReview, ...reviews];
      setReviews(updatedReviews);
      setShowForm(false);
      
      // Store in localStorage
      try {
        const storageKey = `casino_reviews_${casinoName.toLowerCase().replace(/\s+/g, '_')}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
      } catch (error) {
        console.error('Error saving reviews to localStorage:', error);
      }
      
      // Clear form after submission
      setNewReview({
        username: '',
        rating: 5,
        text: '',
      });
      
      // Show submission confirmation
      alert('Thank you for your review! It has been submitted for moderation and will be visible after approval by our team.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('There was an error submitting your review. Please try again later.');
    }
  };
  
  // Helper to get the display name
  const getDisplayName = (review: Review) => {
    return review.username || review.author || 'Anonymous';
  };
  
  // Helper to get the display text
  const getDisplayText = (review: Review) => {
    return review.text || review.content || '';
  };
  
  return (
    <section className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
        <h2 className="text-xl sm:text-2xl font-bold">Reviews</h2>
        
        {/* Aggregate Star Rating */}
        <div className="flex items-center mt-2 sm:mt-0">
          {reviewCount > 0 ? (
            <>
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={i < Math.round(averageRating) ? "#68D08B" : "#4a4b57"} 
                    className="w-5 h-5 mr-0.5"
                  >
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
              <span className="text-white font-medium">{averageRating}</span>
              <span className="text-white/60 text-sm ml-1">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
            </>
          ) : (
            <>
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="#4a4b57" 
                    className="w-5 h-5 mr-0.5"
                  >
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
              <span className="text-white font-medium">0.0</span>
              <span className="text-white/60 text-sm ml-1">(0 reviews)</span>
            </>
          )}
        </div>
      </div>
      
      {/* Add Review Button */}
      {!showForm && (
        <button 
          onClick={() => setShowForm(true)}
          className="bg-[#68D08B] text-[#343541] font-semibold px-4 py-2 rounded-lg hover:bg-[#5EBC7C] transition-colors mb-5 text-sm"
        >
          Write a Review
        </button>
      )}
      
      {/* Review Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#343541] p-4 rounded-lg mb-5">
          <h3 className="font-bold mb-3">Add Your Review</h3>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Your Name</label>
            <input 
              type="text" 
              name="username" 
              value={newReview.username} 
              onChange={handleInputChange}
              className="w-full bg-[#2c2f3a] rounded-lg px-3 py-2 text-white/90"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button 
                  key={rating} 
                  type="button"
                  onClick={() => handleRatingChange(rating)}
                  className="mr-1"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={rating <= (newReview.rating || 0) ? "#68D08B" : "#4a4b57"} 
                    className="w-6 h-6"
                  >
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Your Review</label>
            <textarea 
              name="text" 
              value={newReview.text} 
              onChange={handleInputChange}
              className="w-full bg-[#2c2f3a] rounded-lg px-3 py-2 text-white/90 min-h-[100px]"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              type="submit"
              className="bg-[#68D08B] text-[#343541] font-semibold px-4 py-2 rounded-lg hover:bg-[#5EBC7C] transition-colors text-sm"
            >
              Submit
            </button>
            <button 
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-[#2c2f3a] text-white/90 px-4 py-2 rounded-lg hover:bg-[#383b4a] transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {/* Display Reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {visibleReviews.map((review) => (
            <div key={review.id} className="bg-[#343541] p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center">
                    {/* Star rating */}
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill={i < review.rating ? "#68D08B" : "#4a4b57"} 
                          className="w-4 h-4 mr-0.5"
                        >
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>
                    
                    <span className="font-medium text-sm">{getDisplayName(review)}</span>
                    
                    {review.verified && (
                      <span className="ml-2 text-xs bg-[#2c2f3a] text-[#68D08B] px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                
                <span className="text-xs text-white/60">{review.date}</span>
              </div>
              
              <p className="text-sm text-white/85">{getDisplayText(review)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#343541] p-4 rounded-lg text-center">
          <p className="text-white/85">
            No reviews yet for {casinoName}. Be the first to share your experience!
          </p>
        </div>
      )}
      
      {/* Show More/Less Reviews Controls */}
      {reviews.length > 2 && !expanded && (
        <button 
          className="mt-4 text-[#68D08B] text-sm hover:underline flex items-center mx-auto"
          onClick={() => setExpanded(true)}
        >
          Show all reviews
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {reviews.length > 2 && expanded && (
        <button 
          className="mt-4 text-[#68D08B] text-sm hover:underline flex items-center mx-auto"
          onClick={() => setExpanded(false)}
        >
          Show less
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </section>
  );
};

export default ReviewSection; 