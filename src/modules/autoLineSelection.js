// 智能线路选择逻辑

import { DOWNLOAD_CATEGORIES } from './downloadWays.js';
import { checkAllLatenciesStream } from './latencyCheck.js';

let currentFastestLine = null;
let currentMinLatency = Infinity;

/**
 * 更新最快线路
 * @param {string} newFastestLine - 新的最快线路key
 * @param {number} newMinLatency - 新的最快线路延迟
 */
function updateFastestLine(newFastestLine, newMinLatency) {
    if (newMinLatency < currentMinLatency) {
        currentMinLatency = newMinLatency;
        currentFastestLine = newFastestLine;
        console.log(`智能线路选择: 发现更快线路 ${currentFastestLine} (延迟: ${currentMinLatency}ms)`);
        
        // 更新开门见山的线路选择器
        const odlmSelect = document.getElementById('odlmSelect');
        if (odlmSelect) {
            odlmSelect.value = currentFastestLine;
        }
        
        // 触发线路选择变化事件，更新下载链接
        window.setupIndexDownLinks(currentFastestLine);
    }
}

/**
 * 自动选择最快的线路 (流式版本)
 * @returns {Promise<string|null>} 最终选择的线路key，如果没有可用线路则返回null
 */
async function autoSelectFastestLine() {
    console.log('智能线路选择: 开始检测所有线路延迟...');
    
    // 重置状态
    currentFastestLine = null;
    currentMinLatency = Infinity;
    
    try {
        // 设置一个整体超时时间（例如3秒）
        const overallTimeout = 3000;
        let isCompleted = false;
        
        // 启动延迟检测流，只检测FCL线路
        checkAllLatenciesStream(
            (key, latency) => { // onResult
                // 排除F1线路
                if (key === 'F1') return;
                
                if (!isCompleted) {
                    console.log(`智能线路选择: 线路 ${key} 延迟 ${latency}ms`);
                    if (latency < Infinity) { // 忽略检测失败的线路
                        updateFastestLine(key, latency);
                    }
                }
            },
            () => { // onComplete
                isCompleted = true;
                console.log('智能线路选择: 所有线路延迟检测完成');
            },
            'F' // 只检测FCL线路
        );
        
        // 等待整体超时
        await new Promise(resolve => setTimeout(resolve, overallTimeout));
        isCompleted = true; // 标记完成，停止后续更新
        
        if (currentFastestLine) {
            console.log(`智能线路选择: 最终选择线路 ${currentFastestLine} (延迟: ${currentMinLatency}ms) 作为最快线路`);
            return currentFastestLine;
        } else {
            console.warn('智能线路选择: 未找到可用线路');
            return null;
        }
    } catch (error) {
        console.error('智能线路选择: 检测过程中出错', error);
        return null;
    }
}

/**
 * 初始化智能线路选择
 * 在页面加载完成后自动选择最快线路并更新开门见山的下载链接
 */
async function initAutoLineSelection() {
    // 确保在页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', doInit);
    } else {
        doInit();
    }
    
    async function doInit() {
        // 添加一个延迟，确保页面基本内容已经加载
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('智能线路选择: 初始化...');
        await autoSelectFastestLine();
    }
}

// 导出函数
export { autoSelectFastestLine, initAutoLineSelection };