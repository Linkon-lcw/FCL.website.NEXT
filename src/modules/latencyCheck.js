// 线路延迟检测功能
import { SOURCE_MAP } from './downloadWays.js';

/**
 * 检测单个线路的延迟
 * @param {string} url - 线路URL
 * @returns {Promise<number>} 延迟时间(ms)
 */
async function checkLatency(url) {
    const startTime = performance.now();
    try {
        // 对于JSON API，我们发送一个HEAD请求来测量延迟
        // 对于其他类型，可以考虑发送一个简单的GET请求或OPTIONS请求
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        const endTime = performance.now();
        return endTime - startTime;
    } catch (error) {
        console.error(`延迟检测失败 (${url}):`, error);
        // 如果检测失败，返回一个较大的延迟值
        return Infinity;
    }
}

/**
 * 检测所有线路的延迟
 * @returns {Promise<Object>} 包含所有线路延迟的对象
 */
async function checkAllLatencies() {
    const latencies = {};
    
    // 创建所有延迟检测的Promise
    const latencyPromises = Object.entries(SOURCE_MAP).map(async ([key, config]) => {
        const latency = await checkLatency(config.path);
        return { key, latency };
    });
    
    // 等待所有检测完成
    const results = await Promise.all(latencyPromises);
    
    // 将结果整理成对象
    results.forEach(({ key, latency }) => {
        latencies[key] = latency;
    });
    
    return latencies;
}

/**
 * 找到延迟最低的线路
 * @param {Object} latencies - 包含所有线路延迟的对象
 * @returns {string|null} 延迟最低的线路key，如果没有可用线路则返回null
 */
function findFastestLine(latencies) {
    let fastestKey = null;
    let minLatency = Infinity;
    
    for (const [key, latency] of Object.entries(latencies)) {
        // 忽略检测失败的线路(延迟为Infinity)
        if (latency < minLatency) {
            minLatency = latency;
            fastestKey = key;
        }
    }
    
    return fastestKey;
}

// 导出函数
export { checkLatency, checkAllLatencies, findFastestLine };