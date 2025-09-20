// 性能监控模块

/**
 * 性能监控类
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.startTime = performance.now();
    }

    /**
     * 记录一个时间点
     * @param {string} name - 时间点名称
     */
    mark(name) {
        this.metrics[name] = performance.now() - this.startTime;
    }

    /**
     * 记录资源加载时间
     */
    measureResourceTiming() {
        const resources = performance.getEntriesByType('resource');
        const resourceMetrics = {};
        
        resources.forEach(resource => {
            resourceMetrics[resource.name] = {
                duration: resource.duration,
                startTime: resource.startTime,
                transferSize: resource.transferSize,
                decodedBodySize: resource.decodedBodySize
            };
        });
        
        return resourceMetrics;
    }

    /**
     * 获取页面加载指标
     */
    getPageLoadMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return null;
        
        return {
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnection: navigation.connectEnd - navigation.connectStart,
            requestTime: navigation.responseStart - navigation.requestStart,
            responseTime: navigation.responseEnd - navigation.responseStart,
            domParsing: navigation.domInteractive - navigation.domLoading,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
            totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
        };
    }

    /**
     * 获取内存使用情况
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * 生成性能报告
     */
    generateReport() {
        const report = {
            timePoints: this.metrics,
            pageLoadMetrics: this.getPageLoadMetrics(),
            resourceMetrics: this.measureResourceTiming(),
            memoryUsage: this.getMemoryUsage(),
            userAgent: navigator.userAgent
        };
        
        return report;
    }

    /**
     * 在控制台输出性能报告
     */
    logReport() {
        const report = this.generateReport();
        console.group('=== 性能监控报告 ===');
        console.log('时间点:', report.timePoints);
        console.log('页面加载指标:', report.pageLoadMetrics);
        console.log('内存使用情况:', report.memoryUsage);
        console.groupEnd();
    }

    /**
     * 更新公告中的性能数据
     */
    updateNoticePerformanceData() {
        // 延迟加载notice模块以避免循环依赖
        import('./notice.js').then(({ updatePerformanceDetails }) => {
            const perfData = this.generateReport();
            
            // 准备数据格式
            const noticePerfData = {
                network: {
                    dnsLookup: perfData.pageLoadMetrics?.dnsLookup,
                    tcpConnection: perfData.pageLoadMetrics?.tcpConnection,
                    requestTime: perfData.pageLoadMetrics?.requestTime,
                    responseTime: perfData.pageLoadMetrics?.responseTime
                },
                render: {
                    domParsing: perfData.pageLoadMetrics?.domParsing,
                    domContentLoaded: perfData.pageLoadMetrics?.domContentLoaded,
                    pageLoadTime: perfData.pageLoadMetrics?.pageLoadTime
                },
                resources: Object.entries(perfData.resourceMetrics).map(([name, metrics]) => ({
                    name,
                    ...metrics
                })),
                memory: perfData.memoryUsage
            };
            
            // 更新公告中的性能详情
            updatePerformanceDetails(noticePerfData);
        }).catch(error => {
            console.warn('无法更新公告性能数据:', error);
        });
    }

    /**
     * 创建性能报告面板
     */
    createReportPanel() {
        const report = this.generateReport();
        
        // 创建面板元素
        const panel = document.createElement('div');
        panel.id = 'performance-report-panel';
        panel.className = 'fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md z-50';
        panel.style.cssText = 'border: 1px solid #e5e7eb; max-height: 80vh; overflow-y: auto; font-family: monospace;';
        
        // 面板标题
        const title = document.createElement('h3');
        title.className = 'font-bold text-lg mb-2';
        title.textContent = '性能监控报告';
        panel.appendChild(title);
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'absolute top-2 right-2 text-gray-500 hover:text-gray-700';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => panel.remove();
        panel.appendChild(closeBtn);
        
        // 时间点信息
        if (Object.keys(report.timePoints).length > 0) {
            const timePointsSection = document.createElement('div');
            timePointsSection.className = 'mb-3';
            timePointsSection.innerHTML = '<strong>时间点:</strong><br>';
            
            Object.entries(report.timePoints).forEach(([name, time]) => {
                const p = document.createElement('p');
                p.className = 'text-sm';
                p.innerHTML = `<span class="font-medium">${name}:</span> ${time.toFixed(2)}ms`;
                timePointsSection.appendChild(p);
            });
            
            panel.appendChild(timePointsSection);
        }
        
        // 页面加载指标
        if (report.pageLoadMetrics) {
            const pageLoadSection = document.createElement('div');
            pageLoadSection.className = 'mb-3';
            pageLoadSection.innerHTML = '<strong>页面加载指标:</strong><br>';
            
            Object.entries(report.pageLoadMetrics).forEach(([name, time]) => {
                const p = document.createElement('p');
                p.className = 'text-sm';
                p.innerHTML = `<span class="font-medium">${name}:</span> ${time.toFixed(2)}ms`;
                pageLoadSection.appendChild(p);
            });
            
            panel.appendChild(pageLoadSection);
        }
        
        // 内存使用情况
        if (report.memoryUsage) {
            const memorySection = document.createElement('div');
            memorySection.className = 'mb-3';
            memorySection.innerHTML = '<strong>内存使用:</strong><br>';
            
            Object.entries(report.memoryUsage).forEach(([name, size]) => {
                const p = document.createElement('p');
                p.className = 'text-sm';
                p.innerHTML = `<span class="font-medium">${name}:</span> ${(size / 1024 / 1024).toFixed(2)} MB`;
                memorySection.appendChild(p);
            });
            
            panel.appendChild(memorySection);
        }
        
        return panel;
    }
}

// 创建全局性能监控实例
const perfMonitor = new PerformanceMonitor();

// 记录DOM加载完成时间
document.addEventListener('DOMContentLoaded', () => {
    perfMonitor.mark('DOMContentLoaded');
});

// 记录页面加载完成时间
window.addEventListener('load', () => {
    perfMonitor.mark('PageLoadComplete');
    
    // 延迟一段时间后记录最终状态并更新公告数据
    setTimeout(() => {
        perfMonitor.mark('FinalState');
        perfMonitor.logReport();
        perfMonitor.updateNoticePerformanceData();
    }, 1000);
});

// 导出性能监控实例和类
export { PerformanceMonitor, perfMonitor };