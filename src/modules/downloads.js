// 下载模块功能

import { SOURCE_MAP, getSoftwareList, getSoftwareLines } from './downloadWays.js';
import { createCollapsiblePanel } from '../components/ReusableCollapsiblePanel.js';
import { devModeFetch } from './devMode.js';

/**
 * 创建特点小胶囊
 * @param {string} description - 特点描述
 * @param {string} icon - 图标字符
 * @returns {string} 小胶囊HTML
 */
function createFeatureCapsule(description, icon) {
    if (!description) return '';
    
    // 特点到样式的映射
    const featureClassMap = {
        '已开学': 'school',
        '更新快': 'fast-update',
        '全版本': 'all-versions',
        '速度快': 'fast-speed',
        '高防御': 'high-defense'
    };
    
    const featureClass = featureClassMap[description] || '';
    const displayIcon = icon || '📋';
    
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
    
    // 贡献者到图标的映射
    const providerMap = {
        '站长提供': '👑',
        '哈哈66623332提供': '😄',
        'fishcpy提供': '🐟',
        '八蓝米提供': '🍚',
        'Linkong提供': '🔗',
        '广告哥提供': '📢',
        'LANt提供': '🌐'
    };
    
    const icon = providerMap[provider] || '🙋';
    
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
        
        const response = await devModeFetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const fileList = await response.json();
        
        // 检查数据格式是否为数组
        if (!Array.isArray(fileList)) {
            throw new Error('数据格式错误：期望数组格式');
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
            if (!file.name || !file.url) {
                console.warn(`${lineName}：文件 ${index} 缺少必要字段：`, file);
                return;
            }
            
            panelContent += `
                <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span class="text-sm font-medium">${file.name}</span>
                    <a href="${file.url}" 
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
 * 加载所有FCL下载线路
 * @returns {Promise<void>}
 */
async function loadAllFclDownWays() {
    const container = document.getElementById('fcl-downloads');
    if (!container) {
        console.error('FCL下载：找不到容器：fcl-downloads');
        return;
    }

    // 清空容器
    container.innerHTML = '';

    // 使用新的软件分类结构
    const fclLines = getSoftwareLines('fcl', 'current');
    
    if (!fclLines) {
        console.warn('FCL下载：未找到FCL线路配置，使用旧版SOURCE_MAP');
        // 回退到旧版逻辑
        const oldFclLines = Object.entries(SOURCE_MAP)
            .filter(([key, _]) => key.startsWith('F'))
            .map(([key, config]) => ({ key, name: config.name }));
        
        // 为每个线路创建外层折叠面板
        oldFclLines.forEach(line => {
            const sourceConfig = SOURCE_MAP[line.key];
            
            // 构建显示文本，使用小胶囊样式
            let text = `<span class="font-semibold">${line.name}</span>`;
            
            // 添加特点小胶囊
            if (sourceConfig.description) {
                text += createFeatureCapsule(sourceConfig.description, sourceConfig.icon);
            }
            
            // 添加贡献者小胶囊
            if (sourceConfig.provider) {
                text += createProviderCapsule(sourceConfig.provider);
            }

            // 创建折叠面板内容
            const panelContent = `
                <div class="p-4" id="fcl-${line.key}" class="space-y-3">
                    <div class="text-center py-4 text-gray-500">
                        <p>正在加载${line.name}...</p>
                    </div>
                </div>
            `;

            // 使用独立的折叠面板组件
            const panel = createCollapsiblePanel(
                text,
                panelContent,
                `fcl-line-${line.key}`
            );

            container.appendChild(panel);
        });

        // 并行加载所有线路，谁先加载完谁先显示
        oldFclLines.forEach(async (line) => {
            const sourceConfig = SOURCE_MAP[line.key];
            if (sourceConfig) {
                await loadFclDownWay(sourceConfig.path, `fcl-${line.key}`, line.key);
            }
        });
        return;
    }

    // 使用新的软件分类结构
    console.groupCollapsed('FCL下载：使用软件分类结构');
    console.log('FCL线路数量:', Object.keys(fclLines).length);

    // 为每个线路创建外层折叠面板
    Object.entries(fclLines).forEach(([lineKey, lineConfig]) => {
        // 构建显示文本，使用小胶囊样式
        let text = `<span class="font-semibold">${lineConfig.name}</span>`;
        
        // 添加特点小胶囊
        if (lineConfig.description) {
            text += createFeatureCapsule(lineConfig.description, lineConfig.icon);
        }
        
        // 添加贡献者小胶囊
        if (lineConfig.provider) {
            text += createProviderCapsule(lineConfig.provider);
        }

        // 创建折叠面板内容
        const panelContent = `
            <div class="p-4" id="fcl-${lineKey}" class="space-y-3">
                <div class="text-center py-4 text-gray-500">
                    <p>正在加载${lineConfig.name}...</p>
                </div>
            </div>
        `;

        // 使用独立的折叠面板组件
        const panel = createCollapsiblePanel(
            text,
            panelContent,
            `fcl-line-${lineKey}`
        );

        container.appendChild(panel);
    });

    // 并行加载所有线路，谁先加载完谁先显示
    Object.entries(fclLines).forEach(async ([lineKey, lineConfig]) => {
        if (lineConfig) {
            await loadFclDownWay(lineConfig.path, `fcl-${lineKey}`, lineKey);
        }
    });
    
    console.groupEnd();
}

/**
 * 加载所有ZL下载线路
 * @returns {Promise<void>}
 */
async function loadAllZlDownWays() {
    const container = document.getElementById('zl-downloads');
    if (!container) {
        console.error('ZL下载：找不到容器：zl-downloads');
        return;
    }

    // 清空容器
    container.innerHTML = '';

    // 使用新的软件分类结构
    const zlLines = getSoftwareLines('zl', 'current');
    const zl2Lines = getSoftwareLines('zl2', 'current');
    
    if (!zlLines && !zl2Lines) {
        console.warn('ZL下载：未找到ZL线路配置，使用旧版SOURCE_MAP');
        // 回退到旧版逻辑
        const oldZlLines = Object.entries(SOURCE_MAP)
            .filter(([key, _]) => key.startsWith('Z'))
            .map(([key, config]) => ({ key, name: config.name }));

        // 为每个线路创建外层折叠面板
        oldZlLines.forEach(line => {
            const sourceConfig = SOURCE_MAP[line.key];
            
            // 构建显示文本，使用小胶囊样式
            let text = `<span class="font-semibold">${line.name}</span>`;
            
            // 添加特点小胶囊
            if (sourceConfig.description) {
                text += createFeatureCapsule(sourceConfig.description, sourceConfig.icon);
            }
            
            // 添加贡献者小胶囊
            if (sourceConfig.provider) {
                text += createProviderCapsule(sourceConfig.provider);
            }

            // 创建折叠面板内容
            const panelContent = `
                <div class="p-4" id="zl-${line.key}" class="space-y-3">
                    <div class="text-center py-4 text-gray-500">
                        <p>正在加载${line.name}...</p>
                    </div>
                </div>
            `;

            // 使用独立的折叠面板组件
            const panel = createCollapsiblePanel(
                text,
                panelContent,
                `zl-line-${line.key}`
            );

            container.appendChild(panel);
        });

        // 并行加载所有线路，谁先加载完谁先显示
        oldZlLines.forEach(async (line) => {
            const sourceConfig = SOURCE_MAP[line.key];
            if (sourceConfig) {
                await loadFclDownWay(sourceConfig.path, `zl-${line.key}`, line.key);
            }
        });
        return;
    }

    // 使用新的软件分类结构
    console.groupCollapsed('ZL下载：使用软件分类结构');
    
    // 合并ZL和ZL2线路
    const allZlLines = { ...zlLines, ...zl2Lines };
    console.log('ZL线路数量:', Object.keys(allZlLines).length);

    // 为每个线路创建外层折叠面板
    Object.entries(allZlLines).forEach(([lineKey, lineConfig]) => {
        // 构建显示文本，使用小胶囊样式
        let text = `<span class="font-semibold">${lineConfig.name}</span>`;
        
        // 添加特点小胶囊
        if (lineConfig.description) {
            text += createFeatureCapsule(lineConfig.description, lineConfig.icon);
        }
        
        // 添加贡献者小胶囊
        if (lineConfig.provider) {
            text += createProviderCapsule(lineConfig.provider);
        }

        // 创建折叠面板内容
        const panelContent = `
            <div class="p-4" id="zl-${lineKey}" class="space-y-3">
                <div class="text-center py-4 text-gray-500">
                    <p>正在加载${lineConfig.name}...</p>
                </div>
            </div>
        `;

        // 使用独立的折叠面板组件
        const panel = createCollapsiblePanel(
            text,
            panelContent,
            `zl-line-${lineKey}`
        );

        container.appendChild(panel);
    });

    // 并行加载所有线路，谁先加载完谁先显示
    Object.entries(allZlLines).forEach(async ([lineKey, lineConfig]) => {
        if (lineConfig) {
            await loadFclDownWay(lineConfig.path, `zl-${lineKey}`, lineKey);
        }
    });
    
    console.groupEnd();
}

/**
 * 加载所有渲染器下载线路
 * @returns {Promise<void>}
 */
async function loadAllRendererDownWays() {
    const container = document.getElementById('renderer-downloads');
    if (!container) {
        console.error('渲染器下载：找不到容器：renderer-downloads');
        return;
    }

    // 清空容器
    container.innerHTML = '';

    // 使用新的软件分类结构
    const rendererLines = getSoftwareLines('renderer', 'current');
    
    if (!rendererLines) {
        console.warn('渲染器下载：未找到渲染器线路配置，使用旧版SOURCE_MAP');
        // 回退到旧版逻辑
        const oldRendererLines = Object.entries(SOURCE_MAP)
            .filter(([key, _]) => key.includes('渲染器'))
            .map(([key, config]) => ({ key, name: config.name }));

        // 为每个线路创建外层折叠面板
        oldRendererLines.forEach(line => {
            const sourceConfig = SOURCE_MAP[line.key];
            
            // 构建显示文本，使用小胶囊样式
            let text = `<span class="font-semibold">${line.name}</span>`;
            
            // 添加特点小胶囊
            if (sourceConfig.description) {
                text += createFeatureCapsule(sourceConfig.description, sourceConfig.icon);
            }
            
            // 添加贡献者小胶囊
            if (sourceConfig.provider) {
                text += createProviderCapsule(sourceConfig.provider);
            }

            // 创建折叠面板内容
            const panelContent = `
                <div class="p-4" id="renderer-${line.key}" class="space-y-3">
                    <div class="text-center py-4 text-gray-500">
                        <p>正在加载${line.name}...</p>
                    </div>
                </div>
            `;

            // 使用独立的折叠面板组件
            const panel = createCollapsiblePanel(
                text,
                panelContent,
                `renderer-line-${line.key}`
            );

            container.appendChild(panel);
        });

        // 并行加载所有线路，谁先加载完谁先显示
        oldRendererLines.forEach(async (line) => {
            const sourceConfig = SOURCE_MAP[line.key];
            if (sourceConfig) {
                // 渲染器线路使用简单文件列表格式，使用专门的函数
                await loadFileListDownWay(sourceConfig.path, `renderer-${line.key}`, line.key);
            }
        });
        return;
    }

    // 使用新的软件分类结构
    console.groupCollapsed('渲染器下载：使用软件分类结构');
    console.log('渲染器线路数量:', Object.keys(rendererLines).length);

    // 为每个线路创建外层折叠面板
    Object.entries(rendererLines).forEach(([lineKey, lineConfig]) => {
        // 构建显示文本，使用小胶囊样式
        let text = `<span class="font-semibold">${lineConfig.name}</span>`;
        
        // 添加特点小胶囊
        if (lineConfig.description) {
            text += createFeatureCapsule(lineConfig.description, lineConfig.icon);
        }
        
        // 添加贡献者小胶囊
        if (lineConfig.provider) {
            text += createProviderCapsule(lineConfig.provider);
        }

        // 创建折叠面板内容
        const panelContent = `
            <div class="p-4" id="renderer-${lineKey}" class="space-y-3">
                <div class="text-center py-4 text-gray-500">
                    <p>正在加载${lineConfig.name}...</p>
                </div>
            </div>
        `;

        // 使用独立的折叠面板组件
        const panel = createCollapsiblePanel(
            text,
            panelContent,
            `renderer-line-${lineKey}`
        );

        container.appendChild(panel);
    });

    // 并行加载所有线路，谁先加载完谁先显示
    Object.entries(rendererLines).forEach(async ([lineKey, lineConfig]) => {
        if (lineConfig) {
            // 渲染器线路使用简单文件列表格式，使用专门的函数
            await loadFileListDownWay(lineConfig.path, `renderer-${lineKey}`, lineKey);
        }
    });
    
    console.groupEnd();
}

/**
 * 加载所有驱动下载线路
 * @returns {Promise<void>}
 */
async function loadAllDriverDownWays() {
    const container = document.getElementById('driver-downloads');
    if (!container) {
        console.error('驱动下载：找不到容器：driver-downloads');
        return;
    }

    // 清空容器
    container.innerHTML = '';

    // 使用新的软件分类结构
    const driverLines = getSoftwareLines('driver', 'current');
    
    if (!driverLines) {
        console.warn('驱动下载：未找到驱动线路配置，使用旧版SOURCE_MAP');
        // 回退到旧版逻辑
        const oldDriverLines = Object.entries(SOURCE_MAP)
            .filter(([key, _]) => key.includes('驱动'))
            .map(([key, config]) => ({ key, name: config.name }));

        // 为每个线路创建外层折叠面板
        oldDriverLines.forEach(line => {
            const sourceConfig = SOURCE_MAP[line.key];
            
            // 构建显示文本，使用小胶囊样式
            let text = `<span class="font-semibold">${line.name}</span>`;
            
            // 添加特点小胶囊
            if (sourceConfig.description) {
                text += createFeatureCapsule(sourceConfig.description, sourceConfig.icon);
            }
            
            // 添加贡献者小胶囊
            if (sourceConfig.provider) {
                text += createProviderCapsule(sourceConfig.provider);
            }

            // 创建折叠面板内容
            const panelContent = `
                <div class="p-4" id="driver-${line.key}" class="space-y-3">
                    <div class="text-center py-4 text-gray-500">
                        <p>正在加载${line.name}...</p>
                    </div>
                </div>
            `;

            // 使用独立的折叠面板组件
            const panel = createCollapsiblePanel(
                text,
                panelContent,
                `driver-line-${line.key}`
            );

            container.appendChild(panel);
        });

        // 并行加载所有线路，谁先加载完谁先显示
        oldDriverLines.forEach(async (line) => {
            const sourceConfig = SOURCE_MAP[line.key];
            if (sourceConfig) {
                // 驱动线路使用简单文件列表格式，使用专门的函数
                await loadFileListDownWay(sourceConfig.path, `driver-${line.key}`, line.key);
            }
        });
        return;
    }

    // 使用新的软件分类结构
    console.groupCollapsed('驱动下载：使用软件分类结构');
    console.log('驱动线路数量:', Object.keys(driverLines).length);

    // 为每个线路创建外层折叠面板
    Object.entries(driverLines).forEach(([lineKey, lineConfig]) => {
        // 构建显示文本，使用小胶囊样式
        let text = `<span class="font-semibold">${lineConfig.name}</span>`;
        
        // 添加特点小胶囊
        if (lineConfig.description) {
            text += createFeatureCapsule(lineConfig.description, lineConfig.icon);
        }
        
        // 添加贡献者小胶囊
        if (lineConfig.provider) {
            text += createProviderCapsule(lineConfig.provider);
        }

        // 创建折叠面板内容
        const panelContent = `
            <div class="p-4" id="driver-${lineKey}" class="space-y-3">
                <div class="text-center py-4 text-gray-500">
                    <p>正在加载${lineConfig.name}...</p>
                </div>
            </div>
        `;

        // 使用独立的折叠面板组件
        const panel = createCollapsiblePanel(
            text,
            panelContent,
            `driver-line-${lineKey}`
        );

        container.appendChild(panel);
    });

    // 并行加载所有线路，谁先加载完谁先显示
    Object.entries(driverLines).forEach(async ([lineKey, lineConfig]) => {
        if (lineConfig) {
            // 驱动线路使用简单文件列表格式，使用专门的函数
            await loadFileListDownWay(lineConfig.path, `driver-${lineKey}`, lineKey);
        }
    });
    
    console.groupEnd();
}

// 导出函数
export { loadFclDownWay, loadAllFclDownWays, loadAllZlDownWays, loadAllRendererDownWays, loadAllDriverDownWays };