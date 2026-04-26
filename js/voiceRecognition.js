/**
 * 语音识别模块
 * 负责处理语音录入和识别功能
 * 使用浏览器内置的SpeechRecognition API
 */

export class VoiceRecognition {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResultCallback = null;
        this.onStatusChangeCallback = null;
        this.onErrorCallback = null;
        
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
                throw new Error('您的浏览器不支持语音识别功能');
            }

            this.recognition = new SpeechRecognition();
            
            // 配置识别参数
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'zh-CN';

            // 绑定事件处理
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateStatus('正在听，请说话...');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateStatus('录音结束');
            };

            this.recognition.onresult = (event) => {
                const result = event.results[0][0].transcript;
                const confidence = event.results[0][0].confidence;
                
                if (this.onResultCallback) {
                    this.onResultCallback({
                        text: result,
                        confidence: confidence
                    });
                }
            };

            this.recognition.onerror = (event) => {
                let errorMessage = '语音识别出错';
                
                switch (event.error) {
                    case 'not-allowed':
                        errorMessage = '麦克风权限被拒绝，请允许访问麦克风';
                        break;
                    case 'no-speech':
                        errorMessage = '没有检测到语音，请再试一次';
                        break;
                    case 'audio-capture':
                        errorMessage = '无法访问麦克风，请检查设备连接';
                        break;
                    case 'network':
                        errorMessage = '网络连接错误，请检查网络';
                        break;
                    default:
                        errorMessage = `识别错误: ${event.error}`;
                }
                
                this.isListening = false;
                
                if (this.onErrorCallback) {
                    this.onErrorCallback(errorMessage);
                }
                
                this.updateStatus(errorMessage);
            };

        } catch (error) {
            console.error('语音识别初始化失败:', error);
            
            if (this.onErrorCallback) {
                this.onErrorCallback(error.message);
            }
        }
    }

    /**
     * 开始录音
     */
    start() {
        if (!this.recognition) {
            const error = '语音识别功能不可用';
            if (this.onErrorCallback) {
                this.onErrorCallback(error);
            }
            this.updateStatus(error);
            return false;
        }

        if (this.isListening) {
            return false;
        }

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('启动录音失败:', error);
            if (this.onErrorCallback) {
                this.onErrorCallback('启动录音失败: ' + error.message);
            }
            return false;
        }
    }

    /**
     * 停止录音
     */
    stop() {
        if (!this.recognition || !this.isListening) {
            return false;
        }

        try {
            this.recognition.stop();
            return true;
        } catch (error) {
            console.error('停止录音失败:', error);
            return false;
        }
    }

    /**
     * 设置结果回调
     * @param {Function} callback - 回调函数，参数为识别结果对象 {text: string, confidence: number}
     */
    onResult(callback) {
        this.onResultCallback = callback;
    }

    /**
     * 设置状态变化回调
     * @param {Function} callback - 回调函数，参数为状态信息
     */
    onStatusChange(callback) {
        this.onStatusChangeCallback = callback;
    }

    /**
     * 设置错误回调
     * @param {Function} callback - 回调函数，参数为错误信息
     */
    onError(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * 更新状态
     * @param {string} message - 状态消息
     */
    updateStatus(message) {
        if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback(message);
        }
    }

    /**
     * 检查是否正在监听
     * @returns {boolean}
     */
    getIsListening() {
        return this.isListening;
    }

    /**
     * 检查浏览器是否支持语音识别
     * @returns {boolean}
     */
    isSupported() {
        return this.recognition !== null;
    }
}

export default VoiceRecognition;
