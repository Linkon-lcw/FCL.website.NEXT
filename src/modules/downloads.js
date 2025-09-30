// 下载模块功能

import { SOURCE_MAP } from './downloadWays.js';
import { createCollapsiblePanel } from '../components/ReusableCollapsiblePanel.js';
import { devModeFetch } from './devMode.js';

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

        console.groupCollapsed(`${lineName}：加载下载线路`);

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
                    versionDirs = currentChildren.filter(
                        child => child.type === 'directory' && child.name !== 'root'
                    );
                    break;
                }
                currentChildren = dir.children;
                console.log(`${lineName}：更新后的children:`, currentChildren);
            }

            // 如果成功遍历完所有嵌套路径，则使用最终的children作为版本目录
            if (!versionDirs) {
                versionDirs = currentChildren.filter(
                    child => child.type === 'directory' && child.name !== 'root'
                );
            }
            console.log(`${lineName}：最终versionDirs:`, versionDirs);
        } else {
            versionDirs = fileTree.children.filter(
                child => child.type === 'directory' && child.name !== 'root'
            );
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
        console.groupCollapsed(`${lineName}：创建版本面板 ${versionDir.name}`);
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

    // 定义需要加载的FCL线路
    const fclLines = Object.entries(SOURCE_MAP)
        .filter(([key, _]) => key.startsWith('F'))
        .map(([key, config]) => ({ key, name: config.name }));

    // 为每个线路创建外层折叠面板
    fclLines.forEach(line => {
        const sourceConfig = SOURCE_MAP[line.key]; // 获取线路配置
        
        // 构建显示文本
        let text = `${line.name}`;
        if (sourceConfig.description) {
            text += ` (${sourceConfig.description})`;
        }
        if (sourceConfig.provider) {
            text += ` [${sourceConfig.provider}]`;
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
    fclLines.forEach(async (line) => {
        const sourceConfig = SOURCE_MAP[line.key];
        if (sourceConfig) {
            await loadFclDownWay(sourceConfig.path, `fcl-${line.key}`, line.key);
        }
    });
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

    // 定义需要加载的ZL线路
    const zlLines = Object.entries(SOURCE_MAP)
        .filter(([key, _]) => key.startsWith('Z'))
        .map(([key, config]) => ({ key, name: config.name }));

    // 为每个线路创建外层折叠面板
    zlLines.forEach(line => {
        const sourceConfig = SOURCE_MAP[line.key]; // 获取线路配置
        
        // 构建显示文本
        let text = `${line.name}`;
        if (sourceConfig.description) {
            text += ` (${sourceConfig.description})`;
        }
        if (sourceConfig.provider) {
            text += ` [${sourceConfig.provider}]`;
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
    zlLines.forEach(async (line) => {
        const sourceConfig = SOURCE_MAP[line.key];
        if (sourceConfig) {
            await loadFclDownWay(sourceConfig.path, `zl-${line.key}`, line.key);
        }
    });
}

// 导出函数
export { loadFclDownWay, loadAllFclDownWays, loadAllZlDownWays };