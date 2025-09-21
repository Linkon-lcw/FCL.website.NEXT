// 创建目录结构
import './modules/downloads.js';
import { showDeviceInfo, sysArch } from './modules/deviceSuggestions.js';
import { showDeviceSuggestions } from './modules/deviceSuggestions.js';
import { initAutoLineSelection } from './modules/autoLineSelection.js';
import { setupIndexDownLinks } from './modules/indexDownLinks.js';
import { loadAllFclDownWays, loadAllZlDownWays } from './modules/downloads.js';
import { loadIntroFcl, loadChecksums, loadAbout } from './modules/staticContent.js';
import { perfMonitor } from './utils/performanceMonitor.js';
import { openNotice } from './modules/notice.js';
import { initCollapsiblePanels } from './components/ReusableCollapsiblePanel.js';
import { SOURCE_MAP } from './modules/downloadWays.js';
import { initDevMode } from './modules/devMode.js';

// 记录主脚本开始执行时间
perfMonitor.mark('MainScriptStart');

// 将setupIndexDownLinks函数挂载到window对象上，以便其他模块可以访问
window.setupIndexDownLinks = setupIndexDownLinks;

// 简单的路由和DOM操作
document.addEventListener('DOMContentLoaded', () => {
    // 记录DOM内容加载完成时间
    perfMonitor.mark('DOMContentReady');
    
    // 初始化开发者模式
    initDevMode();
    
    // 填充线路选择下拉菜单
    function populateLineSelection() {
        perfMonitor.mark('StartPopulateLineSelection');
        const selectElement = document.getElementById('odlmSelect');
        if (!selectElement) return;
        
        // 清空现有选项
        selectElement.innerHTML = '';
        
        // 分组添加选项
        const fclGroup = document.createElement('optgroup');
        fclGroup.label = 'FCL 下载线路';
        const zlGroup = document.createElement('optgroup');
        zlGroup.label = 'ZL 下载线路';
        
        Object.entries(SOURCE_MAP).forEach(([key, config]) => {
            const option = document.createElement('option');
            option.value = key;
            
            // 构建显示文本
            let text = `${config.name}`;
            if (config.description) {
                text += ` (${config.description})`;
            }
            if (config.provider) {
                text += ` [${config.provider}]`;
            }
            
            option.textContent = text;
            
            // 设置默认选中项
            if (key === 'F2') {
                option.selected = true;
            }
            
            // 根据key前缀决定放入哪个分组
            if (key.startsWith('F') || key.startsWith('Z')) {
                if (key.startsWith('F')) {
                    fclGroup.appendChild(option);
                } else {
                    zlGroup.appendChild(option);
                }
            } else {
                // 如果不符合F或Z前缀，直接添加到select元素
                selectElement.appendChild(option);
            }
        });
        
        // 将分组添加到select元素
        if (fclGroup.children.length > 0) {
            selectElement.appendChild(fclGroup);
        }
        if (zlGroup.children.length > 0) {
            selectElement.appendChild(zlGroup);
        }
        perfMonitor.mark('EndPopulateLineSelection');
    }
    
    // 初始化线路选择下拉菜单
    populateLineSelection();
    perfMonitor.mark('LineSelectionPopulated');
    
    // 检查URL中的hash并自动导航到相应部分
    const checkHashAndNavigate = () => {
        perfMonitor.mark('StartCheckHash');
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
                
                // 根据目标页面加载相应内容
                switch (targetId) {
                    case 'downloads':
                        perfMonitor.mark('StartLoadDownloads');
                        loadAllFclDownWays();
                        loadAllZlDownWays();
                        // 在内容加载完成后重新初始化折叠面板
                        setTimeout(() => {
                            initCollapsiblePanels();
                        }, 100);
                        perfMonitor.mark('EndLoadDownloads');
                        break;
                    case 'verification':
                        perfMonitor.mark('StartLoadVerification');
                        loadChecksums('verification-content');
                        // 在内容加载完成后重新初始化折叠面板
                        setTimeout(() => {
                            initCollapsiblePanels();
                        }, 100);
                        perfMonitor.mark('EndLoadVerification');
                        break;
                    case 'about':
                        perfMonitor.mark('StartLoadAbout');
                        loadAbout('about-content');
                        // 在内容加载完成后重新初始化折叠面板
                        setTimeout(() => {
                            initCollapsiblePanels();
                        }, 100);
                        perfMonitor.mark('EndLoadAbout');
                        break;
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
        perfMonitor.mark('EndCheckHash');
    };

    // 主题切换
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // 检查本地存储中的主题偏好
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // 白天图标
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // 夜晚图标
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            
            // 更新本地存储中的主题偏好
            if (document.body.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // 白天图标
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // 夜晚图标
            }
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
            perfMonitor.mark(`StartNavigateTo_${link.getAttribute('href').substring(1)}`);
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
            
            // 根据目标页面加载相应内容
            switch (targetId) {
                case 'downloads':
                    perfMonitor.mark('StartLoadDownloadsOnClick');
                    loadAllFclDownWays();
                    loadAllZlDownWays();
                    // 在内容加载完成后重新初始化折叠面板
                    setTimeout(() => {
                        initCollapsiblePanels();
                    }, 100);
                    perfMonitor.mark('EndLoadDownloadsOnClick');
                    break;
                case 'verification':
                    perfMonitor.mark('StartLoadVerificationOnClick');
                    loadChecksums('verification');
                    // 在内容加载完成后重新初始化折叠面板
                    setTimeout(() => {
                        initCollapsiblePanels();
                    }, 100);
                    perfMonitor.mark('EndLoadVerificationOnClick');
                    break;
                case 'about':
                    perfMonitor.mark('StartLoadAboutOnClick');
                    loadAbout('about-content');
                    // 在内容加载完成后重新初始化折叠面板
                    setTimeout(() => {
                        initCollapsiblePanels();
                    }, 100);
                    perfMonitor.mark('EndLoadAboutOnClick');
                    break;
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
            perfMonitor.mark(`EndNavigateTo_${link.getAttribute('href').substring(1)}`);
        });
    });

    // 初始化设备检测
    showDeviceInfo('deviceInfo');

    // 初始化设备建议功能
    showDeviceSuggestions('deviceSuggestions');

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
    
    // 初始化折叠面板组件
    initCollapsiblePanels();
    
    // 添加公告按钮
    setTimeout(() => {
        const noticeBtn = document.createElement('button');
        noticeBtn.id = 'notice-btn';
        noticeBtn.className = 'fixed bottom-4 left-4 bg-primary-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-primary-700 transition';
        noticeBtn.innerHTML = '<i class="fas fa-bullhorn mr-1"></i>公告';
        noticeBtn.onclick = () => {
            openNotice();
        };
        document.body.appendChild(noticeBtn);
    }, 1000);
});