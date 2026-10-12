import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Item, AutoItemParams, RealEstateItemParams, ElectronicsItemParams } from "../../types";
import img from "../../assets/placeholder-image.png"
import { Alert } from "antd";
import './Ad.css'

type AdFeatures = Item & {
    createdAt:string,
    updatedAt:string,
    description?:string
    params:AutoItemParams | RealEstateItemParams | ElectronicsItemParams
}

// формат для корректного отбражения даты
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
        day:'numeric',
        month:'long',
        hour:'2-digit',
        minute:'2-digit'
})

// перевод имен совйств на русский язык

const autoLabels: Record<keyof AutoItemParams, string> = {
    brand:'Марка',
    model:'Модель',
    yearOfManufacture: 'Год выпуска',
    transmission: 'Коробка передач',
    mileage: 'Пробег',
    enginePower: 'Мощность двигателя'
}

const realEstateLabels: Record<keyof RealEstateItemParams, string> = {
    type: "Тип недвижимости",
    address: "Адрес",
    area: "Площадь",
    floor: "Этаж"
}

const electronicsLabels: Record<keyof ElectronicsItemParams, string> = {
    type: "Тип устройства",
    brand: "Марка",
    model: "Модель",
    condition: "Состояние",
    color: "Цвет"
}

const valueTranslations: Record<string, string> = {
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

function Ad(){
    const {id} = useParams<{id:string}>();
    // состояние для объявления
    const [ad, setAd] = useState<AdFeatures | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean | null>(null);

    
    useEffect(() => {
        if (!id) return;

        const getAd = async() => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/items/${id}`);

                if(!res.ok){
                    throw new Error(`ошибка обращения к url объявения: ${res.status}`);
                }

                const data:AdFeatures = await res.json();
                console.log(data);
                setAd(data)
                
            } catch (error) {
                console.error('ошибка получения данных об объявлении: ',error);
                setError(true);
            }finally{
                setLoading(false);
            }
        }
        getAd();
    }, [id])

    if (loading) {
        return <div className="ad-status">Загрузка объявления...</div>;
    }

    if (error || !ad) {
        return <div className="ad-status ad-status--error">Ошибка: {error || 'Объявление не найдено'}</div>;
    }
    const creationDate = dateFormatter.format(new Date(ad.createdAt));
    const updateDate = dateFormatter.format(new Date(ad.updatedAt));

    // ф-я перевода значений на русский
    const renderValue = (val:string | number | undefined) => {
        if (val === undefined || val === null) return "Не указано";
        return valueTranslations[val.toString()] || val.toString();
    }

    // ф-я отображения характеристик в зависимости от категории
    const renderCharacteristics = () => {
        if(!ad.params) return <p>Категория не указана</p>

        switch (ad.category) {
            case "auto":{
                const autoParams = ad.params as AutoItemParams;
                return (
                    <ul className="params-list">
                        {Object.entries(autoLabels).map(([key, label]) => (
                            <li key={key} ><span className="characteristic-label">{label}:</span> {renderValue(autoParams[key as keyof AutoItemParams])}</li>
                        ))}
                    </ul>
                )
            }
            case "electronics":{
                const electronicsParams = ad.params as ElectronicsItemParams;
                return (
                    <ul className="params-list">
                        {Object.entries(electronicsLabels).map(([key, label]) => (
                            <li key={key}><b>{label}</b>{renderValue(electronicsParams[key as keyof ElectronicsItemParams])}</li>
                        ))}
                    </ul>
                )
            }
            case "real_estate":{
                const estateParams = ad.params as RealEstateItemParams;
                return(
                    <ul className="params-list">
                        {Object.entries(realEstateLabels).map(([key,label]) => (
                            <li key={key}><b>{label}:</b>{renderValue(estateParams[key as keyof RealEstateItemParams])}</li>
                        ))}
                    </ul>
                )
            }
            default:
                return <p>Неизвестная категория</p>;
        }
    }

    return(
        <div className="ad">
            <div className="ad__header">
                <div className="ad__header-main">
                    <h1>{ad?.title}</h1>
                    <p>{ad?.price} ₽</p>
                </div>
                <div className="ad__header-extraInfo">
                    <button className="edit-btn">Редактировать</button>
                    <div className="ad__header-extraInfo-time">
                        <p>Опубликовано: {creationDate}</p>
                        {updateDate && (
                            <p>Отредактировано: {updateDate}</p>
                        )}
                        
                    </div>
                </div>
            </div>
            <div className="divider-line"></div>

            <div className="ad__main">
                <div className="ad__picure-desc">
                    <div className="ad__picture">
                        <img src={img} alt="placeholder-img" />
                    </div>
                    {/* {ad.description && (
                        <div>
                            <h3>Описание</h3>
                            <p>{ad.description}</p>
                        </div>
                    )} */}
                </div>
                <div className="ad__characteristics">
                    {ad.needsRevision && (
                        
                        <Alert
                            message="Требуются доработки"
                            type="warning" 
                            showIcon       
                            className="ad-alert" 
                            description={
                                <div>
                                    <p>У объявления не заполнены поля:</p>
                                    <ul>
                                
                                    </ul>
                                </div>
                            }
                        />
                    )}
                    <h2 className="font-medium text-lg mb-[1rem]">Характеристики</h2>
                    {renderCharacteristics()}
                </div>
            </div>
            
           
        </div>
    )
}

export default Ad;