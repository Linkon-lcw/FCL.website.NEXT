// 开发者模式管理模块

// 开发者模式状态
let isDevMode = false;

/**
 * 初始化开发者模式
 * @param {boolean} [initialState=false] - 初始状态
 */
function initDevMode(initialState = false) {
    // 检测是否为localhost访问
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname === '';
    
    // 如果是localhost访问，自动启用开发者模式
    if (isLocalhost) {
        isDevMode = true;
        console.log('检测到localhost访问，自动启用开发者模式');
    } else {
        isDevMode = initialState;
        
        // 从本地存储中读取开发者模式状态
        const savedDevMode = localStorage.getItem('devMode');
        if (savedDevMode !== null) {
            isDevMode = savedDevMode === 'true';
        }
    }
    
    // 创建开发者模式切换按钮
    createDevModeToggle();
    
    // 如果开发者模式已启用，则应用开发者模式的设置
    if (isDevMode) {
        applyDevModeSettings();
    }
    
    console.log(`开发者模式已${isDevMode ? '启用' : '禁用'}`);
}

/**
 * 创建开发者模式切换按钮
 */
function createDevModeToggle() {
    // 检查是否已存在开发者模式切换按钮
    if (document.getElementById('dev-mode-toggle')) {
        return;
    }
    
    // 创建开发者模式切换按钮
    const devModeToggle = document.createElement('button');
    devModeToggle.id = 'dev-mode-toggle';
    devModeToggle.className = `fixed bottom-4 right-4 z-50 p-2 rounded-full transition ${isDevMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-800'} text-white shadow-lg`;
    devModeToggle.setAttribute('aria-label', '切换开发者模式');
    devModeToggle.innerHTML = '<i class="fas fa-code"></i>';
    devModeToggle.style.fontSize = '0.75rem'; // 使按钮更小
    devModeToggle.style.width = '2rem'; // 设置固定宽度
    devModeToggle.style.height = '2rem'; // 设置固定高度
    
    // 添加点击事件
    devModeToggle.addEventListener('click', toggleDevMode);
    
    // 添加到页面底部
    document.body.appendChild(devModeToggle);
    
    // 如果是localhost访问，添加提示文本
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname === '';
    
    if (isLocalhost && isDevMode) {
        const devModeLabel = document.createElement('div');
        devModeLabel.id = 'dev-mode-label';
        devModeLabel.className = 'fixed bottom-4 right-16 z-50 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs shadow-lg';
        devModeLabel.textContent = '开发者模式已启用';
        document.body.appendChild(devModeLabel);
    }
}

/**
 * 切换开发者模式
 */
function toggleDevMode() {
    isDevMode = !isDevMode;
    
    // 保存状态到本地存储
    localStorage.setItem('devMode', isDevMode.toString());
    
    // 更新按钮样式
    const devModeToggle = document.getElementById('dev-mode-toggle');
    if (devModeToggle) {
        if (isDevMode) {
            devModeToggle.classList.remove('bg-gray-700', 'hover:bg-gray-800');
            devModeToggle.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        } else {
            devModeToggle.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
            devModeToggle.classList.add('bg-gray-700', 'hover:bg-gray-800');
        }
    }
    
    // 更新或移除提示文本
    const devModeLabel = document.getElementById('dev-mode-label');
    if (isDevMode) {
        if (!devModeLabel) {
            const newDevModeLabel = document.createElement('div');
            newDevModeLabel.id = 'dev-mode-label';
            newDevModeLabel.className = 'fixed bottom-4 right-16 z-50 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs shadow-lg';
            newDevModeLabel.textContent = '开发者模式已启用';
            document.body.appendChild(newDevModeLabel);
        }
    } else if (devModeLabel) {
        devModeLabel.remove();
    }
    
    // 应用或取消开发者模式设置
    if (isDevMode) {
        applyDevModeSettings();
    } else {
        removeDevModeSettings();
    }
    
    console.log(`开发者模式已${isDevMode ? '启用' : '禁用'}`);
    
    // 刷新页面以应用更改
    window.location.reload();
}

/**
 * 应用开发者模式设置
 */
function applyDevModeSettings() {
    // 添加开发者模式类到body
    document.body.classList.add('dev-mode');
    
    // 显示开发者模式提示
    showDevModeNotification();
}

/**
 * 移除开发者模式设置
 */
function removeDevModeSettings() {
    // 移除开发者模式类
    document.body.classList.remove('dev-mode');
    
    // 移除提示文本
    const devModeLabel = document.getElementById('dev-mode-label');
    if (devModeLabel) {
        devModeLabel.remove();
    }
}

/**
 * 显示开发者模式提示
 */
function showDevModeNotification() {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 glass-effect px-4 py-2 rounded-md z-50 transition-opacity duration-300';
    notification.textContent = '开发者模式已启用 - 外部请求已被阻止';
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * 检查是否为开发者模式
 * @returns {boolean} 是否为开发者模式
 */
function isDevModeEnabled() {
    return isDevMode;
}

/**
 * 开发者模式下的fetch包装器
 * 如果开发者模式已启用，则阻止所有外部请求
 * @param {string} url - 请求URL
 * @param {Object} [options] - fetch选项
 * @returns {Promise<Response>} fetch响应
 */
async function devModeFetch(url, options = {}) {
    // 如果不是开发者模式，直接使用原始fetch
    if (!isDevMode) {
        return fetch(url, options);
    }
    
    // 检查是否为外部请求
    const isExternalRequest = isExternalUrl(url);
    
    if (isExternalRequest) {
        console.warn(`开发者模式：阻止外部请求 - ${url}`);
        
        // 返回一个模拟的响应
        return new Response(JSON.stringify({
            error: '开发者模式已启用',
            message: '外部请求已被阻止',
            url: url
        }), {
            status: 403,
            statusText: 'Forbidden',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    
    // 如果是内部请求，则正常执行
    return fetch(url, options);
}

/**
 * 检查URL是否为外部URL
 * @param {string} url - 要检查的URL
 * @returns {boolean} 是否为外部URL
 */
function isExternalUrl(url) {
    try {
        // 如果URL以./或/开头，则是内部URL
        if (url.startsWith('./') || url.startsWith('/')) {
            return false;
        }
        
        // 如果URL包含://，则检查是否为同源
        if (url.includes('://')) {
            const currentOrigin = window.location.origin;
            const urlOrigin = new URL(url).origin;
            return urlOrigin !== currentOrigin;
        }
        
        // 其他情况视为外部URL
        return true;
    } catch (e) {
        // 如果URL解析失败，视为外部URL
        return true;
    }
}

// 导出函数
export { initDevMode, isDevModeEnabled, devModeFetch, isExternalUrl };