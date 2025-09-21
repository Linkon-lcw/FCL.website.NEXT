import { test, expect } from '@playwright/test';

test.describe('FCL Website Tests', () => {
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

  test('navigation menu works', async ({ page }) => {
    await page.goto('/');
    
    // Check desktop navigation
    const desktopNav = page.locator('#main-nav');
    await expect(desktopNav).toBeVisible();
    
    // Check mobile menu button
    const mobileMenuButton = page.locator('#menu-toggle');
    await expect(mobileMenuButton).toBeVisible();
    
    // Test mobile menu toggle
    await mobileMenuButton.click();
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).not.toHaveClass(/hidden/);
    
    // Close mobile menu
    await mobileMenuButton.click();
    await expect(mobileMenu).toHaveClass(/hidden/);
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

  test('mobile responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile menu button is visible on mobile
    const mobileMenuButton = page.locator('#menu-toggle');
    await expect(mobileMenuButton).toBeVisible();
    
    // Check if desktop navigation is hidden on mobile
    const desktopNav = page.locator('#main-nav');
    await expect(desktopNav).not.toBeVisible();
    
    // Check if content is still accessible
    await expect(page.locator('main')).toBeVisible();
  });

  test('page sections navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to downloads section
    const downloadsLink = page.locator('nav a[href="#downloads"]').first();
    await downloadsLink.click();
    
    // Check if URL contains the hash
    await expect(page).toHaveURL(/#downloads/);
  });
});