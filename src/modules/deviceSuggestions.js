/**
 * 设备建议模块 - 从旧版移植的设备建议功能
 * 提供设备检测和Minecraft相关建议
 */

/**
 * 显示设备信息
 * @param {string} containerId - 可选的容器元素ID
 * @returns {string} 设备信息HTML
 */
function showDeviceInfo(containerId) {
    const userAgent = navigator.userAgent || '';
    let system = 'Unknown';
    let systemVersion = 'Unknown';

    if (userAgent.includes('Windows')) {
        system = 'Windows';
        if (userAgent.includes('Windows NT 10.0')) systemVersion = '10';
        else if (userAgent.includes('Windows NT 6.3')) systemVersion = '8.1';
        else if (userAgent.includes('Windows NT 6.2')) systemVersion = '8';
        else if (userAgent.includes('Windows NT 6.1')) systemVersion = '7';
        else if (userAgent.includes('Windows NT 6.0')) systemVersion = 'Vista';
        else if (userAgent.includes('Windows NT 5.1')) systemVersion = 'XP';
    } else if (userAgent.includes('Mac OS X')) {
        system = 'macOS';
        const match = userAgent.match(/Mac OS X ([\d_]+)/);
        if (match) systemVersion = match[1].replace(/_/g, '.');
    } else if (userAgent.includes('Android')) {
        system = 'Android';
        const match = userAgent.match(/Android ([\d.]+)/);
        if (match) systemVersion = match[1];
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        system = 'iOS';
        const match = userAgent.match(/OS ([\d_]+)/);
        if (match) systemVersion = match[1].replace(/_/g, '.');
    } else if (userAgent.includes('Linux')) {
        system = 'Linux';
    }

    const deviceInfoHTML = `<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 class="font-semibold text-gray-800 mb-2">设备信息</h3>
        <p class="text-gray-700">系统：<code class="bg-gray-100 px-1 rounded">${system} ${systemVersion}</code></p>
        <p class="text-gray-700">架构：<code class="bg-gray-100 px-1 rounded">${sysArch || 'Unknown'}</code></p>
    </div>`;

    // 如果提供了容器ID，则直接更新容器内容
    if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = deviceInfoHTML;
        }
    }

    return deviceInfoHTML;
}

// 全局变量用于存储设备信息
let sysInfo = '';
let sysArch = '';
let androidVer = 0;

/** 架构匹配规则 */
const ARCH_RULES = [
  { regex: /aarch64|arm64|armv8/i, name: 'arm64-v8a' },
  { regex: /armeabi-v7a|(arm$)|armv7/i, name: 'armeabi-v7a' },
  { regex: /armeabi$/i, name: 'armeabi' },
  { regex: /x86_64|x64|amd64/i, name: 'x86_64' },
  { regex: /x86|i[36]86/i, name: 'x86' }
];

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
  const currentVersion = parseFloat(androidVer);

  if (currentVersion === 0) {
    console.log('安卓版本检测：非安卓');
    alert(`安卓版本检测：非安卓\n您不是Android系统，而${lineName}最低要求 Android ${reqVersion} 。（仅供参考，不一定准）`);
    return false;
  }

  if (currentVersion < reqVersion) {
    console.log(`安卓版本检测：版本过低`);
    alert(`安卓版本检测：版本过低\n您的Android版本为 ${currentVersion} ，而${lineName}最低要求 Android ${reqVersion} 。（仅供参考，不一定准）`);
    return false;
  }

  console.log(`安卓版本检测：通过`);
  return true;
}

/**
 * 显示设备建议 - 根据设备类型提供Minecraft相关建议
 * @param {string} containerId - 要填充建议的容器元素ID
 */
async function showDeviceSuggestions(containerId) {
    // 等待容器元素加载完成
    let container = null;
    let attempts = 0;
    const maxAttempts = 50; // 最多等待5秒（50 * 100ms）
    
    if (containerId) {
        while (!container && attempts < maxAttempts) {
            container = document.getElementById(containerId);
            if (!container) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
        
        if (!container) {
            console.warn('设备建议：超时未找到容器：' + containerId);
            return;
        }
    }

    const updateContainer = content => {
        if (container) container.innerHTML = content;
    };

    if (!navigator.userAgent) {
        const msg = "设备建议：无法检测到您的设备信息";
        updateContainer(msg);
        console.warn(msg);
        return;
    }

    try {
        // 获取用户代理字符串
        const userAgent = navigator.userAgent;
        
        // 简单的系统检测
        let system = 'Unknown';
        let systemVersion = 'Unknown';
        
        // 更新全局变量
        if (userAgent.includes('Android')) {
            const match = userAgent.match(/Android ([\d.]+)/);
            androidVer = match ? parseFloat(match[1]) : 0;
        } else {
            androidVer = 0;
        }
        
        // 简单的架构检测
        if (userAgent.includes('x64') || userAgent.includes('x86_64') || userAgent.includes('amd64')) {
            sysArch = 'x86_64';
        } else if (userAgent.includes('x86') || userAgent.includes('i386') || userAgent.includes('i686')) {
            sysArch = 'x86';
        } else if (userAgent.includes('arm64') || userAgent.includes('aarch64')) {
            sysArch = 'arm64-v8a';
        } else if (userAgent.includes('armv7') || userAgent.includes('armeabi-v7a')) {
            sysArch = 'armeabi-v7a';
        } else if (userAgent.includes('armeabi')) {
            sysArch = 'armeabi';
        } else {
            sysArch = 'Unknown';
        }
        
        if (userAgent.includes('Windows')) {
            system = 'Windows';
            // Windows版本检测
            if (userAgent.includes('Windows NT 10.0')) systemVersion = '10';
            else if (userAgent.includes('Windows NT 6.3')) systemVersion = '8.1';
            else if (userAgent.includes('Windows NT 6.2')) systemVersion = '8';
            else if (userAgent.includes('Windows NT 6.1')) systemVersion = '7';
            else if (userAgent.includes('Windows NT 6.0')) systemVersion = 'Vista';
            else if (userAgent.includes('Windows NT 5.1')) systemVersion = 'XP';
        } else if (userAgent.includes('Mac OS X')) {
            system = 'macOS';
            // macOS版本检测
            const match = userAgent.match(/Mac OS X ([\d_]+)/);
            if (match) systemVersion = match[1].replace(/_/g, '.');
        } else if (userAgent.includes('Android')) {
            system = 'Android';
            // Android版本检测
            const match = userAgent.match(/Android ([\d.]+)/);
            if (match) {
                systemVersion = match[1];
            }
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            system = 'iOS';
            // iOS版本检测
            const match = userAgent.match(/OS ([\d_]+)/);
            if (match) systemVersion = match[1].replace(/_/g, '.');
        } else if (userAgent.includes('Linux')) {
            system = 'Linux';
        }
        
        // 架构显示
        let archDisplay = sysArch || 'Unknown';
        
        // 根据设备类型提供建议
        let suggestions = '';
        
        if (system.includes("Windows")) {
            // Windows Phone也是Windows
            if (parseFloat(systemVersion) < 10) {
                // windows10之前系统特殊处理
                suggestions = `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h3 class="font-semibold text-yellow-800 mb-2">⚠️ 系统版本提醒</h3>
                        <p class="text-yellow-700 mb-2">您的系统为 <code class="bg-yellow-100 px-1 rounded">${system} ${systemVersion}</code>，架构为 <code class="bg-yellow-100 px-1 rounded">${archDisplay}</code>。</p>
                        <p class="text-yellow-700">您正在使用较旧的Windows版本，建议升级到Windows 10或更高版本以获得更好的体验。</p>
                    </div>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 class="font-semibold text-blue-800 mb-2">💡 Minecraft 建议</h3>
                        <p class="text-blue-700 mb-2">可以前往</p>
                        <div class="flex justify-center mb-2">
                            <ms-store-badge
                                productid="9NXP44L49SHJ"
                                window-mode="full"
                                theme="auto"
                                size="middle"
                                language="zh-cn"
                                animation="on">
                            </ms-store-badge>
                        </div>
                        <p class="text-blue-700">购买正版Minecraft Java版，通过各种启动器启动Minecraft Java版</p>
                    </div>
                `;
                
                // 延迟加载Microsoft Store徽章脚本
                setTimeout(() => {
                    if (!document.querySelector('script[src="https://get.microsoft.com/badge/ms-store-badge.bundled.js"]')) {
                        const script = document.createElement('script');
                        script.type = 'module';
                        script.src = 'https://get.microsoft.com/badge/ms-store-badge.bundled.js';
                        document.head.appendChild(script);
                    }
                }, 0);
            } else {
                suggestions = `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h3 class="font-semibold text-green-800 mb-2">✅ 系统兼容</h3>
                        <p class="text-green-700 mb-2">您的系统为 <code class="bg-green-100 px-1 rounded">${system} ${systemVersion}</code>，架构为 <code class="bg-green-100 px-1 rounded">${archDisplay}</code>。</p>
                        <p class="text-green-700">您的系统版本兼容Minecraft Java版。</p>
                    </div>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 class="font-semibold text-blue-800 mb-2">💡 Minecraft 建议</h3>
                        <p class="text-blue-700 mb-2">可以前往</p>
                        <div class="flex justify-center mb-2">
                            <ms-store-badge
                                productid="9NXP44L49SHJ"
                                window-mode="full"
                                theme="auto"
                                size="middle"
                                language="zh-cn"
                                animation="on">
                            </ms-store-badge>
                        </div>
                        <p class="text-blue-700">购买和下载正版Minecraft</p>
                    </div>
                `;
                
                // 延迟加载Microsoft Store徽章脚本
                setTimeout(() => {
                    if (!document.querySelector('script[src="https://get.microsoft.com/badge/ms-store-badge.bundled.js"]')) {
                        const script = document.createElement('script');
                        script.type = 'module';
                        script.src = 'https://get.microsoft.com/badge/ms-store-badge.bundled.js';
                        document.head.appendChild(script);
                    }
                }, 0);
            }
        }
        else if (system === "iOS" || system === "macOS") {
            suggestions = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-green-800 mb-2">✅ 系统检测</h3>
                    <p class="text-green-700 mb-2">您的系统为 <code class="bg-green-100 px-1 rounded">${system} ${systemVersion}</code>，架构为 <code class="bg-green-100 px-1 rounded">${archDisplay}</code>。</p>
                    <p class="text-green-700">检测到您使用的是Apple设备。</p>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-blue-800 mb-2">💡 Minecraft 建议</h3>
                    <p class="text-blue-700 mb-2">获取国际版Minecraft：</p>
                    <div class="flex justify-center mb-4">
                        <a href="https://apps.apple.com/us/app/minecraft-dream-it-build-it/id479516143?itscg=30200&itsct=apps_box_badge&mttnsubad=479516143" style="display: inline-block;">
                        <img src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/zh-cn?releaseDate=1321488000" alt="Download on the App Store" style="width: 246px; height: 82px; vertical-align: middle; object-fit: contain;" />
                        </a>
                    </div>
                    <p class="text-blue-700">要在iOS上运行Minecraft Java版，可以前往 <a href="https://pojavlauncher.app/wiki/getting_started/INSTALL.html#ios" target="_blank" class="text-blue-600 hover:underline font-medium">此处</a> 获取更多关于安装PojavLauncher的说明。</p>
                </div>
            `;
        } else if (userAgent.includes("OpenHarmony") || typeof window.harmony !== 'undefined') {
            suggestions = `
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-orange-800 mb-2">🔶 HarmonyOS 检测</h3>
                    <p class="text-orange-700 mb-2">您的系统为 <code class="bg-orange-100 px-1 rounded">${system} ${systemVersion}</code>，架构为 <code class="bg-orange-100 px-1 rounded">${archDisplay}</code>。</p>
                    <p class="text-orange-700">检测到您使用的是HarmonyOS设备。</p>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-yellow-800 mb-2">⚠️ 兼容性提醒</h3>
                    <p class="text-yellow-700 mb-2">HarmonyOS NEXT手机需要在"卓易通"中安装，性能有较大损耗</p>
                    <p class="text-yellow-700">鸿蒙电脑暂时无好用的适配方案，可以尝试在虚拟机中打开此页面下载Windows版</p>
                </div>
            `;
        } else if (system === "Android") {
            const androidVersion = parseFloat(systemVersion);
            let versionStatus = '';
            let versionClass = '';
            
            if (androidVersion >= 8) {
                versionStatus = '✅ 版本兼容';
                versionClass = 'green';
            } else if (androidVersion >= 6) {
                versionStatus = '⚠️ 版本较低';
                versionClass = 'yellow';
            } else {
                versionStatus = '❌ 版本过低';
                versionClass = 'red';
            }
            
            suggestions = `
                <div class="bg-${versionClass}-50 border border-${versionClass}-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-${versionClass}-800 mb-2">${versionStatus}</h3>
                    <p class="text-${versionClass}-700 mb-2">您的系统为 <code class="bg-${versionClass}-100 px-1 rounded">${system} ${systemVersion}</code>，架构为 <code class="bg-${versionClass}-100 px-1 rounded">${archDisplay}</code>。</p>
                    ${androidVersion < 8 ? `<p class="text-${versionClass}-700">您的Android版本较低，可能无法正常运行FCL。建议升级到Android 8.0或更高版本。</p>` : '<p class="text-${versionClass}-700">您的Android版本兼容FCL。</p>'}
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-blue-800 mb-2">💡 Android 建议</h3>
                    <p class="text-blue-700">您可以直接下载FCL启动器在Android设备上运行Minecraft Java版。</p>
                </div>
            `;
        } else if (system === "Linux") {
            suggestions = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-green-800 mb-2">✅ Linux 检测</h3>
                    <p class="text-green-700 mb-2">您的系统为 <code class="bg-green-100 px-1 rounded">${system}</code>，架构为 <code class="bg-green-100 px-1 rounded">${archDisplay}</code>。</p>
                    <p class="text-green-700">检测到您使用的是Linux系统。</p>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-blue-800 mb-2">💡 Linux 建议</h3>
                    <p class="text-blue-700">您可以在Linux系统上运行Minecraft Java版，建议使用官方的Minecraft Launcher或第三方启动器。</p>
                </div>
            `;
        } else {
            suggestions = `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-gray-800 mb-2">🔍 系统检测</h3>
                    <p class="text-gray-700 mb-2">您的系统为 <code class="bg-gray-100 px-1 rounded">${system} ${systemVersion}</code>，架构为 <code class="bg-gray-100 px-1 rounded">${archDisplay}</code>。</p>
                    <p class="text-gray-700">检测到您使用的是${system}系统。</p>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-blue-800 mb-2">💡 通用建议</h3>
                    <p class="text-blue-700">请根据您的系统类型选择合适的Minecraft版本和启动器。</p>
                </div>
            `;
        }

        updateContainer(suggestions);
        
        // 设置全局变量sysInfo用于其他模块
        sysInfo = `<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 class="font-semibold text-gray-800 mb-2">设备信息</h3>
            <p class="text-gray-700">系统：<code class="bg-gray-100 px-1 rounded">${system} ${systemVersion}</code></p>
            <p class="text-gray-700">架构：<code class="bg-gray-100 px-1 rounded">${archDisplay}</code></p>
        </div>`;

    } catch (error) {
        const errorMsg = `设备建议：出错：${error.message || error}`;
        console.error(errorMsg);
        updateContainer(`
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 class="font-semibold text-red-800 mb-2">❌ 出错</h3>
                <p class="text-red-700">${errorMsg}</p>
            </div>
        `);
    }
}

/**
 * 获取设备架构信息
 * @returns {string} 设备架构
 */
function getDeviceArch() {
    return sysArch;
}

/**
 * 获取Android版本
 * @returns {number} Android版本号
 */
function getAndroidVersion() {
    return androidVer;
}

/**
 * 获取系统信息
 * @returns {string} 系统信息HTML
 */
function getSystemInfo() {
    return sysInfo;
}

// 导出函数和变量
export { 
    showDeviceSuggestions, 
    showDeviceInfo,
    getDeviceArch, 
    getAndroidVersion, 
    getSystemInfo,
    testAndroidVersion,
    sysArch,
    sysInfo,
    androidVer
};