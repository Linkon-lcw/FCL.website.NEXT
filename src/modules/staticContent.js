// 静态内容加载模块

/**
 * 从指定URL获取HTML内容并插入到目标容器中
 * @param {string} url - HTML文件的URL
 * @param {string} containerId - 目标容器的ID
 * @returns {Promise<void>}
 */
async function loadHtmlContent(url, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`找不到容器: ${containerId}`);
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const htmlContent = await response.text();
        
        // 创建一个临时的div来解析HTML内容
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // 获取content div的内容
        const contentDiv = tempDiv.querySelector('div');
        if (contentDiv) {
            container.innerHTML = contentDiv.innerHTML;
        } else {
            container.innerHTML = htmlContent;
        }
    } catch (error) {
        console.error(`加载内容失败 (${url}):`, error);
        container.innerHTML = `<p class="text-red-500">加载内容失败: ${error.message}</p>`;
    }
}

/**
 * 加载FCL介绍内容
 * @param {string} containerId - 容器元素的ID
 */
async function loadIntroFcl(containerId) {
    await loadHtmlContent('/src/intro.html', containerId);
}

/**
 * 加载校验内容
 * @param {string} containerId - 容器元素的ID
 */
async function loadChecksums(containerId) {
    await loadHtmlContent('/src/check.html', containerId);
}

/**
 * 加载关于页面内容
 * @param {string} containerId - 容器元素的ID
 */
async function loadAbout(containerId) {
    await loadHtmlContent('/src/about.html', containerId);
}

// 导出函数
export { loadIntroFcl, loadChecksums, loadAbout };