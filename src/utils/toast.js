/**
 * Toast通知组件
 * 提供统一的提示通知功能，替代原生的alert
 */

/**
 * 显示Toast通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型: 'info' | 'success' | 'warning' | 'error'
 * @param {number} duration - 显示时长（毫秒），默认3000ms
 * @param {string} position - 位置，默认'top-right'
 */
function showToast(message, type = 'info', duration = 3000, position = 'top-right') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `fixed z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 ${getPositionClasses(position)} ${getTypeClasses(type)}`;
    
    // 创建图标
    const icon = document.createElement('i');
    icon.className = `fas ${getIconClass(type)} mr-2`;
    
    // 创建消息文本
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ml-3 text-white hover:text-gray-200 focus:outline-none';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.onclick = () => hideToast(notification);
    
    // 组装元素
    notification.appendChild(icon);
    notification.appendChild(messageSpan);
    notification.appendChild(closeBtn);
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 初始状态（透明+上移）
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // 自动隐藏
    const hideTimeout = setTimeout(() => {
        hideToast(notification);
    }, duration);
    
    // 存储timeout ID以便手动关闭时可以清除
    notification.dataset.hideTimeout = hideTimeout;
}

/**
 * 隐藏Toast通知
 * @param {HTMLElement} notification - 通知元素
 */
function hideToast(notification) {
    if (!notification || !notification.parentNode) return;
    
    // 清除自动隐藏定时器
    if (notification.dataset.hideTimeout) {
        clearTimeout(parseInt(notification.dataset.hideTimeout));
    }
    
    // 开始隐藏动画
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    // 动画完成后移除元素
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * 获取位置样式类
 * @param {string} position - 位置
 * @returns {string} 样式类
 */
function getPositionClasses(position) {
    const positions = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position] || positions['top-right'];
}

/**
 * 获取类型样式类
 * @param {string} type - 类型
 * @returns {string} 样式类
 */
function getTypeClasses(type) {
    const types = {
        'info': 'bg-blue-500 text-white border border-blue-600',
        'success': 'bg-green-500 text-white border border-green-600',
        'warning': 'bg-yellow-500 text-white border border-yellow-600',
        'error': 'bg-red-500 text-white border border-red-600'
    };
    return types[type] || types['info'];
}

/**
 * 获取图标类
 * @param {string} type - 类型
 * @returns {string} 图标类
 */
function getIconClass(type) {
    const icons = {
        'info': 'fa-info-circle',
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'error': 'fa-exclamation-circle'
    };
    return icons[type] || icons['info'];
}

/**
 * 显示成功通知
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 */
function showSuccessToast(message, duration = 3000) {
    showToast(message, 'success', duration);
}

/**
 * 显示错误通知
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 */
function showErrorToast(message, duration = 3000) {
    showToast(message, 'error', duration);
}

/**
 * 显示警告通知
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 */
function showWarningToast(message, duration = 3000) {
    showToast(message, 'warning', duration);
}

/**
 * 显示信息通知
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 */
function showInfoToast(message, duration = 3000) {
    showToast(message, 'info', duration);
}

// 导出函数
export {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    hideToast
};