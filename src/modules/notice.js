// 公告系统模块
import { initCollapsiblePanels } from '../components/ReusableCollapsiblePanel.js';
import { devModeFetch } from './devMode.js';
import { showErrorToast } from '../utils/toast.js';

/**
 * 打开公告
 * @param {boolean} [forceShow=false] 强制显示公告，忽略哈希检查
 */
async function openNotice(forceShow = false) {
    try {
        // 获取公告内容
        const response = await devModeFetch('/src/pages/notice.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const noticeContent = await response.text();
        
        // 创建公告对话框
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50';
        dialog.innerHTML = `
            <div class="glass-effect rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col ">
                <div class="flex justify-between items-center p-4 glass-effect">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">公告</h3>
                    <button id="close-notice" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="overflow-y-auto flex-grow p-4 max-h-[calc(90vh-8rem)] glass-effect" id="notice-content">
                    ${noticeContent}
                </div>
                <div class="flex justify-end p-4 border-t border-gray-200 border-opacity-20">
                    <button id="close-notice-btn" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded">
                        确认
                    </button>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(dialog);
        
        // 添加事件监听器
        document.getElementById('close-notice').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('close-notice-btn').addEventListener('click', () => {
            dialog.remove();
        });
        
        // 初始化折叠面板组件
        setTimeout(() => {
            // 清除已存在的监听器标记，确保重新初始化
            const panelHeaders = dialog.querySelectorAll('.collapsible-panel-header');
            panelHeaders.forEach(header => {
                delete header.dataset.listenerAdded;
            });
            
            initCollapsiblePanels(dialog);
        }, 100);
        
        // 添加性能详情切换功能
        const toggleButton = document.getElementById('toggle-performance-details');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                const details = document.getElementById('performance-details');
                if (details) {
                    details.classList.toggle('hidden');
                    toggleButton.textContent = details.classList.contains('hidden') 
                        ? '显示详细性能信息' 
                        : '隐藏详细性能信息';
                }
            });
        }
        
        // 初始化性能数据显示
        initPerformanceDisplay();
        
    } catch (error) {
        console.error('公告：加载出错：', error);
        showErrorToast('公告加载失败: ' + error.message);
    }
}

/**
 * 初始化性能数据显示
 */
function initPerformanceDisplay() {
    // 显示加载时间
    const loadTimeDisplay = document.getElementById('loadTimeDisplay');
    if (loadTimeDisplay) {
        // 获取页面加载时间
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            loadTimeDisplay.textContent = navigation.loadEventEnd.toFixed(2) + ' ms';
        } else {
            loadTimeDisplay.textContent = '数据不可用';
        }
    }
    
    // 显示模块加载时间
    const moduleLoadTimes = document.getElementById('moduleLoadTimes');
    if (moduleLoadTimes) {
        moduleLoadTimes.style.display = 'block';
        const moduleLoadTimesList = document.getElementById('moduleLoadTimesList');
        if (moduleLoadTimesList) {
            // 这里应该从性能监控模块获取实际数据
            moduleLoadTimesList.innerHTML = '<li>模块加载时间数据将在后续版本中提供</li>';
        }
    }
}

/**
 * 更新详细性能信息
 * @param {Object} perfData - 性能数据
 */
function updatePerformanceDetails(perfData) {
    // 更新网络性能
    const networkPerf = document.getElementById('network-performance');
    if (networkPerf && perfData.network) {
        networkPerf.innerHTML = `
            <li>DNS查询: ${perfData.network.dnsLookup?.toFixed(2) || '-'} ms</li>
            <li>TCP连接: ${perfData.network.tcpConnection?.toFixed(2) || '-'} ms</li>
            <li>请求时间: ${perfData.network.requestTime?.toFixed(2) || '-'} ms</li>
            <li>响应时间: ${perfData.network.responseTime?.toFixed(2) || '-'} ms</li>
        `;
    }
    
    // 更新页面渲染性能
    const renderPerf = document.getElementById('render-performance');
    if (renderPerf && perfData.render) {
        renderPerf.innerHTML = `
            <li>DOM解析: ${perfData.render.domParsing?.toFixed(2) || '-'} ms</li>
            <li>DOM内容加载: ${perfData.render.domContentLoaded?.toFixed(2) || '-'} ms</li>
            <li>页面加载: ${perfData.render.pageLoadTime?.toFixed(2) || '-'} ms</li>
        `;
    }
    
    // 更新资源详情
    const resourceDetails = document.getElementById('resource-details');
    if (resourceDetails && perfData.resources) {
        resourceDetails.innerHTML = perfData.resources.slice(0, 10).map(resource => `
            <tr class="border-b">
                <td class="py-2">${getResourceName(resource.name)}</td>
                <td class="py-2">${(resource.decodedBodySize / 1024).toFixed(2)} KB</td>
                <td class="py-2">${resource.duration.toFixed(2)} ms</td>
            </tr>
        `).join('');
    }
    
    // 更新内存使用
    const memoryUsage = document.getElementById('memory-usage');
    if (memoryUsage && perfData.memory) {
        memoryUsage.innerHTML = `
            <li>已使用内存: ${(perfData.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</li>
            <li>总内存: ${(perfData.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB</li>
            <li>内存限制: ${(perfData.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</li>
        `;
    }
}

/**
 * 获取资源名称
 * @param {string} resourceName - 资源URL
 * @returns {string} 资源名称
 */
function getResourceName(resourceName) {
    try {
        const url = new URL(resourceName);
        return url.pathname.split('/').pop() || url.hostname;
    } catch {
        return resourceName;
    }
}

// 导出函数
export { openNotice, updatePerformanceDetails };