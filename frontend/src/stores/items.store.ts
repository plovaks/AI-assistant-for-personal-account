import { makeAutoObservable, runInAction } from "mobx";
import type { Item, ItemsGetOut, FetchParams } from "../types";   

class ItemsStore {
    items: Item[] = [];
    isLoading:boolean = false;
    error:string | null = null;
    totalItems:number = 0;

    constructor(){
        makeAutoObservable(this)
    }

    fetchItems = async (params:FetchParams) => {
        this.isLoading = true;
        this.error = null;
        try {
            const queryParams = new URLSearchParams({
                limit:params.limit.toLocaleString(),
                skip:params.skip.toLocaleString()
            })
        
            if(params.searchQuery.trim()){
                queryParams.append('q', params.searchQuery.trim());
            }
        
            if (params.categories.length > 0){
                queryParams.append('categories', params.categories.join(','));
            }
        
            if(params.needsRevision){
                queryParams.append('needsRevision', 'true')
            }
        
            if(params.sort.column && params.sort.direction){
                queryParams.append('sortColumn', params.sort.column)
                queryParams.append('sortDirection', params.sort.direction)
            }
        
            const response = await fetch(`/items?${queryParams.toString()}`);
        
            if (!response.ok){
                throw new Error('не удалось загрузить объявления');
            }
        
            const data: ItemsGetOut = await response.json();

            runInAction(() => {
                this.items = data.items;
                this.totalItems = data.total;
            })
        
        
        } catch (error: any) {
            runInAction(() => {
                this.error = error.message || 'произошла ошибка получения объявлений'
            })
           
        }finally{
            runInAction(() => {
                this.isLoading = false;
            })
        }

    }

    getTotalPages(itemsPerPage:number):number{
        return Math.ceil(this.totalItems/itemsPerPage)
    }
}

export const itemsStore = new ItemsStore();