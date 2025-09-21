import { test, expect } from '@playwright/test';

test.describe('FCL Website Core Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('FCL下载站');
    
    // Check if header is present
    await expect(page.locator('header')).toBeVisible();
    
    // Check if main content is present
    await expect(page.locator('main')).toBeVisible();
    
    // Check if home section is present
    await expect(page.locator('#home')).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.locator('#theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Get initial theme
    const initialTheme = await page.locator('body').getAttribute('class');
    
    // Click theme toggle
    await themeToggle.click();
    
    // Check if theme changed
    const newTheme = await page.locator('body').getAttribute('class');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('download section elements are present', async ({ page }) => {
    await page.goto('/');
    
    // Check if download select is present
    const downloadSelect = page.locator('#odlmSelect');
    await expect(downloadSelect).toBeVisible();
    
    // Check if architecture buttons are present
    const archButtons = page.locator('#odlm-arch-buttons a');
    const buttonCount = await archButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Check if device info section is present
    const deviceInfo = page.locator('#deviceInfo');
    await expect(deviceInfo).toBeVisible();
  });

  test('mobile menu toggle works on mobile viewport', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:5500/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check if mobile menu button is visible on mobile
    const mobileMenuButton = page.locator('#menu-toggle');
    await expect(mobileMenuButton).toBeVisible();
    
    // Test mobile menu toggle - check initial state
    const mobileMenu = page.locator('#mobile-menu');
    
    // Check if the element has the 'hidden' class specifically
    const initialClasses = await mobileMenu.getAttribute('class');
    expect(initialClasses).toContain('hidden');
    
    // Open mobile menu
    await mobileMenuButton.click();
    
    // Wait for animation and state change
    await page.waitForTimeout(300);
    
    // Check if the 'hidden' class is removed
    const openClasses = await mobileMenu.getAttribute('class');
    expect(openClasses).not.toContain('hidden');
    
    // Close mobile menu
    await mobileMenuButton.click();
    
    // Wait for animation and state change
    await page.waitForTimeout(300);
    
    // Check if the 'hidden' class is added back
    const closeClasses = await mobileMenu.getAttribute('class');
    expect(closeClasses).toContain('hidden');
});
});