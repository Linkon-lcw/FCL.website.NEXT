/**
 * 开发者模式控制面板
 * 提供用户界面来管理和监控开发者模式
 */

import { devModeManager, LOG_LEVELS } from './devModeCore.js';

class DevModePanel {
    constructor() {
        this.panel = null;
        this.isVisible = false;
        this.updateInterval = null;
        this.activeTab = 'logs';
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
                    <button id="dev-mode-minimize" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                        </svg>
                    </button>
                    <button id="dev-mode-close" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
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
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮 - 禁用开发者模式
        document.getElementById('dev-mode-close').addEventListener('click', () => {
            devModeManager.disable();
            updateUrlParameter('dev', '0');
            this.hide();
        });

        // 最小化按钮
        document.getElementById('dev-mode-minimize').addEventListener('click', () => {
            this.minimize();
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
            { key: 'maxLogEntries', label: '最大日志条目', type: 'number', min: 100, max: 10000 }
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
        }, 100);

        return `
            <div class="space-y-3">
                <h4 class="font-semibold text-gray-800 dark:text-white mb-3">配置选项</h4>
                ${configHtml}
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
        this.updateInterval = setInterval(() => {
            if (this.isVisible) {
                this.updateContent();
            }
        }, 1000); // 每秒更新一次
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