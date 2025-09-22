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

  test('mobile navigation displays icons only on mobile viewport', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:5500/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check if navigation is visible
    const mainNav = page.locator('#main-nav');
    await expect(mainNav).toBeVisible();
    
    // Check if mobile menu button is NOT visible (should be removed)
    const mobileMenuButton = page.locator('#menu-toggle');
    await expect(mobileMenuButton).not.toBeVisible();
    
    // Check if mobile menu is NOT present (should be removed)
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).not.toBeVisible();
    
    // Check if navigation links are present and clickable
    const navLinks = page.locator('#main-nav .nav-link');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // Test navigation functionality - click on downloads link
    const downloadsLink = page.locator('#main-nav .nav-link[href="#downloads"]');
    await downloadsLink.click();
    
    // Wait for navigation
    await page.waitForTimeout(500);
    
    // Check if downloads section is visible
    const downloadsSection = page.locator('#downloads');
    await expect(downloadsSection).toBeVisible();
});
});