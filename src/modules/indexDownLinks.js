// 开门见山下载链接设置

import { SOURCE_MAP } from './downloadWays.js';
import { sysArch, sysInfo, testAndroidVersion } from './deviceSuggestions.js';
import { devModeFetch, isDevModeEnabled } from './devMode.js';

/**
 * 递归查找嵌套目录（支持多级嵌套）
 * @param {Array} children - 目录子项数组
 * @param {string} targetName - 目标目录名
 * @param {Array} [nestedPath] - 嵌套路径数组
 */
function findNestedDirectory(children, targetName, nestedPath = []) {
    console.log(`findNestedDirectory: 开始查找目录 "${targetName}"，嵌套路径:`, nestedPath);
    console.log('findNestedDirectory: 当前children:', children);
    
    let currentChildren = children;
    if (nestedPath) {
        console.log('findNestedDirectory: 处理嵌套路径:', nestedPath);
        for (const dirName of nestedPath) {
            console.log(`findNestedDirectory: 查找嵌套目录 "${dirName}"`);
            const dir = currentChildren.find(
                d => d.name === dirName && d.type === 'directory'
            );
            console.log(`findNestedDirectory: 找到嵌套目录:`, dir);
            if (!dir || !dir.children) {
                console.log(`findNestedDirectory: 嵌套目录 "${dirName}" 未找到或没有子目录`);
                return null;
            }
            currentChildren = dir.children;
            console.log(`findNestedDirectory: 更新当前子目录为:`, currentChildren);
        }
    }

    console.log(`findNestedDirectory: 在最终子目录中查找 "${targetName}"`);
    const result = currentChildren.find(
        dir => dir.type === 'directory' && dir.name === targetName
    );
    console.log(`findNestedDirectory: 查找结果:`, result);
    
    return result;
}

/** 
 * 获取并填充下载线路的最新版本到首页开门见山
 * @param {string} sourceKey - 数据源标识
 */
async function setupIndexDownLinks(sourceKey) {
    console.log(`开门见山：加载：${sourceKey}`);

    // 获取按钮容器
    const buttonContainer = document.getElementById('odlm-arch-buttons');
    if (buttonContainer) {
        // 为所有按钮添加加载状态
        const buttons = buttonContainer.querySelectorAll('a');
        buttons.forEach(button => {
            button.classList.add('loading');
            button.href = "javascript:void(0)";
            // 更新版本号占位符为加载中状态
            const versionPlaceholders = button.querySelectorAll('#version-placeholder');
            versionPlaceholders.forEach(span => {
                span.textContent = '...';
            });
        });
    }

    try {
        // 提前获取源配置
        const sourceConfig = SOURCE_MAP[sourceKey];
        if (!sourceConfig) throw new Error(`无效数据源标识："${sourceKey}"`);

        const jsonUrl = sourceConfig.path;
        console.log(`开门见山：JSON：${jsonUrl}`);

        // 并行执行网络请求，但设置超时避免阻塞
        const fetchDataWithTimeout = (url, sourceConfig, timeout = 5000) => {
            console.log(`fetchDataWithTimeout: 开始处理URL: ${url}, nestedPath:`, sourceConfig?.nestedPath);
            
            // 如果开发者模式已启用，直接返回一个模拟数据
            if (isDevModeEnabled()) {
                console.warn(`开发者模式：跳过下载链接加载 - ${url}`);
                
                // 根据nestedPath构建正确的模拟数据结构
                let devModeData = {
                    latest: "dev-mode",
                    children: [
                        {
                            type: "directory",
                            name: "dev-mode",
                            children: [
                                {
                                    type: "file",
                                    name: "dev-mode-file",
                                    arch: "all",
                                    download_link: "javascript:void(0)"
                                }
                            ]
                        }
                    ]
                };
                
                // 如果存在嵌套路径，需要构建嵌套结构
                if (sourceConfig.nestedPath && sourceConfig.nestedPath.length > 0) {
                    console.log(`开发者模式：构建嵌套路径结构:`, sourceConfig.nestedPath);
                    
                    // 从内向外构建嵌套结构
                    let currentLevel = devModeData.children[0];
                    
                    // 反向遍历nestedPath，从最内层开始包装
                    for (let i = sourceConfig.nestedPath.length - 1; i >= 0; i--) {
                        const dirName = sourceConfig.nestedPath[i];
                        currentLevel = {
                            type: "directory",
                            name: dirName,
                            children: [currentLevel]
                        };
                    }
                    
                    devModeData.children = [currentLevel];
                    console.log(`开发者模式：构建后的数据结构:`, devModeData);
                }
                
                return Promise.resolve(devModeData);
            }
            
            return Promise.race([
                // 使用新的开发者模式的fetch包装器，它会自动处理外部请求拦截
                devModeFetch(url).then(response => {
                    if (!response.ok) throw new Error(`HTTP出错：${response.status}`);
                    return response.json();
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('请求超时')), timeout)
                )
            ]);
        };

        const jsonData = await fetchDataWithTimeout(jsonUrl, sourceConfig);

        const { latest, children } = jsonData;

        if (!latest || !Array.isArray(children)) {
            throw new Error('无效的文件树结构');
        }

        let latestVersionDir = findNestedDirectory(children, latest, sourceConfig.nestedPath);
        if (!latestVersionDir) throw new Error(`未找到最新版本目录: ${latest}`);

        console.log(`开门见山：最新版本：${latestVersionDir.name}`);

        const archLinks = latestVersionDir.children?.reduce((map, child) => {
            if (child.type === 'file' && child.arch) {
                map[child.arch] = child.download_link;
            }
            return map;
        }, {}) || {};

        // 创建架构按钮
        const createArchButton = (arch, link, isPrimary = false) => {
            const button = document.createElement('a');
            button.className = isPrimary ? 
                'bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md text-center transition duration-300 ease-in-out transform hover:scale-105 block' :
                'bg-primary-100 hover:bg-primary-200 text-primary-800 py-3 px-4 rounded-md text-center transition duration-300 ease-in-out transform hover:scale-105 block';
            button.href = link || 'javascript:void(0)';
            
            if (!link) {
                button.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                button.target = '_blank';
            }
            
            // 特殊处理'all'架构
            if (arch === 'all') {
                button.innerHTML = `<i class="fas fa-download mr-2"></i>下载 ${latestVersionDir.name} 版本 (通用版)`;
            } else {
                button.innerHTML = `<i class="fas fa-microchip mr-2"></i>下载 ${latestVersionDir.name} 版本 (${arch})`;
            }
            
            return button;
        };

        // 获取按钮容器
        const buttonContainer = document.getElementById('odlm-arch-buttons');
        if (buttonContainer) {
            // 更新按钮内容和链接
            const buttons = buttonContainer.querySelectorAll('a');
            buttons.forEach(button => {
                const arch = button.getAttribute('data-arch');
                const link = archLinks[arch];
                
                if (link) {
                    // 更新链接
                    button.href = link;
                    button.target = "_blank";
                    // 移除禁用状态（如果有的话）
                    button.classList.remove('opacity-50', 'cursor-not-allowed');
                    // 移除加载状态（如果有的话）
                    button.classList.remove('loading');
                } else {
                    // 如果没有链接，禁用按钮
                    button.href = "javascript:void(0)";
                    button.classList.add('opacity-50', 'cursor-not-allowed');
                    // 移除加载状态（如果有的话）
                    button.classList.remove('loading');
                }
                
                // 更新版本号
                const versionPlaceholders = button.querySelectorAll('#version-placeholder');
                versionPlaceholders.forEach(span => {
                    span.textContent = latestVersionDir.name;
                });
            });
        }

        const latestInfoEl = document.getElementById('latestInfo');
        const latestInfoEl2 = document.getElementById('latestInfo2');
        if (latestInfoEl && latestInfoEl2) {
            const latestText = sourceConfig.markLatest ?
                `${latest}（此源最新）` :
                latest;
            latestInfoEl.textContent = latestText;
            latestInfoEl2.textContent = latestText;
        }

        const diEl = document.getElementById('deviceInfo');
        if (diEl) diEl.innerHTML = sysInfo;

        // 延迟执行安卓版本检测，确保showDeviceSuggestions已完成并设置好androidVer变量
        console.log('设置安卓版本检测定时器...');
        setTimeout(() => {
            console.log('准备执行安卓版本检测...');
            try {
                testAndroidVersion(8, 'FCL');
                console.log('安卓版本检测执行完成');
            } catch (error) {
                console.error('安卓版本检测执行失败:', error);
            }
        }, 500); // 延迟500ms确保设备检测完成
        
        // 移除所有按钮的加载状态
        if (buttonContainer) {
            const buttons = buttonContainer.querySelectorAll('a');
            buttons.forEach(button => {
                button.classList.remove('loading');
            });
        }
    } catch (error) {
        console.error(`开门见山：出错：${error.message}`, error);
        
        // 移除所有按钮的加载状态
        if (buttonContainer) {
            const buttons = buttonContainer.querySelectorAll('a');
            buttons.forEach(button => {
                button.classList.remove('loading');
            });
        }

        const errorHtml = `
        <div class="text-red-500">
          <p>抱歉，我们遇到了一个无法解决的问题。</p>
          <p>${error.message}</p>
          <p>点击"转到'下载'TAB"将会跳转到"下载"选项卡，您可以在这里使用其它路线继续下载。</p>
        </div>
        <br>
        <div class="grid grid-cols-2 gap-4">
          <a class="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-center transition" href="#downloads">转到"下载"TAB</a>
          <a class="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-center transition" href="https://wj.qq.com/s2/22395480/df5b/" target="_blank">向站长反馈</a>
        </div>
        <br>
        <div class="text-gray-600">
          <p>下载站运营困难，不妨<a href="#sponsors" class="text-primary-600 hover:underline">赞助此下载站</a>吧awa（不赞助也能下！）</p>
          <p>启动器的开发者也不容易，<a href="https://afdian.com/@tungs" target="_blank" class="text-primary-600 hover:underline">赞助FCL开发者</a>。</p>
          <p class="text-red-600"><mark>赞助是纯自愿的，请结合您的经济状况实力再考虑是否要赞助！赞助后无法退款！</mark></p>
        </div>
        `;

        // 创建一个临时容器来存放错误信息
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = errorHtml;
        
        // 清空按钮容器并添加错误信息
        if (buttonContainer) {
            buttonContainer.innerHTML = '';
            buttonContainer.appendChild(tempContainer);
        }
    }
}

// 导出函数
export { setupIndexDownLinks };