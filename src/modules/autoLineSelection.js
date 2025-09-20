// 智能线路选择逻辑

import { SOURCE_MAP } from './downloadWays.js';
import { checkAllLatencies, findFastestLine } from './latencyCheck.js';

/**
 * 自动选择最快的线路
 * @returns {Promise<string|null>} 最快的线路key，如果没有可用线路则返回null
 */
async function autoSelectFastestLine() {
    console.log('智能线路选择: 开始检测所有线路延迟...');
    
    try {
        // 检测所有线路的延迟
        const latencies = await checkAllLatencies();
        console.log('智能线路选择: 所有线路延迟检测完成', latencies);
        
        // 找到延迟最低的线路
        const fastestLine = findFastestLine(latencies);
        
        if (fastestLine) {
            console.log(`智能线路选择: 选择线路 ${fastestLine} (延迟: ${latencies[fastestLine]}ms) 作为最快线路`);
            return fastestLine;
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
        const fastestLine = await autoSelectFastestLine();
        
        if (fastestLine) {
            // 更新开门见山的线路选择器
            const odlmSelect = document.getElementById('odlmSelect');
            if (odlmSelect) {
                odlmSelect.value = fastestLine;
            }
            
            // 触发线路选择变化事件，更新下载链接
            // 注意：这里需要确保setupIndexDownLinks函数已经定义并可访问
            // 由于模块化的原因，可能需要通过某种方式导入或确保其可用
            window.setupIndexDownLinks(fastestLine);
        }
    }
}

// 导出函数
export { autoSelectFastestLine, initAutoLineSelection };