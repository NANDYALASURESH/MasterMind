// SavedCourses.jsx
import React, { useState, useEffect } from 'react';
import { Heart, Clock, Star, Users, ArrowLeft, BookOpen, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import './app.css';
import Cookies from 'js-cookie'; // Added import for Cookies

const SavedCourses = () => {
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [removingCourse, setRemovingCourse] = useState(null);


  const fetchSavedCourses = async () => {
    const token = Cookies.get("jwt_token"); // Get token from cookie
    if (!token) {
      setError("No JWT token found in cookies. Please log in.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('https://mastermind-2.onrender.com/saved-courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies with the request
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        } else if (res.status === 403) {
          throw new Error('You are not authorized to access this resource.');
        } else if (res.status === 500) {
          throw new Error('Server error. Please try again later.');
        }

        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch saved courses (${res.status})`);
      }

      const data = await res.json();
      setSavedCourses(Array.isArray(data) ? data : data.courses || []);
    } catch (err) {
      console.error('Error fetching saved courses:', err);
      setError(err.message);
      setSavedCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCourses();
  }, []); // Remove token as a dependency

  const handleRemoveCourse = async (courseId) => {
    const token = Cookies.get("jwt_token"); // Get token from cookie
    if (!token) {
      setError("No JWT token found in cookies. Please log in.");
      setRemovingCourse(null);
      return;
    }

    setRemovingCourse(courseId);
    setError(null);

    try {
      const res = await fetch('https://mastermind-2.onrender.com/saved-courses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId }),
        credentials: 'include', // Include cookies with the request
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }

        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove course');
      }

      setSavedCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));

    } catch (err) {
      console.error('Error removing course:', err);
      setError(err.message);
    } finally {
      setRemovingCourse(null);
    }
  };

  const handleEnrollNow = (course) => {
    if (course.url) {
      window.open(course.url, '_blank');
    } else {
      const searchQuery = encodeURIComponent(`${course.title} ${course.platform}`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    }
  };

  const getCourseImage = (platform, courseImage) => {
    if (courseImage && courseImage !== '') {
      return courseImage;
    }

    switch (platform?.toLowerCase()) {
      case 'coursera':
        return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop';
      case 'udemy':
        return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';
      case 'edx':
        return 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=250&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop';
    }
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'difficulty-beginner';
      case 'intermediate': return 'difficulty-intermediate';
      case 'advanced': return 'difficulty-advanced';
      default: return 'difficulty-default';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    if (typeof duration === 'string') return duration;
    return `${duration} hours`;
  };

  const formatStudentCount = (count) => {
    if (!count) return '0';
    if (typeof count === 'number') {
      return count.toLocaleString();
    }
    return count;
  };

  const handleRetry = () => {
    fetchSavedCourses();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your saved courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-courses-container">
      {/* Header */}
      <div className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-left">
              <button className="back-button">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="header-title">My Saved Courses</h1>
                <p className="header-subtitle">
                  {savedCourses.length} course{savedCourses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="header-right">
              <button
                onClick={handleRetry}
                className="refresh-button"
                title="Refresh courses"
              >
                <RefreshCw size={20} />
              </button>
              <div className="course-counter">
                <BookOpen size={20} />
                <span className="course-counter-text">{savedCourses.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <div className="error-card">
            <AlertCircle className="error-icon" size={20} />
            <div>
              <p className="error-text">{error}</p>
              <button
                onClick={handleRetry}
                className="error-retry"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="main-content">
        {savedCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-card">
              <div className="empty-icon-container">
                <Heart className="empty-icon" size={40} />
              </div>
              <h3 className="empty-title">No saved courses yet</h3>
              <p className="empty-description">
                Start exploring our course catalog and save the ones that interest you!
              </p>
            </div>
          </div>
        ) : (
          <div className="courses-grid">
            {savedCourses.map(course => (
              <div key={course._id} className="course-card">
                {/* Course Image */}
                <div className="course-image-container">
                  <img
                    src={getCourseImage(course.platform, course.image)}
                    alt={course.title}
                    className="course-image"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop';
                    }}
                  />

                  {/* Remove Button */}
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveCourse(course._id)}
                    disabled={removingCourse === course._id}
                    title="Remove from saved"
                  >
                    {removingCourse === course._id ? (
                      <div className="spinner-small"></div>
                    ) : (
                      <Heart fill="currentColor" size={18} className="heart-icon" />
                    )}
                  </button>

                  {/* Difficulty Badge */}
                  <div className={`difficulty-badge ${getDifficultyClass(course.difficulty)}`}>
                    {course.difficulty || 'Beginner'}
                  </div>
                </div>

                {/* Course Content */}
                <div className="course-content">
                  <div className="course-header">
                    <h3 className="course-title">
                      {course.title}
                    </h3>
                    <p className="course-instructor">
                      by {course.instructor || 'Unknown Instructor'}
                    </p>
                    <p className="course-platform">
                      {course.platform || 'Online Platform'}
                    </p>
                  </div>

                  <p className="course-description">
                    {course.description || 'No description available.'}
                  </p>

                  {/* Course Stats */}
                  <div className="course-stats">
                    <div className="course-stat">
                      <Clock size={14} className="stat-icon-duration" />
                      <span>{formatDuration(course.duration)}</span>
                    </div>

                    {course.rating && (
                      <div className="course-stat">
                        <Star size={14} className="stat-icon-rating" />
                        <span>{course.rating}</span>
                      </div>
                    )}

                    {course.students && (
                      <div className="course-stat">
                        <Users size={14} className="stat-icon-students" />
                        <span>{formatStudentCount(course.students)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="course-footer">
                    <div className="course-price">
                      {course.price || 'Free'}
                    </div>

                    <div className="course-actions">
                      <button
                        className="action-button-remove"
                        onClick={() => handleRemoveCourse(course._id)}
                        disabled={removingCourse === course._id}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>

                      <button
                        className="action-button-enroll"
                        onClick={() => handleEnrollNow(course)}
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCourses;