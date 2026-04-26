/**
 * 语义分析和翻译模块
 * 负责分析宠物声音并翻译成人类语言
 */

// 确保全局命名空间存在
window.PetTranslator = window.PetTranslator || {};

// 猫咪声音数据库
const catSounds = {
    "meow": {
        translations: [
            "嘿，看看我！",
            "你好啊，我在这里呢！",
            "陪我玩一会儿吧？",
            "我想引起你的注意。"
        ],
        confidence: 0.85,
        context: "通用打招呼或寻求关注"
    },
    "喵": {
        translations: [
            "嘿，看看我！",
            "你好啊，我在这里呢！",
            "陪我玩一会儿吧？",
            "我想引起你的注意。"
        ],
        confidence: 0.85,
        context: "通用打招呼或寻求关注"
    },
    "喵喵": {
        translations: [
            "我饿了！快给我点吃的！",
            "我很想你，快来陪陪我！",
            "我感觉有点不舒服，能关注我一下吗？",
            "我需要你的帮助！"
        ],
        confidence: 0.8,
        context: "表达需求或情感"
    },
    "喵喵叫": {
        translations: [
            "我饿了！快给我点吃的！",
            "我很想你，快来陪陪我！",
            "我感觉有点不舒服，能关注我一下吗？",
            "我需要你的帮助！"
        ],
        confidence: 0.8,
        context: "表达需求或情感"
    },
    "purr": {
        translations: [
            "我现在感觉非常舒服和放松！",
            "你让我感到很安心。",
            "我很满足现在的状态。",
            "你的抚摸让我很享受！"
        ],
        confidence: 0.9,
        context: "表达满足和舒适"
    },
    "呼噜": {
        translations: [
            "我现在感觉非常舒服和放松！",
            "你让我感到很安心。",
            "我很满足现在的状态。",
            "你的抚摸让我很享受！"
        ],
        confidence: 0.9,
        context: "表达满足和舒适"
    },
    "呼噜声": {
        translations: [
            "我现在感觉非常舒服和放松！",
            "你让我感到很安心。",
            "我很满足现在的状态。",
            "你的抚摸让我很享受！"
        ],
        confidence: 0.9,
        context: "表达满足和舒适"
    },
    "hiss": {
        translations: [
            "我现在感到害怕，请不要靠近我！",
            "这让我很不舒服，请后退！",
            "我感觉受到了威胁，需要空间。",
            "这不是我的安全区域。"
        ],
        confidence: 0.88,
        context: "表达恐惧或防御"
    },
    "嘶嘶": {
        translations: [
            "我现在感到害怕，请不要靠近我！",
            "这让我很不舒服，请后退！",
            "我感觉受到了威胁，需要空间。",
            "这不是我的安全区域。"
        ],
        confidence: 0.88,
        context: "表达恐惧或防御"
    },
    "嘶嘶声": {
        translations: [
            "我现在感到害怕，请不要靠近我！",
            "这让我很不舒服，请后退！",
            "我感觉受到了威胁，需要空间。",
            "这不是我的安全区域。"
        ],
        confidence: 0.88,
        context: "表达恐惧或防御"
    },
    "growl": {
        translations: [
            "我现在很生气，请不要挑战我！",
            "这是我的领地，请离开！",
            "我感到被冒犯了，小心点！",
            "不要试图接近我！"
        ],
        confidence: 0.85,
        context: "表达愤怒或警告"
    },
    "咕噜": {
        translations: [
            "我现在很生气，请不要挑战我！",
            "这是我的领地，请离开！",
            "我感到被冒犯了，小心点！",
            "不要试图接近我！"
        ],
        confidence: 0.85,
        context: "表达愤怒或警告"
    },
    "咕噜声": {
        translations: [
            "我现在很生气，请不要挑战我！",
            "这是我的领地，请离开！",
            "我感到被冒犯了，小心点！",
            "不要试图接近我！"
        ],
        confidence: 0.85,
        context: "表达愤怒或警告"
    },
    "yowl": {
        translations: [
            "我现在非常痛苦，需要帮助！",
            "我感到极度不安，快来看看我！",
            "我迷失了方向，很害怕！",
            "我需要你的紧急关注！"
        ],
        confidence: 0.87,
        context: "表达极度痛苦或不安"
    },
    "尖叫": {
        translations: [
            "我现在非常痛苦，需要帮助！",
            "我感到极度不安，快来看看我！",
            "我迷失了方向，很害怕！",
            "我需要你的紧急关注！"
        ],
        confidence: 0.87,
        context: "表达极度痛苦或不安"
    },
    "尖叫声": {
        translations: [
            "我现在非常痛苦，需要帮助！",
            "我感到极度不安，快来看看我！",
            "我迷失了方向，很害怕！",
            "我需要你的紧急关注！"
        ],
        confidence: 0.87,
        context: "表达极度痛苦或不安"
    },
    "trill": {
        translations: [
            "你好啊，很高兴见到你！",
            "来，跟我来看看这个！",
            "我想让你注意到什么东西。",
            "我对你很感兴趣！"
        ],
        confidence: 0.82,
        context: "友好的问候或引导"
    },
    "颤音": {
        translations: [
            "你好啊，很高兴见到你！",
            "来，跟我来看看这个！",
            "我想让你注意到什么东西。",
            "我对你很感兴趣！"
        ],
        confidence: 0.82,
        context: "友好的问候或引导"
    },
    "啁啾": {
        translations: [
            "你好啊，很高兴见到你！",
            "来，跟我来看看这个！",
            "我想让你注意到什么东西。",
            "我对你很感兴趣！"
        ],
        confidence: 0.82,
        context: "友好的问候或引导"
    }
};

// 狗狗声音数据库
const dogSounds = {
    "bark": {
        translations: [
            "嘿，注意到我了吗？",
            "那边有什么东西！",
            "我想玩！",
            "你好啊，主人！"
        ],
        confidence: 0.85,
        context: "通用交流或提醒"
    },
    "汪": {
        translations: [
            "嘿，注意到我了吗？",
            "那边有什么东西！",
            "我想玩！",
            "你好啊，主人！"
        ],
        confidence: 0.85,
        context: "通用交流或提醒"
    },
    "汪汪": {
        translations: [
            "快来看！有情况！",
            "我很兴奋！带我出去玩吧！",
            "有人在门口！",
            "我想引起你的注意！"
        ],
        confidence: 0.82,
        context: "表达兴奋或提醒"
    },
    "汪汪叫": {
        translations: [
            "快来看！有情况！",
            "我很兴奋！带我出去玩吧！",
            "有人在门口！",
            "我想引起你的注意！"
        ],
        confidence: 0.82,
        context: "表达兴奋或提醒"
    },
    "deep bark": {
        translations: [
            "我感觉有点威胁，小心点。",
            "这是我的领地，不要靠近。",
            "我在保护我的家人。",
            "我不确定这是否安全。"
        ],
        confidence: 0.88,
        context: "防御性警告"
    },
    "低沉": {
        translations: [
            "我感觉有点威胁，小心点。",
            "这是我的领地，不要靠近。",
            "我在保护我的家人。",
            "我不确定这是否安全。"
        ],
        confidence: 0.88,
        context: "防御性警告"
    },
    "低沉吠叫": {
        translations: [
            "我感觉有点威胁，小心点。",
            "这是我的领地，不要靠近。",
            "我在保护我的家人。",
            "我不确定这是否安全。"
        ],
        confidence: 0.88,
        context: "防御性警告"
    },
    "whimper": {
        translations: [
            "我有点害怕，能安慰我吗？",
            "我感觉不舒服，需要帮助。",
            "我很想念你，快点回来。",
            "我想出去，但不确定该怎么做。"
        ],
        confidence: 0.85,
        context: "表达不安或渴望"
    },
    "呜咽": {
        translations: [
            "我有点害怕，能安慰我吗？",
            "我感觉不舒服，需要帮助。",
            "我很想念你，快点回来。",
            "我想出去，但不确定该怎么做。"
        ],
        confidence: 0.85,
        context: "表达不安或渴望"
    },
    "呜咽声": {
        translations: [
            "我有点害怕，能安慰我吗？",
            "我感觉不舒服，需要帮助。",
            "我很想念你，快点回来。",
            "我想出去，但不确定该怎么做。"
        ],
        confidence: 0.85,
        context: "表达不安或渴望"
    },
    "howl": {
        translations: [
            "我在这里！能听到我吗？",
            "我感到孤独，需要陪伴。",
            "我听到了声音，想加入其中。",
            "我在表达我的存在。"
        ],
        confidence: 0.8,
        context: "表达孤独或交流"
    },
    "嗥叫": {
        translations: [
            "我在这里！能听到我吗？",
            "我感到孤独，需要陪伴。",
            "我听到了声音，想加入其中。",
            "我在表达我的存在。"
        ],
        confidence: 0.8,
        context: "表达孤独或交流"
    },
    "嚎叫": {
        translations: [
            "我在这里！能听到我吗？",
            "我感到孤独，需要陪伴。",
            "我听到了声音，想加入其中。",
            "我在表达我的存在。"
        ],
        confidence: 0.8,
        context: "表达孤独或交流"
    },
    "growl": {
        translations: [
            "我现在很生气，请不要挑战我！",
            "这是我的东西，请不要碰！",
            "我感到被威胁了，小心点！",
            "不要试图靠近我！"
        ],
        confidence: 0.88,
        context: "表达愤怒或警告"
    },
    "咆哮": {
        translations: [
            "我现在很生气，请不要挑战我！",
            "这是我的东西，请不要碰！",
            "我感到被威胁了，小心点！",
            "不要试图靠近我！"
        ],
        confidence: 0.88,
        context: "表达愤怒或警告"
    },
    "咆哮声": {
        translations: [
            "我现在很生气，请不要挑战我！",
            "这是我的东西，请不要碰！",
            "我感到被威胁了，小心点！",
            "不要试图靠近我！"
        ],
        confidence: 0.88,
        context: "表达愤怒或警告"
    },
    "panting": {
        translations: [
            "我太热了，需要凉快一下。",
            "我刚玩得很开心，需要休息。",
            "我有点紧张，这让我感到压力。",
            "我很兴奋，期待接下来的事情！"
        ],
        confidence: 0.82,
        context: "调节体温或表达情绪"
    },
    "喘气": {
        translations: [
            "我太热了，需要凉快一下。",
            "我刚玩得很开心，需要休息。",
            "我有点紧张，这让我感到压力。",
            "我很兴奋，期待接下来的事情！"
        ],
        confidence: 0.82,
        context: "调节体温或表达情绪"
    },
    "喘气声": {
        translations: [
            "我太热了，需要凉快一下。",
            "我刚玩得很开心，需要休息。",
            "我有点紧张，这让我感到压力。",
            "我很兴奋，期待接下来的事情！"
        ],
        confidence: 0.82,
        context: "调节体温或表达情绪"
    },
    "whine": {
        translations: [
            "我想要那个，能给我吗？",
            "我很焦虑，需要你的安慰。",
            "我不舒服，请关注我。",
            "我想出去，现在就想！"
        ],
        confidence: 0.83,
        context: "表达渴望或不安"
    },
    "哀号": {
        translations: [
            "我想要那个，能给我吗？",
            "我很焦虑，需要你的安慰。",
            "我不舒服，请关注我。",
            "我想出去，现在就想！"
        ],
        confidence: 0.83,
        context: "表达渴望或不安"
    },
    "哀号声": {
        translations: [
            "我想要那个，能给我吗？",
            "我很焦虑，需要你的安慰。",
            "我不舒服，请关注我。",
            "我想出去，现在就想！"
        ],
        confidence: 0.83,
        context: "表达渴望或不安"
    }
};

/**
 * 语义分析器类
 */
PetTranslator.SemanticAnalyzer = class {
    constructor() {
        this.catSounds = catSounds;
        this.dogSounds = dogSounds;
    }

    /**
     * 分析输入文本
     * @param {string} input - 输入的文本
     * @param {string} mode - 翻译模式 ('cat' 或 'dog')
     * @returns {object} 分析结果
     */
    analyze(input, mode) {
        if (!input || input.trim() === '') {
            return {
                success: false,
                error: '输入为空，请提供有效的声音描述'
            };
        }

        const lowerInput = input.toLowerCase();
        const trimmedInput = lowerInput.trim();
        
        const soundDatabase = mode === 'cat' ? this.catSounds : this.dogSounds;
        const animalName = mode === 'cat' ? '猫咪' : '狗狗';
        
        let bestMatch = null;
        let highestConfidence = 0;
        
        for (const [soundKey, soundData] of Object.entries(soundDatabase)) {
            if (lowerInput.includes(soundKey) || trimmedInput.includes(soundKey)) {
                const exactMatch = trimmedInput === soundKey || lowerInput === soundKey;
                const confidence = exactMatch ? Math.min(soundData.confidence + 0.05, 0.98) : soundData.confidence;
                
                if (confidence > highestConfidence) {
                    highestConfidence = confidence;
                    bestMatch = {
                        sound: soundKey,
                        data: soundData,
                        confidence: confidence
                    };
                }
            }
        }
        
        if (!bestMatch) {
            return {
                success: true,
                input: input,
                mode: mode,
                translations: [
                    `你的${animalName}正在尝试与你交流，但声音类型不太明确。`,
                    `尝试观察${animalName}的身体语言来更好地理解它的意图。`,
                    `注意${animalName}的尾巴、耳朵和姿势，这些都能帮助你理解它的情绪。`
                ],
                confidence: 0.4,
                context: "无法识别具体声音类型",
                isFuzzyMatch: true,
                isDefault: true
            };
        }
        
        const translations = bestMatch.data.translations;
        const randomTranslation = translations[Math.floor(Math.random() * translations.length)];
        
        return {
            success: true,
            input: input,
            mode: mode,
            soundType: bestMatch.sound,
            translations: [randomTranslation, ...translations.filter(t => t !== randomTranslation).slice(0, 1)],
            confidence: bestMatch.confidence,
            context: bestMatch.data.context
        };
    }

    /**
     * 格式化翻译结果
     * @param {object} analysisResult - 分析结果
     * @returns {string} 格式化的翻译文本
     */
    formatTranslation(analysisResult) {
        if (!analysisResult.success) {
            return `翻译失败: ${analysisResult.error}`;
        }
        
        const animalName = analysisResult.mode === 'cat' ? '猫咪' : '狗狗';
        
        let formatted = '';
        
        if (analysisResult.isDefault) {
            formatted = analysisResult.translations[0];
        } else {
            formatted = `🐾 ${analysisResult.translations[0]}`;
            
            if (analysisResult.translations.length > 1) {
                formatted += `\n\n💡 其他可能的含义:\n- ${analysisResult.translations[1]}`;
            }
            
            if (analysisResult.context) {
                formatted += `\n\n📖 上下文分析: ${analysisResult.context}`;
            }
        }
        
        return formatted;
    }
};
