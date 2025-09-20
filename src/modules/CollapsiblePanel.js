// 折叠面板组件

/**
 * 创建一个带动画效果的可折叠面板
 * @param {string} title - 面板标题
 * @param {string} content - 面板内容
 * @param {string} id - 面板唯一标识符
 * @returns {HTMLElement} 创建好的面板元素
 */
function createAnimatedCollapsiblePanel(title, content, id) {
    // 创建外层折叠面板容器
    const outerPanel = document.createElement('div');
    outerPanel.className = 'border border-gray-200 rounded-md mb-4 overflow-hidden';
    outerPanel.id = `${id}-panel`;

    // 创建标题部分
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center p-4 cursor-pointer bg-gray-100 notice-panel-header';
    header.id = `${id}-header`;

    header.innerHTML = `
        <h3 class="font-medium">${title}</h3>
        <i class="fas fa-chevron-down transition-transform duration-300"></i>
    `;

    const body = document.createElement('div');
    body.className = 'max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out notice-panel-body';
    body.id = `${id}-body`;
    body.innerHTML = `<div class="p-4">${content}</div>`;

    // 组装外层面板
    outerPanel.appendChild(header);
    outerPanel.appendChild(body);

    return outerPanel;
}

/**
 * 初始化折叠面板组件
 * 为所有带有notice-panel-header类的元素添加折叠功能
 */
function initCollapsiblePanels() {
    // 获取所有折叠面板头部元素
    const panelHeaders = document.querySelectorAll('.notice-panel-header');
    
    // 为每个头部元素添加点击事件监听器
    panelHeaders.forEach(header => {
        // 确保每个面板只添加一次事件监听器
        if (!header.dataset.listenerAdded) {
            header.addEventListener('click', function() {
                // 切换面板展开/收起状态
                togglePanel(this);
            });
            
            // 标记已添加监听器
            header.dataset.listenerAdded = 'true';
        }
    });
}

/**
 * 切换面板展开/收起状态
 * @param {HTMLElement} header - 面板头部元素
 */
function togglePanel(header) {
    // 获取对应的面板主体元素
    const panelBody = header.nextElementSibling;
    
    if (panelBody) {
        // 切换面板状态
        if (panelBody.classList.contains('collapsed') || panelBody.style.maxHeight === '0px' || !panelBody.style.maxHeight) {
            // 展开面板
            panelBody.style.maxHeight = panelBody.scrollHeight + 'px';
            panelBody.style.opacity = '1';
            panelBody.classList.remove('collapsed');
            
            // 更新图标
            const icon = header.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        } else {
            // 收起面板
            panelBody.style.maxHeight = '0px';
            panelBody.style.opacity = '0';
            panelBody.classList.add('collapsed');
            
            // 更新图标
            const icon = header.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        }
    }
}

/**
 * 展开指定面板
 * @param {HTMLElement} header - 面板头部元素
 */
function expandPanel(header) {
    const panelBody = header.nextElementSibling;
    
    if (panelBody && (panelBody.classList.contains('collapsed') || panelBody.style.maxHeight === '0px' || !panelBody.style.maxHeight)) {
        togglePanel(header);
    }
}

/**
 * 收起指定面板
 * @param {HTMLElement} header - 面板头部元素
 */
function collapsePanel(header) {
    const panelBody = header.nextElementSibling;
    
    if (panelBody && !(panelBody.classList.contains('collapsed') || panelBody.style.maxHeight === '0px' || !panelBody.style.maxHeight)) {
        togglePanel(header);
    }
}

// 页面加载完成后初始化折叠面板
document.addEventListener('DOMContentLoaded', () => {
    initCollapsiblePanels();
});

// 导出函数
export { createAnimatedCollapsiblePanel, initCollapsiblePanels, togglePanel, expandPanel, collapsePanel };
