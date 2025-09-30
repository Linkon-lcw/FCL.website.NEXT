/**
 * 开发者模式控制面板
 * 提供用户界面来管理和监控开发者模式
 */

import { devModeManager, LOG_LEVELS } from './devModeCore.js';
import Notification from '../utils/notification.js';

class DevModePanel {
    constructor() {
        this.panel = null;
        this.isVisible = false;
        this.updateInterval = null;
        this.activeTab = 'logs';
        this.isAutoUpdatePaused = false; // 自动更新暂停状态
    }

    /**
     * 创建控制面板
     */
    create() {
        if (this.panel) return;

        const panel = document.createElement('div');
        panel.id = 'dev-mode-panel';
        panel.className = 'fixed top-4 left-4 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 scroll-y rounded-lg shadow-lg z-50 hidden';
        
        panel.innerHTML = `
            <div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">开发者模式</h3>
                <div class="flex items-center space-x-2">
                    <button id="dev-mode-pause" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="暂停自动更新">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                    <button id="dev-mode-close" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="关闭面板">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="flex border-b border-gray-200 dark:border-gray-600">
                <button class="dev-mode-tab px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-blue-500" data-tab="logs">
                    日志
                </button>
                <button class="dev-mode-tab px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent" data-tab="performance">
                    性能
                </button>
                <button class="dev-mode-tab px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent" data-tab="network">
                    网络
                </button>
                <button class="dev-mode-tab px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent" data-tab="errors">
                    错误
                </button>
                <button class="dev-mode-tab px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent" data-tab="notifications">
                    通知
                </button>
                <button class="dev-mode-tab px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent" data-tab="config">
                    配置
                </button>
            </div>
            
            <div class="flex-1 overflow-hidden">
                <div id="dev-mode-content" class="h-64 overflow-auto p-3">
                    <!-- 内容将动态加载 -->
                </div>
            </div>
            
            <div class="p-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                <div class="flex space-x-2">
                    <button id="dev-mode-export" class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                        导出日志
                    </button>
                    <button id="dev-mode-clear" class="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                        清除日志
                    </button>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                    <span id="dev-mode-status">状态: 运行中</span>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;
        this.bindEvents();
        this.startAutoUpdate();
        
        // 初始化拖动功能
        this.initDrag();
    }

    /**
     * 绑定通知调试事件
     */
    bindNotificationEvents() {
        // 快速测试按钮
        document.querySelectorAll('.notification-test-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const message = btn.dataset.message;
                this.testNotification(type, message);
            });
        });

        // 自定义通知测试
        document.getElementById('notification-test-custom')?.addEventListener('click', () => {
            this.testCustomNotification();
        });

        // 测试所有类型
        document.getElementById('notification-test-all')?.addEventListener('click', () => {
            this.testAllNotifications();
        });

        // 清除所有通知
        document.getElementById('notification-clear-all')?.addEventListener('click', () => {
            this.clearAllNotifications();
        });

        // 顺序测试
        document.getElementById('notification-test-sequence')?.addEventListener('click', () => {
            this.testNotificationSequence();
        });

        // 堆叠测试
        document.getElementById('notification-test-stack')?.addEventListener('click', () => {
            this.testNotificationStack();
        });

        // 压力测试
        document.getElementById('notification-test-stress')?.addEventListener('click', () => {
            this.testNotificationStress();
        });

        // 边界条件测试
        document.getElementById('notification-test-long-message')?.addEventListener('click', () => {
            this.testLongMessage();
        });

        document.getElementById('notification-test-special-chars')?.addEventListener('click', () => {
            this.testSpecialCharacters();
        });

        document.getElementById('notification-test-html')?.addEventListener('click', () => {
            this.testHTMLContent();
        });

        document.getElementById('notification-test-extreme-time')?.addEventListener('click', () => {
            this.testExtremeTime();
        });

        // 交互测试
        document.getElementById('notification-test-hover')?.addEventListener('click', () => {
            this.testHoverEffect();
        });

        document.getElementById('notification-test-click')?.addEventListener('click', () => {
            this.testClickBehavior();
        });

        document.getElementById('notification-test-keyboard')?.addEventListener('click', () => {
            this.testKeyboardShortcuts();
        });

        // 样式自定义测试
        document.getElementById('notification-test-custom-style')?.addEventListener('click', () => {
            this.testCustomStyles();
        });

        document.getElementById('notification-test-animation')?.addEventListener('click', () => {
            this.testAnimationEffects();
        });
    }

    /**
     * 测试单个通知
     */
    testNotification(type, message) {
        const position = document.getElementById('notification-position')?.value || 'top-right';
        
        // 根据通知类型调用对应的通知方法
        switch (type) {
            case 'success':
                Notification.success(message, { position });
                break;
            case 'warning':
                Notification.warning(message, { position });
                break;
            case 'error':
                Notification.error(message, { position });
                break;
            case 'info':
                Notification.info(message, { position });
                break;
            default:
                Notification.info(message, { position });
        }

        this.addNotificationHistory(type, message);
    }

    /**
     * 测试自定义通知
     */
    testCustomNotification() {
        const type = document.getElementById('notification-type')?.value || 'info';
        const position = document.getElementById('notification-position')?.value || 'top-right';
        const length = document.getElementById('notification-length')?.value || 'medium';
        const customMessage = document.getElementById('notification-custom-message')?.value;

        let message = customMessage;
        
        // 如果没有自定义消息，使用预设消息
        if (!message || message.trim() === '') {
            const messageLengths = {
                'short': '短消息',
                'medium': '这是一条中等长度的通知消息，用于测试显示效果',
                'long': '这是一条非常长的通知消息，用于测试通知框的自动换行和高度自适应功能。这条消息应该足够长，能够测试通知框的最大宽度限制和文本换行效果。'
            };
            message = messageLengths[length] || messageLengths.medium;
        }

        this.testNotification(type, message);
    }

    /**
     * 测试所有通知类型
     */
    testAllNotifications() {
        const types = ['success', 'warning', 'error', 'info'];
        const messages = {
            'success': '成功通知测试',
            'warning': '警告通知测试',
            'error': '错误通知测试',
            'info': '信息通知测试'
        };

        types.forEach((type, index) => {
            setTimeout(() => {
                this.testNotification(type, messages[type]);
            }, index * 500); // 间隔500ms显示
        });
    }

    /**
     * 清除所有通知
     */
    clearAllNotifications() {
        // 获取所有通知元素并移除
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.remove();
        });
        
        // 更新历史记录
        this.updateNotificationHistory('所有通知已清除');
    }

    /**
     * 顺序测试通知
     */
    testNotificationSequence() {
        const sequence = [
            { type: 'info', message: '开始通知序列测试' },
            { type: 'success', message: '操作成功完成' },
            { type: 'warning', message: '请注意系统警告' },
            { type: 'error', message: '发生了一个错误' },
            { type: 'info', message: '序列测试完成' }
        ];

        sequence.forEach((item, index) => {
            setTimeout(() => {
                this.testNotification(item.type, item.message);
            }, index * 1000); // 间隔1秒显示
        });
    }

    /**
     * 添加通知历史记录
     */
    addNotificationHistory(type, message) {
        const historyElement = document.getElementById('notification-history');
        if (!historyElement) return;

        const timestamp = new Date().toLocaleTimeString();
        const typeLabels = {
            'success': '✅ 成功',
            'warning': '⚠️ 警告',
            'error': '❌ 错误',
            'info': 'ℹ️ 信息'
        };

        const historyItem = document.createElement('div');
        historyItem.className = 'notification-history-item border-b border-gray-200 dark:border-gray-600 py-1';
        historyItem.innerHTML = `
            <span class="font-medium">${typeLabels[type] || 'ℹ️ 信息'}</span>
            <span class="text-gray-500 dark:text-gray-400 text-xs ml-2">${timestamp}</span>
            <div class="text-gray-600 dark:text-gray-300 text-xs mt-1 truncate">${message}</div>
        `;

        // 限制历史记录数量
        const existingItems = historyElement.querySelectorAll('.notification-history-item');
        if (existingItems.length >= 10) {
            existingItems[existingItems.length - 1].remove();
        }

        // 如果当前显示"暂无通知历史"，先清除
        if (historyElement.textContent === '暂无通知历史') {
            historyElement.innerHTML = '';
        }

        historyElement.insertBefore(historyItem, historyElement.firstChild);
    }

    /**
     * 更新通知历史记录
     */
    updateNotificationHistory(message) {
        const historyElement = document.getElementById('notification-history');
        if (!historyElement) return;

        const timestamp = new Date().toLocaleTimeString();
        const historyItem = document.createElement('div');
        historyItem.className = 'notification-history-item border-b border-gray-200 dark:border-gray-600 py-1 text-blue-500 dark:text-blue-400';
        historyItem.innerHTML = `
            <span class="font-medium">🔧 系统</span>
            <span class="text-gray-500 dark:text-gray-400 text-xs ml-2">${timestamp}</span>
            <div class="text-xs mt-1">${message}</div>
        `;

        historyElement.insertBefore(historyItem, historyElement.firstChild);
    }

    /**
     * 测试通知堆叠效果
     */
    testNotificationStack() {
        const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
        const types = ['success', 'warning', 'error', 'info'];
        const messages = [
            '第一条通知消息',
            '第二条通知消息，稍长一些',
            '第三条通知消息，这是更长的消息内容用于测试堆叠效果',
            '第四条通知消息，测试多个通知同时显示时的布局'
        ];

        // 在每个位置显示不同类型的通知
        positions.forEach((position, posIndex) => {
            setTimeout(() => {
                const type = types[posIndex % types.length];
                const message = messages[posIndex % messages.length];
                
                // 在每个位置显示2个通知，测试堆叠
                for (let i = 0; i < 2; i++) {
                    setTimeout(() => {
                        this.testNotification(type, `${message} (${i + 1})`);
                    }, i * 300);
                }
            }, posIndex * 1000);
        });

        this.updateNotificationHistory('开始通知堆叠测试');
    }

    /**
     * 测试通知压力（大量通知同时显示）
     */
    testNotificationStress() {
        const types = ['success', 'warning', 'error', 'info'];
        const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
        
        // 显示20个通知，测试性能
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const type = types[i % types.length];
                const position = positions[i % positions.length];
                const message = `压力测试通知 #${i + 1}`;
                
                Notification[type](message, { 
                    position,
                    duration: 5000 + (i * 200) // 逐渐增加显示时间
                });
                
                this.addNotificationHistory(type, message);
            }, i * 100); // 每100ms显示一个通知
        }

        this.updateNotificationHistory('开始通知压力测试（20个通知）');
    }

    /**
     * 测试超长消息
     */
    testLongMessage() {
        const longMessage = '这是一条非常非常长的通知消息，用于测试通知框的自动换行和高度自适应功能。' +
            '这条消息应该足够长，能够测试通知框的最大宽度限制和文本换行效果。' +
            '我们继续添加更多内容来测试边界情况：' +
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' +
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
        
        this.testNotification('warning', longMessage);
        this.updateNotificationHistory('测试超长消息显示');
    }

    /**
     * 测试特殊字符
     */
    testSpecialCharacters() {
        const specialMessage = '特殊字符测试：!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\' +
            '中文测试：你好世界！' +
            'Emoji测试：😀🎉🚀⭐' +
            '数学符号：∑∫∮∞≠≤≥≈';
        
        this.testNotification('info', specialMessage);
        this.updateNotificationHistory('测试特殊字符显示');
    }

    /**
     * 测试HTML内容
     */
    testHTMLContent() {
        const htmlMessage = 'HTML内容测试：<strong>粗体文本</strong>，<em>斜体文本</em>，<u>下划线</u>，<code>代码</code>';
        
        // 直接使用Notification.show方法，避免HTML转义
        Notification.show(htmlMessage, { 
            type: 'error',
            position: 'top-right',
            duration: 5000
        });
        
        this.addNotificationHistory('error', 'HTML内容测试通知');
        this.updateNotificationHistory('测试HTML内容显示（可能显示原始HTML）');
    }

    /**
     * 测试极值时间设置
     */
    testExtremeTime() {
        // 获取用户选择的位置设置
        const position = document.getElementById('notification-position')?.value || 'top-right';
        
        // 测试极短时间（100ms）
        Notification.info('极短时间测试（100ms）', { 
            duration: 100,
            position: position
        });
        
        // 测试极长时间（30秒）
        setTimeout(() => {
            Notification.warning('极长时间测试（30秒）', { 
                duration: 30000,
                position: position
            });
        }, 500);
        
        this.updateNotificationHistory('测试极值时间设置（100ms和30秒）');
    }

    /**
     * 测试悬停效果
     */
    testHoverEffect() {
        const notification = Notification.info('悬停测试：将鼠标悬停在此通知上', { 
            duration: 10000, // 10秒，便于测试
            position: 'top-center'
        });
        
        // 添加自定义悬停样式
        if (notification) {
            notification.style.transition = 'all 0.3s ease';
            notification.addEventListener('mouseenter', () => {
                notification.style.transform = 'scale(1.05)';
                notification.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            });
            notification.addEventListener('mouseleave', () => {
                notification.style.transform = 'scale(1)';
                notification.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)';
            });
        }
        
        this.addNotificationHistory('info', '悬停效果测试通知');
        this.updateNotificationHistory('测试通知悬停效果');
    }

    /**
     * 测试点击行为
     */
    testClickBehavior() {
        const notification = Notification.success('点击测试：点击此通知测试交互', { 
            duration: 15000, // 15秒，便于测试
            position: 'bottom-center',
            autoClose: false // 禁用自动关闭，便于测试点击
        });
        
        if (notification) {
            notification.style.cursor = 'pointer';
            let clickCount = 0;
            
            notification.addEventListener('click', () => {
                clickCount++;
                const messageElement = notification.querySelector('span');
                if (messageElement) {
                    messageElement.textContent = `点击测试：已点击 ${clickCount} 次（点击关闭按钮或等待自动关闭）`;
                }
                
                // 点击3次后自动关闭
                if (clickCount >= 3) {
                    Notification.close(notification, 'bottom-center');
                }
            });
        }
        
        this.addNotificationHistory('success', '点击行为测试通知');
        this.updateNotificationHistory('测试通知点击交互行为');
    }

    /**
     * 测试键盘快捷键
     */
    testKeyboardShortcuts() {
        // 显示测试通知
        const notification = Notification.warning('键盘测试：按ESC键关闭此通知', { 
            duration: 10000,
            position: 'top-right',
            autoClose: false
        });
        
        // 添加键盘事件监听
        const handleKeyPress = (event) => {
            if (event.key === 'Escape' && notification.parentNode) {
                Notification.close(notification, 'top-right');
                document.removeEventListener('keydown', handleKeyPress);
                this.updateNotificationHistory('通过ESC键关闭通知');
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
        
        this.addNotificationHistory('warning', '键盘快捷键测试通知');
        this.updateNotificationHistory('测试键盘快捷键（ESC关闭）');
    }

    /**
     * 测试自定义样式
     */
    testCustomStyles() {
        const customNotification = Notification.show('自定义样式测试', { 
            type: 'info',
            position: 'top-right',
            duration: 8000,
            styles: {
                backgroundColor: '#8b5cf688',
                color: 'white',
                border: '2px solid #a78bfa',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold'
            },
            className: 'custom-notification-test'
        });
        
        this.addNotificationHistory('info', '自定义样式测试通知');
        this.updateNotificationHistory('测试自定义通知样式');
    }

    /**
     * 测试动画效果
     */
    testAnimationEffects() {
        // 测试不同的动画效果
        const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
        const animations = [
            { name: '淡入淡出', duration: 300 },
            { name: '滑动进入', duration: 400 },
            { name: '弹跳效果', duration: 500 },
            { name: '缩放效果', duration: 350 }
        ];
        
        positions.forEach((position, index) => {
            setTimeout(() => {
                const animation = animations[index];
                const notification = Notification.info(`动画测试：${animation.name}`, { 
                    position,
                    duration: 6000
                });
                
                if (notification) {
                    // 应用自定义动画
                    notification.style.transition = `all ${animation.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                }
                
                this.addNotificationHistory('info', `动画测试：${animation.name}`);
            }, index * 1500);
        });
        
        this.updateNotificationHistory('测试不同动画效果');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮 - 隐藏面板
        document.getElementById('dev-mode-close').addEventListener('click', () => {
            this.hide();
        });

        // 暂停自动更新按钮
        document.getElementById('dev-mode-pause').addEventListener('click', () => {
            this.toggleAutoUpdate();
        });

        // 标签切换
        document.querySelectorAll('.dev-mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // 导出日志
        document.getElementById('dev-mode-export').addEventListener('click', () => {
            devModeManager.exportLogs();
        });

        // 清除日志
        document.getElementById('dev-mode-clear').addEventListener('click', () => {
            if (confirm('确定要清除所有日志吗？')) {
                devModeManager.clearLogs();
                this.updateContent();
            }
        });
    }

    /**
     * 切换标签
     */
    switchTab(tabName) {
        this.activeTab = tabName;
        
        // 更新标签样式
        document.querySelectorAll('.dev-mode-tab').forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('border-blue-500', 'text-blue-600');
                tab.classList.remove('border-transparent');
            } else {
                tab.classList.remove('border-blue-500', 'text-blue-600');
                tab.classList.add('border-transparent');
            }
        });

        this.updateContent();
    }

    /**
     * 更新内容
     */
    updateContent() {
        const content = document.getElementById('dev-mode-content');
        const state = devModeManager.getState();

        switch (this.activeTab) {
            case 'logs':
                content.innerHTML = this.renderLogs(state.logs);
                break;
            case 'performance':
                content.innerHTML = this.renderPerformance(state);
                break;
            case 'network':
                content.innerHTML = this.renderNetwork(state);
                break;
            case 'errors':
                content.innerHTML = this.renderErrors(state);
                break;
            case 'notifications':
                content.innerHTML = this.renderNotifications();
                break;
            case 'config':
                content.innerHTML = this.renderConfig(state.config);
                break;
        }

    }

    /**
     * 渲染日志
     */
    renderLogs(logs) {
        if (!logs || logs.length === 0) {
            return '<div class="text-gray-500 dark:text-gray-400 text-center py-8">暂无日志</div>';
        }

        const logHtml = logs.slice(-50).reverse().map(log => {
            const levelColors = {
                0: 'text-blue-600 dark:text-blue-400', // DEBUG
                1: 'text-green-600 dark:text-green-400', // INFO
                2: 'text-yellow-600 dark:text-yellow-400', // WARN
                3: 'text-red-600 dark:text-red-400' // ERROR
            };

            const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
            const time = new Date(log.timestamp).toLocaleTimeString();
            const colorClass = levelColors[log.level] || 'text-gray-600 dark:text-gray-400';


            return `
                <div class="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-mono ${colorClass}">${levelNames[log.level]}</span>
                        <span class="text-gray-500 dark:text-gray-400">${time}</span>
                    </div>
                    <div class="text-gray-800 dark:text-gray-200">${this.escapeHtml(log.message)}</div>
                    ${log.type ? `<div class="text-gray-500 dark:text-gray-400 mt-1">类型: ${log.type}</div>` : ''}
                </div>
            `;
        }).join('');

        return `<div class="space-y-1">${logHtml}</div>`;
    }

    /**
     * 渲染性能信息
     */
    renderPerformance(state) {
        const { performance } = state;
        const metrics = performance.metrics;
        const uptime = performance.uptime;

        let metricsHtml = '';
        for (const [name, duration] of Object.entries(metrics)) {
            metricsHtml += `
                <div class="flex justify-between items-center py-1">
                    <span class="text-sm text-gray-700 dark:text-gray-300">${name}</span>
                    <span class="text-sm font-mono text-blue-600 dark:text-blue-400">${duration.toFixed(2)}ms</span>
                </div>
            `;
        }

        const memoryStats = state.memory;
        let memoryHtml = '';
        if (memoryStats) {
            memoryHtml = `
                <div class="mt-4">
                    <h4 class="font-semibold text-gray-800 dark:text-white mb-2">内存使用</h4>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">当前使用率</span>
                            <span class="font-mono text-purple-600 dark:text-purple-400">${memoryStats.current.usagePercentage}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">平均使用率</span>
                            <span class="font-mono text-purple-600 dark:text-purple-400">${memoryStats.averageUsage}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">峰值使用率</span>
                            <span class="font-mono text-purple-600 dark:text-purple-400">${memoryStats.peakUsage}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">采样次数</span>
                            <span class="font-mono text-purple-600 dark:text-purple-400">${memoryStats.samples}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // 添加内存监控数据
        const performanceData = state.performanceData || [];
        const memoryData = state.memoryData || [];
        let memoryTrendHtml = '';
        
        // 内存趋势图（如果有多条数据）
        if (memoryData.length > 1) {
            memoryTrendHtml = `
                <div class="mt-4">
                    <h4 class="font-semibold text-gray-800 dark:text-white mb-2">内存使用趋势</h4>
                    <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">最近 ${memoryData.length} 次采样</div>
                        <div class="h-20 flex items-end space-x-1">
            `;
            
            // 显示最近10次内存使用情况
            const recentData = memoryData.slice(-10);
            const maxMemory = Math.max(...recentData.map(d => d.memory ? d.memory.usedJSHeapSize : 0));
            
            recentData.forEach(data => {
                if (data.memory) {
                    const heightPercent = (data.memory.usedJSHeapSize / maxMemory) * 100;
                    memoryTrendHtml += `<div class="bg-blue-400 flex-1 rounded-t" style="height: ${Math.max(heightPercent, 10)}%"></div>`;
                }
            });
            
            memoryTrendHtml += `
                        </div>
                    </div>
                </div>
            `;
        }

        // 配置信息
        const configHtml = `
            <div class="mt-4">
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">监控配置</h4>
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm">
                    <div class="grid grid-cols-2 gap-2">
                        <div>性能采样频率: ${state.config.performanceSamplingInterval || 1000}ms</div>
                        <div>内存采样频率: ${state.config.memorySamplingInterval || 5000}ms</div>
                        <div>自动更新频率: ${state.config.autoUpdateInterval || 1000}ms</div>
                    </div>
                </div>
            </div>
        `;

        return `
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-gray-800 dark:text-white mb-2">运行时间</h4>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        ${uptime > 0 ? `运行了 ${(uptime / 1000).toFixed(1)} 秒` : '未运行'}
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-gray-800 dark:text-white mb-2">性能指标</h4>
                    <div class="space-y-1">
                        ${metricsHtml || '<div class="text-gray-500 dark:text-gray-400">暂无性能数据</div>'}
                    </div>
                </div>
                
                ${memoryHtml}
                ${memoryTrendHtml}
                ${configHtml}
            </div>
        `;
    }

    /**
     * 渲染网络信息
     */
    renderNetwork(state) {
        const { network } = state;
        const requests = state.networkRequests.slice(-20);

        let statsHtml = `
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">${network.successful}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">成功请求</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-red-600 dark:text-red-400">${network.failed}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">失败请求</div>
                </div>
            </div>
            <div class="text-center mb-4">
                <div class="text-lg font-semibold text-blue-600 dark:text-blue-400">${network.successRate}%</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">成功率</div>
            </div>
        `;

        let requestsHtml = '';
        if (requests.length > 0) {
            requestsHtml = requests.reverse().map(request => {
                const statusColor = request.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                const statusIcon = request.status === 'completed' ? '✓' : '✗';
                
                return `
                    <div class="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-mono ${statusColor}">${statusIcon} ${request.status}</span>
                            <span class="text-gray-500 dark:text-gray-400">${request.duration.toFixed(0)}ms</span>
                        </div>
                        <div class="text-gray-800 dark:text-gray-200 truncate">${this.escapeHtml(request.url)}</div>
                        ${request.error ? `<div class="text-red-600 dark:text-red-400 mt-1">${this.escapeHtml(request.error)}</div>` : ''}
                    </div>
                `;
            }).join('');
        }

        return `
            <div>
                ${statsHtml}
                <div>
                    <h4 class="font-semibold text-gray-800 dark:text-white mb-2">最近请求</h4>
                    <div class="space-y-1">
                        ${requestsHtml || '<div class="text-gray-500 dark:text-gray-400 text-center py-4">暂无请求记录</div>'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染错误信息
     */
    renderErrors(state) {
        const { errors } = state;
        const recentErrors = errors.recentErrors;

        let statsHtml = `
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center">
                    <div class="text-2xl font-bold text-red-600 dark:text-red-400">${errors.total}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">总错误数</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">${errors.globalErrors}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">全局错误</div>
                </div>
            </div>
        `;

        let errorsHtml = '';
        if (recentErrors.length > 0) {
            errorsHtml = recentErrors.map(error => {
                const errorColor = error.type === 'global' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400';
                const errorType = error.type === 'global' ? '全局错误' : 'Promise错误';
                const time = new Date(error.timestamp).toLocaleTimeString();
                
                return `
                    <div class="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-mono ${errorColor}">${errorType}</span>
                            <span class="text-gray-500 dark:text-gray-400">${time}</span>
                        </div>
                        <div class="text-gray-800 dark:text-gray-200 mb-1">${this.escapeHtml(error.message)}</div>
                        ${error.stack ? `<div class="text-gray-600 dark:text-gray-400 text-xs font-mono">${this.escapeHtml(error.stack)}</div>` : ''}
                    </div>
                `;
            }).join('');
        }

        return `
            <div>
                ${statsHtml}
                <div>
                    <h4 class="font-semibold text-gray-800 dark:text-white mb-2">最近错误</h4>
                    <div class="space-y-1">
                        ${errorsHtml || '<div class="text-gray-500 dark:text-gray-400 text-center py-4">暂无错误记录</div>'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染通知调试界面
     */
    renderNotifications() {
        const notificationTypes = [
            { type: 'success', label: '成功通知', color: 'bg-green-500 hover:bg-green-600', message: '操作成功完成！' },
            { type: 'warning', label: '警告通知', color: 'bg-yellow-500 hover:bg-yellow-600', message: '请注意：这是一个警告信息' },
            { type: 'error', label: '错误通知', color: 'bg-red-500 hover:bg-red-600', message: '发生了一个错误，请检查操作' },
            { type: 'info', label: '信息通知', color: 'bg-blue-500 hover:bg-blue-600', message: '这是一条普通信息通知' }
        ];

        const positions = [
            { value: 'top-right', label: '右上角' },
            { value: 'top-left', label: '左上角' },
            { value: 'bottom-right', label: '右下角' },
            { value: 'bottom-left', label: '左下角' },
            { value: 'top-center', label: '顶部居中' },
            { value: 'bottom-center', label: '底部居中' }
        ];

        const messageLengths = [
            { value: 'short', label: '短消息', message: '短消息' },
            { value: 'medium', label: '中等消息', message: '这是一条中等长度的通知消息，用于测试显示效果' },
            { value: 'long', label: '长消息', message: '这是一条非常长的通知消息，用于测试通知框的自动换行和高度自适应功能。这条消息应该足够长，能够测试通知框的最大宽度限制和文本换行效果。' }
        ];

        const notificationButtons = notificationTypes.map(nt => 
            `<button class="notification-test-btn px-3 py-2 text-white rounded text-sm ${nt.color} transition-colors" data-type="${nt.type}" data-message="${nt.message}">${nt.label}</button>`
        ).join('');

        const positionOptions = positions.map(pos => 
            `<option value="${pos.value}">${pos.label}</option>`
        ).join('');

        const messageOptions = messageLengths.map(ml => 
            `<option value="${ml.value}">${ml.label}</option>`
        ).join('');

        const html = `
            <div class="space-y-4">
                <h4 class="font-semibold text-gray-800 dark:text-white mb-3">通知调试工具</h4>
                
                <!-- 快速测试按钮 -->
                <div>
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">快速测试</h5>
                    <div class="grid grid-cols-2 gap-2">
                        ${notificationButtons}
                    </div>
                </div>

                <!-- 自定义通知设置 -->
                <div>
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">自定义通知</h5>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">通知类型</label>
                            <select id="notification-type" class="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700">
                                ${notificationTypes.map(nt => `<option value="${nt.type}">${nt.label}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">显示位置</label>
                            <select id="notification-position" class="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700">
                                ${positionOptions}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">消息长度</label>
                            <select id="notification-length" class="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700">
                                ${messageOptions}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">自定义消息</label>
                            <textarea id="notification-custom-message" class="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700" rows="2" placeholder="输入自定义通知消息..."></textarea>
                        </div>
                        
                        <div class="flex space-x-2">
                            <button id="notification-test-custom" class="flex-1 px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors">测试自定义通知</button>
                            <button id="notification-test-all" class="flex-1 px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors">测试所有类型</button>
                        </div>
                    </div>
                </div>

                <!-- 批量操作 -->
                <div>
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">批量操作</h5>
                    <div class="grid grid-cols-2 gap-2">
                        <button id="notification-clear-all" class="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors">清除所有通知</button>
                        <button id="notification-test-sequence" class="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors">顺序测试</button>
                        <button id="notification-test-stack" class="px-3 py-2 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 transition-colors">堆叠测试</button>
                        <button id="notification-test-stress" class="px-3 py-2 bg-pink-500 text-white rounded text-sm hover:bg-pink-600 transition-colors">压力测试</button>
                    </div>
                </div>

                <!-- 高级测试 -->
                <div>
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">高级测试</h5>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">边界条件测试</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button id="notification-test-long-message" class="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors">超长消息</button>
                                <button id="notification-test-special-chars" class="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors">特殊字符</button>
                                <button id="notification-test-html" class="px-3 py-2 bg-yellow-700 text-white rounded text-sm hover:bg-yellow-800 transition-colors">HTML内容</button>
                                <button id="notification-test-extreme-time" class="px-3 py-2 bg-yellow-800 text-white rounded text-sm hover:bg-yellow-900 transition-colors">极值时间</button>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">交互测试</label>
                            <div class="grid grid-cols-3 gap-2">
                                <button id="notification-test-hover" class="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors">悬停效果</button>
                                <button id="notification-test-click" class="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">点击行为</button>
                                <button id="notification-test-keyboard" class="px-3 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800 transition-colors">键盘操作</button>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">样式自定义测试</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button id="notification-test-custom-style" class="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors">自定义样式</button>
                                <button id="notification-test-animation" class="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">动画效果</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 通知历史 -->
                <div>
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">通知历史</h5>
                    <div id="notification-history" class="text-xs text-gray-500 dark:text-gray-400">
                        暂无通知历史
                    </div>
                </div>
            </div>
        `;

        // 绑定事件
        setTimeout(() => {
            this.bindNotificationEvents();
        }, 100);

        return html;
    }

    /**
     * 渲染配置
     */
    renderConfig(config) {
        const configItems = [
            { key: 'logLevel', label: '日志级别', type: 'select', options: ['DEBUG', 'INFO', 'WARN', 'ERROR'] },
            { key: 'enablePerformanceMonitor', label: '性能监控', type: 'checkbox' },
            { key: 'enableNetworkAnalysis', label: '网络分析', type: 'checkbox' },
            { key: 'enableErrorCapture', label: '错误捕获', type: 'checkbox' },
            { key: 'enableExternalRequestBlock', label: '阻止外部请求', type: 'checkbox' },
            { key: 'enableConsoleOverride', label: '控制台输出', type: 'checkbox' },
            { key: 'maxLogEntries', label: '最大日志条目', type: 'number', min: 100, max: 10000 },
            
            // 新增配置参数
            { key: 'autoUpdateInterval', label: '自动更新频率(ms)', type: 'number', min: 100, max: 10000 },
            { key: 'notificationDuration', label: '通知显示时长(ms)', type: 'number', min: 1000, max: 10000 },
            { key: 'networkRequestDelay', label: '网络请求延迟(ms)', type: 'number', min: 0, max: 5000 },
            { key: 'enableErrorSimulation', label: '启用错误模拟', type: 'checkbox' },
            { key: 'performanceSamplingInterval', label: '性能采样频率(ms)', type: 'number', min: 100, max: 5000 },
            { key: 'memorySamplingInterval', label: '内存采样频率(ms)', type: 'number', min: 1000, max: 10000 }
        ];

        const configHtml = configItems.map(item => {
            let inputHtml = '';
            
            if (item.type === 'checkbox') {
                inputHtml = `
                    <input type="checkbox" 
                           id="config-${item.key}" 
                           ${config[item.key] ? 'checked' : ''} 
                           class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                `;
            } else if (item.type === 'select') {
                const options = item.options.map(opt => 
                    `<option value="${LOG_LEVELS[opt]}" ${config[item.key] === LOG_LEVELS[opt] ? 'selected' : ''}>${opt}</option>`
                ).join('');
                inputHtml = `
                    <select id="config-${item.key}" class="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700">
                        ${options}
                    </select>
                `;
            } else if (item.type === 'number') {
                inputHtml = `
                    <input type="number" 
                           id="config-${item.key}" 
                           value="${config[item.key]}" 
                           min="${item.min}" 
                           max="${item.max}" 
                           class="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-20 bg-white dark:bg-gray-700">
                `;
            }

            return `
                <div class="flex justify-between items-center py-2">
                    <label for="config-${item.key}" class="text-sm text-gray-700 dark:text-gray-300">${item.label}</label>
                    ${inputHtml}
                </div>
            `;
        }).join('');

        // 绑定配置变更事件
        setTimeout(() => {
            configItems.forEach(item => {
                const element = document.getElementById(`config-${item.key}`);
                if (element) {
                    element.addEventListener('change', (e) => {
                        let value;
                        if (item.type === 'checkbox') {
                            value = e.target.checked;
                        } else if (item.type === 'select') {
                            value = parseInt(e.target.value);
                        } else if (item.type === 'number') {
                            value = parseInt(e.target.value);
                        }
                        
                        const newConfig = { [item.key]: value };
                        devModeManager.updateConfig(newConfig);
                    });
                }
            });
            
            // 绑定配置面板关闭按钮事件
            const closeButton = document.getElementById('dev-mode-config-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    if (confirm('确定要关闭开发者模式吗？这将禁用所有调试功能并刷新页面。')) {
                        devModeManager.disable();
                        updateUrlParameter('dev', '0');
                        window.location.reload();
                    }
                });
            }
        }, 100);

        return `
            <div class="space-y-3">
                <h4 class="font-semibold text-gray-800 dark:text-white mb-3">配置选项</h4>
                ${configHtml}
                
                <!-- 开发者模式关闭按钮 -->
                <div class="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        关闭开发者模式将禁用所有调试功能并刷新页面
                    </div>
                    <button id="dev-mode-config-close" class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors">
                        关闭开发者模式
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 显示面板
     */
    show() {
        if (!this.panel) {
            this.create();
        }
        
        this.panel.classList.remove('hidden');
        this.isVisible = true;
        this.updateContent();
    }

    /**
     * 隐藏面板
     */
    hide() {
        if (this.panel) {
            this.panel.classList.add('hidden');
            this.isVisible = false;
        }
    }

    /**
     * 最小化面板
     */
    minimize() {
        const content = document.getElementById('dev-mode-content');
        const footer = this.panel.querySelector('.p-3.border-t');
        
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            footer.classList.remove('hidden');
            this.panel.classList.remove('h-auto');
            this.panel.classList.add('h-96');
        } else {
            content.classList.add('hidden');
            footer.classList.add('hidden');
            this.panel.classList.remove('h-96');
            this.panel.classList.add('h-auto');
        }
    }

    /**
     * 开始自动更新
     */
    startAutoUpdate() {
        const state = devModeManager.getState();
        const interval = state.config.autoUpdateInterval || 1000;
        
        this.updateInterval = setInterval(() => {
            if (this.isVisible && !this.isAutoUpdatePaused) {
                this.updateContent();
            }
        }, interval);
    }

    /**
     * 暂停自动更新
     */
    pauseAutoUpdate() {
        this.isAutoUpdatePaused = true;
        this.updateStatus();
    }

    /**
     * 恢复自动更新
     */
    resumeAutoUpdate() {
        this.isAutoUpdatePaused = false;
        this.updateStatus();
    }

    /**
     * 切换自动更新状态
     */
    toggleAutoUpdate() {
        if (this.isAutoUpdatePaused) {
            this.resumeAutoUpdate();
        } else {
            this.pauseAutoUpdate();
        }
    }

    /**
     * 更新状态显示
     */
    updateStatus() {
        const statusElement = document.getElementById('dev-mode-status');
        if (statusElement) {
            if (this.isAutoUpdatePaused) {
                statusElement.textContent = '状态: 已暂停';
                statusElement.classList.add('text-yellow-500');
                statusElement.classList.remove('text-gray-500');
            } else {
                statusElement.textContent = '状态: 运行中';
                statusElement.classList.remove('text-yellow-500');
                statusElement.classList.add('text-gray-500');
            }
        }
    }

    /**
     * 初始化拖动功能
     */
    initDrag() {
        const panel = this.panel;
        const header = panel.querySelector('.flex.items-center.justify-between.p-3');
        
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        // 鼠标按下事件 - 开始拖动
        header.addEventListener('mousedown', (e) => {
            // 只允许通过标题栏拖动，排除按钮区域
            if (e.target.closest('button')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            // 获取当前面板位置
            const rect = panel.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            
            // 添加拖动样式
            panel.style.cursor = 'grabbing';
            panel.style.userSelect = 'none';
            
            e.preventDefault();
        });
        
        // 鼠标移动事件 - 处理拖动
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // 计算新位置，限制在窗口范围内
            const newLeft = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, startLeft + deltaX));
            const newTop = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, startTop + deltaY));
            
            // 应用新位置
            panel.style.position = 'fixed';
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            
            e.preventDefault();
        });
        
        // 鼠标释放事件 - 结束拖动
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                panel.style.cursor = '';
                panel.style.userSelect = '';
            }
        });
        
        // 触摸事件支持
        header.addEventListener('touchstart', (e) => {
            if (e.target.closest('button')) return;
            
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            const rect = panel.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            
            panel.style.cursor = 'grabbing';
            panel.style.userSelect = 'none';
            
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            const newLeft = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, startLeft + deltaX));
            const newTop = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, startTop + deltaY));
            
            panel.style.position = 'fixed';
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            
            e.preventDefault();
        });
        
        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                panel.style.cursor = '';
                panel.style.userSelect = '';
            }
        });
    }
    
    /**
     * 销毁面板
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
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

// 创建全局实例
const devModePanel = new DevModePanel();

// 创建统一开发者模式按钮
function createQuickAccessButton() {
    const button = document.createElement('button');
    button.id = 'dev-mode-quick-access';
    button.className = 'fixed bottom-4 right-4 w-12 h-12 rounded-full shadow-lg z-40 transition-colors glass-effect';
    button.innerHTML = `
        <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
    `;
    button.title = '开发者模式';
    
    button.addEventListener('click', () => {
        // 如果开发者模式未启用，先启用它
        if (!devModeManager.getState().isEnabled) {
            devModeManager.enable();
            updateUrlParameter('dev', '1');
            
            window.location.reload();
        } else {
            // 如果已启用，切换面板显示状态
            if (devModePanel.isVisible) {
                devModePanel.hide();
            } else {
                devModePanel.show();
            }
        }
    });
    
    document.body.appendChild(button);
    return button;
}

// 初始化开发者模式UI
function initDevModeUI() {
    // 创建统一开发者模式按钮
    createQuickAccessButton();
    
    // 设置按钮初始状态
    const button = document.getElementById('dev-mode-quick-access');
    if (button) {
        if (devModeManager.getState().isEnabled) {
            button.classList.remove('bg-gray-500/20');
            button.classList.add('ring-2');
            button.classList.add('ring-blue-500/20');
            button.title = '开发者模式 (点击打开/关闭面板)';
        } else {
            button.classList.remove('ring-2');
            button.classList.remove('ring-blue-500/20');
            button.classList.add('bg-gray-500/20');
            button.title = '开发者模式 (点击启用)';
        }
    }
    
    // 监听开发者模式状态变化
    document.addEventListener('devModeEnabled', () => {
        const button = document.getElementById('dev-mode-quick-access');
        if (button) {
            button.classList.remove('bg-gray-500/20');
            button.classList.add('ring-2');
            button.classList.add('ring-blue-500/20');
            button.title = '开发者模式 (点击打开/关闭面板)';
            // 启用时自动显示面板
            devModePanel.show();
        }
    });
    
    document.addEventListener('devModeDisabled', () => {
        const button = document.getElementById('dev-mode-quick-access');
        if (button) {
            button.classList.remove('ring-2');
            button.classList.remove('ring-blue-500/20');
            button.classList.add('bg-gray-500/20');
            button.title = '开发者模式 (点击启用)';
        }
        devModePanel.hide();
    });
}

// 导出
export {
    devModePanel,
    initDevModeUI
};