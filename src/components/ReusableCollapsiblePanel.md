# 可重用折叠面板组件使用说明

## 简介

这是一个独立的、可重用的折叠面板组件，可以在任何项目中使用。它提供了带动画效果的折叠/展开功能，支持自定义样式和多种配置选项。

## 安装

将 `ReusableCollapsiblePanel.js` 文件复制到您的项目中。

## 使用方法

### 1. 基本用法

```javascript
import { 
    createCollapsiblePanel, 
    initCollapsiblePanels 
} from './ReusableCollapsiblePanel.js';

// 创建折叠面板
const panel = createCollapsiblePanel(
    '面板标题', 
    '面板内容'
);

// 将面板添加到页面
document.body.appendChild(panel);

// 初始化折叠面板功能
initCollapsiblePanels();
```

### 2. 高级用法

```javascript
import { 
    createCollapsiblePanel, 
    initCollapsiblePanels,
    createCollapsiblePanelContainer
} from './ReusableCollapsiblePanel.js';

// 创建面板容器
const container = createCollapsiblePanelContainer('my-panel-container');

// 创建带选项的折叠面板
const panel1 = createCollapsiblePanel(
    '面板1标题', 
    '面板1内容',
    {
        id: 'panel-1',
        startExpanded: true,
        headerClass: 'custom-header-class',
        bodyClass: 'custom-body-class'
    }
);

const panel2 = createCollapsiblePanel(
    '面板2标题', 
    '面板2内容',
    {
        id: 'panel-2',
        allowMultiple: false
    }
);

// 将面板添加到容器
container.appendChild(panel1);
container.appendChild(panel2);

// 将容器添加到页面
document.body.appendChild(container);

// 初始化特定容器内的折叠面板
initCollapsiblePanels('#my-panel-container');
```

### 3. 使用DOM元素作为内容

```javascript
import { createCollapsiblePanel } from './ReusableCollapsiblePanel.js';

// 创建一个DOM元素作为内容
const contentElement = document.createElement('div');
contentElement.innerHTML = '<p>这是动态创建的内容</p>';

// 创建折叠面板
const panel = createCollapsiblePanel(
    '动态内容面板',
    contentElement
);

document.body.appendChild(panel);
```

## API参考

### createCollapsiblePanel(title, content, [options])

创建一个折叠面板。

**参数:**
- `title` (string): 面板标题
- `content` (string|HTMLElement): 面板内容
- `options` (Object, 可选): 配置选项
  - `id` (string): 面板唯一标识符
  - `headerClass` (string): 自定义头部CSS类
  - `bodyClass` (string): 自定义主体CSS类
  - `startExpanded` (boolean): 是否默认展开
  - `allowMultiple` (boolean): 是否允许多个面板同时展开

**返回值:**
- HTMLElement: 创建好的面板元素

### initCollapsiblePanels([container])

初始化折叠面板组件。

**参数:**
- `container` (string|HTMLElement, 可选): 容器元素或选择器，默认为整个文档

### togglePanel(header, [options])

切换面板展开/收起状态。

**参数:**
- `header` (HTMLElement): 面板头部元素
- `options` (Object, 可选): 面板选项

### expandPanel(header)

展开指定面板。

**参数:**
- `header` (HTMLElement): 面板头部元素

### collapsePanel(header)

收起指定面板。

**参数:**
- `header` (HTMLElement): 面板头部元素

### createCollapsiblePanelContainer(id)

创建折叠面板容器。

**参数:**
- `id` (string): 容器ID

**返回值:**
- HTMLElement: 容器元素

## 自定义样式

您可以通过传递自定义CSS类名来定制面板外观：

```javascript
const panel = createCollapsiblePanel(
    '自定义样式面板',
    '面板内容',
    {
        headerClass: 'bg-blue-500 text-white p-3',
        bodyClass: 'bg-gray-100 p-4 transition-all duration-500'
    }
);
```

## 注意事项

1. 确保在DOM加载完成后调用 `initCollapsiblePanels()`
2. 如果动态添加面板，需要重新调用 `initCollapsiblePanels()`
3. 组件依赖 Font Awesome 图标库用于展开/收起图标
4. 组件使用了CSS过渡效果，确保浏览器支持

## 浏览器兼容性

- Chrome 61+
- Firefox 63+
- Safari 12.1+
- Edge 79+

对于较老的浏览器，可能需要添加Polyfill支持。