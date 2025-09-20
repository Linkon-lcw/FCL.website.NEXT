// 可折叠面板组件

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
 * 创建带有动画效果的可折叠面板
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
    header.className = 'flex justify-between items-center p-4 cursor-pointer bg-gray-100';
    header.id = `${id}-header`;

    header.innerHTML = `
        <h3 class="font-medium">${title}</h3>
        <i class="fas fa-chevron-down transition-transform duration-300" id="${id}-icon"></i>
    `;

    const body = document.createElement('div');
    body.className = 'max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out collapsible-content';
    body.id = `${id}-body`;
    body.innerHTML = `<div class="p-4">${content}</div>`;

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
            // 先设置一个具体的maxHeight值以触发动画
            body.style.maxHeight = body.scrollHeight + 'px';
            // 触发重排
            body.offsetHeight;
            body.style.maxHeight = '0px';
            body.style.opacity = '0';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            
            // 动画结束后重置状态
            const onTransitionEnd = () => {
                body.removeEventListener('transitionend', onTransitionEnd);
            };
            body.addEventListener('transitionend', onTransitionEnd);
        } else {
            // 展开
            // 先设置一个具体的maxHeight值以触发动画
            body.style.maxHeight = body.scrollHeight + 'px';
            body.style.opacity = '1';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');

            // 在动画结束后，将maxHeight设置为'none'以适应内容变化
            const onTransitionEnd = () => {
                body.style.maxHeight = 'none';
                body.removeEventListener('transitionend', onTransitionEnd);
            };
            body.addEventListener('transitionend', onTransitionEnd);
        }
    });

    // 初始化时添加collapsed类，以确保第一次点击能正确工作
    body.classList.add('collapsed');

    return outerPanel;
}

// 导出函数
export { createCollapsiblePanel, createAnimatedCollapsiblePanel };