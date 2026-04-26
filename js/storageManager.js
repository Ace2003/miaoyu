/**
 * 本地存储管理模块
 * 负责使用浏览器localStorage存储和管理翻译历史记录
 */

// 存储键名
const STORAGE_KEYS = {
    HISTORY: 'pet_translator_history',
    SETTINGS: 'pet_translator_settings'
};

// 最大历史记录数量
const MAX_HISTORY_ITEMS = 100;

/**
 * 历史记录项结构
 * @typedef {Object} HistoryItem
 * @property {string} id - 唯一标识符
 * @property {string} input - 原始输入文本
 * @property {string} mode - 翻译模式 ('cat' 或 'dog')
 * @property {string} inputType - 输入类型 ('voice' 或 'text')
 * @property {Object} translationResult - 翻译结果对象
 * @property {number} timestamp - 时间戳
 * @property {Date} date - 日期对象
 */

/**
 * 本地存储管理器类
 */
export class StorageManager {
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
     * @param {string} data.input - 原始输入文本
     * @param {string} data.mode - 翻译模式 ('cat' 或 'dog')
     * @param {string} data.inputType - 输入类型 ('voice' 或 'text')
     * @param {Object} data.translationResult - 翻译结果对象
     * @returns {HistoryItem|null} 添加的历史记录项，如果失败则返回null
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
     * @returns {HistoryItem[]} 历史记录数组
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
     * 根据模式过滤历史记录
     * @param {string} mode - 翻译模式 ('cat' 或 'dog')
     * @returns {HistoryItem[]} 过滤后的历史记录数组
     */
    getHistoryByMode(mode) {
        const history = this.getHistory();
        return history.filter(item => item.mode === mode);
    }

    /**
     * 根据输入类型过滤历史记录
     * @param {string} inputType - 输入类型 ('voice' 或 'text')
     * @returns {HistoryItem[]} 过滤后的历史记录数组
     */
    getHistoryByInputType(inputType) {
        const history = this.getHistory();
        return history.filter(item => item.inputType === inputType);
    }

    /**
     * 根据ID获取历史记录项
     * @param {string} id - 历史记录项ID
     * @returns {HistoryItem|null} 历史记录项，如果不存在则返回null
     */
    getHistoryById(id) {
        const history = this.getHistory();
        return history.find(item => item.id === id) || null;
    }

    /**
     * 删除指定的历史记录项
     * @param {string} id - 历史记录项ID
     * @returns {boolean} 是否成功删除
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
     * @returns {boolean} 是否成功清空
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
     * @returns {Object} 设置对象
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
     * @param {Object} newSettings - 新的设置对象
     * @returns {boolean} 是否成功更新
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
     * @returns {string} 唯一标识符
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 格式化日期显示
     * @param {string|number} dateStringOrTimestamp - 日期字符串或时间戳
     * @returns {string} 格式化的日期字符串
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

    /**
     * 获取历史记录统计信息
     * @returns {Object} 统计信息对象
     */
    getStatistics() {
        const history = this.getHistory();
        
        const catCount = history.filter(item => item.mode === 'cat').length;
        const dogCount = history.filter(item => item.mode === 'dog').length;
        const voiceCount = history.filter(item => item.inputType === 'voice').length;
        const textCount = history.filter(item => item.inputType === 'text').length;
        
        return {
            total: history.length,
            cat: catCount,
            dog: dogCount,
            voice: voiceCount,
            text: textCount
        };
    }
}

export default StorageManager;
