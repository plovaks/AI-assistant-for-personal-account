import { makeAutoObservable } from "mobx";
import type { Sort, View } from "../types";
import type { ChangeEvent } from "react";

class AdsUiStore {
    displayType: View = 'grid';
    searchQuery: string = '';
    categoryFilters:string[] = [];
    needsRevision:boolean = false;
    currentPage: number = 1;
    sort:Sort = {column:'', direction:''};
    itemsPerPage: number = 10;

    constructor(){
        makeAutoObservable(this)
    }

    setDisplayType(displayType:View){
        this.displayType = displayType;
    }

    setSearchQuery(query:string){
        this.searchQuery = query;
        this.currentPage = 1;
    }

    toggleCategory(category:string){
        if (this.categoryFilters.includes(category)){
            this.categoryFilters = this.categoryFilters.filter(c => c!== category);
        }else{
            this.categoryFilters.push(category)
        }
        this.currentPage = 1;
    }

    toggleNeedsRevision(){
        this.needsRevision = !this.needsRevision;
        this.currentPage = 1;
    }

    setSort(sortType:string){
        if(!sortType){
            this.sort = {column:'', direction:''};
            return;
        }
        const sortColumn = sortType.split('-')[0] as 'title' | 'createdAt' | '';
        const sortDirection = sortType.split('-')[1] as 'asc' | 'desc' | '';

        this.sort = {column:sortColumn, direction:sortDirection};
        this.currentPage = 1;
    }

    setCurrentPage(page:number){
        this.currentPage = page;
    }

    resetFilters(){
        this.categoryFilters = [];
        this.needsRevision = false;
        this.currentPage = 1;
    }

    get skip(){
        return (this.currentPage - 1) * this.itemsPerPage
    }

    get isFiltersEmpty(){
        return this.categoryFilters.length > 0 || this.needsRevision;
    }

}

export const adsUiStore = new AdsUiStore();