import React, { useState, useEffect } from 'react';

const DebugComponent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      console.log('Debug - Screen size:', window.innerWidth, 'Mobile:', mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <h2>Debug Information</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Screen Information:</h3>
        <p>Screen Width: {window.innerWidth}px</p>
        <p>Is Mobile: {isMobile ? 'Yes' : 'No'}</p>
        <p>User Agent: {navigator.userAgent}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>User State:</h3>
        <p>User: {user ? 'Logged in' : 'Not logged in'}</p>
        <p>Show Menu: {showUserMenu ? 'Yes' : 'No'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Buttons:</h3>
        <button
          onClick={() => {
            console.log('Set test user');
            setUser({
              username: 'TestUser',
              name: 'Test User',
              avatar: 'https://ui-avatars.com/api/?name=Test+User'
            });
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            marginRight: '10px'
          }}
        >
          Set Test User
        </button>

        <button
          onClick={() => {
            console.log('Clear user');
            setUser(null);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            marginRight: '10px'
          }}
        >
          Clear User
        </button>

        <button
          onClick={() => {
            console.log('Toggle menu');
            setShowUserMenu(!showUserMenu);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Toggle Menu
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Profile Button Test:</h3>
        {user ? (
          <button
            onClick={() => {
              console.log('Profile button clicked');
              setShowUserMenu(!showUserMenu);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              console.log('Profile button touched');
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
              WebkitTapHighlightColor: 'transparent',
              ...(isMobile && {
                border: '3px solid #ef4444',
                backgroundColor: '#fef2f2',
                padding: '12px',
                minWidth: '60px',
                minHeight: '60px'
              })
            }}
          >
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #e2e8f0'
              }}
            />
            {isMobile && (
              <span style={{
                fontSize: '12px',
                color: '#ef4444',
                fontWeight: 'bold'
              }}>
                Profile
              </span>
            )}
          </button>
        ) : (
          <p>No user logged in</p>
        )}
      </div>

      {showUserMenu && user && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          zIndex: 10000,
          border: '2px solid #ef4444'
        }}>
          <h3>User Menu (Test)</h3>
          <p>Username: {user.username}</p>
          <p>Name: {user.name}</p>
          <button
            onClick={() => setShowUserMenu(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default DebugComponent; 