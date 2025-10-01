// 下载模块功能

import { SOURCE_MAP, getSoftwareList, getSoftwareLines, getSoftwareById, getFeatureIcon, getProviderIcon, getDisplaySoftwareList } from './downloadWays.js';
import { createCollapsiblePanel } from '../components/ReusableCollapsiblePanel.js';
import { devModeFetch } from './devMode.js';

// 加载函数映射表
const loadFunctionMap = {
    loadFclDownWay: loadFclDownWay,
    loadFileListDownWay: loadFileListDownWay
};

/**
 * 创建特点小胶囊
 * @param {string} description - 特点描述
 * @param {string} icon - 图标字符
 * @returns {string} 小胶囊HTML
 */
function createFeatureCapsule(description, icon) {
    if (!description) return '';
    
    // 从JSON配置获取特点到样式的映射
    const softwareConfig = getSoftwareList();
    const featureMapping = softwareConfig?.metadata?.featureMapping || {};
    
    // 特点到样式的映射（如果没有配置，使用默认映射）
    const featureClassMap = {
        '已开学': 'school',
        '更新快': 'fast-update',
        '全版本': 'all-versions',
        '速度快': 'fast-speed',
        '高防御': 'high-defense'
    };
    
    const featureClass = featureClassMap[description] || '';
    const displayIcon = icon || featureMapping[description] || '📋';
    
    return `<span class="capsule capsule-feature ${featureClass}">
        <span class="capsule-icon">${displayIcon}</span>
        ${description}
    </span>`;
}

/**
 * 创建贡献者小胶囊
 * @param {string} provider - 贡献者名称
 * @returns {string} 小胶囊HTML
 */
function createProviderCapsule(provider) {
    if (!provider) return '';
    
    // 从JSON配置获取贡献者到图标的映射
    const softwareConfig = getSoftwareList();
    const providerMapping = softwareConfig?.metadata?.providerMapping || {};
    
    // 贡献者到图标的映射（如果没有配置，使用默认映射）
    const defaultProviderMap = {
        '站长提供': '👑',
        '哈哈66623332提供': '😄',
        'fishcpy提供': '🐟',
        '八蓝米提供': '🍚',
        'Linkong提供': '🔗',
        '广告哥提供': '📢',
        'LANt提供': '🌐'
    };
    
    const icon = providerMapping[provider] || defaultProviderMap[provider] || '🙋';
    
    return `<span class="capsule capsule-provider">
        <span class="capsule-icon">${icon}</span>
        ${provider}
    </span>`;
}

/**
 * 加载简单文件列表格式的下载线路
 * @param {string} url - 文件列表JSON的URL
 * @param {string} containerId - 容器元素的ID
 * @param {string} lineName - 线路名称（用于日志标识）
 * @returns {Promise<void>} 无返回值
 */
async function loadFileListDownWay(url, containerId, lineName) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`${lineName}：找不到容器：${containerId}`);
        return;
    }

    try {
        console.group(`${lineName}：加载文件列表下载线路`);
        console.log(`${lineName}：${url}`);
        
        console.log(`${lineName}：开始请求URL：${url}`);
        const response = await devModeFetch(url);
        
        console.log(`${lineName}：请求状态：${response.status} ${response.statusText}`);
        console.log(`${lineName}：响应头：`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            console.error(`${lineName}：HTTP请求失败：${response.status} ${response.statusText}`);
            throw new Error(`HTTP错误：${response.status} ${response.statusText}`);
        }

        const jsonData = await response.json();
        
        // 调试：输出原始JSON数据格式
        console.log(`${lineName}：原始JSON数据：`, jsonData);
        console.log(`${lineName}：数据类型：`, typeof jsonData);
        console.log(`${lineName}：是否为数组：`, Array.isArray(jsonData));
        
        // 处理不同的JSON数据格式
        let fileList = [];
        
        if (Array.isArray(jsonData)) {
            // 格式1：纯数组格式
            fileList = jsonData;
            console.log(`${lineName}：使用纯数组格式，文件数：${fileList.length}`);
        } else if (jsonData && Array.isArray(jsonData.children)) {
            // 格式2：包含children数组的对象格式
            fileList = jsonData.children;
            console.log(`${lineName}：使用children数组格式，文件数：${fileList.length}`);
        } else if (jsonData && jsonData.latest && Array.isArray(jsonData.children)) {
            // 格式3：包含latest字段和children数组的对象格式
            fileList = jsonData.children;
            console.log(`${lineName}：使用latest+children格式，文件数：${fileList.length}`);
        } else {
            // 调试：输出详细的结构信息
            console.error(`${lineName}：数据格式不匹配，详细结构：`, {
                hasChildren: jsonData && Array.isArray(jsonData.children),
                hasLatest: jsonData && jsonData.latest,
                keys: jsonData ? Object.keys(jsonData) : 'null',
                dataType: typeof jsonData
            });
            throw new Error('数据格式错误：期望数组格式或包含children数组的对象格式');
        }

        // 清空容器内容，移除"正在加载..."文本
        container.innerHTML = '';

        if (fileList.length === 0) {
            console.warn(`${lineName}：找到文件数：${fileList.length}`);
            container.innerHTML = `<div class="text-red-500">${lineName}：警告：没有找到文件数据</div>`;
            console.groupEnd();
            return;
        }

        console.log(`${lineName}：找到文件数：${fileList.length}`);

        // 创建文件列表面板
        const panelId = `${containerId}-file-list`;
        
        // 创建面板内容HTML
        let panelContent = `<div class="p-3 text-xs text-gray-500">数据源: ${url}</div>`;
        panelContent += '<div class="p-3"><div class="space-y-2">';
        
        fileList.forEach((file, index) => {
            // 支持两种字段名：download_link 或 url
            const downloadLink = file.download_link || file.url;
            
            if (!file.name || !downloadLink) {
                console.warn(`${lineName}：文件 ${index} 缺少必要字段：`, file);
                return;
            }
            
            panelContent += `
                <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span class="text-sm font-medium">${file.name}</span>
                    <a href="${downloadLink}" 
                       class="bg-primary-100 hover:bg-primary-200 text-primary-700 py-1 px-3 rounded text-xs transition" 
                       target="_blank">下载</a>
                </div>
            `;
        });
        
        panelContent += '</div></div>';

        // 使用统一的折叠面板组件创建文件列表面板
        const panel = createCollapsiblePanel(
            `${lineName} - 文件列表`,
            panelContent,
            { id: panelId }
        );

        // 将面板添加到容器
        container.appendChild(panel);

        // 初始化事件监听器
        const { initCollapsiblePanels } = await import('../components/ReusableCollapsiblePanel.js');
        
        // 添加延迟，确保DOM完全渲染
        setTimeout(() => {
            initCollapsiblePanels(container);
            console.log(`${lineName}：已初始化文件列表面板的事件监听器`);
        }, 100);

        console.log(`${lineName}：完成`);
        console.groupEnd();
    } catch (error) {
        console.error(`${lineName}：出错：`, error);
        container.innerHTML = `<div class="text-red-500 p-4">${lineName}：出错：${error.message}</div>`;
    }
}

/**\n * 加载下载线路\n * @param {string} url - 文件树JSON的URL\n * @param {string} containerId - 容器元素的ID\n * @param {string} lineName - 线路名称（用于日志标识）\n * @returns {Promise<void>} 无返回值\n */
async function loadFclDownWay(url, containerId, lineName) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`${lineName}：找不到容器：${containerId}`);
        return;
    }

    // 检查SOURCE_MAP[lineName]是否存在
    if (!SOURCE_MAP[lineName]) {
        console.error(`${lineName}：未在SOURCE_MAP中找到配置`);
        container.innerHTML = `<div class="text-red-500">${lineName}：配置错误</div>`;
        return;
    }

    try {

        console.group(`${lineName}：加载下载线路`);

        console.log(`${lineName}：${url}`);
        const response = await devModeFetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const fileTree = await response.json();
        // 不清空容器，而是直接更新内容

        let versionDirs = null;

        // 处理特殊嵌套路径
        if (SOURCE_MAP[lineName] && SOURCE_MAP[lineName].nestedPath) {
            console.log(`${lineName}：特殊处理嵌套路径`);
            let currentChildren = fileTree.children;

            // 对于FCL线2和ZL2线2，按名称查找嵌套目录
            // 其他线路也按名称查找（保持一致性）
            for (const dirName of SOURCE_MAP[lineName].nestedPath) {
                console.log(`${lineName}：查找目录: ${dirName}`);
                console.log(`${lineName}：当前目录列表:`, currentChildren.map(d => d.name));
                const dir = currentChildren.find(
                    d => d.name === dirName && d.type === 'directory'
                );
                console.log(`${lineName}：找到目录:`, dir);
                if (!dir || !dir.children) {
                    console.error(`${lineName}：在以下目录中未找到匹配的子目录:`, currentChildren);
                    // 如果找不到嵌套目录，就直接使用当前的children作为版本目录
                    // 检查currentChildren是否存在，避免TypeError
                    if (!currentChildren || !Array.isArray(currentChildren)) {
                        console.warn(`${lineName}：currentChildren不存在或不是数组，使用空数组`);
                        versionDirs = [];
                    } else {
                        versionDirs = currentChildren.filter(
                            child => child.type === 'directory' && child.name !== 'root'
                        );
                    }
                    break;
                }
                currentChildren = dir.children;
                console.log(`${lineName}：更新后的children:`, currentChildren);
            }

            // 如果成功遍历完所有嵌套路径，则使用最终的children作为版本目录
            if (!versionDirs) {
                // 检查currentChildren是否存在，避免TypeError
                if (!currentChildren || !Array.isArray(currentChildren)) {
                    console.warn(`${lineName}：currentChildren不存在或不是数组，使用空数组`);
                    versionDirs = [];
                } else {
                    versionDirs = currentChildren.filter(
                        child => child.type === 'directory' && child.name !== 'root'
                    );
                }
            }
            console.log(`${lineName}：最终versionDirs:`, versionDirs);
        } else {
            // 检查fileTree.children是否存在，避免TypeError
            if (!fileTree.children || !Array.isArray(fileTree.children)) {
                console.warn(`${lineName}：fileTree.children不存在或不是数组，使用空数组`);
                versionDirs = [];
            } else {
                versionDirs = fileTree.children.filter(
                    child => child.type === 'directory' && child.name !== 'root'
                );
            }
        }

        if (versionDirs.length === 0) {
            console.warn(`${lineName}：找到版本数：${versionDirs.length}`);
            container.innerHTML = `<div class="text-red-500">${lineName}：警告：没有找到版本数据</div>`;
            return;
        } else {
            console.log(`${lineName}：找到版本数：${versionDirs.length}`);
        }

        // 清空容器内容，移除"正在加载..."文本
        container.innerHTML = '';

        // 为每个版本创建可折叠面板
        console.groupCollapsed(`${lineName}：创建版本面板`);
        versionDirs.forEach((versionDir, index) => {
            const version = versionDir.name;
            const archMap = {};
            versionDir.children
                .filter(child => child.type === 'file' && child.arch)
                .forEach(file => {
                    archMap[file.arch] = file.download_link;
                });

            const allArchs = Object.keys(archMap);

            // 为每个版本面板创建唯一的ID
            const versionId = `${containerId}-version-${index}`;

            // 创建版本面板的内容HTML
            let versionContent = '';
            if (allArchs.length === 0) {
                versionContent = '<div class="p-3"><p class="text-gray-500 text-sm">此版本无可用下载文件</p></div>';
            } else {
                // 显示JSON源链接
                versionContent = `<div class="p-3 text-xs text-gray-500">数据源: ${url}</div>`;
                // 创建架构按钮
                versionContent += '<div class="p-3"><div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">';
                allArchs.forEach(arch => {
                    const link = archMap[arch];
                    const buttonText = arch === 'all' ? '通用版' : arch;
                    versionContent += `<a href="${link || 'javascript:void(0)'}" 
                                      class="bg-primary-100 hover:bg-primary-200 text-primary-700 py-1 px-2 rounded text-xs text-center transition block ${!link ? 'opacity-50 cursor-not-allowed' : ''}" 
                                      ${link ? 'target="_blank"' : ''} 
                                      ${!link ? 'title="未提供此架构版本"' : ''}>${buttonText}</a>`;
                });
                versionContent += '</div></div>';
            }

            // 使用统一的折叠面板组件创建版本面板
            const versionPanel = createCollapsiblePanel(
                version,
                versionContent,
                versionId
            );


            // 添加调试日志
            
            console.log(`${lineName}：创建版本面板 ${versionId}，标题：${version}`);

            // 将面板添加到容器
            container.appendChild(versionPanel);
        });

        console.groupEnd();

        // 在所有面板创建完成后，统一初始化事件监听器
        const { initCollapsiblePanels } = await import('../components/ReusableCollapsiblePanel.js');
        
        // 添加延迟，确保DOM完全渲染
        setTimeout(() => {
            initCollapsiblePanels(container);
            console.log(`${lineName}：已初始化所有版本面板的事件监听器`);
            
            // 验证事件监听器是否成功添加
            const panelHeaders = container.querySelectorAll('.collapsible-panel-header');
            console.log(`${lineName}：容器中找到 ${panelHeaders.length} 个面板头部元素`);
            
            panelHeaders.forEach((header, index) => {
                console.log(`${lineName}：面板 ${index + 1} - 监听器状态：`, header.dataset.listenerAdded || '未添加');
            });
        }, 100);

        console.log(`${lineName}：完成`);
        console.groupEnd();
    } catch (error) {
        console.error(`${lineName}：出错：`, error);
        container.innerHTML = `<div class="text-red-500 p-4">${lineName}：出错：${error.message}</div>`;
    }
}




/**
 * 动态生成软件下载区域的HTML结构
 * @returns {Promise<void>}
 */
async function generateSoftwareDownloadsHTML() {
    const container = document.getElementById('software-downloads-container');
    if (!container) {
        console.error('软件下载：找不到软件下载容器');
        return;
    }

    // 获取显示软件列表
    const displaySoftwareList = getDisplaySoftwareList();
    
    if (!displaySoftwareList || displaySoftwareList.length === 0) {
        console.warn('软件下载：未找到需要显示的软件配置');
        container.innerHTML = '<div class="text-red-500 p-4">未找到软件配置</div>';
        return;
    }

    console.groupCollapsed('软件下载：动态生成HTML结构');
    console.log('显示软件数量:', displaySoftwareList.length);

    // 清空容器
    container.innerHTML = '';

    // 将软件列表分成两行显示（每行最多2个软件）
    const firstRowSoftware = displaySoftwareList.slice(0, 2);
    const secondRowSoftware = displaySoftwareList.slice(2);

    // 生成第一行软件区域
    if (firstRowSoftware.length > 0) {
        const firstRowHTML = `
            <div class="gap-6 grid grid-cols-1 md:grid-cols-2">
                ${firstRowSoftware.map(software => `
                    <div>
                        <h3 class="mb-3 font-semibold text-primary-600 text-xl">
                            ${software.icon || '📦'} ${software.name} 下载
                        </h3>
                        <div class="space-y-4" id="${software.containerId || software.id + '-downloads'}">
                            <div class="py-4 text-gray-500 text-center">
                                <p>正在加载${software.name}下载线路...</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.innerHTML += firstRowHTML;
    }

    // 生成第二行软件区域（如果有）
    if (secondRowSoftware.length > 0) {
        const secondRowHTML = `
            <div class="gap-6 grid grid-cols-1 md:grid-cols-2 mt-8">
                ${secondRowSoftware.map(software => `
                    <div>
                        <h3 class="mb-3 font-semibold text-primary-600 text-xl">
                            ${software.icon || '📦'} ${software.name} 下载
                        </h3>
                        <div class="space-y-4" id="${software.containerId || software.id + '-downloads'}">
                            <div class="py-4 text-gray-500 text-center">
                                <p>正在加载${software.name}下载线路...</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.innerHTML += secondRowHTML;
    }

    console.log('HTML结构生成完成');
    console.groupEnd();
}

/**
 * 加载所有软件的下载线路（统一函数）
 * 通过JSON配置控制软件数量、名称和显示顺序
 * @returns {Promise<void>}
 */
async function loadAllSoftwareDownWays() {
    // 先动态生成HTML结构
    await generateSoftwareDownloadsHTML();
    
    // 获取显示软件列表
    const displaySoftwareList = getDisplaySoftwareList();
    
    if (!displaySoftwareList || displaySoftwareList.length === 0) {
        console.warn('软件下载：未找到需要显示的软件配置');
        return;
    }

    console.groupCollapsed('软件下载：使用统一函数加载所有软件');
    console.log('显示软件数量:', displaySoftwareList.length);
    console.log('软件列表:', displaySoftwareList.map(s => s.id));

    // 并行加载所有软件
    const loadPromises = displaySoftwareList.map(async (softwareConfig) => {
        try {
            await loadSoftwareDownWays(softwareConfig.id);
        } catch (error) {
            console.error(`加载软件 ${softwareConfig.id} 失败:`, error);
        }
    });

    await Promise.all(loadPromises);
    console.groupEnd();
}

/**
 * 加载单个软件的下载线路
 * @param {string} softwareId - 软件ID
 * @returns {Promise<void>}
 */
async function loadSoftwareDownWays(softwareId) {
    // 获取软件配置
    const softwareConfig = getSoftwareById(softwareId);
    if (!softwareConfig) {
        console.error(`软件下载：找不到软件配置：${softwareId}`);
        return;
    }

    const container = document.getElementById(softwareConfig.containerId || `${softwareId}-downloads`);
    if (!container) {
        console.error(`软件下载：找不到容器：${softwareConfig.containerId || `${softwareId}-downloads`}`);
        return;
    }

    // 清空容器
    container.innerHTML = '';

    // 获取软件线路配置
    const softwareLines = getSoftwareLines(softwareId);
    
    if (!softwareLines || softwareLines.length === 0) {
        console.warn(`软件下载：未找到软件线路配置：${softwareId}`);
        return;
    }

    console.groupCollapsed(`软件下载：${softwareConfig.name}`);
    console.log('线路数量:', softwareLines.length);

    // 为每个线路创建外层折叠面板
    softwareLines.forEach((lineConfig) => {
        // 构建显示文本，使用小胶囊样式
        let text = `<span class="font-semibold">${lineConfig.name}</span>`;
        
        // 添加特点小胶囊
        if (lineConfig.description) {
            text += createFeatureCapsule(lineConfig.description, getFeatureIcon(lineConfig.feature));
        }
        
        // 添加贡献者小胶囊
        if (lineConfig.provider) {
            text += createProviderCapsule(lineConfig.provider, getProviderIcon(lineConfig.provider));
        }

        // 创建折叠面板内容
        const panelContent = `
            <div class="p-4" id="${softwareId}-${lineConfig.id}" class="space-y-3">
                <div class="text-center py-4 text-gray-500">
                    <p>正在加载${lineConfig.name}...</p>
                </div>
            </div>
        `;

        // 使用独立的折叠面板组件
        const panel = createCollapsiblePanel(
            text,
            panelContent,
            `${softwareId}-line-${lineConfig.id}`
        );

        container.appendChild(panel);
    });

    // 并行加载所有线路，谁先加载完谁先显示
    softwareLines.forEach(async (lineConfig) => {
        if (lineConfig) {
            // 根据JSON配置选择加载函数
            const loadFunctionName = softwareConfig.loadFunction || 'loadFileListDownWay';
            const loadFunction = loadFunctionMap[loadFunctionName] || loadFileListDownWay;
            
            await loadFunction(lineConfig.path, `${softwareId}-${lineConfig.id}`, lineConfig.id);
        }
    });
    
    console.groupEnd();
}

// 导出函数
export { loadFclDownWay, loadAllSoftwareDownWays, loadSoftwareDownWays };