// 创建目录结构
import './modules/downloads.js';
import { showDeviceInfo, sysArch } from './modules/deviceDetection.js';
import { initAutoLineSelection } from './modules/autoLineSelection.js';
import { setupIndexDownLinks } from './modules/indexDownLinks.js';
import { loadAllFclDownWays, loadAllZlDownWays } from './modules/downloads.js';

// 将setupIndexDownLinks函数挂载到window对象上，以便其他模块可以访问
window.setupIndexDownLinks = setupIndexDownLinks;

// 简单的路由和DOM操作
document.addEventListener('DOMContentLoaded', () => {
    // 主题切换
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            // 这里可以添加更复杂的主题切换逻辑
        });
    }

    // 移动端菜单切换
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 导航链接激活状态切换
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // 更新导航激活状态
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // 显示对应的内容区域
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(targetId)?.classList.remove('hidden');
            
            // 隐藏移动端菜单
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
            
            // 如果是下载页面，加载下载线路
            if (targetId === 'downloads') {
                loadAllFclDownWays();
                loadAllZlDownWays();
            }
        });
    });

    // 初始化设备检测
    showDeviceInfo('deviceInfo');

    // 初始化智能线路选择
    initAutoLineSelection();

    // 监听线路选择变化
    const odlmSelect = document.getElementById('odlmSelect');
    if (odlmSelect) {
        odlmSelect.addEventListener('change', (e) => {
            setupIndexDownLinks(e.target.value);
        });
    }
    
    // 默认加载下载页面的内容（如果当前在下载页面）
    if (window.location.hash === '#downloads') {
        loadAllFclDownWays();
        loadAllZlDownWays();
    }
});