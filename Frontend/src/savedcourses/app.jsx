import React, { useState, useEffect } from 'react';
import ThreeDotsLoader from "../loader/app"; // adjust path if neede
import "../app.css"
import { Heart, Clock, Star, Users, ArrowLeft, BookOpen, Trash2 } from 'lucide-react';

const SavedCourses = () => {
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Get token from cookies (you can replace this with your cookie library)
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    setToken(getCookie('jwt_token'));
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
        const res = await fetch('https://mastermind-2.onrender.com/saved-courses', {
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
      const res = await fetch('https://mastermind-2.onrender.com/saved-courses', {
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

      setSavedCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
    } catch (err) {
      setError(err.message);
    }
  };

  const getCourseImage = (platform) => {
    switch (platform) {
      case 'Coursera':
        return 'https://assets.datamation.com/uploads/2024/04/dm_20240424-coursera-data-analytics-certifications-review.png';
      case 'Great Learning Academy':
        return 'https://yt3.googleusercontent.com/ytc/AIdro_m_o6r4liwONXrrjZ2v2ZJ_WlaYXZQF9lrOy3J_aBAWeCU=s900-c-k-c0x00ffffff-no-rj';
      case 'Google Developers':
        return 'https://developers.google.com/static/site-assets/images/home/developers-social-media.png';
      default:
        return 'https://via.placeholder.com/400x250?text=CourseImage';
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
      <div className="loading-wrapper">
         <ThreeDotsLoader />
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
    <>
      <style jsx>{`
        .saved-courses-container {
          min-height: 100vh;
          width:100vw;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .header {
          background: white;
          padding: 2rem;
          box-shadow: 0 2px 20px rgba(108, 106, 206, 0.1);
          border-bottom: 1px solid rgba(108, 106, 206, 0.1);
          margin-bottom: 2rem;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .back-button {
          background: none;
          border: none;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          color: #64748b;
          transition: all 0.3s ease;
          margin-right: 1rem;
        }

        .back-button:hover {
          background-color: #f1f5f9;
          color: #6c6ace;
          transform: translateX(-2px);
        }

        .header-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          background: linear-gradient(135deg, #6c6ace, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .course-count {
          color: #64748b;
          font-size: 1.1rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        .course-badge {
          background: linear-gradient(135deg, #6c6ace, #8b5cf6);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          box-shadow: 0 4px 20px rgba(108, 106, 206, 0.3);
        }

        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #6c6ace;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-state p, .error-state p {
          font-size: 1.2rem;
          color: #64748b;
          font-weight: 500;
        }

        .error-state p {
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 1rem 2rem;
          border-radius: 12px;
          color: #dc2626;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          background: white;
          margin: 2rem auto;
          max-width: 500px;
          padding: 3rem;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(108, 106, 206, 0.1);
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          color: #6c6ace;
          margin-bottom: 2rem;
          background: rgba(108, 106, 206, 0.1);
          padding: 20px;
          border-radius: 50%;
        }

        .empty-state h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .empty-state p {
          font-size: 1.1rem;
          color: #64748b;
          line-height: 1.6;
        }

        .saved-courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
        }

        .saved-course-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(108, 106, 206, 0.1);
          transition: all 0.4s ease;
          border: 1px solid rgba(108, 106, 206, 0.1);
        }

        .saved-course-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(108, 106, 206, 0.2);
        }

        .saved-course-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .saved-course-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .saved-course-card:hover .saved-course-image {
          transform: scale(1.05);
        }

        .heart-button {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6c6ace;
        }

        .heart-button:hover {
          background: #6c6ace;
          color: white;
          transform: scale(1.1);
        }

        .heart-button.saved {
          background: #6c6ace;
          color: white;
        }

        .level-badge {
          position: absolute;
          bottom: 16px;
          left: 16px;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
          backdrop-filter: blur(10px);
        }

        .level-beginner {
          background: rgba(34, 197, 94, 0.9);
          color: white;
        }

        .level-intermediate {
          background: rgba(251, 191, 36, 0.9);
          color: white;
        }

        .level-advanced {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }

        .saved-course-content {
          padding: 1.5rem;
        }

        .saved-course-header {
          margin-bottom: 1rem;
        }

        .saved-course-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .saved-course-instructor {
          color: #6c6ace;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .saved-course-description {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .saved-course-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .stat svg {
          color: #6c6ace;
        }

        .saved-course-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .price-text {
          font-size: 1.2rem;
          font-weight: 700;
          color: #6c6ace;
        }

        .remove-from-saved-button {
          background: #f1f5f9;
          color: #64748b;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .remove-from-saved-button:hover {
          background: #fee2e2;
          color: #dc2626;
          transform: translateY(-1px);
        }

        .enroll-button {
          background: linear-gradient(135deg, #6c6ace, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          box-shadow: 0 4px 15px rgba(108, 106, 206, 0.3);
        }

        .enroll-button:hover {
          background: linear-gradient(135deg, #5a58b8, #7c3aed);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(108, 106, 206, 0.4);
        }

        @media (max-width: 768px) {
          .saved-courses-grid {
            grid-template-columns: 1fr;
            padding: 0 1rem 2rem;
          }
          
          .header {
            padding: 1rem;
          }
          
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .header-title {
            font-size: 2rem;
          }
          
          .saved-course-footer {
            flex-direction: column;
            align-items: stretch;
          }
          
          .remove-from-saved-button,
          .enroll-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
      
      <div className="saved-courses-container">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => window.history.back()} className="back-button">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="header-title">My Saved Courses</h1>
                <p className="course-count">{savedCourses.length} courses saved</p>
              </div>
            </div>
            <div className="course-badge">
              <BookOpen size={20} />
              <span>{savedCourses.length}</span>
            </div>
          </div>
        </div>

        {savedCourses.length === 0 ? (
          <div className="empty-state">
            <Heart className="empty-icon" />
            <h3>No saved courses yet</h3>
            <p>Start exploring and save courses you're interested in!</p>
          </div>
        ) : (
          <div className="saved-courses-grid">
            {savedCourses.map(course => (
              <div key={course._id} className="saved-course-card">
                <div className="saved-course-image-container">
                  <img 
                    src={getCourseImage(course.platform)} 
                    alt={course.title} 
                    className="saved-course-image" 
                  />
                  <button 
                    className="heart-button saved"
                    onClick={() => handleRemoveCourse(course._id)}
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
                      onClick={() => handleRemoveCourse(course._id)}
                    >
                      <Trash2 size={16} />
                      Remove
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
    </>
  );
};

export default SavedCourses;