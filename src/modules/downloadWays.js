// 下载线路数据源映射表

// 定义下载线路
const SOURCE_MAP = {
    F1: { name: 'FCL线1', path: './file/data/fclDownWay1.json', markLatest: false },
    F2: { name: 'FCL线2', path: 'https://frostlynx.work/external/fcl/file_tree.json', markLatest: true, nestedPath: ['fcl'] },
    F3: { name: 'FCL线3', path: './file/data/fclDownWay3.json', markLatest: false },
    F4: { name: 'FCL线4', path: './file/data/fclDownWay4.json', markLatest: false },
    F5: { name: 'FCL线5', path: 'https://fcl.switch.api.072211.xyz/?from=foldcraftlauncher&isDev=1', markLatest: true },
    F6: { name: 'FCL线6', path: 'https://bbs.xn--rhqx00c95nv9a.club/mirror.json', markLatest: false },
    F8: { name: 'FCL线8', path: 'https://api.cxsjmc.cn/api/FCL/filelist.json', markLatest: false },
    Z1: { name: 'ZL线1', path: './file/data/zlDownWay1.json', markLatest: false },
    Z3: { name: 'ZL线3', path: './file/data/ZlDownWay3.json', markLatest: false },
    Z21: { name: 'ZL2线1', path: './file/data/zl2DownWay1.json', markLatest: false },
    Z22: { name: 'ZL2线2', path: 'https://frostlynx.work/external/zl2/file_tree.json', markLatest: false, nestedPath: ['zl2'] }
};

// 导出常量
export { SOURCE_MAP };