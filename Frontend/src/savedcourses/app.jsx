// SavedCourses.jsx
import React, { useState, useEffect } from 'react';
import { Heart, Clock, Star, Users, ArrowLeft, BookOpen, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import './app.css';

const SavedCourses = () => {
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || ''); // Initialize token from localStorage
  const [removingCourse, setRemovingCourse] = useState(null);

  // Demo data for testing the UI
  // const demoData = [
  //   {
  //     _id: '1',
  //     title: 'Complete React Developer Course',
  //     instructor: 'John Smith',
  //     platform: 'Udemy',
  //     description: 'Master React from basics to advanced concepts including hooks, context, and testing.',
  //     difficulty: 'intermediate',
  //     duration: '40 hours',
  //     rating: '4.8',
  //     students: '150,000',
  //     price: '$89.99',
  //     url: 'https://example.com/react-course',
  //     image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'
  //   },
  //   {
  //     _id: '2',
  //     title: 'Python for Data Science',
  //     instructor: 'Dr. Sarah Johnson',
  //     platform: 'Coursera',
  //     description: 'Learn Python programming for data analysis, visualization, and machine learning.',
  //     difficulty: 'beginner',
  //     duration: '25 hours',
  //     rating: '4.6',
  //     students: '75,000',
  //     price: 'Free',
  //     url: 'https://example.com/python-course',
  //     image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop'
  //   },
  //   {
  //     _id: '3',
  //     title: 'Advanced JavaScript Concepts',
  //     instructor: 'Mike Chen',
  //     platform: 'edX',
  //     description: 'Deep dive into advanced JavaScript topics including closures, prototypes, and async programming.',
  //     difficulty: 'advanced',
  //     duration: '30 hours',
  //     rating: '4.9',
  //     students: '45,000',
  //     price: '$129.99',
  //     url: 'https://example.com/js-course',
  //     image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop'
  //   },
  //   {
  //     _id: '4',
  //     title: 'Machine Learning Fundamentals',
  //     instructor: 'Dr. Emily Wang',
  //     platform: 'Coursera',
  //     description: 'Introduction to machine learning algorithms and practical applications.',
  //     difficulty: 'intermediate',
  //     duration: '35 hours',
  //     rating: '4.7',
  //     students: '92,000',
  //     price: '$79.99',
  //     url: 'https://example.com/ml-course',
  //     image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop'
  //   },
  //   {
  //     _id: '5',
  //     title: 'Web Design Masterclass',
  //     instructor: 'Alex Rodriguez',
  //     platform: 'Udemy',
  //     description: 'Complete guide to modern web design principles and best practices.',
  //     difficulty: 'beginner',
  //     duration: '20 hours',
  //     rating: '4.5',
  //     students: '38,000',
  //     price: 'Free',
  //     url: 'https://example.com/design-course',
  //     image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop'
  // }];

  const fetchSavedCourses = async () => {
    if (!token) {
      setLoading(false);
      setError('Please enter your JWT token to connect to the backend.');
      setSavedCourses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('https://mastermind-2.onrender.com/saved-courses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
  }, [token]); // Add token as a dependency

  const handleRemoveCourse = async (courseId) => {
    if (!token) {
      setError('Please connect to the backend to remove courses.');
      return;
    }

    setRemovingCourse(courseId);
    setError(null);

    try {
      const res = await fetch('https://mastermind-2.onrender.com/saved-courses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: courseId }),
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

  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };

  const handleConnectBackend = () => {
    if (token) {
      localStorage.setItem('token', token); // Save token to localStorage
      fetchSavedCourses();
    }
  };

  const handleClearToken = () => {
    setToken('');
    localStorage.removeItem('token'); // Remove token from localStorage
    setSavedCourses([]);
    setError(null);
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

      {/* Backend Connection Panel */}
      <div className="connection-panel">
        <div className="connection-card">
          <h3 className="connection-title">Backend Connection</h3>
          <div className="connection-form">
            <input
              type="text"
              placeholder="Enter your JWT token to connect to backend"
              value={token}
              onChange={handleTokenChange}
              className="token-input"
            />
            <button
              onClick={handleConnectBackend}
              className="connect-button"
              disabled={!token}
            >
              Connect
            </button>
            <button
              onClick={handleClearToken}
              className="connect-button"
            >
              Clear Token
            </button>
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