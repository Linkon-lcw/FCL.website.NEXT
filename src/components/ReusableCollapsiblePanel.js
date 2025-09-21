// 通用折叠面板组件
// 可以在任何项目中独立使用

/**
 * 创建一个带动画效果的可折叠面板
 * @param {string} title - 面板标题
 * @param {string|HTMLElement} content - 面板内容（可以是HTML字符串或DOM元素）
 * @param {Object} [options] - 配置选项
 * @param {string} [options.id] - 面板唯一标识符
 * @param {string} [options.headerClass] - 自定义头部CSS类
 * @param {string} [options.bodyClass] - 自定义主体CSS类
 * @param {boolean} [options.startExpanded=false] - 是否默认展开
 * @param {boolean} [options.allowMultiple=false] - 是否允许多个面板同时展开
 * @returns {HTMLElement} 创建好的面板元素
 */
function createCollapsiblePanel(title, content, options = {}) {
    // 默认选项
    const defaults = {
        id: `collapsible-panel-${Date.now()}`,
        headerClass: 'flex justify-between items-center p-4 cursor-pointer bg-gray-100',
        bodyClass: 'max-h-0 opacity-0 overflow-hidden',
        startExpanded: false,
        allowMultiple: false
    };
    
    // 合并选项
    const opts = { ...defaults, ...options };
    
    // 创建外层折叠面板容器
    const outerPanel = document.createElement('div');
    outerPanel.className = 'border border-gray-200 rounded-md mb-4 overflow-hidden collapsible-panel';
    outerPanel.id = `${opts.id}-panel`;
    
    // 创建标题部分
    const header = document.createElement('div');
    header.className = `collapsible-panel-header ${opts.headerClass}`;
    header.id = `${opts.id}-header`;
    
    // 创建标题文本元素
    const titleElement = document.createElement('h3');
    titleElement.className = 'font-medium';
    titleElement.textContent = title;
    
    // 创建图标元素
    const iconElement = document.createElement('i');
    iconElement.className = 'fas fa-chevron-down';
    
    // 组装标题部分
    header.appendChild(titleElement);
    header.appendChild(iconElement);
    
    // 创建主体部分
    const body = document.createElement('div');
    body.className = `collapsible-panel-body ${opts.bodyClass}`;
    body.id = `${opts.id}-body`;
    
    // 设置内容
    if (typeof content === 'string') {
        const contentWrapper = document.createElement('div');
        contentWrapper.innerHTML = content;
        body.appendChild(contentWrapper);
    } else if (content instanceof HTMLElement) {
        const wrapper = document.createElement('div');
        wrapper.appendChild(content);
        body.appendChild(wrapper);
    }
    
    // 组装外层面板
    outerPanel.appendChild(header);
    outerPanel.appendChild(body);
    
    // 如果默认展开，设置初始状态
    if (opts.startExpanded) {
        body.classList.remove('collapsed');
        body.classList.add('expanded');
        // 添加p-4类以提供内边距
        body.classList.add('p-4');
        iconElement.classList.remove('fa-chevron-down');
        iconElement.classList.add('fa-chevron-up');
    } else {
        body.classList.add('collapsed');
    }
    
    return outerPanel;
}

/**\n * 初始化折叠面板组件\n * 为所有带有collapsible-panel-header类的元素添加折叠功能\n * @param {string|HTMLElement} [container=document] - 容器元素或选择器，默认为整个文档\n */
function initCollapsiblePanels(container = document) {
    // 获取容器元素
    const targetContainer = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    
    if (!targetContainer) {
        console.warn('折叠面板：找不到容器元素');
        return;
    }
    
    // 获取所有折叠面板头部元素
    const panelHeaders = targetContainer.querySelectorAll('.collapsible-panel-header');
    
    // 为每个头部元素添加点击事件监听器
    panelHeaders.forEach(header => {
        // 使用节流函数限制点击事件的触发频率
        const throttledClickHandler = throttle(function(e) {
            // 阻止事件冒泡
            e.stopPropagation();
            // 保存事件对象供togglePanel使用
            header.event = e;
            
            // 获取面板容器和选项
            const panelContainer = this.closest('.collapsible-panel');
            const panelOptions = panelContainer ? JSON.parse(panelContainer.dataset.panelOptions || '{}') : {};
            
            // 切换面板展开/收起状态
            togglePanel(this, panelOptions);
        }, 200); // 200ms节流间隔
        
        // 确保每个面板只添加一次事件监听器
        if (!header.dataset.listenerAdded) {
            header.addEventListener('click', throttledClickHandler);
            
            // 标记已添加监听器
            header.dataset.listenerAdded = 'true';
        }
    });
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**\n * 切换面板展开/收起状态\n * @param {HTMLElement} header - 面板头部元素\n * @param {Object} [options] - 面板选项\n * @param {boolean} [options.allowMultiple=false] - 是否允许多个面板同时展开\n */
function togglePanel(header, options = {}) {
    // 阻止事件冒泡，防止影响父级面板
    if (header.event && typeof header.event.stopPropagation === 'function') {
        header.event.stopPropagation();
    }
    
    // 获取对应的面板主体元素
    const panelBody = header.nextElementSibling;
    
    if (panelBody) {
        // 如果不允许同时展开多个面板，需要关闭其他面板
        if (!options.allowMultiple) {
            // 获取同一容器内的所有面板（但不包括嵌套的面板）
            const container = header.closest('.collapsible-panel-container') || 
                             (header.closest('.collapsible-panel') ? header.closest('.collapsible-panel').parentElement : document);
            
            // 只选择直接子面板，不包括嵌套在其他面板中的面板
            const allHeaders = Array.from(container.querySelectorAll('.collapsible-panel-header')).filter(h => {
                // 检查这个header是否是container的直接子面板，而不是嵌套在其他面板中的
                const panel = h.closest('.collapsible-panel');
                return panel && panel.parentElement === container;
            });
            
            allHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    const otherBody = otherHeader.nextElementSibling;
                    if (otherBody && otherBody.classList.contains('expanded')) {
                        // 收起其他面板
                        collapsePanel(otherHeader);
                    }
                }
            });
        }
        
        // 切换当前面板状态
        if (panelBody.classList.contains('collapsed') || !panelBody.classList.contains('expanded')) {
            // 展开面板
            expandPanel(header);
        } else {
            // 收起面板
            collapsePanel(header);
        }
    }
}

/**
 * 展开指定面板
 * @param {HTMLElement} header - 面板头部元素
 */
function expandPanel(header) {
    const panelBody = header.nextElementSibling;
    
    if (panelBody) {
        // 移除可能存在的内联样式，让CSS类控制动画
        panelBody.style.maxHeight = '';
        panelBody.style.opacity = '';
        
        // 使用CSS类控制展开状态
        panelBody.classList.remove('collapsed');
        panelBody.classList.add('expanded');
        // 添加p-4类以提供内边距
        panelBody.classList.add('p-4');
        
        // 更新图标
        const icon = header.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    }
}

/**
 * 收起指定面板
 * @param {HTMLElement} header - 面板头部元素
 */
function collapsePanel(header) {
    const panelBody = header.nextElementSibling;
    
    if (panelBody) {
        // 使用CSS类控制收起状态
        panelBody.classList.remove('expanded');
        panelBody.classList.add('collapsed');
        // 移除p-4类以消除内边距
        panelBody.classList.remove('p-4');
        
        // 更新图标
        const icon = header.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    }
}

/**
 * 创建折叠面板容器
 * 用于管理一组折叠面板
 * @param {string} id - 容器ID
 * @returns {HTMLElement} 容器元素
 */
function createCollapsiblePanelContainer(id) {
    const container = document.createElement('div');
    container.className = 'collapsible-panel-container';
    container.id = id;
    return container;
}

// 页面加载完成后初始化折叠面板
document.addEventListener('DOMContentLoaded', () => {
    initCollapsiblePanels();
});

// 导出函数
export { 
    createCollapsiblePanel, 
    initCollapsiblePanels, 
    togglePanel, 
    expandPanel, 
    collapsePanel,
    createCollapsiblePanelContainer
};