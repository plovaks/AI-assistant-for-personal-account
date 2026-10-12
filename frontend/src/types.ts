// тип объявления
export type Item = {
    id: string | number,
    category:"auto" | "real_estate" | "electronics",
    title:string,
    price:number,
    needsRevision:boolean,
}

// тип получаемого списка объявлений
export type ItemsGetOut = {
    items: Item[],
    total:number
}

// тип для фильтрации
export type Filters = {
    category: string[],
    needsRevision:boolean
}

// тип для сортировки
export type Sort = {
    column: 'title' | 'createdAt' | '',
    direction: 'asc' | 'desc' | ''
}

// типы для редактирвоания объявления 
export type ItemUpdateIn = {
  category: 'auto' | 'real_estate' | 'electronics';
  title: string;
  description?: string;
  price: number;
  params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
};
 
export type AutoItemParams = {
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  transmission?: 'automatic' | 'manual';
  mileage?: number;
  enginePower?: number;
};
 
export type RealEstateItemParams = {
  type?: 'flat' | 'house' | 'room';
  address?: string;
  area?: number;
  floor?: number;
};
 
export type ElectronicsItemParams = {
  type?: 'phone' | 'laptop' | 'misc';
  brand?: string;
  model?: string;
  condition?: 'new' | 'used';
  color?: string;
};