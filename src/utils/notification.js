/**
 * 通用通知组件
 * 提供多种类型的通知显示功能，支持自定义配置
 */

class Notification {
    /**
     * 通知配置选项
     * @typedef {Object} NotificationOptions
     * @property {string} [type='info'] - 通知类型：success, warning, error, info
     * @property {number} [duration=5000] - 显示持续时间（毫秒）
     * @property {string} [position='top-right'] - 显示位置：top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
     * @property {boolean} [autoClose=true] - 是否自动关闭
     * @property {boolean} [showCloseButton=true] - 是否显示关闭按钮
     * @property {string} [className=''] - 自定义CSS类名
     * @property {Object} [styles={}] - 自定义样式
     */

    /**
     * 默认配置
     */
    static defaultOptions = {
        type: 'info',
        duration: 5000,
        position: 'top-right',
        autoClose: true,
        showCloseButton: true,
        className: '',
        styles: {}
    };

    /**
     * 通知堆叠管理器
     */
    static stackManager = {
        // 存储每个位置的通知堆叠
        stacks: {},
        
        // 获取指定位置的通知堆叠
        getStack(position) {
            if (!this.stacks[position]) {
                this.stacks[position] = [];
            }
            return this.stacks[position];
        },
        
        // 添加通知到堆叠
        addNotification(position, notification) {
            const stack = this.getStack(position);
            stack.push(notification);
            this.updateStackPositions(position);
        },
        
        // 从堆叠中移除通知
        removeNotification(position, notification) {
            const stack = this.getStack(position);
            const index = stack.indexOf(notification);
            if (index > -1) {
                stack.splice(index, 1);
                this.updateStackPositions(position);
            }
        },
        
        // 更新堆叠中所有通知的位置
        updateStackPositions(position) {
            const stack = this.getStack(position);
            let totalOffset = 0;
            
            stack.forEach((notification, index) => {
                // 动态计算每个通知的实际高度（包括间距）
                const notificationHeight = this.calculateNotificationHeight(notification);
                const offset = totalOffset;
                totalOffset += notificationHeight;
                
                this.applyStackOffset(notification, position, offset);
            });
        },
        
        // 计算通知的实际高度（包括间距）
        calculateNotificationHeight(notification) {
            // 获取通知的实际高度，如果元素还没有渲染完成，使用估算高度
            let height = notification.offsetHeight;
            
            // 如果高度为0（元素可能还没有完全渲染），使用估算高度
            if (height === 0) {
                // 估算通知高度：基础高度 + 内容高度
                const content = notification.textContent || '';
                const lineCount = Math.ceil(content.length / 40); // 每行大约40个字符
                const baseHeight = 60; // 基础高度（包括padding）
                const lineHeight = 20; // 每行额外高度
                height = baseHeight + (Math.max(0, lineCount - 1) * lineHeight);
            }
            
            // 添加间距（20px）
            const spacing = 20;
            return height + spacing;
        },
        
        // 应用堆叠偏移到通知元素
        applyStackOffset(notification, position, offset) {
            const basePosition = Notification.positionStyles[position] || Notification.positionStyles['top-right'];
            
            // 根据位置类型应用不同的偏移逻辑
            if (position.includes('top')) {
                notification.style.top = `calc(${basePosition.top || '1rem'} + ${offset}px)`;
                if (basePosition.bottom) {
                    notification.style.bottom = '';
                }
            } else if (position.includes('bottom')) {
                notification.style.bottom = `calc(${basePosition.bottom || '1rem'} + ${offset}px)`;
                if (basePosition.top) {
                    notification.style.top = '';
                }
            }
            
            // 保持水平位置不变
            if (basePosition.left) {
                notification.style.left = basePosition.left;
            }
            if (basePosition.right) {
                notification.style.right = basePosition.right;
            }
            
            // 居中位置的特殊处理 - 修复逻辑
            if (position.includes('center')) {
                // 对于居中位置，保持水平居中效果
                notification.style.left = '50%';
                
                // 获取当前transform值，避免覆盖scale动画
                const currentTransform = notification.style.transform || '';
                
                // 如果当前transform不包含translateX(-50%)，则添加水平居中
                if (!currentTransform.includes('translateX(-50%)')) {
                    // 保留scale动画，添加水平居中
                    if (currentTransform.includes('scale')) {
                        notification.style.transform = `translateX(-50%) ${currentTransform}`;
                    } else {
                        notification.style.transform = `translateX(-50%) scale(1)`;
                    }
                }
                // 如果已经包含translateX(-50%)，则保持原有transform
            }
        }
    };


    /**
     * 通知类型对应的样式
     */
    static typeStyles = {
        success: { backgroundColor: '#10b98188', color: 'white' , '--blur-radius': '5px' },
        warning: { backgroundColor: '#f59e0b88', color: 'white' , '--blur-radius': '5px' },
        error: { backgroundColor: '#ef444488', color: 'white' , '--blur-radius': '5px' },
        info: { backgroundColor: '#3b82f688', color: 'white' , '--blur-radius': '5px' }
    };

    /**
     * 位置对应的样式
     */
    static positionStyles = {
        'top-right': { top: '1rem', right: '1rem' },
        'top-left': { top: '1rem', left: '1rem' },
        'bottom-right': { bottom: '1rem', right: '1rem' },
        'bottom-left': { bottom: '1rem', left: '1rem' },
        'top-center': { top: '1rem', left: '50%', transform: 'translateX(-50%)' },
        'bottom-center': { bottom: '1rem', left: '50%', transform: 'translateX(-50%)' }
    };

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {NotificationOptions} options - 通知选项
     * @returns {HTMLElement} 通知元素
     */
    static show(message, options = {}) {
        // 开始日志 - 打包输出
        console.groupCollapsed('开始显示通知:', message);
        console.log('消息:', message);
        console.log('选项:', options);
        
        // 合并默认配置
        const config = { ...this.defaultOptions, ...options };
        
        // 创建通知元素
        const notification = document.createElement('div');
        console.log('创建通知元素');
        
        // 设置样式
        const baseStyles = this.buildNotificationStyles(config);
        console.log('基础样式:', baseStyles);
        Object.assign(notification.style, baseStyles);
        
        // 添加自定义样式
        Object.assign(notification.style, config.styles);
        
        // 设置内容
        notification.innerHTML = this.buildNotificationContent(message, config);
        console.log('设置通知内容');
        
        // 添加到页面
        document.body.appendChild(notification);
        console.log('通知已添加到页面');
        
        // 添加到堆叠管理器
        this.stackManager.addNotification(config.position, notification);
        console.log('通知已添加到堆叠管理器，位置:', config.position);
        
        // 触发显示动画
        setTimeout(() => {
            console.log('触发显示动画');
            notification.style.opacity = '1';
            
            // 智能处理transform属性：对于居中位置保留translateX(-50%)，其他位置使用scale(1)
            if (config.position.includes('center')) {
                notification.style.transform = 'translateX(-50%) scale(1)';
            } else {
                notification.style.transform = 'scale(1)';
            }
        }, 10);
        
        // 设置自动关闭
        if (config.autoClose) {
            this.setupAutoClose(notification, config.duration, config.position);
        }
        
        // 设置关闭按钮事件
        if (config.showCloseButton) {
            this.setupCloseButton(notification, config.position);
        }
        
        // 结束日志 - 打包输出
        console.log('通知显示完成');
        console.groupEnd();
        
        return notification;
    }

    /**
     * 构建通知样式
     * @param {NotificationOptions} config - 通知配置
     * @returns {Object} 样式对象
     */
    static buildNotificationStyles(config) {
        const baseStyles = {
            position: 'fixed',
            zIndex: '50',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
            transform: 'scale(0.95)',
            transition: 'all 0.3s ease',
            maxWidth: '24rem',
            minWidth: '16rem',
            opacity: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: `blur(var(--blur-radius, 5px))`
        };
        
        const typeStyle = this.typeStyles[config.type] || this.typeStyles.info;
        const positionStyle = this.positionStyles[config.position] || this.positionStyles['top-right'];
        
        return { ...baseStyles, ...typeStyle, ...positionStyle };
    }

    /**
     * 构建通知内容
     * @param {string} message - 通知消息
     * @param {NotificationOptions} config - 通知配置
     * @returns {string} HTML内容
     */
    static buildNotificationContent(message, config) {
        let content = `<div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <span style="flex: 1;">${message}</span>`;
        
        if (config.showCloseButton) {
            content += `
            <button style="margin-left: 0.75rem; color: white; background: none; border: none; cursor: pointer; transition: color 0.2s;" 
                    aria-label="关闭通知">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>`;
        }
        
        content += '</div>';
        return content;
    }

    /**
     * 设置自动关闭
     * @param {HTMLElement} notification - 通知元素
     * @param {number} duration - 持续时间
     * @param {string} position - 通知位置
     */
    static setupAutoClose(notification, duration, position) {
        const timer = setTimeout(() => {
            this.close(notification, position);
        }, duration);
        
        // 保存timer以便手动清除
        notification.dataset.closeTimer = timer;
    }

    /**
     * 设置关闭按钮事件
     * @param {HTMLElement} notification - 通知元素
     * @param {string} position - 通知位置
     */
    static setupCloseButton(notification, position) {
        const closeButton = notification.querySelector('button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.close(notification, position);
            });
        }
    }

    /**
     * 关闭通知
     * @param {HTMLElement} notification - 通知元素
     * @param {string} position - 通知位置
     */
    static close(notification, position) {
        // 清除自动关闭定时器
        if (notification.dataset.closeTimer) {
            clearTimeout(parseInt(notification.dataset.closeTimer));
        }
        
        // 从堆叠管理器中移除通知
        if (position) {
            this.stackManager.removeNotification(position, notification);
            console.log('通知已从堆叠管理器移除，位置:', position);
        }
        
        // 添加关闭动画 - 智能处理transform属性
        notification.style.opacity = '0';
        
        // 对于居中位置保留translateX(-50%)，其他位置使用scale(0.95)
        if (position && position.includes('center')) {
            notification.style.transform = 'translateX(-50%) scale(0.95)';
        } else {
            notification.style.transform = 'scale(0.95)';
        }
        
        // 动画完成后移除元素
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * 显示成功通知
     * @param {string} message - 通知消息
     * @param {NotificationOptions} options - 通知选项
     * @returns {HTMLElement} 通知元素
     */
    static success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    /**
     * 显示警告通知
     * @param {string} message - 通知消息
     * @param {NotificationOptions} options - 通知选项
     * @returns {HTMLElement} 通知元素
     */
    static warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    /**
     * 显示错误通知
     * @param {string} message - 通知消息
     * @param {NotificationOptions} options - 通知选项
     * @returns {HTMLElement} 通知元素
     */
    static error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }

    /**
     * 显示信息通知
     * @param {string} message - 通知消息
     * @param {NotificationOptions} options - 通知选项
     * @returns {HTMLElement} 通知元素
     */
    static info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    /**
     * 关闭所有通知
     */
    static closeAll() {
        // 关闭所有堆叠管理器中的通知
        Object.keys(this.stackManager.stacks).forEach(position => {
            const stack = this.stackManager.getStack(position);
            // 复制数组以避免在遍历时修改
            [...stack].forEach(notification => {
                this.close(notification, position);
            });
        });
        
        // 同时关闭可能不在堆叠管理器中的通知（兼容性）
        const notifications = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 50"]');
        notifications.forEach(notification => {
            if (!notification.parentNode) return; // 如果已经移除则跳过
            this.close(notification);
        });
    }
}

// 导出Notification类
export default Notification;