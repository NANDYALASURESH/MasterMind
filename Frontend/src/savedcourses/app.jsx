import React, { useState, useEffect } from 'react';
import { Heart, Clock, Star, Users, ArrowLeft, BookOpen, Trash2, AlertCircle, RefreshCw } from 'lucide-react';

const SavedCourses = () => {
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [removingCourse, setRemovingCourse] = useState(null);

  // Get token from localStorage or cookies
  useEffect(() => {
    const getAuthToken = () => {
      // Try localStorage first
      let authToken = localStorage.getItem('jwt_token') || localStorage.getItem('authToken');
      
      // If not in localStorage, try cookies
      if (!authToken) {
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
        };
        authToken = getCookie('jwt_token') || getCookie('authToken');
      }
      
      return authToken;
    };
    
    setToken(getAuthToken());
  }, []);

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
    if (token) {
      fetchSavedCourses();
    }
  }, [token]);

  const handleRemoveCourse = async (courseId) => {
    if (!token) {
      setError("You are not authorized to perform this action. Please log in.");
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

      // Remove the course from state
      setSavedCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
      
      // Show success message briefly
      const successMsg = "Course removed successfully!";
      setError(null);
      
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
      // Fallback search based on course title and platform
      const searchQuery = encodeURIComponent(`${course.title} ${course.platform}`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    }
  };

  const getCourseImage = (platform, courseImage) => {
    // Use course-specific image if available
    if (courseImage && courseImage !== '') {
      return courseImage;
    }
    
    // Platform-specific fallback images
    switch (platform?.toLowerCase()) {
      case 'coursera':
        return 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/fb/e9e8b045b011e682d816c345ce55dd/shutterstock_226881610.jpg';
      case 'great learning academy':
        return 'https://www.mygreatlearning.com/static/media/gl-logo-white.6c9c3578.svg';
      case 'google developers':
        return 'https://developers.google.com/static/site-assets/images/home/developers-social-media.png';
      case 'udemy':
        return 'https://img-c.udemycdn.com/course/750x422/placeholder.jpg';
      case 'edx':
        return 'https://www.edx.org/images/logos/edx-logo-elm.svg';
      default:
        return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&crop=center';
    }
  };

  const getLevelColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-blue-500';
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your saved courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()} 
                className="p-2 rounded-xl bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Saved Courses
                </h1>
                <p className="text-gray-600 mt-1">
                  {savedCourses.length} course{savedCourses.length !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRetry}
                className="p-2 rounded-xl bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 transition-all duration-300"
                title="Refresh courses"
              >
                <RefreshCw size={20} />
              </button>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg">
                <BookOpen size={20} />
                <span className="font-semibold">{savedCourses.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <button 
                onClick={handleRetry}
                className="text-red-600 underline text-sm mt-1 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="bg-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Heart className="text-indigo-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No saved courses yet</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Start exploring our course catalog and save the ones that interest you!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedCourses.map(course => (
              <div key={course._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group">
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={getCourseImage(course.platform, course.image)} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&crop=center';
                    }}
                  />
                  
                  {/* Remove Button */}
                  <button 
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-red-500 hover:text-white group shadow-lg ${
                      removingCourse === course._id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handleRemoveCourse(course._id)}
                    disabled={removingCourse === course._id}
                    title="Remove from saved"
                  >
                    {removingCourse === course._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                    ) : (
                      <Heart fill="currentColor" size={18} className="text-red-500 group-hover:text-white" />
                    )}
                  </button>

                  {/* Difficulty Badge */}
                  <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-white text-sm font-semibold ${getLevelColor(course.difficulty)} shadow-lg`}>
                    {course.difficulty || 'Beginner'}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-indigo-600 font-semibold text-sm">
                      by {course.instructor || 'Unknown Instructor'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.platform || 'Online Platform'}
                    </p>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description || 'No description available.'}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} className="text-indigo-500" />
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                    
                    {course.rating && (
                      <div className="flex items-center space-x-1">
                        <Star size={14} className="text-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                    )}
                    
                    {course.students && (
                      <div className="flex items-center space-x-1">
                        <Users size={14} className="text-green-500" />
                        <span>{formatStudentCount(course.students)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-lg font-bold text-indigo-600">
                      {course.price || 'Free'}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-300 flex items-center space-x-1"
                        onClick={() => handleRemoveCourse(course._id)}
                        disabled={removingCourse === course._id}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                      
                      <button 
                        className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
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