import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import { environment } from '../../config/environment';

const PERFORMANCE_THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 90,
  seo: 90,
  pwa: 85,
};

describe('Lighthouse Performance Tests', () => {
  let chrome: any;
  let results: any;

  beforeAll(async () => {
    chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
      logLevel: 'info',
      output: 'json',
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    };

    results = await lighthouse(environment.appUrl, options);
  }, 60000);

  afterAll(async () => {
    await chrome.kill();
  });

  test.each(Object.entries(PERFORMANCE_THRESHOLDS))(
    '%s score should meet threshold',
    (category, threshold) => {
      const score = results.lhr.categories[category].score * 100;
      expect(score).toBeGreaterThanOrEqual(threshold);
    }
  );
});