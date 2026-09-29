import { defineConfig } from '@playwright/test';
const baseURL = process.env.PAGES_URL;
if (!baseURL) throw new Error('PAGES_URL is required; live tests never silently use localhost');
const target = new URL(baseURL);
if (target.protocol !== 'https:' || target.hostname.toLowerCase() !== 'soomin921123.github.io' || target.pathname !== '/economy-designer-test/') throw new Error('Only the explicitly authorized test Pages site may be tested');
export default defineConfig({
  testDir: './deployment-tests',
  timeout: 45000,
  expect: { timeout: 12000 },
  workers: 1, retries: 0, forbidOnly: true,
  outputDir: 'live-test-results',
  reporter: [['line'],['json',{outputFile:'evidence/live-results.json'}],['html',{open:'never',outputFolder:'live-playwright-report'}]],
  use: { baseURL, ignoreHTTPSErrors:false, serviceWorkers:'allow', trace:'on', screenshot:'on', actionTimeout:12000, navigationTimeout:20000 },
  projects: [
    {name:'desktop-chromium',use:{browserName:'chromium',viewport:{width:1440,height:900}}},
    {name:'mobile-chromium',use:{browserName:'chromium',viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}}
  ]
});
