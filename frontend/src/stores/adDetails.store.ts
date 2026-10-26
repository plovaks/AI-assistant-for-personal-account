import { makeAutoObservable, runInAction } from "mobx";
import type { AdFeatures } from "../types";

class AdDetailsStore {
    ad:AdFeatures | null = null;
    loading:boolean = false;
    error:string | null = null;
    
    constructor(){
        makeAutoObservable(this)
    }

    fetchAdById = async (id:string) => {
        if(!id) return;

        this.loading = true;
        this.error = null;
        try {
            const res = await fetch(`/items/${id}`);

            if(!res.ok){
                throw new Error(`ошибка обращения к url объявения: ${res.status}`);
            }

            const data:AdFeatures = await res.json();

            runInAction(() => {
                this.ad = data;
            })
            
        } catch (error:any) {
            runInAction(() => {
                this.error = error.message || 'произошла ошибка получения объявления'
            })
        }finally{
            runInAction(() =>{
                this.loading = false;
            })
        }
    }

    clear(){
        this.ad = null;
        this.error = null;
        this.loading = false;
    }
}

export const adDetailsStore = new AdDetailsStore();