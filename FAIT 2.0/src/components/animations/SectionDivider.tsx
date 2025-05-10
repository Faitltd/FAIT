import React from 'react';

interface SectionDividerProps {
  type: 'wave' | 'diagonal' | 'curve';
  topColor: string;
  bottomColor: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ type, topColor, bottomColor }) => {
  switch (type) {
    case 'wave':
      return (
        <div className={`${topColor} relative h-24`}>
          <div className={`absolute bottom-0 left-0 w-full overflow-hidden`} style={{ height: '70px' }}>
            <svg
              className="absolute bottom-0 w-full h-full"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              fill={bottomColor.replace('bg-', '')}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 120L48 105C96 90 192 60 288 55C384 50 480 70 576 75C672 80 768 70 864 65C960 60 1056 60 1152 65C1248 70 1344 80 1392 85L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V120Z"
              />
            </svg>
          </div>
        </div>
      );
    case 'diagonal':
      return (
        <div className={`${topColor} relative h-24`}>
          <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: '70px' }}>
            <svg
              className="absolute bottom-0 w-full h-full"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              fill={bottomColor.replace('bg-', '')}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 120L1440 0V120H0Z" />
            </svg>
          </div>
        </div>
      );
    case 'curve':
      return (
        <div className={`${topColor} relative h-24`}>
          <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: '70px' }}>
            <svg
              className="absolute bottom-0 w-full h-full"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              fill={bottomColor.replace('bg-', '')}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 120C240 50 480 80 720 80C960 80 1200 50 1440 120V120H0V120Z"
              />
            </svg>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default SectionDivider;
