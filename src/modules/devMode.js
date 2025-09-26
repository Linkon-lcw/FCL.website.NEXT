// 开发者模式管理模块
// 已升级为使用增强的核心模块

import { devModeManager } from './devModeCore.js';
import { devModePanel, initDevModeUI } from './devModePanel.js';
import Notification from '../utils/notification.js';

// 开发者模式状态（保持向后兼容）
let isDevMode = false;

/**
 * 初始化开发者模式
 * @param {boolean} [initialState=false] - 初始状态
 */
function initDevMode(initialState = false) {
    // 初始化新的开发者模式核心模块
    devModeManager.init();
    
    // 初始化开发者模式UI面板
    initDevModeUI();
    
    // 保持向后兼容的状态同步
    isDevMode = devModeManager.getState().isEnabled;
    
    // 监听开发者模式状态变化
    document.addEventListener('devModeEnabled', () => {
        isDevMode = true;
        applyDevModeSettings();
        devModePanel.show();
    });
    
    document.addEventListener('devModeDisabled', () => {
        isDevMode = false;
        removeDevModeSettings();
        devModePanel.hide();
    });
    
    // 监听URL参数变化（通过popstate事件）
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const devParam = urlParams.get('dev');
        const currentState = devModeManager.getState().isEnabled;
        
        // 如果URL参数与当前状态不匹配，刷新页面
        if (devParam === '1' && !currentState) {
            // 刷新页面以应用开发者模式
            window.location.reload();
        } else if (devParam === '0' && currentState) {
            // 刷新页面以禁用开发者模式
            window.location.reload();
        } else if (!devParam && currentState && !isLocalhostAccess()) {
            // 如果没有dev参数且不是localhost，刷新页面以禁用开发者模式
            window.location.reload();
        }
    });
    
    // 如果开发者模式已启用，显示通知和面板
    if (isDevMode) {
        showDevModeNotification('开发者模式已自动启用');
        devModePanel.show();
    }
}

// 开发者模式切换功能已移至devModePanel.js中的统一按钮实现

/**
 * 切换开发者模式
 */
function toggleDevMode() {
    if (isDevMode) {
        devModeManager.disable();
        // 更新URL参数
        updateUrlParameter('dev', '0');
    } else {
        devModeManager.enable();
        // 更新URL参数
        updateUrlParameter('dev', '1');
    }
}

/**
 * 更新URL参数
 * @param {string} key - 参数名
 * @param {string} value - 参数值
 */
function updateUrlParameter(key, value) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    if (value === null || value === undefined || value === '') {
        params.delete(key);
    } else {
        params.set(key, value);
    }
    
    // 更新URL，不重新加载页面
    const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}${url.hash}`;
    window.history.replaceState({}, '', newUrl);
}

/**
 * 应用开发者模式设置
 */
function applyDevModeSettings() {
    // 添加开发者模式类到body
    document.body.classList.add('dev-mode');
    
    // 显示启用通知
    showDevModeNotification('开发者模式已启用');
    
    // 触发自定义事件
    document.dispatchEvent(new CustomEvent('devModeEnabled'));
}

/**
 * 移除开发者模式设置
 */
function removeDevModeSettings() {
    // 从body元素中移除开发者模式的CSS类
    document.body.classList.remove('dev-mode');
    
    // 显示禁用通知
    showDevModeNotification('开发者模式已禁用');
    
    // 刷新页面以禁用开发者模式
    window.location.reload();
    
    // 触发自定义事件
    document.dispatchEvent(new CustomEvent('devModeDisabled'));
}

/**
 * 显示开发者模式通知
 */
function showDevModeNotification(message) {
    // 使用通用通知组件显示开发者模式通知
    return Notification.warning(message, {
        position: 'top-right',
        duration: 3000,
        className: 'dev-mode-notification'
    });
}

/**
 * 检查是否为开发者模式
 * @returns {boolean} 是否为开发者模式
 */
function isDevModeEnabled() {
    return devModeManager.getState().isEnabled;
}

/**
 * 开发者模式下的fetch包装器
 * 如果开发者模式已启用，则阻止所有外部请求
 * @param {string} url - 请求URL
 * @param {Object} [options] - fetch选项
 * @returns {Promise<Response>} fetch响应
 */
async function devModeFetch(url, options = {}) {
    // 如果开发者模式未启用，使用原始fetch
    if (!isDevModeEnabled()) {
        return window.fetch(url, options);
    }
    
    // 开发者模式启用时，使用核心模块的拦截逻辑
    // 注意：devModeCore.js会自动拦截所有fetch调用，所以这里直接调用即可
    return window.fetch(url, options);
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

/**
 * 检查是否为localhost访问
 */
function isLocalhostAccess() {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname === '' ||
           hostname === '::1';
}

// 更新开发者模式切换按钮UI功能已移至devModePanel.js中的统一按钮实现

// 导出函数
export { 
    initDevMode, 
    isDevModeEnabled, 
    devModeFetch, 
    isExternalUrl,
    isLocalhostAccess,
    toggleDevMode,
    updateUrlParameter
};