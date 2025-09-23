import { test, expect } from '@playwright/test';

test('MCP功能测试 - 手动创建', async ({ page }) => {
  // 导航到首页
  await page.goto('http://localhost:5500');
  
  // 等待页面加载
  await page.waitForLoadState('networkidle');
  
  // 验证页面标题
  await expect(page).toHaveTitle(/Fold Craft Launcher/);
  
  // 截取屏幕截图
  await page.screenshot({ path: 'test-results/mcp-test-homepage.png', fullPage: true });
  
  // 验证主要元素存在
  await expect(page.locator('h1').first()).toContainText('FCL下载站');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  
  console.log('MCP测试通过 - 基本页面功能正常');
});