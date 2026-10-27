import { makeAutoObservable,runInAction } from "mobx";
import type { AdFeatures } from "../types";
import { fetchPriceRecommendation, fetchDescription } from "../aiResponses";

class AdEditUiStore  {
    formParams:AdFeatures | null = null;
    // состояния для ai статусов оценки рыночной стоимости
    aiStatus:'idle' | 'success' | 'loading' | 'error' = 'idle';
    aiResponse:string = '';
    aiParsedPrice:number | null = null;
    isPopoverOpen:boolean = false;
    aiLoading:boolean = false;
    isAiRequestedBefore:boolean = false;
    // состояния для ai-кнопки описания
    aiDescStatus:'idle' | 'success' | 'loading' | 'error' = 'idle';
    aidescription:null|string = null;
    aiDescLoading:boolean = false;
    isAiDescRequested:boolean = false;
    isDescPopoverOpen:boolean = false;

    constructor(){
        makeAutoObservable(this);
    }

    initForm (ad:AdFeatures, savedDraft:string |  null){
        this.formParams = savedDraft ? JSON.parse(savedDraft) : {...ad};
    }

    changeField <K extends keyof AdFeatures>(key: K, value: AdFeatures[K]){
        if(!this.formParams)return;
        this.formParams[key] = value;
    }

    changeCategory(value: 'auto' | 'real_estate' | 'electronics', originalAd: AdFeatures | null){
        if (!this.formParams) return;
        const isOriginalCategory = originalAd && originalAd.category === value;
        this.formParams.category = value;
        this.formParams.params = isOriginalCategory ? {...originalAd.params} : {};
    }

    changeParam (paramaName:string, value:any) {
        if (!this.formParams) return;
        this.formParams.params = {
            ...this.formParams?.params,
            [paramaName]:value
            
        }
    }

    getAiPrice = async() => {
        if (this.aiLoading || !this.formParams) return;
        runInAction(() => {
            this.aiLoading = true;
            this.isAiRequestedBefore = true;
            this.aiStatus = 'loading';
            this.isPopoverOpen = true; 
        });
        
        try {
            const data = await fetchPriceRecommendation({
                category: this.formParams.category,
                title: this.formParams.title,
                description: this.formParams.description,
                params: this.formParams.params
            });
            this.aiResponse = data.textAnalysis;
            this.aiParsedPrice = data.recommendedPrice;
            this.aiStatus = 'success';
            this.isPopoverOpen = true;
        } catch (err) {
            runInAction(() => { this.aiStatus = 'error'; });
        } finally {
            runInAction(() => { this.aiLoading = false; });
        }
    }

    getAiDescription = async () => {
        if (!this.formParams) return;
        this.aiDescStatus = 'loading';
        this.aiDescLoading = true;
        this.isAiDescRequested = true;
        
        try {
            const data = await fetchDescription({
                category: this.formParams.category,
                title: this.formParams.title,
                description: this.formParams.description,
                params: this.formParams.params
            });
            runInAction(() => {
                this.aidescription = data.description;
                this.aiDescStatus = 'success';
                this.isDescPopoverOpen = true;
            });
        } catch {
            runInAction(() => { this.aiDescStatus = 'error'; });
        } finally {
            runInAction(() => { this.aiDescLoading = false; });
        }
    };

    setPopoverOpen(open: boolean) { this.isPopoverOpen = open; }
    setDescPopoverOpen(open: boolean) { this.isDescPopoverOpen = open; }

    get isFormInvalid():boolean{
        if (!this.formParams) return true;
        const isEmpty = (val: any) => val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
        return isEmpty(this.formParams.category) || isEmpty(this.formParams.title) || isEmpty(this.formParams.price) || Number(this.formParams.price) <= 0;
    }

    clearUiState(){
        this.formParams = null;
        this.aiStatus = 'idle';
        this.isPopoverOpen = false;
        this.isDescPopoverOpen = false
    }
}

export const adEditUiStore = new AdEditUiStore();