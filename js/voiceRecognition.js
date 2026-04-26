/**
 * 语音识别模块
 * 负责处理语音录入和识别功能
 * 使用浏览器内置的SpeechRecognition API，包含备用方案
 */

// 确保全局命名空间存在
window.PetTranslator = window.PetTranslator || {};

// 模拟的宠物声音短语库（用于备用方案）
const PET_SOUND_PHRASES = [
    '喵喵',
    '喵',
    '喵喵叫',
    '呼噜声',
    '呼噜',
    '嘶嘶声',
    '咕噜声',
    '咕噜',
    '尖叫声',
    '尖叫',
    '颤音',
    '啁啾',
    '汪汪',
    '汪',
    '汪汪叫',
    '低沉吠叫',
    '低沉',
    '呜咽声',
    '呜咽',
    '嗥叫',
    '嚎叫',
    '咆哮声',
    '咆哮',
    '喘气声',
    '喘气',
    '哀号声',
    '哀号',
    '猫咪在叫',
    '狗狗在叫',
    '我的猫在喵喵叫',
    '我的狗在汪汪叫',
    '宠物在发出声音'
];

/**
 * 语音识别类
 */
PetTranslator.VoiceRecognition = class {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResultCallback = null;
        this.onStatusChangeCallback = null;
        this.onErrorCallback = null;
        
        // 模拟模式相关
        this.simulationMode = false;
        this.simulationTimer = null;
        this.simulationStartTime = 0;
        
        // 错误处理
        this.consecutiveErrors = 0;
        this.maxConsecutiveErrors = 3;
        
        this.init();
    }

    /**
     * 初始化语音识别
     */
    init() {
        try {
            // 检查浏览器支持
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                console.warn('浏览器不支持原生语音识别，将使用模拟模式');
                this.simulationMode = true;
                this.updateStatus('您的浏览器不支持语音识别，已启用模拟模式');
                return;
            }

            this.recognition = new SpeechRecognition();
            
            // 配置识别参数 - 优化设置
            this.recognition.continuous = false;
            this.recognition.interimResults = true;  // 启用中间结果，提供实时反馈
            this.recognition.lang = 'zh-CN';
            this.recognition.maxAlternatives = 1;
            
            // 绑定事件处理
            this.recognition.onstart = () => {
                this.isListening = true;
                this.consecutiveErrors = 0;
                this.updateStatus('🎤 正在听，请说话...');
                console.log('语音识别已启动');
            };

            this.recognition.onaudiostart = () => {
                this.updateStatus('🎵 检测到音频输入...');
            };

            this.recognition.onsoundstart = () => {
                this.updateStatus('🔊 检测到声音...');
            };

            this.recognition.onspeechstart = () => {
                this.updateStatus('💬 检测到语音，正在识别...');
            };

            // 中间结果 - 提供实时反馈
            this.recognition.onresult = (event) => {
                const resultIndex = event.resultIndex;
                const result = event.results[resultIndex];
                
                if (result.isFinal) {
                    // 最终结果
                    const transcript = result[0].transcript;
                    const confidence = result[0].confidence;
                    
                    console.log('最终识别结果:', transcript, '置信度:', confidence);
                    
                    if (this.onResultCallback) {
                        this.onResultCallback({
                            text: transcript,
                            confidence: confidence,
                            isFinal: true
                        });
                    }
                } else {
                    // 中间结果 - 显示实时反馈
                    const interimTranscript = result[0].transcript;
                    this.updateStatus('正在识别: "' + interimTranscript + '"...');
                }
            };

            this.recognition.onspeechend = () => {
                this.updateStatus('语音结束，处理中...');
            };

            this.recognition.onsoundend = () => {
                this.updateStatus('声音结束...');
            };

            this.recognition.onaudioend = () => {
                this.updateStatus('音频结束...');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                console.log('语音识别已结束');
                
                // 如果是因为没有检测到语音而结束，给出明确提示
                setTimeout(() => {
                    if (!this.isListening) {
                        this.updateStatus('录音已结束，请查看结果');
                    }
                }, 500);
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                this.consecutiveErrors++;
                
                let errorMessage = '语音识别出错';
                let shouldRetry = false;
                
                console.error('语音识别错误:', event.error, event.message);
                
                switch (event.error) {
                    case 'not-allowed':
                        errorMessage = '❌ 麦克风权限被拒绝。请在浏览器设置中允许访问麦克风，或使用文本输入。';
                        break;
                    case 'no-speech':
                        errorMessage = '⚠️ 没有检测到语音。请确保麦克风正常工作，然后再试一次。';
                        shouldRetry = true;
                        break;
                    case 'audio-capture':
                        errorMessage = '❌ 无法访问麦克风。请检查麦克风是否已连接且未被其他应用占用。';
                        break;
                    case 'network':
                        errorMessage = '⚠️ 网络连接问题。语音识别需要网络连接，请检查网络后重试。';
                        shouldRetry = true;
                        break;
                    case 'aborted':
                        errorMessage = '录音被中止。';
                        break;
                    case 'not-recognized':
                        errorMessage = '⚠️ 无法识别语音。请尝试说得更清楚一些。';
                        shouldRetry = true;
                        break;
                    case 'language-not-supported':
                        errorMessage = '❌ 不支持的语言。';
                        break;
                    default:
                        errorMessage = '语音识别错误: ' + event.error;
                        shouldRetry = true;
                }
                
                // 检查是否连续出错太多次
                if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
                    errorMessage += ' （连续错误次数过多，建议使用文本输入）';
                    this.simulationMode = true;
                }
                
                if (this.onErrorCallback) {
                    this.onErrorCallback(errorMessage);
                }
                
                this.updateStatus(errorMessage);
            };

            console.log('语音识别初始化成功');
            this.updateStatus('语音识别已就绪，点击"开始录音"开始');

        } catch (error) {
            console.error('语音识别初始化失败:', error);
            this.simulationMode = true;
            this.updateStatus('语音识别初始化失败，已启用模拟模式');
            
            if (this.onErrorCallback) {
                this.onErrorCallback('语音识别初始化失败: ' + error.message);
            }
        }
    }

    /**
     * 开始录音
     */
    start() {
        // 如果是模拟模式
        if (this.simulationMode) {
            return this.startSimulation();
        }
        
        if (!this.recognition) {
            const error = '语音识别功能不可用，已自动切换到模拟模式';
            this.simulationMode = true;
            this.updateStatus(error);
            return this.startSimulation();
        }

        if (this.isListening) {
            console.log('语音识别已经在运行中');
            return false;
        }

        try {
            console.log('尝试启动语音识别...');
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('启动录音失败:', error);
            
            // 如果是因为已经在运行的错误，先停止再重新启动
            if (error.message && error.message.includes('already started')) {
                try {
                    this.recognition.stop();
                    setTimeout(() => {
                        this.start();
                    }, 100);
                    return true;
                } catch (e) {
                    console.error('重新启动失败:', e);
                }
            }
            
            // 切换到模拟模式
            this.consecutiveErrors++;
            if (this.consecutiveErrors >= 2) {
                this.simulationMode = true;
                const errorMsg = '启动语音识别失败，已切换到模拟模式。错误: ' + error.message;
                this.updateStatus(errorMsg);
                
                if (this.onErrorCallback) {
                    this.onErrorCallback(errorMsg);
                }
                
                return this.startSimulation();
            }
            
            const errorMsg = '启动录音失败: ' + error.message + '，请重试';
            this.updateStatus(errorMsg);
            
            if (this.onErrorCallback) {
                this.onErrorCallback(errorMsg);
            }
            
            return false;
        }
    }

    /**
     * 停止录音
     */
    stop() {
        // 如果是模拟模式
        if (this.simulationMode) {
            return this.stopSimulation();
        }
        
        if (!this.recognition || !this.isListening) {
            return false;
        }

        try {
            console.log('停止语音识别...');
            this.recognition.stop();
            return true;
        } catch (error) {
            console.error('停止录音失败:', error);
            // 即使出错也标记为停止
            this.isListening = false;
            return false;
        }
    }

    /**
     * 启动模拟语音识别（备用方案）
     */
    startSimulation() {
        if (this.isListening) {
            return false;
        }
        
        this.isListening = true;
        this.simulationStartTime = Date.now();
        
        this.updateStatus('🎤 模拟模式：正在听，请说话（模拟中）...');
        console.log('模拟语音识别已启动');
        
        // 模拟检测过程
        this.simulationTimer = setTimeout(() => {
            if (this.isListening) {
                this.updateStatus('🔊 模拟模式：检测到声音...');
            }
        }, 1000);
        
        setTimeout(() => {
            if (this.isListening) {
                this.updateStatus('💬 模拟模式：正在识别...');
            }
        }, 2000);
        
        return true;
    }

    /**
     * 停止模拟语音识别
     */
    stopSimulation() {
        if (!this.isListening) {
            return false;
        }
        
        this.isListening = false;
        
        // 清除定时器
        if (this.simulationTimer) {
            clearTimeout(this.simulationTimer);
            this.simulationTimer = null;
        }
        
        // 生成模拟结果
        const randomPhrase = PET_SOUND_PHRASES[Math.floor(Math.random() * PET_SOUND_PHRASES.length)];
        const confidence = 0.7 + Math.random() * 0.25; // 70%-95%的置信度
        
        console.log('模拟识别结果:', randomPhrase, '置信度:', confidence);
        
        // 延迟一点再显示结果，更真实
        setTimeout(() => {
            this.updateStatus('模拟识别完成: "' + randomPhrase + '"');
            
            if (this.onResultCallback) {
                this.onResultCallback({
                    text: randomPhrase,
                    confidence: confidence,
                    isFinal: true,
                    isSimulation: true
                });
            }
        }, 500);
        
        return true;
    }

    /**
     * 设置结果回调
     */
    onResult(callback) {
        this.onResultCallback = callback;
    }

    /**
     * 设置状态变化回调
     */
    onStatusChange(callback) {
        this.onStatusChangeCallback = callback;
    }

    /**
     * 设置错误回调
     */
    onError(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * 更新状态
     */
    updateStatus(message) {
        console.log('状态更新:', message);
        if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback(message);
        }
    }

    /**
     * 检查是否正在监听
     */
    getIsListening() {
        return this.isListening;
    }

    /**
     * 检查是否是模拟模式
     */
    isSimulationMode() {
        return this.simulationMode;
    }

    /**
     * 检查浏览器是否支持语音识别
     */
    isSupported() {
        return this.recognition !== null || this.simulationMode;
    }

    /**
     * 重置连续错误计数
     */
    resetErrors() {
        this.consecutiveErrors = 0;
        this.simulationMode = false;
        this.init();
    }
};
