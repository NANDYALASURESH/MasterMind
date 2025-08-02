import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './app.css';
import { Heart, Clock, Star, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SavedCourses = () => {
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setToken(Cookies.get('jwt_token'));
  }, []);

  useEffect(() => {
    const fetchSavedCourses = async () => {
      if (!token) {
        setLoading(false);
        setError("Please log in to view your saved courses.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:3000/saved-courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch saved courses');
        }

        const data = await res.json();
        setSavedCourses(data);
      } catch (err) {
        setError(err.message);
        setSavedCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSavedCourses();
    }
  }, [token]);

  const handleRemoveCourse = async (courseId) => {
    if (!token) {
      setError("You are not authorized to perform this action. Please log in.");
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/saved-courses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: courseId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to remove course');
      }

      setSavedCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to get image based on platform
  const getCourseImage = (platform) => {
    switch (platform) {
      case 'Coursera':
        return 'https://assets.datamation.com/uploads/2024/04/dm_20240424-coursera-data-analytics-certifications-review.png';
      case 'Great Learning Academy':
        return 'https://yt3.googleusercontent.com/ytc/AIdro_m_o6r4liwONXrrjZ2v2ZJ_WlaYXZQF9lrOy3J_aBAWeCU=s900-c-k-c0x00ffffff-no-rj';
      case 'Google Developers':
        return 'https://developers.google.com/static/site-assets/images/home/developers-social-media.png';
      default:
        return 'https://via.placeholder.com/400x250?text=CourseImage'; // Default placeholder
    }
  };

  const getLevelColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'level-beginner';
      case 'intermediate': return 'level-intermediate';
      case 'advanced': return 'level-advanced';
      default: return 'level-beginner';
    }
  };

  if (loading) {
    return (
      <div className="saved-courses-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your saved courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-courses-container">
        <div className="error-state">
          <p>❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-courses-container">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <h1 className='text-2xl font-bold ml-4'>My Saved Courses</h1>
        <p className="course-count">{savedCourses.length} courses saved</p>
      </div>

      {savedCourses.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} className="empty-icon" />
          <h3>No saved courses yet</h3>
          <p>Start exploring and save courses you're interested in!</p>
        </div>
      ) : (
        <div className="saved-courses-grid">
          {savedCourses.map(course => (
            <div key={course.id} className="saved-course-card">
              <div className="saved-course-image-container">
                <img 
                  src={getCourseImage(course.platform)} 
                  alt={course.title} 
                  className="saved-course-image" 
                />
                <button 
                  className="heart-button saved"
                  onClick={() => handleRemoveCourse(course.id)}
                  title="Remove from saved"
                >
                  <Heart fill="currentColor" size={20} />
                </button>
                <span className={`level-badge ${getLevelColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>

              <div className="saved-course-content">
                <div className="saved-course-header">
                  <h3 className="saved-course-title">{course.title}</h3>
                  <p className="saved-course-instructor">by {course.instructor}</p>
                </div>

                <p className="saved-course-description">{course.description}</p>

                <div className="saved-course-stats">
                  <div className="stat">
                    <Clock size={14} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="stat">
                    <Star size={14} />
                    <span>{course.rating}</span>
                  </div>
                  <div className="stat">
                    <Users size={14} />
                    <span>{course.students?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="saved-course-footer">
                  <div className="price">
                    <span className="price-text">{course.price}</span>
                  </div>
                  <button 
                    className="remove-from-saved-button"
                    onClick={() => handleRemoveCourse(course.id)}
                  >
                    Remove from Saved
                  </button>
                  <button className="enroll-button">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCourses;