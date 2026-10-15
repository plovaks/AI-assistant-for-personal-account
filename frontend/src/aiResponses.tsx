import { GoogleGenAI } from "@google/genai";
import { categoryNames } from "./types";
import type {AutoItemParams, RealEstateItemParams, ElectronicsItemParams} from "./types"


interface AiPriceRequest {
    category: 'auto' | 'real_estate' | 'electronics';
    title: string;
    description?: string;
    params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
}

interface AiPriceResponse {
    textAnalysis: string;
    recommendedPrice: number;
}

export const fetchPriceRecommendation = async (data: AiPriceRequest): Promise<AiPriceResponse> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    
    if (!apiKey) {
        throw new Error("Ключ API Gemini не настроен в окружении приложения");
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Проанализируй рыночную стоимость следующего объявления:
        Категория: ${categoryNames[data.category]}
        Название: ${data.title}
        Описание: ${data.description || 'Не указано'}
        Характеристики: ${JSON.stringify(data.params)}
            `.trim();

    // запрос к модели 
    const interaction = await ai.interactions.create({
        model: "gemini-3.8-flash",
        input: prompt,
        system_instruction: `
            Ты эксперт по оценке рыночной стоимости б/у и новых товаров.
            Проанализируй переданные данные объявления и сформируй ответ СТРОГО в формате JSON.
            Не используй markdown-разметку (никогда не пиши \`\`\`json в начале и \`\`\` в конце ответа!).

            Твой ответ должен содержать объект ровно с двумя обязательными свойствами:
            1. "textAnalysis" (строка) — подробный текстовый анализ цен со списками и диапазонами цен для разного состояния товара (как на макете). Используй знак переноса строки \\n для красивого отображения списков.
            2. "recommendedPrice" (число) — ОДНО оптимальное числовое значение средней цены для отличного состояния товара.

            Пример возвращаемой структуры:
            {"textAnalysis": "Средняя цена на MacBook Pro...\\n • 115 000 – 135 000 ₽ — отличное состояние.", "recommendedPrice": 125000}
                    `.trim()
    });

    if (!interaction.output_text) {
        throw new Error("Пустой ответ от модели");
    }

    // try {
    //     // Защитная очистка текста на случай, если модель вопреки инструкции добавила кавычки markdown
    //     const cleanJsonString = interaction.output_text
    //         .replace(/```json/g, '')
    //         .replace(/```/g, '')
    //         .trim();

    //     // Парсим гарантированную строку ответа в типизированный JS-объект
    //     const parsedResult: AiPriceResponse = JSON.parse(cleanJsonString);
        
    //     return parsedResult;
    // } catch (parseError) {
    //     console.error("Ошибка парсинга ответа ИИ в JSON:", interaction.output_text);
    //     throw new Error("ИИ вернул ответ в неверном текстовом формате, не поддающемся разбору");
    // }

    const cleanJsonString = interaction.output_text
             .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

    const parsedResult: AiPriceResponse = JSON.parse(cleanJsonString);
        
    return parsedResult;
};
