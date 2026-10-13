import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { AutoItemParams, RealEstateItemParams, ElectronicsItemParams, AdFeatures } from "../../types";
import img from "../../assets/placeholder-image.png"
import { Alert } from "antd";
import './Ad.css'

import {  
    autoLabels, 
    realEstateLabels, 
    electronicsLabels, 
    renderValue,
    validateAdFields
} from '../../types';

// формат для корректного отбражения даты
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
        day:'numeric',
        month:'long',
        hour:'2-digit',
        minute:'2-digit'
})

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

    

    // ф-я отображения характеристик в зависимости от категории
    const renderCharacteristics = () => {
        if(!ad.params) return <p>Категория не указана</p>

        switch (ad.category) {
            case "auto":{
                const autoParams = ad.params as AutoItemParams;
                return (
                    <ul className="params-list">
                        {Object.entries(autoLabels).map(([key, label]) => (
                            <li key={key} className="param">
                                <span className="characteristic-label">{label}:</span> 
                                {renderValue(autoParams[key as keyof AutoItemParams])}
                            </li>
                        ))}
                    </ul>
                )
            }
            case "electronics":{
                const electronicsParams = ad.params as ElectronicsItemParams;
                return (
                    <ul className="params-list">
                        {Object.entries(electronicsLabels).map(([key, label]) => (
                            <li key={key} className="param">
                                <span className="characteristic-label">{label}:</span> 
                                {renderValue(electronicsParams[key as keyof ElectronicsItemParams])}
                            </li>
                        ))}
                    </ul>
                )
            }
            case "real_estate":{
                const estateParams = ad.params as RealEstateItemParams;
                return(
                    <ul className="params-list">
                        {Object.entries(realEstateLabels).map(([key,label]) => (
                            <li key={key} className="param">
                                <span className="characteristic-label">{label}:</span> 
                                {renderValue(estateParams[key as keyof RealEstateItemParams])}
                            </li>
                        ))}
                    </ul>
                )
            }
            default:
                return <p>Неизвестная категория</p>;
        }
    }
    const missingFields = validateAdFields(ad);

    return(
        <div className="ad">
            <div className="ad__header">
                <div className="ad__header-main">
                    <h1>{ad?.title}</h1>
                    <p>{ad?.price} ₽</p>
                </div>
                <div className="ad__header-extraInfo">
                    <Link to={`/ads/${ad.id}/edit`}>
                        <button 
                            className="edit-btn"
                        >
                            Редактировать
                        </button>
                    </Link>
                    
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
                    
                </div>
                <div className="ad__characteristics">
                    {ad.needsRevision && (
                        
                        <Alert
                            title="Требуются доработки"
                            type="warning" 
                            showIcon       
                            className="ad-alert" 
                            description={
                                <div>
                                    <p>У объявления не заполнены поля:</p>
                                    <ul>
                                        {missingFields.map((field) => (
                                            <li key={field}>{field}</li>
                                        ))}
                                    </ul>
                                </div>
                            }
                        />
                    )}
                    {ad.params && Object.keys(ad.params).length > 0 && (
                        <div>
                            <h2 className="font-medium text-lg mb-[1rem]">Характеристики</h2>
                            {renderCharacteristics()}
                        </div>
                    )}
                    
                </div>
            </div>
            <div className="ad-description">
                <h2 className="font-medium text-lg mb-[1rem]">Описание</h2>
                {ad.description ? (
                    <p >{ad.description}</p>
                ):(
                    <p>Отсутствует</p>
                )}
            </div>
            
           
        </div>
    )
}

export default Ad;