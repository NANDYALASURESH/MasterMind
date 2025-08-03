const ThreeDotsLoader = () => (
    <div className="three-dots-loader">
      <span></span>
      <span></span>
      <span></span>
  
      <style jsx>{`
        .three-dots-loader {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          width: 100%;
          height: 100%;
        }
  
        .three-dots-loader span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #6c6ace;
          animation: bounce 0.6s infinite alternate;
        }
  
        .three-dots-loader span:nth-child(2) {
          animation-delay: 0.2s;
        }
  
        .three-dots-loader span:nth-child(3) {
          animation-delay: 0.4s;
        }
  
        @keyframes bounce {
          from {
            transform: translateY(0px);
            opacity: 0.3;
          }
          to {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  export default ThreeDotsLoader;