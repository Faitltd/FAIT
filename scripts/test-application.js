#!/usr/bin/env node

/**
 * Application Testing Script with Puppeteer
 * 
 * This script uses Puppeteer to test the FAIT Co-op application functionality
 * and iterate on improvements.
 */

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ApplicationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.devServer = null;
    this.baseUrl = 'http://localhost:5173';
  }

  async startDevServer() {
    console.log('🚀 Starting development server...');
    
    return new Promise((resolve, reject) => {
      this.devServer = spawn('npm', ['run', 'dev'], {
        cwd: join(__dirname, '..'),
        stdio: 'pipe'
      });

      this.devServer.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Dev server:', output.trim());
        
        if (output.includes('Local:') || output.includes('localhost:5173')) {
          console.log('✅ Development server started');
          resolve();
        }
      });

      this.devServer.stderr.on('data', (data) => {
        console.error('Dev server error:', data.toString());
      });

      this.devServer.on('error', (error) => {
        console.error('Failed to start dev server:', error);
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Dev server startup timeout'));
      }, 30000);
    });
  }

  async startBrowser() {
    console.log('🌐 Starting browser...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      devtools: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Enable console logging
    this.page.on('console', (msg) => {
      console.log('Browser console:', msg.text());
    });

    // Enable error logging
    this.page.on('pageerror', (error) => {
      console.error('Browser error:', error.message);
    });

    console.log('✅ Browser started');
  }

  async testHomePage() {
    console.log('🏠 Testing home page...');
    
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      // Wait for the page to load
      await this.page.waitForSelector('h1', { timeout: 10000 });
      
      // Check if the main heading is present
      const heading = await this.page.$eval('h1', el => el.textContent);
      console.log('Page heading:', heading);
      
      // Check for key elements
      const elements = await this.page.evaluate(() => {
        return {
          hasNavbar: !!document.querySelector('nav'),
          hasGetStartedButton: !!document.querySelector('[data-testid="get-started-button"]'),
          hasFindServicesButton: !!document.querySelector('[data-testid="find-services-button"]'),
          hasFooter: !!document.querySelector('footer')
        };
      });
      
      console.log('Page elements:', elements);
      
      // Take a screenshot
      await this.page.screenshot({ 
        path: 'test-results/homepage.png',
        fullPage: true 
      });
      
      return {
        success: true,
        heading,
        elements
      };
    } catch (error) {
      console.error('❌ Home page test failed:', error);
      await this.page.screenshot({ path: 'test-results/homepage-error.png' });
      return { success: false, error: error.message };
    }
  }

  async testNavigation() {
    console.log('🧭 Testing navigation...');
    
    try {
      // Test navigation to different pages
      const testRoutes = [
        { path: '/calculator/estimate', name: 'Estimate Calculator' },
        { path: '/services/search', name: 'Service Search' },
        { path: '/login', name: 'Login Page' },
        { path: '/register', name: 'Register Page' }
      ];

      const results = {};

      for (const route of testRoutes) {
        try {
          console.log(`Testing route: ${route.path}`);
          await this.page.goto(`${this.baseUrl}${route.path}`, { waitUntil: 'networkidle2' });
          
          // Wait for content to load
          await this.page.waitForSelector('body', { timeout: 5000 });
          
          // Check if page loaded without errors
          const pageTitle = await this.page.title();
          const hasContent = await this.page.evaluate(() => {
            return document.body.textContent.trim().length > 0;
          });
          
          results[route.path] = {
            success: true,
            title: pageTitle,
            hasContent
          };
          
          // Take screenshot
          await this.page.screenshot({ 
            path: `test-results/route-${route.path.replace(/\//g, '-')}.png` 
          });
          
        } catch (error) {
          console.error(`❌ Route ${route.path} failed:`, error.message);
          results[route.path] = {
            success: false,
            error: error.message
          };
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Navigation test failed:', error);
      return { success: false, error: error.message };
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing authentication...');
    
    try {
      // Go to login page
      await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      
      // Check if login form exists
      const hasLoginForm = await this.page.evaluate(() => {
        return !!document.querySelector('form') || 
               !!document.querySelector('input[type="email"]') ||
               !!document.querySelector('input[type="password"]');
      });
      
      console.log('Has login form:', hasLoginForm);
      
      // Take screenshot
      await this.page.screenshot({ path: 'test-results/login-page.png' });
      
      return {
        success: true,
        hasLoginForm
      };
    } catch (error) {
      console.error('❌ Authentication test failed:', error);
      return { success: false, error: error.message };
    }
  }

  async testResponsiveness() {
    console.log('📱 Testing responsiveness...');
    
    try {
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1280, height: 720, name: 'Desktop' }
      ];

      const results = {};

      for (const viewport of viewports) {
        await this.page.setViewport(viewport);
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Check if content is visible and properly laid out
        const layout = await this.page.evaluate(() => {
          const body = document.body;
          return {
            hasHorizontalScroll: body.scrollWidth > window.innerWidth,
            hasContent: body.textContent.trim().length > 0,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
          };
        });
        
        results[viewport.name] = layout;
        
        // Take screenshot
        await this.page.screenshot({ 
          path: `test-results/responsive-${viewport.name.toLowerCase()}.png` 
        });
      }

      return results;
    } catch (error) {
      console.error('❌ Responsiveness test failed:', error);
      return { success: false, error: error.message };
    }
  }

  async generateReport(results) {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    Object.entries(results).forEach(([testName, result]) => {
      console.log(`\n${testName}:`);
      if (result.success) {
        console.log('  ✅ PASSED');
        if (result.details) {
          Object.entries(result.details).forEach(([key, value]) => {
            console.log(`  - ${key}: ${JSON.stringify(value)}`);
          });
        }
      } else {
        console.log('  ❌ FAILED');
        console.log(`  Error: ${result.error}`);
      }
    });
    
    console.log('\n📸 Screenshots saved to test-results/ directory');
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    
    if (this.browser) {
      await this.browser.close();
    }
    
    if (this.devServer) {
      this.devServer.kill();
    }
  }

  async runAllTests() {
    try {
      // Create test results directory
      await import('fs').then(fs => {
        if (!fs.existsSync('test-results')) {
          fs.mkdirSync('test-results');
        }
      });

      await this.startDevServer();
      await this.startBrowser();
      
      // Wait a bit for the server to be fully ready
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const results = {};
      
      results.homePage = await this.testHomePage();
      results.navigation = await this.testNavigation();
      results.authentication = await this.testAuthentication();
      results.responsiveness = await this.testResponsiveness();
      
      await this.generateReport(results);
      
      return results;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ApplicationTester();
  
  tester.runAllTests()
    .then(() => {
      console.log('🎉 All tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    });
}

export { ApplicationTester };
