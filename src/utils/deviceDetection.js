// 设备检测逻辑

// 从旧代码中提取的架构匹配规则
const ARCH_RULES = [
    { regex: /aarch64|arm64|armv8/i, name: 'arm64-v8a' },
    { regex: /armeabi-v7a|(arm$)|armv7/i, name: 'armeabi-v7a' },
    { regex: /armeabi$/i, name: 'armeabi' },
    { regex: /x86_64|x64|amd64/i, name: 'x86_64' },
    { regex: /x86|i[36]86/i, name: 'x86' }
];

// 全局变量，用于存储设备信息
let sysInfo = '';
let sysArch = '';
let androidVer = 0;

/**
 * 架构检测：设备信息检测工具函数
 * @param {string} containerId - 要填充结果的容器元素ID
 */
async function showDeviceInfo(containerId) {
    let container = null;
    if (containerId) {
        container = document.getElementById(containerId);
        if (!container) {
            console.warn('架构检测：出错：没有容器：' + containerId);
            return;
        }
    }

    const updateContainer = content => {
        if (container) container.innerHTML = content;
    };

    if (!navigator.userAgent) {
        const msg = "架构检测：无法检测到您的设备信息";
        updateContainer(msg);
        console.warn(msg);
        return;
    }

    try {
        // 简化设备信息检测，不依赖外部库
        // 在实际项目中，可以考虑引入更轻量级的库或自己实现
        // 这里我们用一个简化的版本
        
        // 获取用户代理字符串
        const userAgent = navigator.userAgent;
        
        // 简单的系统检测
        let system = 'Unknown';
        let systemVersion = 'Unknown';
        
        if (userAgent.includes('Windows')) {
            system = 'Windows';
            // 简化版本检测
            if (userAgent.includes('Windows NT 10.0')) systemVersion = '10';
            else if (userAgent.includes('Windows NT 6.3')) systemVersion = '8.1';
            else if (userAgent.includes('Windows NT 6.2')) systemVersion = '8';
            else if (userAgent.includes('Windows NT 6.1')) systemVersion = '7';
        } else if (userAgent.includes('Mac OS X')) {
            system = 'macOS';
            // 简化版本检测
            const match = userAgent.match(/Mac OS X ([\d_]+)/);
            if (match) systemVersion = match[1].replace(/_/g, '.');
        } else if (userAgent.includes('Android')) {
            system = 'Android';
            // 简化版本检测
            const match = userAgent.match(/Android ([\d.]+)/);
            if (match) {
                systemVersion = match[1];
                androidVer = parseFloat(match[1]);
            }
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            system = 'iOS';
            // 简化版本检测
            const match = userAgent.match(/OS ([\d_]+)/);
            if (match) systemVersion = match[1].replace(/_/g, '.');
        } else if (userAgent.includes('Linux')) {
            system = 'Linux';
        }
        
        // 架构检测
        let archDisplay = 'Unknown';
        let archName = 'Unknown';
        
        // 尝试从navigator.platform获取架构信息
        const platform = navigator.platform || '';
        
        // 使用架构匹配规则
        const matchedRule = ARCH_RULES.find(r => r.regex.test(platform));
        if (matchedRule) {
            archName = matchedRule.name;
            archDisplay = `${matchedRule.name}(${platform})`;
        } else {
            // 如果没有匹配的规则，使用平台信息
            archName = platform;
            archDisplay = platform;
        }
        
        // 保存全局变量
        sysArch = archName;
        
        // 构建输出信息
        let output = '';
        if (system === 'Windows') {
            output = `您的系统为<code>${system} ${systemVersion}</code>，架构为<code>${archDisplay}</code>，仅供参考，不一定准。`;
        } else if (system === 'iOS' || system === 'macOS') {
            output = `您的系统为<code>${system} ${systemVersion}</code>，架构为<code>${archDisplay}</code>，仅供参考，不一定准。`;
        } else if (system === 'Android') {
            output = `您的系统为<code>${system} ${systemVersion}</code>，架构为<code>${archDisplay}</code>，仅供参考，不一定准。`;
        } else {
            output = `您的系统为<code>${system} ${systemVersion}</code>，架构为<code>${archDisplay}</code>，仅供参考，不一定准。`;
        }
        
        sysInfo = output;
        updateContainer(output);
        
        console.log(`架构检测：sysArch：${sysArch}`);
        console.log(`架构检测：androidVer：${androidVer}`);
        
    } catch (error) {
        const errorMsg = `架构检测：出错：${error.message || error}`;
        console.error(errorMsg);
        updateContainer(errorMsg);
    }
}

/**
 * 安卓版本检测：检测当前安卓版本是否大于等于给定的安卓版本
 * @param {number} version - 要比较的安卓版本号（支持小数）
 * @param {string} lineName - 附加信息
 * @returns {boolean} 是否通过检测
 */
function testAndroidVersion(version, lineName) {
    if (typeof version !== 'number' || isNaN(version)) {
        console.error('安卓版本检测：无效版本参数', version);
        return false;
    }

    const reqVersion = parseFloat(version);
    const currentVersion = androidVer;

    if (currentVersion === 0) {
        console.log('安卓版本检测：非安卓');
        // 在实际项目中，这里可以显示一个模态框或提示信息
        // 由于我们没有引入MDUI，这里只打印日志
        return false;
    }

    if (currentVersion < reqVersion) {
        console.log(`安卓版本检测：版本过低`);
        // 在实际项目中，这里可以显示一个模态框或提示信息
        // 由于我们没有引入MDUI，这里只打印日志
        return false;
    }

    console.log(`安卓版本检测：通过`);
    return true;
}

// 导出函数和变量
export { showDeviceInfo, testAndroidVersion, sysInfo, sysArch, androidVer };