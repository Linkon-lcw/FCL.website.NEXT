// 下载模块功能 - 支持多级嵌套结构

import { DOWNLOAD_CATEGORIES } from './downloadWays.js';
import { createCollapsiblePanel } from '../components/ReusableCollapsiblePanel.js';
import { devModeFetch } from './devMode.js';

/**
 * 递归构建下载分类结构
 * @param {Object} categories - 分类配置
 * @param {HTMLElement} container - 容器元素
 * @param {string} parentId - 父级ID（用于生成唯一ID）
 */
function buildDownloadCategories(categories, container, parentId = '') {
    for (const [key, category] of Object.entries(categories)) {
        const categoryId = parentId ? `${parentId}-${key}` : key;
        
        // 构建分类标题文本
        let titleText = category.name;
        if (category.description) {
            titleText += ` (${category.description})`;
        }

        // 创建分类内容容器
        const contentContainer = document.createElement('div');
        contentContainer.id = `category-${categoryId}`;
        contentContainer.className = 'space-y-4';

        // 如果有子分类，递归构建
        if (category.children) {
            buildDownloadCategories(category.children, contentContainer, categoryId);
        }

        // 如果有下载源，添加加载提示
        if (category.sources) {
            contentContainer.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <p>正在加载${category.name}...</p>
                </div>
            `;
        }

        // 使用折叠面板组件创建分类面板
        const panel = createCollapsiblePanel(
            titleText,
            contentContainer.outerHTML,
            `category-${categoryId}`
        );
        
        container.appendChild(panel);

        // 如果有下载源，异步加载它们
        if (category.sources) {
            setTimeout(() => loadCategorySources(category.sources, `category-${categoryId}`), 0);
        }
    }
}

/**
 * 加载分类中的下载源
 * @param {Object} sources - 下载源配置
 * @param {string} containerId - 容器元素ID
 */
async function loadCategorySources(sources, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`找不到容器：${containerId}`);
        return;
    }

    // 为每个下载源创建一个独立的容器
    Object.entries(sources).forEach(([sourceKey, sourceConfig]) => {
        const sourceContainer = document.createElement('div');
        sourceContainer.id = `source-${containerId}-${sourceKey}`;
        sourceContainer.className = 'mb-6';
        sourceContainer.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <p>正在加载 ${sourceConfig.name}...</p>
            </div>
        `;
        container.appendChild(sourceContainer);
    });

    // 并行加载所有下载源
    const loadPromises = Object.entries(sources).map(async ([sourceKey, sourceConfig]) => {
        await loadDownloadSource(sourceConfig, `source-${containerId}-${sourceKey}`, sourceKey);
    });

    try {
        await Promise.all(loadPromises);
    } catch (error) {
        console.error('加载下载源时出错：', error);
    }
}

/**
 * 加载单个下载源
 * @param {Object} sourceConfig - 下载源配置
 * @param {string} containerId - 容器元素ID
 * @param {string} sourceKey - 源标识键
 */
async function loadDownloadSource(sourceConfig, containerId, sourceKey) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`${sourceKey}：找不到容器：${containerId}`);
        return;
    }

    try {
        console.log(`${sourceKey}：${sourceConfig.path}`);
        const response = await devModeFetch(sourceConfig.path);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // 检查数据格式，判断是版本目录结构还是驱动/插件列表结构
        if (Array.isArray(data) && data.length > 0 && (data[0].hasOwnProperty('name') && data[0].hasOwnProperty('url'))) {
            // 驱动/插件列表结构
            renderDriverPluginList(data, sourceConfig, container, containerId, sourceKey);
        } else if (data.hasOwnProperty('children')) {
            // 启动器版本目录结构
            renderLauncherVersions(data, sourceConfig, container, containerId, sourceKey);
        } else {
            // 未知格式
            console.warn(`${sourceKey}：未知的数据格式`);
            container.innerHTML = `
                <div class="bg-white shadow rounded-lg p-4">
                    <h4 class="font-semibold text-gray-800 text-lg mb-2">${sourceConfig.name}</h4>
                    ${sourceConfig.description ? `<p class="text-gray-600 text-sm mb-1">${sourceConfig.description}</p>` : ''}
                    ${sourceConfig.provider ? `<p class="text-gray-500 text-xs mb-3">提供者: ${sourceConfig.provider}</p>` : ''}
                    <p class="text-gray-500">数据格式不支持</p>
                </div>
            `;
        }
    } catch (error) {
        console.error(`${sourceKey}：出错：`, error);
        container.innerHTML = `
            <div class="bg-white shadow rounded-lg p-4">
                <h4 class="font-semibold text-red-600 text-lg mb-2">${sourceConfig.name}</h4>
                <p class="text-red-500">加载失败：${error.message}</p>
            </div>
        `;
    }
}

/**
 * 渲染启动器版本目录结构
 */
function renderLauncherVersions(fileTree, sourceConfig, container, containerId, sourceKey) {
    let versionDirs = null;

    // 处理特殊嵌套路径
    if (sourceConfig.nestedPath) {
        console.log(`${sourceKey}：特殊处理嵌套路径`);
        let currentChildren = fileTree.children;

        for (const dirName of sourceConfig.nestedPath) {
            console.log(`${sourceKey}：查找目录: ${dirName}`);
            const dir = currentChildren.find(
                d => d.name === dirName && d.type === 'directory'
            );
            if (!dir || !dir.children) {
                console.error(`${sourceKey}：未找到匹配的子目录: ${dirName}`);
                // 如果找不到嵌套目录，就直接使用当前的children作为版本目录
                versionDirs = currentChildren.filter(
                    child => child.type === 'directory' && child.name !== 'root'
                );
                break;
            }
            currentChildren = dir.children;
        }

        // 如果成功遍历完所有嵌套路径，则使用最终的children作为版本目录
        if (!versionDirs) {
            versionDirs = currentChildren.filter(
                child => child.type === 'directory' && child.name !== 'root'
            );
        }
    } else {
        versionDirs = fileTree.children.filter(
            child => child.type === 'directory' && child.name !== 'root'
        );
    }

    if (versionDirs.length === 0) {
        console.warn(`${sourceKey}：没有找到版本数据`);
        container.innerHTML = `
            <div class="bg-white shadow rounded-lg p-4">
                <h4 class="font-semibold text-gray-800 text-lg mb-2">${sourceConfig.name}</h4>
                ${sourceConfig.description ? `<p class="text-gray-600 text-sm mb-1">${sourceConfig.description}</p>` : ''}
                ${sourceConfig.provider ? `<p class="text-gray-500 text-xs mb-3">提供者: ${sourceConfig.provider}</p>` : ''}
                <p class="text-gray-500">此线路暂无版本数据</p>
            </div>
        `;
        return;
    }

    // 为整个下载源创建一个可折叠面板
    const sourceContent = document.createElement('div');
    sourceContent.className = 'space-y-3';
    
    // 添加版本信息到源内容
    versionDirs.forEach((versionDir, index) => {
        const version = versionDir.name;
        const archMap = {};
        versionDir.children
            .filter(child => child.type === 'file' && child.arch)
            .forEach(file => {
                archMap[file.arch] = file.download_link;
            });

        const allArchs = Object.keys(archMap);
        const versionId = `${containerId}-${sourceKey}-version-${index}`;

        // 使用可折叠面板组件
        const versionContent = `
            ${allArchs.length === 0 ? 
                '<div class="p-3"><p class="text-gray-500 text-sm">此版本无可用下载文件</p></div>' :
                `<div class="p-3 text-xs text-gray-500">数据源: ${sourceConfig.path}</div>
                 <div class="p-3">
                     <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                         ${allArchs.map(arch => {
                             const link = archMap[arch];
                             const buttonText = arch === 'all' ? '通用版' : arch;
                             return `<a href="${link || 'javascript:void(0)'}" 
                                       class="bg-primary-100 hover:bg-primary-200 text-primary-700 py-1 px-2 rounded text-xs text-center transition block ${!link ? 'opacity-50 cursor-not-allowed' : ''}" 
                                       ${link ? 'target="_blank"' : ''} 
                                       ${!link ? 'title="未提供此架构版本"' : ''}>${buttonText}</a>`;
                         }).join('')}
                     </div>
                 </div>`
            }
        `;

        const versionPanel = createCollapsiblePanel(
            version,
            versionContent,
            {
                id: versionId,
                headerClass: 'flex justify-between items-center p-3 cursor-pointer bg-gray-50',
                bodyClass: 'overflow-hidden',
                startExpanded: false
            }
        );

        sourceContent.appendChild(versionPanel);
    });

    // 使用折叠面板组件包装源内容
    const sourcePanel = createCollapsiblePanel(
        `${sourceConfig.name}${sourceConfig.description ? ` (${sourceConfig.description})` : ''}${sourceConfig.provider ? ` [${sourceConfig.provider}]` : ''}`,
        sourceContent,
        {
            id: `source-panel-${containerId}`,
            startExpanded: true // 默认展开
        }
    );
    
    // 清空容器并添加折叠面板
    container.innerHTML = '';
    container.appendChild(sourcePanel);

    console.log(`${sourceKey}：完成`);
}

/**
 * 渲染驱动/插件列表结构
 */
function renderDriverPluginList(items, sourceConfig, container, containerId, sourceKey) {
    if (items.length === 0) {
        console.warn(`${sourceKey}：没有找到下载项`);
        container.innerHTML = `
            <div class="bg-white shadow rounded-lg p-4">
                <h4 class="font-semibold text-gray-800 text-lg mb-2">${sourceConfig.name}</h4>
                ${sourceConfig.description ? `<p class="text-gray-600 text-sm mb-1">${sourceConfig.description}</p>` : ''}
                ${sourceConfig.provider ? `<p class="text-gray-500 text-xs mb-3">提供者: ${sourceConfig.provider}</p>` : ''}
                <p class="text-gray-500">此线路暂无下载项</p>
            </div>
        `;
        return;
    }

    // 为整个下载源创建一个可折叠面板
    const sourceContent = document.createElement('div');
    sourceContent.className = 'space-y-3';
    
    // 为每个下载项创建一个面板
    items.forEach((item, index) => {
        const itemId = `${containerId}-${sourceKey}-item-${index}`;
        
        // 使用可折叠面板组件
        const itemContent = `
            <div class="p-3 text-xs text-gray-500">数据源: ${sourceConfig.path}</div>
            <div class="p-3">
                <a href="${item.url || 'javascript:void(0)'}" 
                   class="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded text-center transition block"
                   ${item.url ? 'target="_blank"' : ''} 
                   ${!item.url ? 'title="下载链接不可用"' : ''}>下载 ${item.name}</a>
            </div>
        `;

        const itemPanel = createCollapsiblePanel(
            item.name,
            itemContent,
            {
                id: itemId,
                headerClass: 'flex justify-between items-center p-3 cursor-pointer bg-gray-50',
                bodyClass: 'overflow-hidden',
                startExpanded: false
            }
        );

        sourceContent.appendChild(itemPanel);
    });

    // 使用折叠面板组件包装源内容
    const sourcePanel = createCollapsiblePanel(
        `${sourceConfig.name}${sourceConfig.description ? ` (${sourceConfig.description})` : ''}${sourceConfig.provider ? ` [${sourceConfig.provider}]` : ''}`,
        sourceContent,
        {
            id: `source-panel-${containerId}`,
            startExpanded: true // 默认展开
        }
    );
    
    // 清空容器并添加折叠面板
    container.innerHTML = '';
    container.appendChild(sourcePanel);

    console.log(`${sourceKey}：完成`);
}

/**
 * 加载所有下载分类
 * @returns {Promise<void>}
 */
async function loadAllDownloadCategories() {
    const container = document.getElementById('downloads-container');
    if (!container) {
        console.error('找不到下载容器：downloads-container');
        return;
    }

    // 清空容器
    container.innerHTML = '';

    // 构建下载分类结构
    buildDownloadCategories(DOWNLOAD_CATEGORIES, container);
}

/**
 * 初始化下载模块
 */
function initDownloads() {
    // 创建主下载容器（如果不存在）
    let container = document.getElementById('downloads-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'downloads-container';
        container.className = 'space-y-6';
        
        // 替换原有的FCL和ZL下载容器
        const fclContainer = document.getElementById('fcl-downloads');
        const zlContainer = document.getElementById('zl-downloads');
        
        if (fclContainer && zlContainer) {
            fclContainer.replaceWith(container);
            zlContainer.remove();
        } else {
            const downloadsSection = document.querySelector('#downloads > div');
            if (downloadsSection) {
                downloadsSection.appendChild(container);
            }
        }
    }

    // 加载所有下载分类
    loadAllDownloadCategories();
}

// 导出函数
export { initDownloads, loadAllDownloadCategories };