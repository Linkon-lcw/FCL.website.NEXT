// 下载模块功能

import { SOURCE_MAP } from './downloadWays.js';

/**
 * 创建一个可折叠的面板项
 * @param {string} title - 面板标题
 * @param {string} content - 面板内容
 * @returns {HTMLElement} 创建好的面板元素
 */
function createCollapsiblePanel(title, content) {
    const panel = document.createElement('div');
    panel.className = 'border border-gray-200 rounded-md';
    
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center p-4 cursor-pointer bg-gray-50';
    header.innerHTML = `
        <h4 class="font-medium">${title}</h4>
        <i class="fas fa-chevron-down transition-transform duration-200"></i>
    `;
    
    const body = document.createElement('div');
    body.className = 'p-4 hidden';
    body.innerHTML = content;
    
    // 切换折叠状态
    header.addEventListener('click', () => {
        body.classList.toggle('hidden');
        const icon = header.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });
    
    panel.appendChild(header);
    panel.appendChild(body);
    
    return panel;
}

/**
 * 加载下载线路
 * @param {string} url - 文件树JSON的URL
 * @param {string} containerId - 容器元素的ID
 * @param {string} lineName - 线路名称（用于日志标识）
 * @returns {Promise<void>} 无返回值
 */
async function loadFclDownWay(url, containerId, lineName) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`${lineName}：找不到容器：${containerId}`);
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
            for (const dirName of SOURCE_MAP[lineName].nestedPath) {
                const dir = currentChildren.find(
                    d => d.name === dirName && d.type === 'directory'
                );
                if (!dir || !dir.children) {
                    throw new Error(`未找到嵌套目录: ${dirName}`);
                }
                currentChildren = dir.children;
            }
            versionDirs = currentChildren.filter(
                child => child.type === 'directory' && child.name !== 'root'
            );
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
                        
                        // 在动画结束后，将maxHeight设置为'none'以适应内容变化
                        const cleanup = () => {
                            body.style.maxHeight = 'none';
                            body.removeEventListener('transitionend', cleanup);
                        };
                        body.addEventListener('transitionend', cleanup);
                    }
                });
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
    const fclLines = [
        { key: 'F1', name: 'FCL线1' },
        { key: 'F2', name: 'FCL线2' },
        { key: 'F3', name: 'FCL线3' },
        { key: 'F4', name: 'FCL线4' },
        { key: 'F5', name: 'FCL线5' },
        { key: 'F6', name: 'FCL线6' },
        { key: 'F8', name: 'FCL线8' }
    ];
    
    // 为每个线路创建外层折叠面板
    fclLines.forEach(line => {
        // 创建外层折叠面板容器
        const outerPanel = document.createElement('div');
        outerPanel.className = 'border border-gray-200 rounded-md mb-4 overflow-hidden';
        outerPanel.id = `fcl-line-${line.key}-panel`;
        
        // 创建标题部分
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center p-4 cursor-pointer bg-gray-100';
        header.id = `fcl-line-${line.key}-header`;
        header.innerHTML = `
            <h3 class="font-medium">${line.name}</h3>
            <i class="fas fa-chevron-down transition-transform duration-300" id="fcl-line-${line.key}-icon"></i>
        `;
        
        const body = document.createElement('div');
            body.className = 'max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out collapsible-content';
            body.id = `fcl-line-${line.key}-body`;
            body.innerHTML = `
                <div class="p-4" id="fcl-${line.key}" class="space-y-3">
                    <div class="text-center py-4 text-gray-500">
                        <p>正在加载${line.name}...</p>
                    </div>
                </div>
            `;
        
        // 组装外层面板
        outerPanel.appendChild(header);
        outerPanel.appendChild(body);
        
        // 为外层折叠面板添加折叠功能
        header.addEventListener('click', () => {
            const icon = header.querySelector('i');
            // 切换状态类
            body.classList.toggle('collapsed');
            
            if (body.classList.contains('collapsed')) {
                // 折叠
                body.style.maxHeight = '0px';
                body.style.opacity = '0';
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                // 展开
                // 先设置一个具体的maxHeight值以触发动画
                body.style.maxHeight = body.scrollHeight + 'px';
                body.style.opacity = '1';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                
                // 在动画结束后，将maxHeight设置为'none'以适应内容变化
                const cleanup = () => {
                    body.style.maxHeight = 'none';
                    body.removeEventListener('transitionend', cleanup);
                };
                body.addEventListener('transitionend', cleanup);
            }
        });
        
        container.appendChild(outerPanel);
    });
    
    // 并行加载所有线路，谁先加载完谁先显示
    fclLines.forEach(async (line) => {
        const sourceConfig = SOURCE_MAP[line.key];
        if (sourceConfig) {
            await loadFclDownWay(sourceConfig.path, `fcl-${line.key}`, line.name);
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
    const zlLines = [
        { key: 'Z1', name: 'ZL线1' },
        { key: 'Z3', name: 'ZL线3' },
        { key: 'Z21', name: 'ZL2线1' },
        { key: 'Z22', name: 'ZL2线2' }
    ];
    
    // 为每个线路创建外层折叠面板
    zlLines.forEach(line => {
        // 创建外层折叠面板容器
        const outerPanel = document.createElement('div');
        outerPanel.className = 'border border-gray-200 rounded-md mb-4 overflow-hidden';
        outerPanel.id = `zl-line-${line.key}-panel`;
        
        // 创建标题部分
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center p-4 cursor-pointer bg-gray-100';
        header.id = `zl-line-${line.key}-header`;
        header.innerHTML = `
            <h3 class="font-medium">${line.name}</h3>
            <i class="fas fa-chevron-down transition-transform duration-300" id="zl-line-${line.key}-icon"></i>
        `;
        
        const body = document.createElement('div');
            body.className = 'max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out collapsible-content';
            body.id = `zl-line-${line.key}-body`;
            body.innerHTML = `
                <div class="p-4" id="zl-${line.key}" class="space-y-3">
                    <div class="text-center py-4 text-gray-500">
                        <p>正在加载${line.name}...</p>
                    </div>
                </div>
            `;
        
        // 组装外层面板
        outerPanel.appendChild(header);
        outerPanel.appendChild(body);
        
        // 为外层折叠面板添加折叠功能
        header.addEventListener('click', () => {
            const icon = header.querySelector('i');
            // 切换状态类
            body.classList.toggle('collapsed');
            
            if (body.classList.contains('collapsed')) {
                // 折叠
                body.style.maxHeight = '0px';
                body.style.opacity = '0';
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                // 展开
                // 先设置一个具体的maxHeight值以触发动画
                body.style.maxHeight = body.scrollHeight + 'px';
                body.style.opacity = '1';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                
                // 在动画结束后，将maxHeight设置为'none'以适应内容变化
                const cleanup = () => {
                    body.style.maxHeight = 'none';
                    body.removeEventListener('transitionend', cleanup);
                };
                body.addEventListener('transitionend', cleanup);
            }
        });
        
        container.appendChild(outerPanel);
    });
    
    // 并行加载所有线路，谁先加载完谁先显示
    zlLines.forEach(async (line) => {
        const sourceConfig = SOURCE_MAP[line.key];
        if (sourceConfig) {
            await loadFclDownWay(sourceConfig.path, `zl-${line.key}`, line.name);
        }
    });
}

// 导出函数
export { loadFclDownWay, createCollapsiblePanel, loadAllFclDownWays, loadAllZlDownWays };