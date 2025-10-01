// 下载线路数据源映射表 - 支持软件分类和简化结构

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
        console.log('软件数量:', SOFTWARE_CONFIG.software ? SOFTWARE_CONFIG.software.length : 0);
        console.groupEnd();
        
        return SOFTWARE_CONFIG;
    } catch (error) {
        console.error('加载软件分类配置失败:', error);
        console.groupEnd();
        
        // 如果加载失败，使用空的SOURCE_MAP
        SOURCE_MAP = {};
        return null;
    }
}

/**
 * 构建向后兼容的SOURCE_MAP
 */
function buildSourceMap() {
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.software) {
        SOURCE_MAP = {};
        return;
    }
    
    SOURCE_MAP = {};
    
    // 遍历所有软件和线路，构建扁平化的线路映射
    SOFTWARE_CONFIG.software.forEach(software => {
        if (software.lines) {
            software.lines.forEach(lineConfig => {
                if (lineConfig.id) {
                    // 添加特点图标和提供者图标
                    const enhancedConfig = {
                        ...lineConfig,
                        icon: getFeatureIcon(lineConfig.description, SOFTWARE_CONFIG.metadata?.featureMapping),
                        providerIcon: getProviderIcon(lineConfig.provider, SOFTWARE_CONFIG.metadata?.providerMapping)
                    };
                    SOURCE_MAP[lineConfig.id] = enhancedConfig;
                }
            });
        }
    });
    
    console.log('构建SOURCE_MAP完成，线路数量:', Object.keys(SOURCE_MAP).length);
}

/**
 * 获取特点图标
 * @param {string} description - 线路描述
 * @param {Object} featureMapping - 特点映射
 * @returns {string} 图标
 */
function getFeatureIcon(description, featureMapping) {
    if (!featureMapping) return '👑';
    return featureMapping[description] || featureMapping[''] || '👑';
}

/**
 * 获取提供者图标
 * @param {string} provider - 提供者名称
 * @param {Object} providerMapping - 提供者映射
 * @returns {string} 图标
 */
function getProviderIcon(provider, providerMapping) {
    if (!providerMapping) return '👑';
    return providerMapping[provider] || providerMapping['站长提供'] || '👑';
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
 * @param {string} softwareId - 软件ID（如 'fcl', 'zl', 'zl2'）
 * @returns {Array|null} 软件线路配置数组
 */
function getSoftwareLines(softwareId) {
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.software) {
        return null;
    }
    
    const software = SOFTWARE_CONFIG.software.find(s => s.id === softwareId);
    return software ? software.lines || [] : null;
}

/**
 * 获取所有软件列表
 * @returns {Array} 软件列表
 */
function getSoftwareList() {
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.software) {
        return [];
    }
    
    return SOFTWARE_CONFIG.software.map(software => ({
        id: software.id,
        name: software.name,
        description: software.description,
        icon: software.icon,
        containerId: software.containerId
    }));
}

/**
 * 根据软件ID获取软件配置
 * @param {string} softwareId - 软件ID
 * @returns {Object|null} 软件配置
 */
function getSoftwareById(softwareId) {
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.software) {
        return null;
    }
    
    return SOFTWARE_CONFIG.software.find(s => s.id === softwareId) || null;
}

/**
 * 获取软件显示顺序
 * @returns {Array} 软件显示顺序数组
 */
function getSoftwareDisplayOrder() {
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.metadata || !SOFTWARE_CONFIG.metadata.displayOrder) {
        // 如果没有配置显示顺序，则从软件列表自动生成
        if (SOFTWARE_CONFIG && SOFTWARE_CONFIG.software) {
            return SOFTWARE_CONFIG.software.map(s => s.id);
        }
        return [];
    }
    
    return SOFTWARE_CONFIG.metadata.displayOrder;
}

/**
 * 获取启用的软件列表
 * @returns {Array} 启用的软件ID数组
 */
function getEnabledSoftware() {
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.metadata || !SOFTWARE_CONFIG.metadata.enabledSoftware) {
        // 如果没有配置启用列表，则启用所有软件
        if (SOFTWARE_CONFIG && SOFTWARE_CONFIG.software) {
            return SOFTWARE_CONFIG.software.map(s => s.id);
        }
        return [];
    }
    
    return SOFTWARE_CONFIG.metadata.enabledSoftware;
}

/**
 * 获取要显示的软件列表（按显示顺序过滤）
 * @returns {Array} 要显示的软件配置列表
 */
function getDisplaySoftwareList() {
    const displayOrder = getSoftwareDisplayOrder();
    const enabledSoftware = getEnabledSoftware();
    
    if (!SOFTWARE_CONFIG || !SOFTWARE_CONFIG.software) {
        return [];
    }
    
    // 按显示顺序过滤并排序
    return displayOrder
        .filter(softwareId => enabledSoftware.includes(softwareId))
        .map(softwareId => SOFTWARE_CONFIG.software.find(s => s.id === softwareId))
        .filter(software => software !== undefined);
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
    getSoftwareList,
    getSoftwareById,
    getFeatureIcon,
    getProviderIcon,
    getSoftwareDisplayOrder,
    getEnabledSoftware,
    getDisplaySoftwareList
};