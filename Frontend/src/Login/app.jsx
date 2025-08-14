import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
  });
  const [otpData, setOtpData] = useState({
    otpKey: '', 
    otp: ['', '', '', '', '', ''],
    timeLeft: 300, // 5 minutes in seconds
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const otpInputRefs = useRef([]);
  const navigate = useNavigate();

  // Timer for OTP expiration
  useEffect(() => {
    let timer;
    if (showOTPScreen && otpData.timeLeft > 0) {
      timer = setInterval(() => {
        setOtpData(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOTPScreen, otpData.timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError('');
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otpData.otp];
    newOtp[index] = value;
    
    setOtpData(prev => ({
      ...prev,
      otp: newOtp
    }));

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (error) setError('');
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpData.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = Array(6).fill('');
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtpData(prev => ({
      ...prev,
      otp: newOtp
    }));
  };

  const onSubmitSuccess = (jwtToken) => {
    Cookies.set('jwt_token', jwtToken, { expires: rememberMe ? 30 : 1 });
    navigate('/home', { replace: true });
  };

  const validateForm = () => {
    const { username, email, password, name } = formData;
    
    if (!username.trim()) return "Username is required";
    if (!password.trim()) return "Password is required";
    
    if (!isLogin) {
      if (!email.trim()) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email";
      if (!name.trim()) return "Full name is required";
      if (password.length < 6) return "Password must be at least 6 characters";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await axios.post(
          'https://mastermind-2.onrender.com/login',
          { 
            username: formData.username, 
            password: formData.password 
          },
          { withCredentials: true }
        );
        
        if (res.data.success && res.data.requiresOTP) {
          setOtpData(prev => ({
            ...prev,
            otpKey: res.data.otpKey,
            timeLeft: 300,
            otp: ['', '', '', '', '', '']
          }));
          setShowOTPScreen(true);
        }else {
          setError(res.data.message || 'Login failed');
        }
      } else {
        const response = await axios.post('https://mastermind-2.onrender.com/users', {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        
        alert(response.data.message || 'Signup successful! Please login.');
        
        setFormData({
          username: '',
          email: '',
          password: '',
          name: '',
        });
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 
        (isLogin ? 'Login failed. Please check your credentials.' : 'Signup failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    const otpString = otpData.otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('https://mastermind-2.onrender.com/verify-otp', {
        otpKey: otpData.otpKey,
        otp: otpString
      });

      if (res.data.success) {
        onSubmitSuccess(res.data.jwtToken);
      } else {
        setError(res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('https://mastermind-2.onrender.com/resend-otp', {
        otpKey: otpData.otpKey
      });

      if (res.data.success) {
        setOtpData(prev => ({
          ...prev,
          timeLeft: 300,
          otp: ['', '', '', '', '', '']
        }));
        setResendCooldown(30); // 30 second cooldown
        otpInputRefs.current[0]?.focus();
      } else {
        setError(res.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowOTPScreen(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goBackToLogin = () => {
    setShowOTPScreen(false);
    setError('');
    setOtpData(prev => ({
      ...prev,
      otp: ['', '', '', '', '', ''],
      timeLeft: 300
    }));
  };

  const handleMenuClick = (label) => {
    if (label === 'Profile') {
      navigate('/profile');
    } else if (label === 'Saved Courses') {
      navigate('/saved-courses');
    }
    // Add more as needed
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {!showOTPScreen ? (
          <>
            {/* Header */}
            <div className="header">
              <h1 className="title">MasterMind</h1>
              <h2 className="subtitle">
                {isLogin ? 'Welcome back! Sign in to continue' : 'Join us today and start learning'}
              </h2>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                onClick={() => switchMode()}
                type="button"
                className={`tab ${isLogin ? 'active' : ''}`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode()}
                type="button"
                className={`tab ${!isLogin ? 'active' : ''}`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="form">
              {/* Username */}
              <div className="input-group">
                <label className="label">Username</label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="yourusername"
                  disabled={isLoading}
                  className="input"
                />
              </div>

              {/* Signup Fields */}
              {!isLogin && (
                <>
                  <div className="input-group">
                    <label className="label">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className="input"
                    />
                  </div>

                  <div className="input-group">
                    <label className="label">Full Name</label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      disabled={isLoading}
                      className="input"
                    />
                  </div>
                </>
              )}

              {/* Password */}
              <div className="input-group password-group">
                <label className="label">Password</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                  disabled={isLoading}
                  className="input password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>

              {/* Login Extras */}
              {isLogin && (
                <div className="login-extras">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      disabled={isLoading}
                      className="checkbox"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
              >
                {isLoading && <div className="spinner" />}
                {isLoading 
                  ? `${isLogin ? 'Signing In...' : 'Signing Up...'}`
                  : `${isLogin ? 'Sign In' : 'Sign Up'}`
                }
              </button>
            </form>
          </>
        ) : (
          /* OTP Screen */
          <div className="otp-screen">
            <div className="otp-header">
              <button onClick={goBackToLogin} className="back-btn">
                ← Back
              </button>
              <h1 className="otp-title">Enter Verification Code</h1>
              <p className="otp-subtitle">
                We've sent a 6-digit code to your email. Enter it below to complete your login.
              </p>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="otp-container">
              <div className="otp-inputs" onPaste={handleOTPPaste}>
                {otpData.otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => otpInputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    className="otp-input"
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="otp-timer">
                {otpData.timeLeft > 0 ? (
                  <>
                    <span className="timer-icon">⏱️</span>
                    Code expires in {formatTime(otpData.timeLeft)}
                  </>
                ) : (
                  <span className="expired">Code has expired</span>
                )}
              </div>

              <div className="otp-actions">
                <button
                  onClick={handleOTPSubmit}
                  disabled={isLoading || otpData.otp.join('').length !== 6}
                  className={`otp-verify-btn ${isLoading ? 'loading' : ''}`}
                >
                  {isLoading && <div className="spinner" />}
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isLoading}
                  className="resend-btn"
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Code'
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .login-card {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
          margin: 0;
        }

        .tabs {
          display: flex;
          background-color: #f1f5f9;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 32px;
          position: relative;
        }

        .tab {
          flex: 1;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          z-index: 2;
          background: transparent;
          color: #64748b;
        }

        .tab.active {
          background-color: #ffffff;
          color: #1e293b;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .error-message {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
        }

        .error-icon {
          margin-right: 8px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          position: relative;
        }

        .password-group {
          position: relative;
        }

        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .input {
          width: 100%;
          padding: 14px 16px;
          font-size: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
          background-color: #ffffff;
          color: #1e293b;
          outline: none;
          box-sizing: border-box;
        }

        .input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .password-input {
          padding-right: 44px;
        }

        .password-toggle {
          position: absolute;
          top: 38px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          outline: none;
          height: 24px;
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .login-extras {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #64748b;
          cursor: pointer;
        }

        .checkbox {
          margin-right: 8px;
          accent-color: #667eea;
        }

        .forgot-password {
          background: none;
          border: none;
          color: #667eea;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 56px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:hover:not(.loading) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .submit-btn.loading {
          background: linear-gradient(135deg, #94a3b8 0%, #94a3b8 100%);
          cursor: not-allowed;
        }

        /* OTP Screen Styles */
        .otp-screen {
          text-align: center;
        }

        .otp-header {
          margin-bottom: 32px;
        }

        .back-btn {
          background: none;
          border: none;
          color: #667eea;
          font-size: 16px;
          cursor: pointer;
          margin-bottom: 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          color: #5a67d8;
          transform: translateX(-2px);
        }

        .otp-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 12px 0;
        }

        .otp-subtitle {
          font-size: 16px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        .otp-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .otp-inputs {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .otp-input {
          width: 56px;
          height: 56px;
          font-size: 24px;
          font-weight: 600;
          text-align: center;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          color: #1e293b;
          outline: none;
          transition: all 0.2s ease;
        }

        .otp-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: scale(1.05);
        }

        .otp-timer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .timer-icon {
          font-size: 16px;
        }

        .expired {
          color: #dc2626;
          font-weight: 600;
        }

        .otp-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .otp-verify-btn {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 56px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .otp-verify-btn:hover:not(.loading):not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .otp-verify-btn:disabled {
          background: linear-gradient(135deg, #94a3b8 0%, #94a3b8 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .otp-verify-btn.loading {
          background: linear-gradient(135deg, #94a3b8 0%, #94a3b8 100%);
          cursor: not-allowed;
        }

        .resend-btn {
          background: none;
          border: 2px solid #e2e8f0;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 12px 24px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .resend-btn:hover:not(:disabled) {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .resend-btn:disabled {
          color: #94a3b8;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          margin-right: 12px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
            margin: 16px;
          }

          .otp-inputs {
            gap: 8px;
          }

          .otp-input {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginSignup;