/**
 * 本地存储管理模块
 * 负责使用浏览器localStorage存储和管理翻译历史记录
 */

// 创建全局命名空间
window.PetTranslator = window.PetTranslator || {};

// 存储键名
const STORAGE_KEYS = {
    HISTORY: 'pet_translator_history',
    SETTINGS: 'pet_translator_settings'
};

// 最大历史记录数量
const MAX_HISTORY_ITEMS = 100;

/**
 * 本地存储管理器类
 */
PetTranslator.StorageManager = class {
    constructor() {
        this.storageAvailable = this.checkStorageAvailable();
        this.init();
    }

    /**
     * 检查localStorage是否可用
     * @returns {boolean}
     */
    checkStorageAvailable() {
        try {
            const test = 'test_storage';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage不可用:', e);
            return false;
        }
    }

    /**
     * 初始化存储
     */
    init() {
        if (!this.storageAvailable) {
            console.warn('本地存储功能不可用，历史记录将不会被保存');
            return;
        }

        // 确保历史记录存储存在
        if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
        }

        // 确保设置存储存在
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
                defaultMode: 'cat',
                defaultInputType: 'voice',
                maxHistoryItems: MAX_HISTORY_ITEMS
            }));
        }
    }

    /**
     * 添加历史记录
     * @param {Object} data - 历史记录数据
     * @returns {Object|null} 添加的历史记录项
     */
    addHistory(data) {
        if (!this.storageAvailable) {
            console.warn('无法保存历史记录：存储不可用');
            return null;
        }

        try {
            const history = this.getHistory();
            
            // 创建新的历史记录项
            const historyItem = {
                id: this.generateId(),
                input: data.input,
                mode: data.mode,
                inputType: data.inputType,
                translationResult: data.translationResult,
                timestamp: Date.now(),
                date: new Date().toISOString()
            };

            // 添加到历史记录开头
            history.unshift(historyItem);

            // 限制历史记录数量
            const settings = this.getSettings();
            const maxItems = settings.maxHistoryItems || MAX_HISTORY_ITEMS;
            
            if (history.length > maxItems) {
                history.splice(maxItems);
            }

            // 保存到localStorage
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

            return historyItem;

        } catch (error) {
            console.error('添加历史记录失败:', error);
            return null;
        }
    }

    /**
     * 获取所有历史记录
     * @returns {Array} 历史记录数组
     */
    getHistory() {
        if (!this.storageAvailable) {
            return [];
        }

        try {
            const historyJson = localStorage.getItem(STORAGE_KEYS.HISTORY);
            return historyJson ? JSON.parse(historyJson) : [];
        } catch (error) {
            console.error('获取历史记录失败:', error);
            return [];
        }
    }

    /**
     * 根据ID获取历史记录项
     * @param {string} id - 历史记录项ID
     * @returns {Object|null}
     */
    getHistoryById(id) {
        const history = this.getHistory();
        return history.find(item => item.id === id) || null;
    }

    /**
     * 删除指定的历史记录项
     * @param {string} id - 历史记录项ID
     * @returns {boolean}
     */
    deleteHistory(id) {
        if (!this.storageAvailable) {
            return false;
        }

        try {
            const history = this.getHistory();
            const index = history.findIndex(item => item.id === id);
            
            if (index === -1) {
                return false;
            }

            history.splice(index, 1);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
            
            return true;

        } catch (error) {
            console.error('删除历史记录失败:', error);
            return false;
        }
    }

    /**
     * 清空所有历史记录
     * @returns {boolean}
     */
    clearHistory() {
        if (!this.storageAvailable) {
            return false;
        }

        try {
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
            return true;
        } catch (error) {
            console.error('清空历史记录失败:', error);
            return false;
        }
    }

    /**
     * 获取设置
     * @returns {Object}
     */
    getSettings() {
        if (!this.storageAvailable) {
            return {
                defaultMode: 'cat',
                defaultInputType: 'voice',
                maxHistoryItems: MAX_HISTORY_ITEMS
            };
        }

        try {
            const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return settingsJson ? JSON.parse(settingsJson) : {
                defaultMode: 'cat',
                defaultInputType: 'voice',
                maxHistoryItems: MAX_HISTORY_ITEMS
            };
        } catch (error) {
            console.error('获取设置失败:', error);
            return {
                defaultMode: 'cat',
                defaultInputType: 'voice',
                maxHistoryItems: MAX_HISTORY_ITEMS
            };
        }
    }

    /**
     * 更新设置
     * @param {Object} newSettings
     * @returns {boolean}
     */
    updateSettings(newSettings) {
        if (!this.storageAvailable) {
            return false;
        }

        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...newSettings };
            
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
            return true;

        } catch (error) {
            console.error('更新设置失败:', error);
            return false;
        }
    }

    /**
     * 生成唯一ID
     * @returns {string}
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 格式化日期显示
     * @param {string|number} dateStringOrTimestamp
     * @returns {string}
     */
    formatDate(dateStringOrTimestamp) {
        const date = new Date(dateStringOrTimestamp);
        
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) {
            return '刚刚';
        } else if (diffMins < 60) {
            return `${diffMins}分钟前`;
        } else if (diffHours < 24) {
            return `${diffHours}小时前`;
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    /**
     * 检查存储是否可用
     * @returns {boolean}
     */
    isStorageAvailable() {
        return this.storageAvailable;
    }
};
