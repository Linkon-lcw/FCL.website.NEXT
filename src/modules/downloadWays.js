// 下载线路数据源映射表

// 从旧代码中提取的数据源映射表
const SOURCE_MAP = {
    F1: {
        path: "./file/data/fclDownWay1.json",
        markLatest: false
    },
    F2: {
        path: "https://frostlynx.work/external/fcl/file_tree.json",
        markLatest: true,
        nestedPath: ["fcl"] // 特殊嵌套路径
    },
    F3: {
        path: "./file/data/fclDownWay3.json",
        markLatest: false
    },
    F4: {
        path: "./file/data/fclDownWay4.json",
        markLatest: false
    },
    F5: {
        path: "https://fcl.switch.api.072211.xyz/?from=foldcraftlauncher&isDev=1",
        markLatest: true
    },
    F6: {
        path: "https://bbs.xn--rhqx00c95nv9a.club/mirror.json",
        markLatest: false
    },
    F8: {
        path: "https://api.cxsjmc.cn/api/FCL/filelist.json",
        markLatest: false
    },
    Z1: {
        path: "./file/data/zlDownWay1.json",
        markLatest: false
    },
    Z3: {
        path: "./file/data/ZlDownWay3.json",
        markLatest: false
    },
    Z21: {
        path: "./file/data/zl2DownWay1.json",
        markLatest: false
    },
    Z22: {
        path: "https://frostlynx.work/external/zl2/file_tree.json",
        markLatest: false,
        nestedPath: ["zl2"] // 特殊嵌套路径
    }
};

// 导出SOURCE_MAP
export { SOURCE_MAP };