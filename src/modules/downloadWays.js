// 下载线路数据源映射表 - 支持多级嵌套结构

// 定义下载线路分类结构
const DOWNLOAD_CATEGORIES = {
    // 启动器下载大板块
    launcher: {
        name: '启动器下载',
        description: '各种 Minecraft 启动器下载',
        children: {
            // FCL下载子板块
            fcl: {
                name: 'FCL 下载',
                description: 'Fold Craft Launcher 下载',
                children: {
                    // 高速线路子板块
                    highSpeed: {
                        name: '高速线路',
                        description: '高速下载线路',
                        sources: {
                            F2: { name: 'FCL线2', path: 'https://frostlynx.work/external/fcl/file_tree.json', markLatest: true, nestedPath: ['fcl'], description: '更新快', provider: '哈哈66623332提供' },
                            F5: { name: 'FCL线5', path: 'https://fcl.switch.api.072211.xyz/?from=foldcraftlauncher&isDev=1', markLatest: true, description: '更新快', provider: 'Linkong提供' }
                        }
                    },
                    // 稳定线路子板块
                    stable: {
                        name: '稳定线路',
                        description: '稳定可靠的下载线路',
                        sources: {
                            F1: { name: 'FCL线1', path: './file/data/fclDownWay1.json', markLatest: false, description: '已开学', provider: '站长提供' },
                            F3: { name: 'FCL线3', path: './file/data/fclDownWay3.json', markLatest: false, description: '全版本', provider: 'fishcpy提供' },
                            F4: { name: 'FCL线4', path: './file/data/fclDownWay4.json', markLatest: false, description: '速度快', provider: '八蓝米提供' }
                        }
                    },
                    // 其他线路子板块
                    other: {
                        name: '其他线路',
                        description: '其他下载线路',
                        sources: {
                            F6: { name: 'FCL线6', path: 'https://bbs.xn--rhqx00c85nv9a.club/mirror.json', markLatest: false, description: '更新快', provider: '广告哥提供' },
                            F8: { name: 'FCL线8', path: 'https://api.cxsjmc.cn/api/FCL/filelist.json', markLatest: false, description: '高防御', provider: 'LANt提供' }
                        }
                    }
                }
            },
            // ZL下载子板块
            zl: {
                name: 'ZL 下载',
                description: 'Zalith Launcher 下载',
                children: {
                    // 主线路子板块
                    main: {
                        name: '主线路',
                        description: '主要下载线路',
                        sources: {
                            Z1: { name: 'ZL线1', path: './file/data/zlDownWay1.json', markLatest: false, description: '', provider: '站长提供' },
                            Z3: { name: 'ZL线3', path: './file/data/zlDownWay3.json', markLatest: false, description: '', provider: 'fishcpy提供' }
                        }
                    },
                    // ZL2线路子板块
                    zl2: {
                        name: 'ZL2 线路',
                        description: 'ZL2 启动器下载',
                        sources: {
                            Z21: { name: 'ZL2线1', path: './file/data/zl2DownWay1.json', markLatest: false, description: '', provider: '站长提供' },
                            Z22: { name: 'ZL2线2', path: 'https://frostlynx.work/external/zl2/file_tree.json', markLatest: false, nestedPath: ['zl2'], description: '', provider: '哈哈66623332提供' }
                        }
                    }
                }
            }
        }
    },
    // 驱动下载大板块
    drivers: {
        name: '驱动下载',
        description: '各种 GPU 驱动下载',
        children: {
            // 驱动下载子板块
            vk: {
                name: 'Vulkan 驱动',
                description: 'Vulkan 图形驱动',
                sources: {
                    D1: { name: '驱动线1', path: './file/data/驱动线1.json', markLatest: false, description: '', provider: '站长提供' }
                    // D8: { name: '驱动线8', path: './file/data/驱动线8.json', markLatest: false, description: '', provider: '未知' }
                }
            }
        }
    },
    // 插件下载大板块
    plugins: {
        name: '插件下载',
        description: '各种 Minecraft 插件下载',
        children: {
            // 渲染器插件子板块
            renderer: {
                name: '渲染器插件',
                description: '图形渲染插件',
                sources: {
                    P1: { name: '渲染器线1', path: './file/data/渲染器线1.json', markLatest: false, description: '', provider: '站长提供' }
                    // P3: { name: '渲染器线3', path: './file/data/渲染器线3.json', markLatest: false, description: '', provider: '未知' }
                }
            }
        }
    }
};

// 导出常量
export { DOWNLOAD_CATEGORIES };