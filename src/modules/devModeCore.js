/**
 * 开发者模式核心模块
 * 提供增强的调试工具、性能监控、错误捕获和网络分析功能
 */

// 日志级别枚举
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// 开发者模式配置
const DEV_MODE_CONFIG = {
    logLevel: LOG_LEVELS.INFO,
    enablePerformanceMonitor: true,
    enableNetworkAnalysis: true,
    enableErrorCapture: true,
    enableExternalRequestBlock: true,
    maxLogEntries: 1000,
    autoExportLogs: false,
    enableConsoleOverride: true
};

// 开发者模式状态
let devModeState = {
    isEnabled: false,
    startTime: null,
    logs: [],
    performanceMetrics: {},
    networkRequests: [],
    errors: [],
    memoryUsage: [],
    config: { ...DEV_MODE_CONFIG }
};

// 性能监控器
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
    }

    startMeasure(name) {
        if (!devModeState.isEnabled || !devModeState.config.enablePerformanceMonitor) return;
        this.startTimes.set(name, performance.now());
        console.log(`[PerformanceMonitor] 性能监控开始: ${name}`);
        this.log(`性能监控开始: ${name}`, LOG_LEVELS.DEBUG);
    }

    endMeasure(name) {
        if (!devModeState.isEnabled || !devModeState.config.enablePerformanceMonitor) return;
        const startTime = this.startTimes.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.metrics.set(name, duration);
            this.startTimes.delete(name);
            console.log(`[PerformanceMonitor] 性能监控结束: ${name}, 耗时: ${duration.toFixed(2)}ms`);
            this.log(`性能监控结束: ${name}, 耗时: ${duration.toFixed(2)}ms`, LOG_LEVELS.INFO);
        }
    }

    getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    log(message, level = LOG_LEVELS.INFO) {
        devModeState.logs.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            type: 'performance'
        });
        this.cleanupLogs();
    }

    cleanupLogs() {
        if (devModeState.logs.length > devModeState.config.maxLogEntries) {
            devModeState.logs = devModeState.logs.slice(-devModeState.config.maxLogEntries);
        }
    }
}

// 网络分析器
class NetworkAnalyzer {
    constructor() {
        this.requests = new Map();
        this.interceptedRequests = [];
    }

    interceptRequest(url, options = {}) {
        if (!devModeState.isEnabled || !devModeState.config.enableNetworkAnalysis) return null;
        
        const requestId = this.generateRequestId();
        const startTime = performance.now();
        
        this.requests.set(requestId, {
            url,
            options,
            startTime,
            status: 'pending'
        });

        return requestId;
    }

    completeRequest(requestId, response, error = null) {
        if (!devModeState.isEnabled || !devModeState.config.enableNetworkAnalysis) return;
        
        const request = this.requests.get(requestId);
        if (request) {
            const endTime = performance.now();
            const duration = endTime - request.startTime;
            
            const completedRequest = {
                ...request,
                endTime,
                duration,
                status: error ? 'failed' : 'completed',
                response: error ? null : {
                    status: response.status,
                    statusText: response.statusText,
                    headers: this.extractHeaders(response.headers)
                },
                error: error ? error.message : null
            };

            devModeState.networkRequests.push(completedRequest);
            this.requests.delete(requestId);

            const logLevel = error ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
            const logMessage = error 
                ? `网络请求失败: ${request.url}, 错误: ${error.message}, 耗时: ${duration.toFixed(2)}ms`
                : `网络请求完成: ${request.url}, 状态: ${response.status}, 耗时: ${duration.toFixed(2)}ms`;
            
            console.log(`[NetworkAnalyzer] ${logMessage}`);
            this.log(logMessage, logLevel);
        }
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    extractHeaders(headers) {
        const extracted = {};
        if (headers) {
            for (let [key, value] of headers.entries()) {
                extracted[key] = value;
            }
        }
        return extracted;
    }

    getNetworkStats() {
        const completed = devModeState.networkRequests;
        const total = completed.length;
        const successful = completed.filter(req => req.status === 'completed').length;
        const failed = completed.filter(req => req.status === 'failed').length;
        const avgDuration = total > 0 
            ? completed.reduce((sum, req) => sum + req.duration, 0) / total 
            : 0;

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total * 100).toFixed(2) : 0,
            avgDuration: avgDuration.toFixed(2)
        };
    }

    log(message, level = LOG_LEVELS.INFO) {
        devModeState.logs.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            type: 'network'
        });
    }
}

// 错误捕获器
class ErrorCapture {
    constructor() {
        this.originalErrorHandler = null;
        this.originalUnhandledRejectionHandler = null;
    }

    init() {
        if (!devModeState.isEnabled || !devModeState.config.enableErrorCapture) return;

        // 捕获全局错误
        this.originalErrorHandler = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
            this.captureError({
                type: 'global',
                message,
                source,
                lineno,
                colno,
                error: error ? error.stack : null,
                timestamp: new Date().toISOString()
            });

            // 调用原始错误处理器
            if (this.originalErrorHandler) {
                this.originalErrorHandler.call(window, message, source, lineno, colno, error);
            }
        };

        // 捕获未处理的Promise拒绝
        this.originalUnhandledRejectionHandler = window.onunhandledrejection;
        window.onunhandledrejection = (event) => {
            this.captureError({
                type: 'promise',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });

            // 调用原始处理器
            if (this.originalUnhandledRejectionHandler) {
                this.originalUnhandledRejectionHandler.call(window, event);
            }
        };
    }

    captureError(errorInfo) {
        devModeState.errors.push(errorInfo);
        console.log(`[ErrorCapture] 捕获错误: ${errorInfo.type} - ${errorInfo.message}`);
        this.log(`捕获错误: ${errorInfo.type} - ${errorInfo.message}`, LOG_LEVELS.ERROR);
    }

    destroy() {
        // 恢复原始错误处理器
        if (this.originalErrorHandler) {
            window.onerror = this.originalErrorHandler;
        }
        if (this.originalUnhandledRejectionHandler) {
            window.onunhandledrejection = this.originalUnhandledRejectionHandler;
        }
    }

    getErrorStats() {
        const errors = devModeState.errors;
        const globalErrors = errors.filter(e => e.type === 'global').length;
        const promiseErrors = errors.filter(e => e.type === 'promise').length;

        return {
            total: errors.length,
            globalErrors,
            promiseErrors,
            recentErrors: errors.slice(-10)
        };
    }

    log(message, level = LOG_LEVELS.INFO) {
        devModeState.logs.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            type: 'error'
        });
    }
}

// 内存监控器
class MemoryMonitor {
    constructor() {
        this.intervalId = null;
    }

    start() {
        if (!devModeState.isEnabled || !performance.memory) return;

        this.intervalId = setInterval(() => {
            const memoryInfo = performance.memory;
            const memoryData = {
                timestamp: new Date().toISOString(),
                usedJSHeapSize: memoryInfo.usedJSHeapSize,
                totalJSHeapSize: memoryInfo.totalJSHeapSize,
                jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
                usagePercentage: (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit * 100).toFixed(2)
            };

            devModeState.memoryUsage.push(memoryData);

            // 保持最近100条记录
            if (devModeState.memoryUsage.length > 100) {
                devModeState.memoryUsage = devModeState.memoryUsage.slice(-100);
            }

            // 如果内存使用率超过90%，发出警告
            if (parseFloat(memoryData.usagePercentage) > 90) {
                console.log(`[MemoryMonitor] 内存使用警告: ${memoryData.usagePercentage}%`);
                this.log(`内存使用警告: ${memoryData.usagePercentage}%`, LOG_LEVELS.WARN);
            }
        }, 5000); // 每5秒检查一次
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    getMemoryStats() {
        const usage = devModeState.memoryUsage;
        if (usage.length === 0) return null;

        const latest = usage[usage.length - 1];
        const avgUsage = usage.reduce((sum, data) => sum + parseFloat(data.usagePercentage), 0) / usage.length;

        return {
            current: latest,
            averageUsage: avgUsage.toFixed(2),
            peakUsage: Math.max(...usage.map(data => parseFloat(data.usagePercentage))).toFixed(2),
            samples: usage.length
        };
    }

    log(message, level = LOG_LEVELS.INFO) {
        devModeState.logs.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            type: 'memory'
        });
    }
}

// 核心开发者模式管理器
class DevModeManager {
    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
        this.networkAnalyzer = new NetworkAnalyzer();
        this.errorCapture = new ErrorCapture();
        this.memoryMonitor = new MemoryMonitor();
        this.originalFetch = null;
    }

    /**
     * 初始化开发者模式
     */
    init() {
        // 检查URL参数（优先级最高）
        const urlParams = new URLSearchParams(window.location.search);
        const devParam = urlParams.get('dev');
        
        // 如果URL参数为dev=0，明确禁用开发者模式（优先级最高）
        if (devParam === '0') {
            this.disable();
            console.log('[DevModeManager] 检测到URL参数 dev=0，禁用开发者模式');
            this.log('检测到URL参数 dev=0，禁用开发者模式', LOG_LEVELS.INFO);
            return;
        }
        
        // 检测是否为localhost访问
        const isLocalhost = this.isLocalhostAccess();
        
        // 检查本地存储
        // 禁用本地存储记录，确保每次都检查URL参数和localhost访问
        // const savedDevMode = localStorage.getItem('devMode');
        
        // 自动启用条件（dev=1参数、localhost访问）
        if (devParam === '1' || isLocalhost) {
            this.enable();
            
            if (devParam === '1') {
                console.log('[DevModeManager] 检测到URL参数 dev=1，启用开发者模式');
                this.log('检测到URL参数 dev=1，启用开发者模式', LOG_LEVELS.INFO);
            }
            if (isLocalhost) {
                console.log('[DevModeManager] 检测到localhost访问，自动启用开发者模式');
                this.log('检测到localhost访问，自动启用开发者模式', LOG_LEVELS.INFO);
            }
        }
    }

    /**
     * 启用开发者模式
     */
    enable() {
        if (devModeState.isEnabled) return;

        devModeState.isEnabled = true;
        devModeState.startTime = new Date().toISOString();

        // 初始化各个组件
        this.errorCapture.init();
        this.memoryMonitor.start();
        this.interceptFetch();

        // 添加开发者模式类到body
        document.body.classList.add('dev-mode');

        console.log('[DevModeManager] 开发者模式已启用');
        this.log('开发者模式已启用', LOG_LEVELS.INFO);
        
        // 显示启用通知
        this.showNotification('开发者模式已启用', 'success');
        
        // window.location.reload();
    }

    /**
     * 禁用开发者模式
     */
    disable() {
        if (!devModeState.isEnabled) return;

        devModeState.isEnabled = false;

        // 清理各个组件
        this.errorCapture.destroy();
        this.memoryMonitor.stop();
        this.restoreFetch();

        // 移除开发者模式类
        document.body.classList.remove('dev-mode');

        console.log('[DevModeManager] 开发者模式已禁用');
        this.log('开发者模式已禁用', LOG_LEVELS.INFO);
        
        // 显示禁用通知
        this.showNotification('开发者模式已禁用', 'info');

        
            // window.location.reload();
    }

    /**
     * 拦截fetch请求
     */
    interceptFetch() {
        if (!devModeState.config.enableExternalRequestBlock) return;

        this.originalFetch = window.fetch;
        const self = this;
        
        window.fetch = async function(url, options = {}) {
            const requestId = self.networkAnalyzer.interceptRequest(url, options);
            
            try {
                // 检查是否为外部请求
                if (self.isExternalUrl(url)) {
                    self.log(`阻止外部请求: ${url}`, LOG_LEVELS.WARN);

                    //排除'./src/settings/dev/Url.json'配置文件内指定的URL
                    const urlConfig = await self.loadUrlConfig('./src/settings/dev/Url.json');
                    if (urlConfig.urls.some(item => item.url === url && item.rule === 'pass')) {
                        self.log(`允许外部请求: ${url}`, LOG_LEVELS.INFO);
                        return self.originalFetch.call(this, url, options);
                    }

                    //帮我改成做一个随机延迟
                    const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3秒之间的随机延迟
                    await new Promise(resolve => setTimeout(resolve, delay));

                    //重定向到.\file\testdata\fclExample.json的内容
                    const response = await self.originalFetch.call(this, './file/testdata/fclExample.json');
                    const json = await response.json();
                    
                    const mockResponse = new Response(JSON.stringify({
                        message: json.message,
                        url: url
                    }), {
                        status: 200,
                        statusText: 'OK',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (requestId) {
                        self.networkAnalyzer.completeRequest(requestId, mockResponse);
                    }
                    
                    return mockResponse;
                }

                // 内部请求，正常执行
                const response = await self.originalFetch.call(this, url, options);
                
                if (requestId) {
                    self.networkAnalyzer.completeRequest(requestId, response);
                }
                
                return response;
            } catch (error) {
                if (requestId) {
                    self.networkAnalyzer.completeRequest(requestId, null, error);
                }
                throw error;
            }
        };
    }

    /**
     * 恢复原始fetch
     */
    restoreFetch() {
        if (this.originalFetch) {
            window.fetch = this.originalFetch;
            this.originalFetch = null;
        }
    }

    /**
     * 检查是否为localhost访问
     */
    isLocalhostAccess() {
        const hostname = window.location.hostname;
        return hostname === 'localhost' || 
               hostname === '127.0.0.1' || 
               hostname === '' ||
               hostname === '::1';
    }

    /**
     * 检查URL是否为外部URL
     */
    isExternalUrl(url) {
        try {
            // 如果URL是模块路径（如./src/modules/xxx.js），则是内部URL
            if (url.startsWith('./') || url.startsWith('/')) {
                return false;
            }
            
            // 如果URL包含://，则检查是否为同源
            if (url.includes('://')) {
                const currentOrigin = window.location.origin;
                const urlOrigin = new URL(url).origin;
                return urlOrigin !== currentOrigin;
            }
            
            // 如果是data:、blob:等协议，视为内部URL
            if (url.startsWith('data:') || url.startsWith('blob:')) {
                return false;
            }
            
            // 其他情况视为外部URL
            return true;
        } catch (e) {
            // 如果URL解析失败，视为外部URL
            return true;
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        // 使用统一的notification通知系统
        import('../utils/notification.js').then(module => {
            const notificationType = type === 'success' ? 'success' : 
                                   type === 'error' ? 'error' : 
                                   type === 'warn' ? 'warning' : 'info';
            module.default.show(message, { type: notificationType, duration: 3000, position: 'top-right' });
        }).catch(() => {
            // 如果notification模块加载失败，使用备用通知方式
            const notification = document.createElement('div');
            notification.className = `fixed top-20 right-4 px-4 py-2 rounded-md z-50 transition-opacity duration-300 ${
                type === 'success' ? 'bg-green-500' : 
                type === 'error' ? 'bg-red-500' : 
                type === 'warn' ? 'bg-yellow-500' : 'bg-blue-500'
            } text-white`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        });
    }

    /**
     * 记录日志
     */
    log(message, level = LOG_LEVELS.INFO) {
        devModeState.logs.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            type: 'system'
        });

        // 控制台输出
        if (devModeState.config.enableConsoleOverride) {
            const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
            const levelName = levelNames[level] || 'INFO';
            console.log(`[DevMode][${levelName}] ${message}`);
        }
    }

    /**
     * 获取开发者模式状态
     */
    getState() {
        return {
            ...devModeState,
            performance: {
                metrics: this.performanceMonitor.getMetrics(),
                uptime: devModeState.startTime ? 
                    new Date() - new Date(devModeState.startTime) : 0
            },
            network: this.networkAnalyzer.getNetworkStats(),
            errors: this.errorCapture.getErrorStats(),
            memory: this.memoryMonitor.getMemoryStats()
        };
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        devModeState.config = { ...devModeState.config, ...newConfig };
        console.log('[DevModeManager] 开发者模式配置已更新');
        this.log('开发者模式配置已更新', LOG_LEVELS.INFO);
    }

    /**
     * 导出日志
     */
    exportLogs() {
        const logs = {
            exportTime: new Date().toISOString(),
            state: this.getState(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        const blob = new Blob([JSON.stringify(logs, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dev-mode-logs-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('[DevModeManager] 日志已导出');
        this.log('日志已导出', LOG_LEVELS.INFO);
    }

    /**
     * 清除日志
     */
    clearLogs() {
        devModeState.logs = [];
        devModeState.networkRequests = [];
        devModeState.errors = [];
        devModeState.memoryUsage = [];
        this.performanceMonitor.metrics.clear();

        console.log('[DevModeManager] 日志已清除');
        this.log('日志已清除', LOG_LEVELS.INFO);
    }

    /**
     * 加载URL配置文件
     */
    async loadUrlConfig(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.log(`[DevModeManager] 加载URL配置文件失败: ${error.message}`);
            this.log(`加载URL配置文件失败: ${error.message}`, LOG_LEVELS.ERROR);
            return { urls: [] };
        }
    }
}

// 创建全局实例
const devModeManager = new DevModeManager();

// 导出函数和常量
export {
    devModeManager,
    LOG_LEVELS,
    DEV_MODE_CONFIG
};