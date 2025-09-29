import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md';
}

const Loader: React.FC<LoaderProps> = ({ size = 'md' }) => {
  const isSmall = size === 'sm';

  return (
    <div className={`loader ${isSmall ? 'loader-sm' : ''}`}>
      <div className={`loaderMiniContainer ${isSmall ? 'loader-mini-sm' : ''}`}>
        <div className="barContainer">
          <span className="bar" />
          <span className={`bar ${isSmall ? 'bar-sm' : 'bar2'}`} />
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 101 114"
          className={`svgIcon ${isSmall ? 'svgIcon-sm' : ''}`}
        >
          <circle
            strokeWidth={isSmall ? 5 : 7}
            stroke="black"
            transform="rotate(36.0692 46.1726 46.1727)"
            r={isSmall ? "25" : "29.5497"}
            cy="46.1727"
            cx="46.1726"
          />
          <line
            strokeWidth={isSmall ? 5 : 7}
            stroke="black"
            y2={isSmall ? "105" : "111.784"}
            x2={isSmall ? "90" : "97.7088"}
            y1={isSmall ? "65" : "67.7837"}
            x1={isSmall ? "58" : "61.7089"}
          />
        </svg>
      </div>

      <style jsx>{`
        .loader {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loader-sm {
          transform: scale(0.5);
          margin: -15px 0 -15px -15px;
        }

        .loaderMiniContainer {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 130px;
          height: fit-content;
        }

        .loader-mini-sm {
          width: 100px;
        }

        .barContainer {
          width: 100%;
          height: fit-content;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 10px;
          background-position: left;
        }

        .bar {
          width: 100%;
          height: 8px;
          background: linear-gradient(
            to right,
            rgb(161, 94, 255),
            rgb(217, 190, 255),
            rgb(161, 94, 255)
          );
          background-size: 200% 100%;
          border-radius: 10px;
          animation: bar 3s ease-in-out infinite alternate-reverse;
        }

        .bar-sm {
          width: 70%;
          height: 6px;
        }

        @keyframes bar {
          0% {
            background-position: 0%;
          }
          100% {
            background-position: 100%;
          }
        }

        .bar2 {
          width: 50%;
        }

        .svgIcon {
          position: absolute;
          left: -25px;
          margin-top: 18px;
          z-index: 2;
          width: 70%;
          animation: search 3s ease-in-out infinite alternate-reverse;
        }

        .svgIcon-sm {
          left: -20px;
          margin-top: 12px;
          width: 60%;
        }

        @keyframes search {
          0% {
            transform: translateX(0%) rotate(70deg);
          }
          100% {
            transform: translateX(100px) rotate(10deg);
          }
        }

        .svgIcon circle,
        .svgIcon line {
          stroke: rgb(162, 55, 255);
        }

        .svgIcon circle {
          fill: rgba(98, 65, 142, 0.238);
        }
      `}</style>
    </div>
  );
};

export default Loader;