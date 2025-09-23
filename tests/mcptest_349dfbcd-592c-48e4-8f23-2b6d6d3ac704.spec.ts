
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('MCPTest_2025-09-23', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5500');

    // Take screenshot
    await page.screenshot({ path: 'mcp-test-homepage.png', fullPage: true });

    // Click element
    await page.click('#theme-toggle');

    // Click element
    await page.click('#odlmSelect');

    // Click element
    await page.click('nav a[href="#downloads"]');
});