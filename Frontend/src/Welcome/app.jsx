import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Users, Clock, Star, Play, Award, CheckCircle, TrendingUp, Globe } from 'lucide-react';

const Welcome = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const stats = [
    { number: '10,000+', label: 'Active Students', icon: Users, colorClass: 'stat-purple' },
    { number: '500+', label: 'Expert Courses', icon: BookOpen, colorClass: 'stat-blue' },
    { number: '24/7', label: 'Learning Support', icon: Clock, colorClass: 'stat-indigo' },
    { number: '98%', label: 'Success Rate', icon: TrendingUp, colorClass: 'stat-violet' }
  ];

  const features = [
    { 
      icon: Star, 
      title: 'Premium Content', 
      desc: 'Curated by industry experts with real-world experience',
      color: '#667eea'
    },
    { 
      icon: Play, 
      title: 'Interactive Learning', 
      desc: 'Hands-on projects, quizzes, and practical exercises',
      color: '#764ba2'
    },
    { 
      icon: Award, 
      title: 'Verified Certificates', 
      desc: 'Industry-recognized certifications for career growth',
      color: '#667eea'
    },
    {
      icon: Globe,
      title: 'Global Community',
      desc: 'Connect with learners worldwide and build your network',
      color: '#764ba2'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      company: 'Google',
      quote: 'MasterMind transformed my career. The quality of courses and support is unmatched.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Data Scientist',
      company: 'Microsoft',
      quote: 'The practical approach and real-world projects helped me land my dream job.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'UX Designer',
      company: 'Apple',
      quote: 'Best investment in my professional development. Highly recommend!',
      rating: 5
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const statInterval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      clearInterval(statInterval);
      clearInterval(testimonialInterval);
    };
  }, []);

  const handleGetStarted = () => {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0.8';
    setTimeout(() => {
      window.location.href = '/login';
    }, 300);
  };

  const handleExplore = () => {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0.8';
    setTimeout(() => {
      window.location.href = '/courses';
    }, 300);
  };

  return (
    <div className="welcome-container">
      <div className={`welcome-content ${isVisible ? 'visible' : ''}`}>
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-card">
            <div className="hero-content">
              <div className="brand-section">
                <div className="brand-icon">
                  <BookOpen size={28} />
                </div>
                <h1 className="brand-title">MasterMind</h1>
              </div>
              
              <h2 className="hero-title">
                Transform Your Future with 
                <span className="gradient-text"> Expert Learning</span>
              </h2>
              
              <p className="hero-subtitle">
                Join thousands of professionals who've accelerated their careers through our 
                premium courses, expert mentorship, and hands-on projects.
              </p>

              <div className="cta-section">
                <button onClick={handleGetStarted} className="primary-btn">
                  Start Your Journey
                  <ArrowRight size={20} className="arrow-icon" />
                </button>
                
                <button onClick={handleExplore} className="secondary-btn">
                  Explore Courses
                </button>
              </div>

              <div className="trust-indicators">
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="rating-text">4.9/5 from 10,000+ reviews</span>
                </div>
                <div className="trust-text">
                  Trusted by professionals at top companies worldwide
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-card">
                <div className="visual-content">
                  <Play size={48} className="play-icon" />
                  <div className="visual-text">
                    <h4>Watch Demo</h4>
                    <p>See how it works</p>
                  </div>
                </div>
              </div>
              
              <div className="floating-stats">
                {stats.slice(0, 2).map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className={`floating-stat ${index === 1 ? 'delayed' : ''}`}>
                      <IconComponent size={20} />
                      <div>
                        <div className="stat-number">{stat.number}</div>
                        <div className="stat-label">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-container">
            <h3 className="stats-title">Why Choose MasterMind?</h3>
            <div className="stats-grid">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                const isActive = currentStat === index;
                return (
                  <div
                    key={index}
                    className={`stat-card ${stat.colorClass} ${isActive ? 'active' : ''}`}
                    onClick={() => setCurrentStat(index)}
                  >
                    <div className="stat-icon">
                      <IconComponent size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{stat.number}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-container">
            <h3 className="section-title">Everything You Need to Succeed</h3>
            <div className="features-grid">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="feature-card">
                    <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                      <IconComponent size={24} />
                    </div>
                    <h4 className="feature-title">{feature.title}</h4>
                    <p className="feature-desc">{feature.desc}</p>
                    <div className="feature-check">
                      <CheckCircle size={16} />
                      <span>Included</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <div className="testimonials-container">
            <h3 className="section-title">What Our Students Say</h3>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="quote-mark">"</div>
                <p className="testimonial-text">
                  {testimonials[currentTestimonial].quote}
                </p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h5 className="author-name">{testimonials[currentTestimonial].name}</h5>
                    <p className="author-role">
                      {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                    </p>
                  </div>
                  <div className="testimonial-rating">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="testimonial-indicators">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${currentTestimonial === index ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="final-cta-section">
          <div className="final-cta-card">
            <h3 className="cta-title">Ready to Transform Your Career?</h3>
            <p className="cta-subtitle">
              Join thousands of successful professionals and start your learning journey today.
            </p>
            <div className="cta-buttons">
              <button onClick={handleGetStarted} className="primary-btn large">
                Get Started Now
                <ArrowRight size={20} className="arrow-icon" />
              </button>
            </div>
            <div className="cta-note">
              <CheckCircle size={16} />
              <span>30-day money-back guarantee • No commitment required</span>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .welcome-container {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          overflow-x: hidden;
        }

        .welcome-content {
          opacity: 0;
          transform: translateY(20px);
          transition: all 1s ease;
        }

        .welcome-content.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Hero Section */
        .hero-section {
          padding: 80px 20px 60px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 60px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .hero-card {
            grid-template-columns: 1fr 400px;
            gap: 60px;
          }
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .brand-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .brand-title {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 24px 0;
          line-height: 1.1;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 20px;
          color: #64748b;
          margin: 0 0 40px 0;
          line-height: 1.6;
          font-weight: 500;
        }

        .cta-section {
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .primary-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
        }

        .primary-btn.large {
          padding: 20px 40px;
          font-size: 18px;
        }

        .arrow-icon {
          transition: transform 0.3s ease;
        }

        .primary-btn:hover .arrow-icon {
          transform: translateX(4px);
        }

        .secondary-btn {
          border: 2px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.8);
          color: #374151;
          padding: 16px 32px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-btn:hover {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .trust-indicators {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stars {
          display: flex;
          gap: 2px;
          color: #fbbf24;
        }

        .rating-text {
          font-size: 14px;
          color: #64748b;
          font-weight: 600;
        }

        .trust-text {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .visual-card {
          background: rgba(102, 126, 234, 0.1);
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(102, 126, 234, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .visual-card:hover {
          transform: scale(1.05);
          background: rgba(102, 126, 234, 0.15);
        }

        .visual-content {
          display: flex;
          align-items: center;
          gap: 20px;
          color: #667eea;
        }

        .play-icon {
          color: #667eea;
        }

        .visual-text h4 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .visual-text p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }

        .floating-stats {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .floating-stat {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: float 3s ease-in-out infinite;
          color: #667eea;
        }

        .floating-stat:first-child {
          top: -20px;
          right: -40px;
        }

        .floating-stat.delayed {
          bottom: -20px;
          left: -40px;
          animation-delay: 1.5s;
        }

        .floating-stat .stat-number {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .floating-stat .stat-label {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* Stats Section */
        .stats-section {
          padding: 60px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .stats-title {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          margin: 0 0 48px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .stat-card {
          padding: 32px 24px;
          border-radius: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 2px solid transparent;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }

        .stat-card.active {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .stat-purple { background: linear-gradient(135deg, #ede9fe 0%, #f3f4f6 100%); }
        .stat-blue { background: linear-gradient(135deg, #dbeafe 0%, #f3f4f6 100%); }
        .stat-indigo { background: linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%); }
        .stat-violet { background: linear-gradient(135deg, #f3e8ff 0%, #f3f4f6 100%); }

        .stat-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-content .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 4px 0;
        }

        .stat-content .stat-label {
          font-size: 16px;
          color: #64748b;
          font-weight: 600;
          margin: 0;
        }

        /* Features Section */
        .features-section {
          padding: 60px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .features-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          margin: 0 0 48px 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
        }

        .feature-card {
          padding: 32px;
          border-radius: 16px;
          background: rgba(248, 250, 252, 0.8);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: #667eea;
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .feature-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 12px 0;
        }

        .feature-desc {
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        .feature-check {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #10b981;
          font-size: 14px;
          font-weight: 600;
        }

        /* Testimonials Section */
        .testimonials-section {
          padding: 60px 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .testimonials-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .testimonial-card {
          text-align: center;
        }

        .testimonial-content {
          margin-bottom: 32px;
        }

        .quote-mark {
          font-size: 64px;
          color: #667eea;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .testimonial-text {
          font-size: 20px;
          color: #1e293b;
          line-height: 1.6;
          margin: 0 0 32px 0;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .author-name {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 4px 0;
        }

        .author-role {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .testimonial-rating {
          display: flex;
          gap: 2px;
          color: #fbbf24;
        }

        .testimonial-indicators {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: #667eea;
          transform: scale(1.2);
        }

        /* Final CTA Section */
        .final-cta-section {
          padding: 60px 20px 80px;
          max-width: 800px;
          margin: 0 auto;
        }

        .final-cta-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          text-align: center;
        }

        .cta-title {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 16px 0;
        }

        .cta-subtitle {
          font-size: 18px;
          color: #64748b;
          margin: 0 0 32px 0;
          line-height: 1.6;
        }

        .cta-buttons {
          margin-bottom: 24px;
        }

        .cta-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          color: #10b981;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-card {
            padding: 40px 24px;
          }

          .stats-container,
          .features-container,
          .testimonials-container,
          .final-cta-card {
            padding: 32px 24px;
          }

          .cta-section {
            flex-direction: column;
          }

          .primary-btn,
          .secondary-btn {
            justify-content: center;
          }

          .floating-stat {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Welcome;