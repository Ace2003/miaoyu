/**
 * 主应用逻辑模块
 * 整合所有功能模块，处理用户界面交互
 */

// 确保全局命名空间存在
window.PetTranslator = window.PetTranslator || {};

/**
 * 宠物翻译器应用类
 */
PetTranslator.App = class {
    constructor() {
        this.currentMode = 'cat';
        this.currentInputType = 'voice';
        
        // 初始化各模块
        this.voiceRecognition = new PetTranslator.VoiceRecognition();
        this.semanticAnalyzer = new PetTranslator.SemanticAnalyzer();
        this.storageManager = new PetTranslator.StorageManager();
        
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
        var self = this;
        
        // 模式切换
        this.elements.catModeBtn.addEventListener('click', function() {
            self.setMode('cat');
        });
        this.elements.dogModeBtn.addEventListener('click', function() {
            self.setMode('dog');
        });
        
        // 输入类型切换
        this.elements.voiceInputBtn.addEventListener('click', function() {
            self.setInputType('voice');
        });
        this.elements.textInputBtn.addEventListener('click', function() {
            self.setInputType('text');
        });
        
        // 语音识别控制
        this.elements.startVoiceBtn.addEventListener('click', function() {
            self.toggleVoiceRecognition();
        });
        
        // 文本翻译
        this.elements.translateTextBtn.addEventListener('click', function() {
            self.translateText();
        });
        this.elements.textInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                self.translateText();
            }
        });
        
        // 历史记录操作
        this.elements.clearHistoryBtn.addEventListener('click', function() {
            self.clearHistory();
        });
        
        // 语音识别回调
        this.voiceRecognition.onResult(function(result) {
            self.handleVoiceResult(result);
        });
        this.voiceRecognition.onStatusChange(function(status) {
            self.updateVoiceStatus(status);
        });
        this.voiceRecognition.onError(function(error) {
            self.handleVoiceError(error);
        });
    }

    /**
     * 加载设置
     */
    loadSettings() {
        var settings = this.storageManager.getSettings();
        
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
        var started = this.voiceRecognition.start();
        
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
     */
    handleVoiceResult(result) {
        console.log('语音识别结果:', result);
        
        // 停止语音识别UI
        this.stopVoiceRecognition();
        
        // 如果有识别结果，进行翻译
        if (result.text && result.text.trim()) {
            var simulationNote = result.isSimulation ? ' (模拟模式)' : '';
            this.elements.voiceStatus.textContent = '识别到: "' + result.text + '" (置信度: ' + Math.round(result.confidence * 100) + '%)' + simulationNote;
            
            // 执行翻译
            this.translate(result.text, 'voice');
        } else {
            this.elements.voiceStatus.textContent = '未识别到有效语音，请再试一次';
        }
    }

    /**
     * 更新语音状态
     */
    updateVoiceStatus(status) {
        if (this.elements.voiceStatus) {
            this.elements.voiceStatus.textContent = status;
        }
    }

    /**
     * 处理语音识别错误
     */
    handleVoiceError(error) {
        console.error('语音识别错误:', error);
        
        // 停止语音识别UI
        this.stopVoiceRecognition();
        
        // 显示错误信息
        this.elements.voiceStatus.textContent = '错误: ' + error;
    }

    /**
     * 翻译文本输入
     */
    translateText() {
        var text = this.elements.textInput.value.trim();
        
        if (!text) {
            this.showError('请输入您的宠物声音描述');
            return;
        }
        
        this.translate(text, 'text');
    }

    /**
     * 执行翻译
     */
    translate(input, inputType) {
        console.log('翻译输入: ' + input + ', 模式: ' + this.currentMode + ', 输入类型: ' + inputType);
        
        // 执行语义分析
        var analysisResult = this.semanticAnalyzer.analyze(input, this.currentMode);
        
        // 显示结果
        this.displayTranslationResult(analysisResult);
        
        // 保存到历史记录
        if (analysisResult.success) {
            var historyItem = this.storageManager.addHistory({
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
     */
    displayTranslationResult(result) {
        if (!result.success) {
            this.elements.translationResult.innerHTML = 
                '<div class="error-message">' +
                    '<p>❌ 翻译失败</p>' +
                    '<p class="error-details">' + result.error + '</p>' +
                '</div>';
            return;
        }
        
        var animalEmoji = result.mode === 'cat' ? '🐱' : '🐶';
        var confidencePercent = Math.round(result.confidence * 100);
        
        var resultHTML = 
            '<div class="translation-success">' +
                '<div class="translation-header">' +
                    '<span class="animal-emoji">' + animalEmoji + '</span>' +
                    '<span class="translation-title">翻译结果</span>' +
                '</div>' +
                '<div class="translation-main">' +
                    '<p class="translation-text">' + result.translations[0] + '</p>' +
                '</div>';
        
        // 如果有其他可能的含义
        if (result.translations.length > 1) {
            resultHTML += 
                '<div class="translation-alternatives">' +
                    '<p class="alternatives-title">💡 其他可能的含义:</p>' +
                    '<ul class="alternatives-list">' +
                        '<li>' + result.translations[1] + '</li>' +
                    '</ul>' +
                '</div>';
        }
        
        // 上下文信息
        if (result.context) {
            resultHTML += 
                '<div class="translation-context">' +
                    '<span class="context-label">📖 上下文:</span>' +
                    '<span class="context-value">' + result.context + '</span>' +
                '</div>';
        }
        
        // 置信度
        resultHTML += 
            '<div class="translation-confidence">' +
                '<span class="confidence-label">置信度:</span>' +
                '<span class="confidence-value">' + confidencePercent + '%</span>' +
            '</div>';
        
        // 如果是模糊匹配，添加提示
        if (result.isFuzzyMatch) {
            resultHTML += 
                '<div class="fuzzy-match-notice">' +
                    '<p>⚠️ 注意: 这是基于关键词的模糊匹配，可能不完全准确。</p>' +
                    '<p>建议观察宠物的身体语言来获得更完整的理解。</p>' +
                '</div>';
        }
        
        resultHTML += '</div>';
        
        this.elements.translationResult.innerHTML = resultHTML;
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        this.elements.translationResult.innerHTML = 
            '<div class="error-message">' +
                '<p>❌ ' + message + '</p>' +
            '</div>';
    }

    /**
     * 加载历史记录
     */
    loadHistory() {
        var history = this.storageManager.getHistory();
        
        if (history.length === 0) {
            this.elements.historyList.innerHTML = '<p class="placeholder-text">暂无翻译历史</p>';
            return;
        }
        
        this.elements.historyList.innerHTML = '';
        
        for (var i = 0; i < history.length; i++) {
            this.appendHistoryItem(history[i]);
        }
    }

    /**
     * 追加历史记录项
     */
    appendHistoryItem(item) {
        var historyElement = this.createHistoryElement(item);
        this.elements.historyList.appendChild(historyElement);
    }

    /**
     * 在历史记录开头添加项
     */
    prependHistoryItem(item) {
        // 移除占位符文本
        var placeholder = this.elements.historyList.querySelector('.placeholder-text');
        if (placeholder) {
            placeholder.remove();
        }
        
        var historyElement = this.createHistoryElement(item);
        this.elements.historyList.insertBefore(historyElement, this.elements.historyList.firstChild);
    }

    /**
     * 创建历史记录DOM元素
     */
    createHistoryElement(item) {
        var self = this;
        var animalEmoji = item.mode === 'cat' ? '🐱' : '🐶';
        var inputTypeText = item.inputType === 'voice' ? '🎤 语音' : '⌨️ 文本';
        var formattedDate = this.storageManager.formatDate(item.date);
        
        // 提取主要翻译文本
        var mainTranslation = '';
        if (item.translationResult && item.translationResult.translations) {
            mainTranslation = item.translationResult.translations[0];
        }
        
        var historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.dataset.id = item.id;
        
        historyItem.innerHTML = 
            '<div class="history-item-header">' +
                '<div class="history-item-info">' +
                    '<span class="animal-icon">' + animalEmoji + '</span>' +
                    '<span class="history-item-type">' + inputTypeText + '</span>' +
                '</div>' +
                '<span class="history-item-time">' + formattedDate + '</span>' +
            '</div>' +
            '<div class="history-item-input">' +
                '<span class="input-label">输入:</span>' +
                '<span class="input-text">"' + item.input + '"</span>' +
            '</div>' +
            '<div class="history-item-output">' +
                '<span class="output-label">翻译:</span>' +
                '<span class="output-text">' + mainTranslation + '</span>' +
            '</div>' +
            '<div class="history-item-actions">' +
                '<button class="retranslate-btn" data-id="' + item.id + '">重新翻译</button>' +
                '<button class="delete-btn" data-id="' + item.id + '">删除</button>' +
            '</div>';
        
        // 绑定事件
        var retranslateBtn = historyItem.querySelector('.retranslate-btn');
        retranslateBtn.addEventListener('click', function() {
            self.retranslateItem(item.id);
        });
        
        var deleteBtn = historyItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            self.deleteHistoryItem(item.id);
        });
        
        return historyItem;
    }

    /**
     * 重新翻译历史记录项
     */
    retranslateItem(id) {
        var item = this.storageManager.getHistoryById(id);
        
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
     */
    deleteHistoryItem(id) {
        var deleted = this.storageManager.deleteHistory(id);
        
        if (deleted) {
            // 从DOM中移除
            var element = this.elements.historyList.querySelector('[data-id="' + id + '"]');
            if (element) {
                element.remove();
            }
            
            // 检查是否还有历史记录
            var remainingItems = this.elements.historyList.querySelectorAll('.history-item');
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
            var cleared = this.storageManager.clearHistory();
            
            if (cleared) {
                this.elements.historyList.innerHTML = '<p class="placeholder-text">暂无翻译历史</p>';
            }
        }
    }
};

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    new PetTranslator.App();
});
