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
    // 检查URL中的hash并自动导航到相应部分
    const checkHashAndNavigate = () => {
        const hash = window.location.hash;
        if (hash) {
            const targetId = hash.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // 更新导航激活状态
                navLinks.forEach(l => l.classList.remove('active'));
                const targetNavLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
                if (targetNavLink) {
                    targetNavLink.classList.add('active');
                }
                
                // 显示对应的内容区域
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.add('hidden');
                });
                targetElement.classList.remove('hidden');
                
                // 如果是下载页面，加载下载线路
                if (targetId === 'downloads') {
                    loadAllFclDownWays();
                    loadAllZlDownWays();
                }
                
                // 滚动到目标元素，并考虑固定标题栏的高度
                const headerHeight = document.querySelector('header').offsetHeight;
                const navHeight = document.getElementById('main-nav').offsetHeight;
                const offset = headerHeight + navHeight;
                
                window.scrollTo({
                    top: targetElement.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        }
    };

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
            
            // 更新URL hash
            window.location.hash = targetId;
            
            // 滚动到目标元素，并考虑固定标题栏的高度
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const navHeight = document.getElementById('main-nav').offsetHeight;
                const offset = headerHeight + navHeight;
                
                window.scrollTo({
                    top: targetElement.offsetTop - offset,
                    behavior: 'smooth'
                });
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
            window.setupIndexDownLinks(e.target.value);
        });
    }
    
    // 页面加载时检查hash
    checkHashAndNavigate();
    
    // 监听hash变化
    window.addEventListener('hashchange', checkHashAndNavigate);
});