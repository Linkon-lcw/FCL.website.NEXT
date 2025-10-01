// 下载线路数据源映射表 - 支持软件分类和嵌套结构

// 软件分类配置路径
const SOFTWARE_CONFIG_PATH = './file/data/software-config.json';

// 全局线路映射表（向后兼容）
let SOURCE_MAP = {};

// 软件分类数据结构
let SOFTWARE_CONFIG = null;

/**
 * 加载软件分类配置
 * @returns {Promise<Object>} 软件配置对象
 */
async function loadSoftwareConfig() {
    if (SOFTWARE_CONFIG) {
        return SOFTWARE_CONFIG;
    }

    try {
        console.groupCollapsed('下载线路：加载软件分类配置');
        
        // 使用开发者模式fetch以确保兼容性
        const { devModeFetch } = await import('./devMode.js');
        const response = await devModeFetch(SOFTWARE_CONFIG_PATH);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        
        SOFTWARE_CONFIG = await response.json();
        
        // 构建向后兼容的SOURCE_MAP
        buildSourceMap();
        
        console.log('软件分类配置加载成功');
        console.log('软件数量:', Object.keys(SOFTWARE_CONFIG.software).length);
        console.groupEnd();
        
        return SOFTWARE_CONFIG;
    } catch (error) {
        console.error('加载软件分类配置失败:', error);
        console.groupEnd();
        
        // 如果加载失败，使用默认的SOURCE_MAP（向后兼容）
        SOURCE_MAP = getDefaultSourceMap();
        return null;
    }
}

/**
 * 构建向后兼容的SOURCE_MAP
 */
function buildSourceMap() {
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.software) {
        SOURCE_MAP = getDefaultSourceMap();
        return;
    }
    
    SOURCE_MAP = {};
    
    // 遍历所有软件和版本，构建扁平化的线路映射
    Object.values(SOFTWARE_CONFIG.software).forEach(software => {
        if (software.versions) {
            Object.values(software.versions).forEach(version => {
                if (version.lines) {
                    Object.entries(version.lines).forEach(([lineKey, lineConfig]) => {
                        SOURCE_MAP[lineKey] = lineConfig;
                    });
                }
            });
        }
    });
    
    console.log('构建SOURCE_MAP完成，线路数量:', Object.keys(SOURCE_MAP).length);
}

/**
 * 获取默认的SOURCE_MAP（向后兼容）
 * @returns {Object} 默认线路映射
 */
function getDefaultSourceMap() {
    return {
        F1: { name: 'FCL线1', path: './file/data/fclDownWay1.json', markLatest: false, description: '已开学', provider: '站长提供', icon: '🏫' },
        F2: { name: 'FCL线2', path: 'https://frostlynx.work/external/fcl/file_tree.json', markLatest: true, nestedPath: ['fcl'], description: '更新快', provider: '哈哈66623332提供', icon: '🚀' },
        F3: { name: 'FCL线3', path: './file/data/fclDownWay3.json', markLatest: false, description: '全版本', provider: 'fishcpy提供', icon: '📦' },
        F4: { name: 'FCL线4', path: './file/data/fclDownWay4.json', markLatest: false, description: '速度快', provider: '八蓝米提供', icon: '⚡' },
        F5: { name: 'FCL线5', path: 'https://fcl.switch.api.072211.xyz/?from=foldcraftlauncher&isDev=1', markLatest: true, description: '更新快', provider: 'Linkong提供', icon: '🚀' },
        F6: { name: 'FCL线6', path: 'https://bbs.xn--rhqx00c95nv9a.club/mirror.json', markLatest: false, description: '更新快', provider: '广告哥提供', icon: '🚀' },
        F8: { name: 'FCL线8', path: 'https://api.cxsjmc.cn/api/FCL/filelist.json', markLatest: false, description: '高防御', provider: 'LANt提供', icon: '🛡️' },
        Z1: { name: 'ZL线1', path: './file/data/zlDownWay1.json', markLatest: false, description: '', provider: '站长提供', icon: '👑' },
        Z3: { name: 'ZL线3', path: './file/data/zlDownWay3.json', markLatest: false, description: '', provider: 'fishcpy提供', icon: '🐟' },
        Z21: { name: 'ZL2线1', path: './file/data/zl2DownWay1.json', markLatest: false, description: '', provider: '站长提供', icon: '👑' },
        Z22: { name: 'ZL2线2', path: 'https://frostlynx.work/external/zl2/file_tree.json', markLatest: false, nestedPath: ['zl2'], description: '', provider: '哈哈66623332提供', icon: '😄' }
    };
}

/**
 * 获取软件分类配置
 * @returns {Object|null} 软件配置对象
 */
function getSoftwareConfig() {
    return SOFTWARE_CONFIG;
}

/**
 * 获取特定软件的线路配置
 * @param {string} softwareKey - 软件键名（如 'fcl', 'zl', 'zl2'）
 * @param {string} versionKey - 版本键名（如 'current', 'legacy'）
 * @returns {Object|null} 软件版本配置
 */
function getSoftwareLines(softwareKey, versionKey = 'current') {
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.software) {
        return null;
    }
    
    const software = SOFTWARE_CONFIG.software[softwareKey];
    if (!software || !software.versions) {
        return null;
    }
    
    const version = software.versions[versionKey];
    return version ? version.lines || null : null;
}

/**
 * 获取所有软件列表
 * @returns {Array} 软件列表
 */
function getSoftwareList() {
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.software) {
        return [];
    }
    
    return Object.entries(SOFTWARE_CONFIG.software).map(([key, config]) => ({
        key,
        name: config.name,
        description: config.description,
        icon: config.icon
    }));
}

// 初始化时加载配置（异步）
loadSoftwareConfig().catch(error => {
    console.error('初始化软件配置失败:', error);
});

// 导出常量和函数
export { 
    SOURCE_MAP, 
    SOFTWARE_CONFIG_PATH,
    loadSoftwareConfig, 
    getSoftwareConfig, 
    getSoftwareLines, 
    getSoftwareList 
};