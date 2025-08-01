import React, { useState, useEffect } from "react";
import axios from "axios";
import ReviewForm from "../components/ReviewForm"; // adjust path if needed
import "../styles/pagesstyle.css";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchReviews = () => {
    setLoading(true);
    setError(null);

    axios
      .get("/api/reviews/my", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setReviews(res.data))
      .catch(() => setError("Failed to load reviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="section-container">
      <h2 className="section-title">My Reviews</h2>

      {/* ReviewForm (example: clientId and projectId passed if applicable) */}
      {/* If you want to enable submitting new reviews here */}
      {/* <ReviewForm clientId={yourClientId} projectId={yourProjectId} onReviewSubmitted={fetchReviews} /> */}

      {reviews.length === 0 ? (
        <p>No reviews received yet.</p>
      ) : (
        <ul className="review-list">
          {reviews.map((review) => (
            <li key={review._id} className="review-item">
              <span className="review-rating">⭐ {review.rating}/5</span>
              <p className="review-comment">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyReviews;
