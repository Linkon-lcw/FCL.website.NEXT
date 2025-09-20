// 开门见山下载链接设置

import { SOURCE_MAP } from './downloadWays.js';
import { sysArch, sysInfo, testAndroidVersion } from './deviceDetection.js';

/**
 * 递归查找嵌套目录（支持多级嵌套）
 * @param {Array} children - 目录子项数组
 * @param {string} targetName - 目标目录名
 * @param {Array} [nestedPath] - 嵌套路径数组
 */
function findNestedDirectory(children, targetName, nestedPath = []) {
    let currentChildren = children;
    if (nestedPath) {
        for (const dirName of nestedPath) {
            const dir = currentChildren.find(
                d => d.name === dirName && d.type === 'directory'
            );
            if (!dir || !dir.children) return null;
            currentChildren = dir.children;
        }
    }

    return currentChildren.find(
        dir => dir.type === 'directory' && dir.name === targetName
    );
}

/**
 * 获取并填充下载线路的最新版本到首页开门见山
 * @param {string} sourceKey - 数据源标识
 */
async function setupIndexDownLinks(sourceKey) {
    console.log(`开门见山：加载：${sourceKey}`);

    try {
        // 提前获取源配置
        const sourceConfig = SOURCE_MAP[sourceKey];
        if (!sourceConfig) throw new Error(`无效数据源标识："${sourceKey}"`);

        const jsonUrl = sourceConfig.path;
        console.log(`开门见山：JSON：${jsonUrl}`);

        // 并行执行网络请求，但设置超时避免阻塞
        const fetchDataWithTimeout = (url, timeout = 5000) => {
            return Promise.race([
                fetch(url).then(response => {
                    if (!response.ok) throw new Error(`HTTP出错：${response.status}`);
                    return response.json();
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('请求超时')), timeout)
                )
            ]);
        };

        const jsonData = await fetchDataWithTimeout(jsonUrl);

        const { latest, children } = jsonData;

        if (!latest || !Array.isArray(children)) {
            throw new Error('无效的文件树结构');
        }

        let latestVersionDir = findNestedDirectory(children, latest, sourceConfig.nestedPath);
        if (!latestVersionDir) throw new Error(`未找到最新版本目录: ${latest}`);

        console.log(`开门见山：最新版本：${latestVersionDir.name}`);

        const archLinks = latestVersionDir.children?.reduce((map, child) => {
            if (child.type === 'file' && child.arch) {
                map[child.arch] = child.download_link;
            }
            return map;
        }, {}) || {};

        // 创建架构按钮
        const createArchButton = (arch, link, isPrimary = false) => {
            const button = document.createElement('a');
            button.className = isPrimary ? 
                'bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-center transition duration-300 ease-in-out transform hover:scale-105 block' :
                'bg-primary-100 hover:bg-primary-200 text-primary-800 py-3 px-4 rounded-md text-center transition duration-300 ease-in-out transform hover:scale-105 block';
            button.href = link || 'javascript:void(0)';
            
            if (!link) {
                button.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                button.target = '_blank';
            }
            
            // 特殊处理'all'架构
            if (arch === 'all') {
                button.innerHTML = `<i class="fas fa-download mr-2"></i>下载 ${latestVersionDir.name} 版本 (通用版)`;
            } else {
                button.innerHTML = `<i class="fas fa-microchip mr-2"></i>下载 ${latestVersionDir.name} 版本 (${arch})`;
            }
            
            return button;
        };

        // 获取所有可用架构（除了'all'）
        const availableArchs = Object.keys(archLinks).filter(arch => arch !== 'all');
        
        // 获取按钮容器
        const buttonContainer = document.getElementById('odlm-arch-buttons');
        if (buttonContainer) {
            // 清空容器
            buttonContainer.innerHTML = '';
            
            // 为'all'架构创建按钮
            if (archLinks['all']) {
                const allButton = createArchButton('all', archLinks['all'], true);
                buttonContainer.appendChild(allButton);
            }
            
            // 为每个架构创建按钮
            availableArchs.forEach(arch => {
                const button = createArchButton(arch, archLinks[arch]);
                buttonContainer.appendChild(button);
            });
            
            // 如果没有架构，显示提示信息
            if (availableArchs.length === 0 && !archLinks['all']) {
                const noArchText = document.createElement('p');
                noArchText.className = 'text-red-500 text-center py-4';
                noArchText.textContent = '此版本无可用下载文件';
                buttonContainer.appendChild(noArchText);
            }
        }

        const latestInfoEl = document.getElementById('latestInfo');
        const latestInfoEl2 = document.getElementById('latestInfo2');
        if (latestInfoEl && latestInfoEl2) {
            const latestText = sourceConfig.markLatest ?
                `${latest}（此源最新）` :
                latest;
            latestInfoEl.textContent = latestText;
            latestInfoEl2.textContent = latestText;
        }

        const diEl = document.getElementById('deviceInfo');
        if (diEl) diEl.innerHTML = sysInfo;

        testAndroidVersion(8, 'FCL');

    } catch (error) {
        console.error(`开门见山：出错：${error.message}`, error);

        const errorHtml = `
        <div class="text-red-500">
          <p>抱歉，我们遇到了一个无法解决的问题。</p>
          <p>${error.message}</p>
          <p>点击"转到'下载'TAB"将会跳转到"下载"选项卡，您可以在这里使用其它路线继续下载。</p>
        </div>
        <br>
        <div class="grid grid-cols-2 gap-4">
          <a class="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md text-center transition" href="#downloads">转到"下载"TAB</a>
          <a class="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md text-center transition" href="https://wj.qq.com/s2/22395480/df5b/" target="_blank">向站长反馈</a>
        </div>
        <br>
        <div class="text-gray-600">
          <p>下载站运营困难，不妨<a href="#sponsors" class="text-primary-600 hover:underline">赞助此下载站</a>吧awa（不赞助也能下！）</p>
          <p>启动器的开发者也不容易，<a href="https://afdian.com/@tungs" target="_blank" class="text-primary-600 hover:underline">赞助FCL开发者</a>。</p>
          <p class="text-red-600"><mark>赞助是纯自愿的，请结合您的经济状况实力再考虑是否要赞助！赞助后无法退款！</mark></p>
        </div>
        `;

        const odlm = document.getElementById('odlm');
        if (odlm) {
            odlm.innerHTML = errorHtml;
        }
    }
}

// 导出函数
export { setupIndexDownLinks };