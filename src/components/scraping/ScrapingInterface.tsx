import { useState } from 'react';
import ProcessMonitor from '../common/ProcessMonitor';

const ScrapingInterface: React.FC = () => {
  const [isScrapingActive, setIsScrapingActive] = useState(false);

  const handleStartScraping = () => {
    setIsScrapingActive(true);
    // Add your scraping logic here
  };

  const handleStopScraping = () => {
    setIsScrapingActive(false);
    // Add your stop scraping logic here
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Data Scraping</h2>
        <button
          onClick={handleStartScraping}
          disabled={isScrapingActive}
          className={`px-4 py-2 rounded-md ${
            isScrapingActive
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Start Scraping
        </button>
      </div>

      <ProcessMonitor
        isActive={isScrapingActive}
        onStop={handleStopScraping}
        processName="Data Scraping"
      />
    </div>
  );
};

export default ScrapingInterface;