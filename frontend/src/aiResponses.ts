import type { AutoItemParams, RealEstateItemParams, ElectronicsItemParams } from "./types"; 

interface AiRequest { //
    category: 'auto' | 'real_estate' | 'electronics';
    title: string;
    description?: string;
    params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
}

interface AiPriceResponse { //
    textAnalysis: string;
    recommendedPrice: number;
}

interface AiDescriptionResponse {
    description:string,
}

export const fetchPriceRecommendation = async (data: AiRequest): Promise<AiPriceResponse> => {
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

export const fetchDescription = async (data:AiRequest): Promise<AiDescriptionResponse> => {
    const response = await fetch('/items/ai-description', {
        method:"POST",
        headers:{
            "Content-Type": "application/json",
        },
        body:JSON.stringify({
            category: data.category,
            title: data.title,
            description: data.description,
            params: data.params
        })
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error);
    }

    return await response.json();
}

