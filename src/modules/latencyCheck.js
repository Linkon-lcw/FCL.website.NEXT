// 线路延迟检测功能
import { SOURCE_MAP } from './downloadWays.js';
import { devModeFetch, isDevModeEnabled } from './devMode.js';

/**
 * 检测单个线路的延迟
 * @param {string} url - 线路URL
 * @returns {Promise<number>} 延迟时间(ms)
 */
async function checkLatency(url) {
    // 如果开发者模式已启用，直接返回一个较大的延迟值
    if (isDevModeEnabled()) {
        console.warn(`开发者模式：跳过延迟检测 - ${url}`);
        return Infinity;
    }
    
    const startTime = performance.now();
    try {
        // 设置超时时间（例如3秒）
        const timeout = 3000;
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('延迟检测超时')), timeout)
        );

        // 对于JSON API，我们发送一个HEAD请求来测量延迟
        // 对于其他类型，可以考虑发送一个简单的GET请求或OPTIONS请求
        const fetchPromise = devModeFetch(url, { method: 'HEAD', mode: 'no-cors' });
        
        // 使用Promise.race来处理超时
        await Promise.race([fetchPromise, timeoutPromise]);
        
        const endTime = performance.now();
        return endTime - startTime;
    } catch (error) {
        console.error(`延迟检测失败 (${url}):`, error.message);
        // 如果检测失败或超时，返回一个较大的延迟值
        return Infinity;
    }
}

/**
 * 检测所有线路的延迟 (流式版本)
 * @param {function(string, number)} onResult - 当一个线路检测完成时的回调函数 (key, latency)
 * @param {function()} onComplete - 当所有线路检测完成时的回调函数
 * @param {string} prefix - 只检测指定前缀的线路
 */
async function checkAllLatenciesStream(onResult, onComplete, prefix = '') {
    // 过滤出指定前缀的线路
    const filteredSourceMap = {};
    for (const [key, config] of Object.entries(SOURCE_MAP)) {
        if (key.startsWith(prefix)) {
            filteredSourceMap[key] = config;
        }
    }
    
    const promises = Object.entries(filteredSourceMap).map(async ([key, config]) => {
        const latency = await checkLatency(config.path);
        onResult(key, latency);
    });

    // 等待所有检测完成
    await Promise.all(promises);
    onComplete();
}

/**
 * 检测所有线路的延迟 (旧版一次性返回)
 * @param {string} prefix - 只检测指定前缀的线路
 * @returns {Promise<Object>} 包含所有线路延迟的对象
 */
async function checkAllLatencies(prefix = '') {
    // 过滤出指定前缀的线路
    const filteredSourceMap = {};
    for (const [key, config] of Object.entries(SOURCE_MAP)) {
        if (key.startsWith(prefix)) {
            filteredSourceMap[key] = config;
        }
    }
    
    const latencies = {};
    
    // 创建所有延迟检测的Promise
    const latencyPromises = Object.entries(filteredSourceMap).map(async ([key, config]) => {
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
export { checkLatency, checkAllLatenciesStream, checkAllLatencies, findFastestLine };