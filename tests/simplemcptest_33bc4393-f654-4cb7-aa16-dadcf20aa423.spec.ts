
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('SimpleMCPTest_2025-09-23', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5500');

    // Take screenshot
    await page.screenshot({ path: 'simple-mcp-test.png', fullPage: true });
});