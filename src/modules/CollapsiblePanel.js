// 折叠面板组件 (兼容旧版本接口)
import { 
    createCollapsiblePanel as createAnimatedCollapsiblePanel,
    initCollapsiblePanels,
    togglePanel,
    expandPanel,
    collapsePanel
} from './ReusableCollapsiblePanel.js';

// 保持与旧版本兼容的导出
export { 
    createAnimatedCollapsiblePanel, 
    initCollapsiblePanels, 
    togglePanel, 
    expandPanel, 
    collapsePanel 
};
