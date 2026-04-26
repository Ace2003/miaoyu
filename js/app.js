/**
 * 主应用逻辑模块
 * 整合所有功能模块，处理用户界面交互
 */

import { VoiceRecognition } from './voiceRecognition.js';
import { SemanticAnalyzer } from './semanticAnalyzer.js';
import { StorageManager } from './storageManager.js';

/**
 * 宠物翻译器应用类
 */
class PetTranslatorApp {
    constructor() {
        this.currentMode = 'cat'; // 默认猫咪模式
        this.currentInputType = 'voice'; // 默认语音输入
        
        // 初始化各模块
        this.voiceRecognition = new VoiceRecognition();
        this.semanticAnalyzer = new SemanticAnalyzer();
        this.storageManager = new StorageManager();
        
        // DOM元素引用
        this.elements = {};
        
        // 初始化应用
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.cacheDOMElements();
        this.bindEventListeners();
        this.loadSettings();
        this.loadHistory();
        
        console.log('🐾 宠物语言翻译器已启动！');
    }

    /**
     * 缓存DOM元素引用
     */
    cacheDOMElements() {
        // 模式选择器
        this.elements.catModeBtn = document.getElementById('cat-mode');
        this.elements.dogModeBtn = document.getElementById('dog-mode');
        
        // 输入类型选择器
        this.elements.voiceInputBtn = document.getElementById('voice-input-btn');
        this.elements.textInputBtn = document.getElementById('text-input-btn');
        
        // 语音输入区域
        this.elements.voiceInputArea = document.getElementById('voice-input-area');
        this.elements.voiceAnimation = document.getElementById('voice-animation');
        this.elements.startVoiceBtn = document.getElementById('start-voice-btn');
        this.elements.voiceBtnText = document.getElementById('voice-btn-text');
        this.elements.voiceStatus = document.getElementById('voice-status');
        
        // 文本输入区域
        this.elements.textInputArea = document.getElementById('text-input-area');
        this.elements.textInput = document.getElementById('text-input');
        this.elements.translateTextBtn = document.getElementById('translate-text-btn');
        
        // 输出区域
        this.elements.translationResult = document.getElementById('translation-result');
        
        // 历史记录区域
        this.elements.historyList = document.getElementById('history-list');
        this.elements.clearHistoryBtn = document.getElementById('clear-history-btn');
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 模式切换
        this.elements.catModeBtn.addEventListener('click', () => this.setMode('cat'));
        this.elements.dogModeBtn.addEventListener('click', () => this.setMode('dog'));
        
        // 输入类型切换
        this.elements.voiceInputBtn.addEventListener('click', () => this.setInputType('voice'));
        this.elements.textInputBtn.addEventListener('click', () => this.setInputType('text'));
        
        // 语音识别控制
        this.elements.startVoiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
        
        // 文本翻译
        this.elements.translateTextBtn.addEventListener('click', () => this.translateText());
        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.translateText();
            }
        });
        
        // 历史记录操作
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // 语音识别回调
        this.voiceRecognition.onResult((result) => this.handleVoiceResult(result));
        this.voiceRecognition.onStatusChange((status) => this.updateVoiceStatus(status));
        this.voiceRecognition.onError((error) => this.handleVoiceError(error));
    }

    /**
     * 加载设置
     */
    loadSettings() {
        const settings = this.storageManager.getSettings();
        
        if (settings.defaultMode) {
            this.setMode(settings.defaultMode);
        }
        
        if (settings.defaultInputType) {
            this.setInputType(settings.defaultInputType);
        }
        
        // 检查语音识别支持
        if (!this.voiceRecognition.isSupported()) {
            this.elements.voiceStatus.textContent = '您的浏览器不支持语音识别，请使用文本输入';
            this.elements.voiceInputBtn.disabled = true;
            this.setInputType('text');
        }
    }

    /**
     * 设置翻译模式
     * @param {string} mode - 模式 ('cat' 或 'dog')
     */
    setMode(mode) {
        if (mode !== 'cat' && mode !== 'dog') return;
        
        this.currentMode = mode;
        
        // 更新UI
        this.elements.catModeBtn.classList.toggle('active', mode === 'cat');
        this.elements.dogModeBtn.classList.toggle('active', mode === 'dog');
        
        // 保存设置
        this.storageManager.updateSettings({ defaultMode: mode });
    }

    /**
     * 设置输入类型
     * @param {string} type - 输入类型 ('voice' 或 'text')
     */
    setInputType(type) {
        if (type !== 'voice' && type !== 'text') return;
        
        this.currentInputType = type;
        
        // 更新UI
        this.elements.voiceInputBtn.classList.toggle('active', type === 'voice');
        this.elements.textInputBtn.classList.toggle('active', type === 'text');
        
        this.elements.voiceInputArea.classList.toggle('active', type === 'voice');
        this.elements.textInputArea.classList.toggle('active', type === 'text');
        
        // 保存设置
        this.storageManager.updateSettings({ defaultInputType: type });
    }

    /**
     * 切换语音识别状态
     */
    toggleVoiceRecognition() {
        if (this.voiceRecognition.getIsListening()) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }

    /**
     * 启动语音识别
     */
    startVoiceRecognition() {
        const started = this.voiceRecognition.start();
        
        if (started) {
            // 更新UI状态
            this.elements.voiceBtnText.textContent = '停止录音';
            this.elements.startVoiceBtn.classList.add('listening');
            this.elements.voiceAnimation.classList.add('listening');
        }
    }

    /**
     * 停止语音识别
     */
    stopVoiceRecognition() {
        this.voiceRecognition.stop();
        
        // 更新UI状态
        this.elements.voiceBtnText.textContent = '开始录音';
        this.elements.startVoiceBtn.classList.remove('listening');
        this.elements.voiceAnimation.classList.remove('listening');
    }

    /**
     * 处理语音识别结果
     * @param {Object} result - 识别结果对象
     */
    handleVoiceResult(result) {
        console.log('语音识别结果:', result);
        
        // 停止语音识别UI
        this.stopVoiceRecognition();
        
        // 如果有识别结果，进行翻译
        if (result.text && result.text.trim()) {
            // 显示识别到的文本
            this.elements.voiceStatus.textContent = `识别到: "${result.text}" (置信度: ${Math.round(result.confidence * 100)}%)`;
            
            // 执行翻译
            this.translate(result.text, 'voice');
        } else {
            this.elements.voiceStatus.textContent = '未识别到有效语音，请再试一次';
        }
    }

    /**
     * 更新语音状态
     * @param {string} status - 状态消息
     */
    updateVoiceStatus(status) {
        if (this.elements.voiceStatus) {
            this.elements.voiceStatus.textContent = status;
        }
    }

    /**
     * 处理语音识别错误
     * @param {string} error - 错误信息
     */
    handleVoiceError(error) {
        console.error('语音识别错误:', error);
        
        // 停止语音识别UI
        this.stopVoiceRecognition();
        
        // 显示错误信息
        this.elements.voiceStatus.textContent = `错误: ${error}`;
    }

    /**
     * 翻译文本输入
     */
    translateText() {
        const text = this.elements.textInput.value.trim();
        
        if (!text) {
            this.showError('请输入您的宠物声音描述');
            return;
        }
        
        this.translate(text, 'text');
    }

    /**
     * 执行翻译
     * @param {string} input - 输入文本
     * @param {string} inputType - 输入类型 ('voice' 或 'text')
     */
    translate(input, inputType) {
        console.log(`翻译输入: ${input}, 模式: ${this.currentMode}, 输入类型: ${inputType}`);
        
        // 执行语义分析
        const analysisResult = this.semanticAnalyzer.analyze(input, this.currentMode);
        
        // 显示结果
        this.displayTranslationResult(analysisResult);
        
        // 保存到历史记录
        if (analysisResult.success) {
            const historyItem = this.storageManager.addHistory({
                input: input,
                mode: this.currentMode,
                inputType: inputType,
                translationResult: analysisResult
            });
            
            if (historyItem) {
                this.prependHistoryItem(historyItem);
            }
        }
    }

    /**
     * 显示翻译结果
     * @param {Object} result - 分析结果对象
     */
    displayTranslationResult(result) {
        if (!result.success) {
            this.elements.translationResult.innerHTML = `
                <div class="error-message">
                    <p>❌ 翻译失败</p>
                    <p class="error-details">${result.error}</p>
                </div>
            `;
            return;
        }
        
        const animalEmoji = result.mode === 'cat' ? '🐱' : '🐶';
        const confidencePercent = Math.round(result.confidence * 100);
        
        let resultHTML = `
            <div class="translation-success">
                <div class="translation-header">
                    <span class="animal-emoji">${animalEmoji}</span>
                    <span class="translation-title">翻译结果</span>
                </div>
                <div class="translation-main">
                    <p class="translation-text">${result.translations[0]}</p>
                </div>
        `;
        
        // 如果有其他可能的含义
        if (result.translations.length > 1) {
            resultHTML += `
                <div class="translation-alternatives">
                    <p class="alternatives-title">💡 其他可能的含义:</p>
                    <ul class="alternatives-list">
            `;
            
            for (let i = 1; i < result.translations.length; i++) {
                resultHTML += `<li>${result.translations[i]}</li>`;
            }
            
            resultHTML += `
                    </ul>
                </div>
            `;
        }
        
        // 上下文信息
        if (result.context) {
            resultHTML += `
                <div class="translation-context">
                    <span class="context-label">📖 上下文:</span>
                    <span class="context-value">${result.context}</span>
                </div>
            `;
        }
        
        // 置信度
        resultHTML += `
            <div class="translation-confidence">
                <span class="confidence-label">置信度:</span>
                <span class="confidence-value">${confidencePercent}%</span>
            </div>
        `;
        
        // 如果是模糊匹配，添加提示
        if (result.isFuzzyMatch) {
            resultHTML += `
                <div class="fuzzy-match-notice">
                    <p>⚠️ 注意: 这是基于关键词的模糊匹配，可能不完全准确。</p>
                    <p>建议观察宠物的身体语言来获得更完整的理解。</p>
                </div>
            `;
        }
        
        resultHTML += `</div>`;
        
        this.elements.translationResult.innerHTML = resultHTML;
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    showError(message) {
        this.elements.translationResult.innerHTML = `
            <div class="error-message">
                <p>❌ ${message}</p>
            </div>
        `;
    }

    /**
     * 加载历史记录
     */
    loadHistory() {
        const history = this.storageManager.getHistory();
        
        if (history.length === 0) {
            this.elements.historyList.innerHTML = '<p class="placeholder-text">暂无翻译历史</p>';
            return;
        }
        
        this.elements.historyList.innerHTML = '';
        
        history.forEach(item => {
            this.appendHistoryItem(item);
        });
    }

    /**
     * 追加历史记录项
     * @param {Object} item - 历史记录项
     */
    appendHistoryItem(item) {
        const historyElement = this.createHistoryElement(item);
        this.elements.historyList.appendChild(historyElement);
    }

    /**
     * 在历史记录开头添加项
     * @param {Object} item - 历史记录项
     */
    prependHistoryItem(item) {
        // 移除占位符文本
        const placeholder = this.elements.historyList.querySelector('.placeholder-text');
        if (placeholder) {
            placeholder.remove();
        }
        
        const historyElement = this.createHistoryElement(item);
        this.elements.historyList.insertBefore(historyElement, this.elements.historyList.firstChild);
    }

    /**
     * 创建历史记录DOM元素
     * @param {Object} item - 历史记录项
     * @returns {HTMLElement} 历史记录元素
     */
    createHistoryElement(item) {
        const animalEmoji = item.mode === 'cat' ? '🐱' : '🐶';
        const inputTypeText = item.inputType === 'voice' ? '🎤 语音' : '⌨️ 文本';
        const formattedDate = this.storageManager.formatDate(item.date);
        
        // 提取主要翻译文本
        let mainTranslation = '';
        if (item.translationResult && item.translationResult.translations) {
            mainTranslation = item.translationResult.translations[0];
        }
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.dataset.id = item.id;
        
        historyItem.innerHTML = `
            <div class="history-item-header">
                <div class="history-item-info">
                    <span class="animal-icon">${animalEmoji}</span>
                    <span class="history-item-type">${inputTypeText}</span>
                </div>
                <span class="history-item-time">${formattedDate}</span>
            </div>
            <div class="history-item-input">
                <span class="input-label">输入:</span>
                <span class="input-text">"${item.input}"</span>
            </div>
            <div class="history-item-output">
                <span class="output-label">翻译:</span>
                <span class="output-text">${mainTranslation}</span>
            </div>
            <div class="history-item-actions">
                <button class="retranslate-btn" data-id="${item.id}">重新翻译</button>
                <button class="delete-btn" data-id="${item.id}">删除</button>
            </div>
        `;
        
        // 绑定事件
        const retranslateBtn = historyItem.querySelector('.retranslate-btn');
        retranslateBtn.addEventListener('click', () => this.retranslateItem(item.id));
        
        const deleteBtn = historyItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.deleteHistoryItem(item.id));
        
        return historyItem;
    }

    /**
     * 重新翻译历史记录项
     * @param {string} id - 历史记录项ID
     */
    retranslateItem(id) {
        const item = this.storageManager.getHistoryById(id);
        
        if (item) {
            // 设置对应的模式
            this.setMode(item.mode);
            
            // 显示翻译结果
            this.displayTranslationResult(item.translationResult);
            
            // 滚动到结果区域
            this.elements.translationResult.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * 删除历史记录项
     * @param {string} id - 历史记录项ID
     */
    deleteHistoryItem(id) {
        const deleted = this.storageManager.deleteHistory(id);
        
        if (deleted) {
            // 从DOM中移除
            const element = this.elements.historyList.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.remove();
            }
            
            // 检查是否还有历史记录
            const remainingItems = this.elements.historyList.querySelectorAll('.history-item');
            if (remainingItems.length === 0) {
                this.elements.historyList.innerHTML = '<p class="placeholder-text">暂无翻译历史</p>';
            }
        }
    }

    /**
     * 清空所有历史记录
     */
    clearHistory() {
        if (confirm('确定要清空所有翻译历史吗？此操作不可撤销。')) {
            const cleared = this.storageManager.clearHistory();
            
            if (cleared) {
                this.elements.historyList.innerHTML = '<p class="placeholder-text">暂无翻译历史</p>';
            }
        }
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PetTranslatorApp();
});

export default PetTranslatorApp;
