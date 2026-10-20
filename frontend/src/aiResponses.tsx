import type { AutoItemParams, RealEstateItemParams, ElectronicsItemParams } from "./types"; 

interface AiPriceRequest { //
    category: 'auto' | 'real_estate' | 'electronics';
    title: string;
    description?: string;
    params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
}

interface AiPriceResponse { //
    textAnalysis: string;
    recommendedPrice: number;
}

export const fetchPriceRecommendation = async (data: AiPriceRequest): Promise<AiPriceResponse> => {
    const response = await fetch('/items/ai-recommend-price', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            category: data.category,
            title: data.title,
            description: data.description,
            params: data.params
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error);
    }

    return await response.json();
};

