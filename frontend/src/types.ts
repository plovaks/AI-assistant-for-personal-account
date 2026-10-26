export const itemsCategories = ["auto", "real_estate", "electronics"];

// русификация категорий
export const categoryNames: Record<string, string> = {
        auto: "Транспорт",
        real_estate: "Недвижимость",
        electronics: "Электроника"
    }

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

// тип для запроса объявлений с сервера
export type FetchParams = {
    limit:number,
    skip:number,
    searchQuery:string,
    categories:string[],
    needsRevision:boolean,
    sort: Sort
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

export type AdFeatures = Item & {
    createdAt:string,
    updatedAt:string,
    description?:string
    params:AutoItemParams | RealEstateItemParams | ElectronicsItemParams
}

export type FormParams = Item & {
    params?:AutoItemParams | RealEstateItemParams | ElectronicsItemParams
}

export type View = 'row' | 'grid';

// перевод имен совйств на русский язык
export const autoLabels: Record<keyof AutoItemParams, string> = {
    brand:'Марка',
    model:'Модель',
    yearOfManufacture: 'Год выпуска',
    transmission: 'Коробка передач',
    mileage: 'Пробег',
    enginePower: 'Мощность двигателя'
}

export const realEstateLabels: Record<keyof RealEstateItemParams, string> = {
    type: "Тип недвижимости",
    address: "Адрес",
    area: "Площадь",
    floor: "Этаж"
}

export const electronicsLabels: Record<keyof ElectronicsItemParams, string> = {
    type: "Тип устройства",
    brand: "Марка",
    model: "Модель",
    condition: "Состояние",
    color: "Цвет"
}

export const valueTranslations: Record<string, string> = {
    automatic: "Автомат",
    manual: "Механика",
    flat: "Квартира",
    house: "Дом",
    room: "Комната",
    phone: "Телефон",
    laptop: "Ноутбук",
    misc: "Другое",
    new: "Новое",
    used: "Б/У"
};


// ф-я перевода значений на русский
export const renderValue = (val:string | number | undefined) => {
    if (val === undefined || val === null) return "Не указано";
    return valueTranslations[val.toString()] || val.toString();
}


interface SimpleAdData {
    category: 'auto' | 'real_estate' | 'electronics';
    description?: string;
    params:AutoItemParams | RealEstateItemParams | ElectronicsItemParams
}

// ф-я пустых полей формы
export const validateAdFields = (ad: SimpleAdData | null): string[] => {
    if (!ad) return [];

    const emptyFields: string[] = [];

    
    if (!ad.description || ad.description.trim() === '') {
        emptyFields.push('Описание');
    }

    const currentParams = (ad.params || {}) as Record<string, any>;
    let labelsMap: Record<string, string> = {};

    if (ad.category === 'auto') labelsMap = autoLabels;
    else if (ad.category === 'real_estate') labelsMap = realEstateLabels;
    else if (ad.category === 'electronics') labelsMap = electronicsLabels;

    Object.entries(labelsMap).forEach(([key, label]) => {
        const value = currentParams[key];
        if (value === undefined || value === null || value === '') {
            emptyFields.push(label);
        }
    });

    return emptyFields;
};
