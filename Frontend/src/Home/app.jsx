import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Search, Filter, X, Clock, Star, DollarSign, BookOpen, Users, User, LogOut, Settings, Heart, Award, ChevronDown, Bell, Menu } from 'lucide-react';

const LearningPlatform = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [uniquePlatforms, setUniquePlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [user, setUser] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [notificationList] = useState([
    { id: 1, text: "🎉 New course 'React Mastery' added!", time: "2h ago" },
    { id: 2, text: "⭐ You earned a certificate for 'Python Basics'", time: "1d ago" },
    { id: 3, text: "🔔 Reminder: Complete 'Data Science 101'", time: "3d ago" }
  ]);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  const [filters, setFilters] = useState({
    platform: '',
    priceType: '',
    level: '',
    duration: '',
    rating: '',
  });
  const [savedCourses, setSavedCourses] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get('jwt_token');
      if (!token) return;

      try {
        const res = await fetch('https://mastermind-2.onrender.com/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };

    fetchProfile();
  }, []);

  // Track screen size for mobile responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      console.log('Screen size changed:', window.innerWidth, 'Mobile:', mobile);
    };

    // Set initial value
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://mastermind-2.onrender.com/courses');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        // Backend returns an array directly
        const coursesArr = Array.isArray(data) ? data : [];
        setCourses(coursesArr);
        setFilteredCourses(coursesArr);
        // Extract unique platforms from fetched data
        const platforms = Array.from(new Set(coursesArr.map(c => c.platform))).filter(Boolean);
        setUniquePlatforms(platforms);
      } catch (err) {
        setCourses([]);
        setFilteredCourses([]);
        setUniquePlatforms([]);
        setError('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchSavedCourses = async () => {
      const token = Cookies.get('jwt_token');
      if (!token) return;
      try {
        const res = await fetch('https://mastermind-2.onrender.com/saved-courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSavedCourses(data.map(course => course._id)); // store only course IDs
        }
      } catch (err) {
        setSavedCourses([]);
      }
    };
    fetchSavedCourses();
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close notifications popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    let filtered = [...courses];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((course) => {
        const titleMatch = course.title?.toLowerCase().includes(query);
        const instructorMatch = course.instructor?.toLowerCase().includes(query);
        const categoryMatch = course.category && Array.isArray(course.category)
          ? course.category.some(cat => cat.toLowerCase().includes(query))
          : course.category?.toLowerCase().includes(query);
        return titleMatch || instructorMatch || categoryMatch;
      });
    }

    if (filters.platform) {
      filtered = filtered.filter(course => course.platform === filters.platform);
    }

    if (filters.priceType === 'free') {
      filtered = filtered.filter(course => course.price === 'Free');
    } else if (filters.priceType === 'paid') {
      filtered = filtered.filter(course => course.price === 'Paid');
    }

    if (filters.level) {
      filtered = filtered.filter(course => course.difficulty === filters.level);
    }

    if (filters.duration) {
      filtered = filtered.filter(course => {
        const hours = parseInt(course.duration);
        switch (filters.duration) {
          case 'short': return hours <= 10;
          case 'medium': return hours > 10 && hours <= 50;
          case 'long': return hours > 50;
          default: return true;
        }
      });
    }

    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(course => parseFloat(course.rating) >= minRating);
    }

    setFilteredCourses(filtered);
  }, [courses, searchQuery, filters]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const clearFilters = () => {
    setFilters({
      platform: '',
      priceType: '',
      level: '',
      duration: '',
      rating: '',
    });
    setSearchQuery('');
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(val => val !== '').length + (searchQuery ? 1 : 0);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'Coursera': 'bg-blue-100 text-blue-800',
      'edX': 'bg-purple-100 text-purple-800',
      'Udemy': 'bg-orange-100 text-orange-800',
      'LinkedIn Learning': 'bg-cyan-100 text-cyan-800',
      'Figma Academy': 'bg-pink-100 text-pink-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  const handleLogout = () => {
      Cookies.remove('jwt_token');
      navigate('/login');
  };

  // Toggle save/unsave course
  const handleSaveCourse = async (courseId) => {
    const token = Cookies.get('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (savedCourses.includes(courseId)) {
      // Unsave (DELETE)
      try {
        const res = await fetch('https://mastermind-2.onrender.com/saved-courses', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ course_id: courseId }),
        });
        if (res.ok) {
          setSavedCourses(prev => prev.filter(id => id !== courseId));
        } else {
          // Optionally show an error message
          const data = await res.json();
          console.error('Failed to unsave course:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Network error while unsaving course:', err);
      }
    } else {
      // Save (POST)
      try {
        const res = await fetch('https://mastermind-2.onrender.com/saved-courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ course_id: courseId }),
        });
        if (res.ok) {
          setSavedCourses(prev => [...prev, courseId]);
        } else {
          // Optionally show an error message
          const data = await res.json();
          console.error('Failed to save course:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Network error while saving course:', err);
      }
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

  // Reset visibleCount when filters or search change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, filters, filteredCourses.length]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        width:"100vw",
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Loading courses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        width: "100vw",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <p style={{ color: '#ef4444', fontSize: '18px', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
        width:"100vw",

      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '16px 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={20} color="white" />
              </div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                '@media (max-width: 768px)': {
                  fontSize: '20px'
                }
              }} className="brand-title">
                MasterMind {isMobile && '(Mobile)'}
              </h1>
            </div>

            {/* Search Bar */}
            <div style={{
              flex: 1,
              maxWidth: '500px',
              position: 'relative',
              minWidth: '200px',
              '@media (max-width: 768px)': {
                order: 3,
                flex: '1 1 100%',
                maxWidth: 'none',
                marginTop: '16px'
              }
            }} className="search-container">
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    color: '#9ca3af',
                    zIndex: 10
                  }}
                />
                <input
                  type="text"
                  placeholder="Search courses, topics, or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    '@media (max-width: 768px)': {
                      fontSize: '14px',
                      padding: '12px 16px 12px 44px'
                    }
                  }}
                  className="search-input"
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Right Section */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              flexShrink: 0,
              '@media (max-width: 768px)': {
                gap: '12px'
              }
            }} className="right-section">
              {/* Notifications */}
              <div style={{ position: 'relative' }} ref={notificationRef}>
                <button style={{
                  position: 'relative',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#f1f5f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setShowNotifications((v) => !v)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                >
                  <Bell size={20} color="#64748b" />
                  {notifications > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '18px',
                      height: '18px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {notifications}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    minWidth: '320px',
                    background: 'rgba(255,255,255,0.98)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid #e2e8f0',
                    zIndex: 100,
                    padding: '0',
                    overflow: 'hidden'
                  }}>

                    <div style={{ maxHeight: '260px', overflowY: 'auto', background: 'white' }}>
                      {notificationList.length === 0 ? (
                        <div style={{ padding: '24px', color: '#64748b', textAlign: 'center' }}>
                          No notifications
                        </div>
                      ) : (
                        notificationList.map(n => (
                          <div key={n.id} style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '15px',
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>{n.text}</span>
                            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '12px', whiteSpace: 'nowrap' }}>{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: showFilters ? '#667eea' : '#f1f5f9',
                  color: showFilters ? 'white' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <Filter size={16} />
                <span>Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span style={{
                    backgroundColor: showFilters ? 'rgba(255,255,255,0.2)' : '#ef4444',
                    color: showFilters ? 'white' : 'white',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* User Profile Dropdown */}
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                {user ? (
                  <button
                    onClick={() => {
                      console.log('Profile button clicked, current state:', showUserMenu, 'Mobile:', isMobile);
                      setShowUserMenu(!showUserMenu);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      console.log('Profile button touched, current state:', showUserMenu, 'Mobile:', isMobile);
                      setShowUserMenu(!showUserMenu);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: showUserMenu ? '#f1f5f9' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    <img
                      src={user.avatar || "https://ui-avatars.com/api/?name=" + (user.username || "U")}
                      alt={user.name || user.username || "User"}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #e2e8f0'
                      }}
                    />
                    <ChevronDown
                      size={16}
                      color="#64748b"
                      style={{
                        transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </button>
                ) : (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={20} color="#64748b" />
                  </div>
                )}

                {/* User Dropdown Menu */}
                {showUserMenu && user && (
                  <>
                    {/* Mobile Backdrop Overlay */}
                    {isMobile && (
                      <div 
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          zIndex: 9999
                        }} 
                        onClick={() => setShowUserMenu(false)}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          setShowUserMenu(false);
                        }}
                      />
                    )}
                    <div style={{
                      position: isMobile ? 'fixed' : 'absolute',
                      top: isMobile ? 'auto' : '100%',
                      bottom: isMobile ? '20px' : 'auto',
                      left: isMobile ? '20px' : 'auto',
                      right: isMobile ? '20px' : 0,
                      marginTop: isMobile ? '0' : '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      boxShadow: isMobile ? '0 25px 50px rgba(0, 0, 0, 0.25)' : '0 25px 50px rgba(0, 0, 0, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      minWidth: isMobile ? 'auto' : '280px',
                      maxWidth: isMobile ? 'none' : '320px',
                      width: isMobile ? 'calc(100vw - 40px)' : 'auto',
                      zIndex: 10000,
                      overflow: 'hidden',
                      transform: 'translateZ(0)'
                    }} className="user-dropdown">
                    {/* User Info Header */}
                    <div style={{
                      padding: '20px',
                      borderBottom: '1px solid #e2e8f0',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={user.avatar || "https://ui-avatars.com/api/?name=" + (user.username || "U")}
                          alt={user.name || user.username || "User"}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #e2e8f0'
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontWeight: 700, 
                            fontSize: '14px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {user.name || user.username || "User"}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#e0e7ef',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {user.email || ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '16px', 
                        textAlign: 'center',
                        '@media (max-width: 480px)': {
                          gridTemplateColumns: '1fr 1fr',
                          gap: '12px'
                        }
                      }} className="user-stats">
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                            {user.completedCourses || 0}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Completed</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                            {user.savedCourses || 0}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Saved</div>
                        </div>
                        <div style={{
                          '@media (max-width: 480px)': {
                            gridColumn: '1 / -1'
                          }
                        }} className="learning-hours">
                          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                            {user.totalHours || 0}h
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Learning</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ padding: '8px 0' }}>
                      {[
                        { icon: User, label: 'Profile', color: '#64748b' },
                        {
                          icon: Heart,
                          label: 'Saved Courses',
                          color: '#ef4444',
                          isSaved: savedCourses.length > 0
                        },
                        { icon: Award, label: 'Certificates', color: '#f59e0b' },
                        { icon: Settings, label: 'Settings', color: '#64748b' }
                      ].map((item, index) => (
                        <button
                          key={index}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 20px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left'
                          }}
                          onClick={() => {
                            if (item.label === 'Saved Courses') {
                              navigate('/saved-courses');
                            } else if (item.label === 'Profile') {
                              // Navigate to profile page or show profile modal
                              console.log('Profile clicked');
                              // You can add navigation to a profile page here
                            } else if (item.label === 'Settings') {
                              // Navigate to settings page or show settings modal
                              console.log('Settings clicked');
                              // You can add navigation to a settings page here
                            } else if (item.label === 'Certificates') {
                              // Navigate to certificates page
                              console.log('Certificates clicked');
                              // You can add navigation to a certificates page here
                            }
                            setShowUserMenu(false); // Close menu after click
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            if (item.label === 'Saved Courses') {
                              navigate('/saved-courses');
                            } else if (item.label === 'Profile') {
                              console.log('Profile clicked');
                            } else if (item.label === 'Settings') {
                              console.log('Settings clicked');
                            } else if (item.label === 'Certificates') {
                              console.log('Certificates clicked');
                            }
                            setShowUserMenu(false);
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          {item.label === 'Saved Courses' ? (
                            <Heart
                              size={16}
                              color="#ef4444"
                              fill={savedCourses.length > 0 ? "#ef4444" : "none"}
                              style={{ transition: 'all 0.2s' }}
                            />
                          ) : (
                            <item.icon size={16} color={item.color} />
                          )}
                          {item.label}
                        </button>
                      ))}

                      <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />

                      <button
                        onClick={handleLogout}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handleLogout();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 20px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'left',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              alignItems: 'end'
            }}>
              {[
                {
                  key: 'platform',
                  label: 'Platform',
                  options: [{ value: '', label: 'All Platforms' }, ...uniquePlatforms.map(p => ({ value: p, label: p }))]
                },
                {
                  key: 'priceType',
                  label: 'Price',
                  options: [
                    { value: '', label: 'All Prices' },
                    { value: 'free', label: 'Free' },
                    { value: 'paid', label: 'Paid' }
                  ]
                },
                {
                  key: 'level',
                  label: 'Level',
                  options: [
                    { value: '', label: 'All Levels' },
                    { value: 'Beginner', label: 'Beginner' },
                    { value: 'Intermediate', label: 'Intermediate' },
                    { value: 'Advanced', label: 'Advanced' }
                  ]
                },
                {
                  key: 'duration',
                  label: 'Duration',
                  options: [
                    { value: '', label: 'All Durations' },
                    { value: 'short', label: 'Short (≤ 10 hrs)' },
                    { value: 'medium', label: 'Medium (10–50 hrs)' },
                    { value: 'long', label: 'Long (> 50 hrs)' }
                  ]
                },
                {
                  key: 'rating',
                  label: 'Rating',
                  options: [
                    { value: '', label: 'All Ratings' },
                    { value: '4.5', label: '4.5+ Stars' },
                    { value: '4.6', label: '4.6+ Stars' },
                    { value: '4.7', label: '4.7+ Stars' },
                    { value: '4.8', label: '4.8+ Stars' },
                    { value: '4.9', label: '4.9+ Stars' }
                  ]
                }
              ].map((filter) => (
                <div key={filter.key}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    {filter.label}
                  </label>
                  <select
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    value={filters[filter.key]}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#1e293b',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <button
                onClick={clearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '48px'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#ef4444';
                  e.target.style.color = '#ef4444';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.color = '#64748b';
                }}
              >
                <X size={16} />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0
          }}>
            {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Found
          </h2>
        </div>

        {filteredCourses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#f1f5f9',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Search size={32} color="#64748b" />
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 8px 0'
            }}>
              No courses found
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              margin: 0
            }}>
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '24px',
              '@media (max-width: 1200px)': {
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              },
              '@media (max-width: 768px)': {
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              },
              '@media (max-width: 480px)': {
                gridTemplateColumns: '1fr',
                gap: '16px'
              }
            }} className="courses-grid">
              {filteredCourses.slice(0, visibleCount).map(course => (
                <div key={course._id} style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
                >
                  {/* Course Image */}
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                      src={getCourseImage(course.platform)}
                      alt={course.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Platform Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#1e293b'
                      }}>
                        {course.platform}
                      </span>
                    </div>
                    {/* Difficulty Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '6px',
                        ...(() => {
                          switch (course.difficulty) {
                            case 'Beginner': return { backgroundColor: 'rgba(34, 197, 94, 0.9)', color: 'white' };
                            case 'Intermediate': return { backgroundColor: 'rgba(251, 191, 36, 0.9)', color: 'white' };
                            case 'Advanced': return { backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white' };
                            default: return { backgroundColor: 'rgba(107, 114, 128, 0.9)', color: 'white' };
                          }
                        })()
                      }}>
                        {course.difficulty}
                      </span>
                    </div>
                    {/* Save Button */}
                    <button
  onClick={(e) => {
    e.stopPropagation();
    handleSaveCourse(course._id);
  }}
  aria-label={savedCourses.includes(course._id) ? "Unsave course" : "Save course"}
                      style={{outline:"none",color:"black", position: 'absolute', top: '44px', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer'}}
>
  <Heart
    size={22}
    color={savedCourses.includes(course._id) ? "#ef4444" : "#64748b"}
    fill={savedCourses.includes(course._id) ? "#ef4444" : "none"}
    style={{ transition: 'color 0.5s ease' }}
  />
</button>


                  </div>

                  {/* Course Content */}
                  <div style={{ 
                    padding: '24px',
                    '@media (max-width: 768px)': {
                      padding: '20px'
                    },
                    '@media (max-width: 480px)': {
                      padding: '16px'
                    }
                  }} className="course-content">
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: '0 0 8px 0',
                      lineHeight: '1.4',
                      height: '50px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      '@media (max-width: 768px)': {
                        fontSize: '16px',
                        height: '44px'
                      },
                      '@media (max-width: 480px)': {
                        fontSize: '15px',
                        height: '40px'
                      }
                    }} className="course-title">
                      {course.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: 0,
                        '@media (max-width: 480px)': {
                          fontSize: '13px'
                        }
                      }}>
                        by {course.instructor}
                      </p>
                      
                    </div>
                    {/* Course Meta */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '20px',
                      fontSize: '14px',
                      color: '#64748b',
                      '@media (max-width: 768px)': {
                        gap: '12px',
                        fontSize: '13px'
                      },
                      '@media (max-width: 480px)': {
                        gap: '8px',
                        fontSize: '12px',
                        flexWrap: 'wrap'
                      }
                    }} className="course-meta">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={16} />
                        <span>{course.duration}h</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={16} color="#f59e0b" fill="#f59e0b" />
                        <span>{course.rating}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={16} />
                        <span>{course.students}</span>
                      </div>
                    </div>

                    {/* Course Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: course.price === 'Free' ? '#22c55e' : '#667eea'
                      }}>
                        <DollarSign size={16} />
                        <span>{course.price === 'Free' ? 'Free' : 'Paid'}</span>
                      </div>
                      
                      <button 
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          border: 'none',
                          borderRadius: '8px',
                          background: course.link ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#cbd5e1',
                          color: course.link ? 'white' : '#64748b',
                          cursor: course.link ? 'pointer' : 'not-allowed',
                          opacity: course.link ? 1 : 0.6,
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => course.link && window.open(course.link, '_blank', 'noopener noreferrer')}
                        disabled={!course.link}
                        aria-label={course.link ? `Enroll in ${course.title}` : 'No enrollment link available'}
                        onMouseOver={e => {
                          if (course.link) {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                          }
                        }}
                        onMouseOut={e => {
                          if (course.link) {
                            e.currentTarget.style.transform = 'translateY(0px)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {course.link ? 'Enroll Now' : 'No Link'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {visibleCount < filteredCourses.length && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                <button
                  onClick={() => setVisibleCount(v => v + 10)}
                  disabled={loading}
                  aria-label="Show more courses"
                  style={{
                    padding: '12px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '8px',
                    background: loading
                      ? 'linear-gradient(135deg, #cbd5e1 0%, #e5e7eb 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: loading ? ' #64748b' : 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseOut={e => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.2)';
                    }
                  }}
                >
                  {loading ? 'Loading...' : 'Show More'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button for Mobile Filters */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 40
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.6)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
        }}
      >
        <Filter size={24} />
        {getActiveFiltersCount() > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '20px',
            height: '20px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            fontSize: '12px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {getActiveFiltersCount()}
          </span>
        )}
      </button>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Mobile touch improvements */
        @media (max-width: 768px) {
          * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          
          button {
            -webkit-tap-highlight-color: transparent;
          }
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .courses-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
            gap: 20px !important;
          }
        }
        
        @media (max-width: 768px) {
          .courses-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            gap: 16px !important;
          }
          
          .filters-grid {
            grid-template-columns: 1fr !important;
          }
          
          .header-content {
            flex-direction: column !important;
            gap: 16px !important;
          }
          
          .search-container {
            order: 3 !important;
            width: 100% !important;
            margin-top: 16px !important;
          }
          
          .right-section {
            order: 2 !important;
            width: 100% !important;
            justify-content: space-between !important;
            gap: 12px !important;
          }
          
          .brand-title {
            font-size: 20px !important;
          }
          
          .search-input {
            font-size: 14px !important;
            padding: 12px 16px 12px 44px !important;
          }
          
          .course-content {
            padding: 20px !important;
          }
          
          .course-title {
            font-size: 16px !important;
            height: 44px !important;
          }
          
          .course-meta {
            gap: 12px !important;
            font-size: 13px !important;
          }
          

          
          .user-stats {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          
          .user-stats .learning-hours {
            grid-column: 1 / -1 !important;
          }
        }
        
        @media (max-width: 480px) {
          .courses-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .course-content {
            padding: 16px !important;
          }
          
          .course-title {
            font-size: 15px !important;
            height: 40px !important;
          }
          
          .course-instructor {
            font-size: 13px !important;
          }
          
          .course-meta {
            gap: 8px !important;
            font-size: 12px !important;
            flex-wrap: wrap !important;
          }
          
          .right-section {
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LearningPlatform;