// 下载模块功能

import { SOURCE_MAP } from './downloadWays.js';
import { createAnimatedCollapsiblePanel } from './CollapsiblePanel.js';

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
        container.innerHTML = `<div class="text-red-500 p-4">${lineName}：配置错误</div>`;
        return;
    }

    try {
        console.log(`${lineName}：${url}`);
        const response = await fetch(url);
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
            container.innerHTML = `<div class="text-red-500 p-4">${lineName}：警告：没有找到版本数据</div>`;
            return;
        } else {
            console.log(`${lineName}：找到版本数：${versionDirs.length}`);
        }

        // 为每个版本创建可折叠面板
        let contentHtml = '';
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

            // 创建版本面板的标题
            contentHtml += `
                <div class="border border-gray-200 rounded-md overflow-hidden mb-3" id="${versionId}-panel">
                    <div class="flex justify-between items-center p-3 cursor-pointer bg-gray-50" id="${versionId}-header">
                        <h5 class="font-medium">${version}</h5>
                        <i class="fas fa-chevron-down transition-transform duration-300" id="${versionId}-icon"></i>
                    </div>
                    <div class="max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out collapsible-content" id="${versionId}-body" style="max-height: 0px;">
            `;

            if (allArchs.length === 0) {
                contentHtml += '<div class="p-3"><p class="text-gray-500 text-sm">此版本无可用下载文件</p></div>';
            } else {
                // 显示JSON源链接
                contentHtml += `<div class="p-3 text-xs text-gray-500">数据源: ${url}</div>`;
                // 创建架构按钮
                contentHtml += '<div class="p-3"><div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">';
                allArchs.forEach(arch => {
                    const link = archMap[arch];
                    const buttonText = arch === 'all' ? '通用版' : arch;
                    contentHtml += `<a href="${link || 'javascript:void(0)'}" 
                                      class="bg-primary-100 hover:bg-primary-200 text-primary-700 py-1 px-2 rounded text-xs text-center transition block ${!link ? 'opacity-50 cursor-not-allowed' : ''}" 
                                      ${link ? 'target="_blank"' : ''} 
                                      ${!link ? 'title="未提供此架构版本"' : ''}>${buttonText}</a>`;
                });
                contentHtml += '</div></div>';
            }

            // 结束版本面板
            contentHtml += `
                    </div>
                </div>
            `;
        });

        // 更新容器内容
        container.innerHTML = contentHtml;

        // 为新添加的版本面板添加折叠功能和动画
        const versionPanels = container.querySelectorAll('[id$="-panel"]');
        versionPanels.forEach(panel => {
            const header = panel.querySelector('[id$="-header"]');
            const body = panel.querySelector('[id$="-body"]');
            const icon = panel.querySelector('[id$="-icon"]');

            if (header && body && icon) {
                header.addEventListener('click', () => {
                    // 切换状态类
                    body.classList.toggle('collapsed');

                    if (body.classList.contains('collapsed')) {
                        // 折叠
                        // 先设置一个具体的maxHeight值以触发动画
                        body.style.maxHeight = body.scrollHeight + 'px';
                        // 触发重排
                        body.offsetHeight;
                        body.style.maxHeight = '0px';
                        body.style.opacity = '0';
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    } else {
                        // 展开
                        // 获取内容的实际高度（包括padding）
                        const contentHeight = body.scrollHeight;
                        body.style.maxHeight = contentHeight + 'px';
                        body.style.opacity = '1';
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');

                        // 动画结束后重置状态
                        const onTransitionEnd = () => {
                            body.removeEventListener('transitionend', onTransitionEnd);
                        };
                        body.addEventListener('transitionend', onTransitionEnd);
                    }
                });

                // 初始化时添加collapsed类，以确保第一次点击能正确工作
                body.classList.add('collapsed');
            }
        });

        console.log(`${lineName}：完成`);
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
        const panel = createAnimatedCollapsiblePanel(
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
        const panel = createAnimatedCollapsiblePanel(
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