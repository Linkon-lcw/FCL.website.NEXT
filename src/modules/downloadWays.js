// 下载线路数据源映射表

// 定义下载线路
const SOURCE_MAP = {
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

// 导出常量
export { SOURCE_MAP };