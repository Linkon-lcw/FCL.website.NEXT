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

// 主初始化函数 - 在模块加载完成后调用
function initializeApp() {
    // log 主脚本开始执行
    console.log('[MainScript] 主脚本开始执行');

    // 记录DOM内容加载完成时间
    perfMonitor.mark('DOMContentReady');
    
    // 初始化开发者模式（已升级为增强版本）
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
    
    // 初始化线路选择下拉菜单 - 延迟执行以确保home.html模块加载完成
    setTimeout(() => {
        populateLineSelection();
        perfMonitor.mark('LineSelectionPopulated');
    }, 500); // 延迟500ms确保模块加载完成
    
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

    // 主题切换按钮事件处理

    // 加入日志记录
    console.log('Themes:初始化主题切换按钮事件处理');
    
    const themeToggle = document.getElementById('theme-toggle');

    if (!themeToggle) {
        console.error('Themes:未找到主题切换按钮元素');
        return;
    }

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
            console.log('Themes:点击了主题切换按钮');

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

    // 导航链接事件处理
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 移除所有链接的active类
            navLinks.forEach(l => l.classList.remove('active'));
            
            // 为当前点击的链接添加active类
            link.classList.add('active');
            
            // 获取目标section的id
            const targetId = link.getAttribute('href').substring(1);
            
            // 隐藏所有section
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });
            
            // 显示目标section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                
                // 根据目标页面加载相应内容
                switch (targetId) {
                    case 'downloads':
                        loadAllFclDownWays();
                        loadAllZlDownWays();
                        // 在内容加载完成后重新初始化折叠面板
                        setTimeout(() => {
                            initCollapsiblePanels();
                        }, 100);
                        break;
                    case 'verification':
                        loadChecksums('verification-content');
                        // 在内容加载完成后重新初始化折叠面板
                        setTimeout(() => {
                            initCollapsiblePanels();
                        }, 100);
                        break;
                    case 'about':
                        loadAbout('about-content');
                        // 在内容加载完成后重新初始化折叠面板
                        setTimeout(() => {
                            initCollapsiblePanels();
                        }, 100);
                        break;
                }
                
                // 滚动到目标section，考虑固定标题栏的高度
                const headerHeight = document.querySelector('header').offsetHeight;
                const navHeight = document.getElementById('main-nav').offsetHeight;
                const offset = headerHeight + navHeight;
                
                window.scrollTo({
                    top: targetSection.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 页面加载时检查hash并导航
    checkHashAndNavigate();
    
    // 监听hash变化
    window.addEventListener('hashchange', checkHashAndNavigate);
    
    // 初始化设备检测和智能线路选择
    showDeviceInfo();
    showDeviceSuggestions();
    initAutoLineSelection();
    
    // 监听线路选择变化
    const odlmSelect = document.getElementById('odlmSelect');
    if (odlmSelect) {
        odlmSelect.addEventListener('change', (e) => {
            window.setupIndexDownLinks(e.target.value);
        });
        
        // 确保初始时也调用一次setupIndexDownLinks，特别是在开发者模式下
        setTimeout(() => {
            console.log('检查线路选择器状态:', {
                选择器存在: !!odlmSelect,
                当前值: odlmSelect.value,
                选项数量: odlmSelect.options ? odlmSelect.options.length : 0,
                所有选项: Array.from(odlmSelect.options || []).map(opt => opt.value)
            });
            
            if (odlmSelect.value) {
                console.log('初始调用setupIndexDownLinks，线路：', odlmSelect.value);
                window.setupIndexDownLinks(odlmSelect.value);
            } else {
                console.log('线路选择器没有值，尝试使用第一个选项');
                if (odlmSelect.options && odlmSelect.options.length > 0) {
                    const firstValue = odlmSelect.options[0].value;
                    console.log('使用第一个选项:', firstValue);
                    window.setupIndexDownLinks(firstValue);
                }
            }
        }, 2000); // 延迟2秒确保所有模块加载完成
    }
    
    // 初始化可折叠面板
    initCollapsiblePanels();
    
    // 添加公告按钮
    setTimeout(() => {
        const noticeBtn = document.createElement('button');
        noticeBtn.id = 'notice-btn';
        noticeBtn.innerHTML = '<i class="fas fa-bullhorn"></i>';
        noticeBtn.onclick = () => {
            openNotice();
        };
        document.body.appendChild(noticeBtn);
    }, 1000);
    
    // 记录主脚本执行完成时间
    perfMonitor.mark('MainScriptEnd');
    
    // 记录性能指标
    perfMonitor.measure('DOMContentLoadTime', 'MainScriptStart', 'DOMContentReady');
    perfMonitor.measure('MainScriptExecutionTime', 'DOMContentReady', 'MainScriptEnd');
    
    console.log('[MainScript] 主脚本初始化完成');
}

// 导出初始化函数，供index.html调用
window.initializeApp = initializeApp;