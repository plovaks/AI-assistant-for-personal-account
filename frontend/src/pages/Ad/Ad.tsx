import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { AutoItemParams, RealEstateItemParams, ElectronicsItemParams, AdFeatures } from "../../types";
import img from "../../assets/placeholder-image.png"
import { Alert, Result, Button } from "antd";
import './Ad.css'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

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
    const navigate = useNavigate();
    const [reloadKey, setReloadKey] = useState(0);
    // состояние для объявления
    const [ad, setAd] = useState<AdFeatures | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    
    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        const getAd = async() => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/items/${id}`);

                if(!res.ok){
                    throw new Error(`ошибка обращения к url объявения: ${res.status}`);
                }

                const data:AdFeatures = await res.json();
                if (!cancelled) setAd(data);
                
            } catch (error) {
                console.error('ошибка получения данных об объявлении: ',error);
                if (!cancelled) setError('Не удалось загрузить объявление');
            }finally{
                if (!cancelled) setLoading(false);
            }
        }
        getAd();

        return () => {
            cancelled = true;
        };
    }, [id, reloadKey])


    if (!loading && error) {
        return (
            <Result
                status="error"
                title="Не удалось загрузить объявление"
                subTitle="Проверьте соединение и попробуйте ещё раз"
                extra={[
                    <Button type="primary" key="retry" onClick={() => setReloadKey(k => k + 1)}>
                        Повторить
                    </Button>,
                    <Button key="back" onClick={() => navigate('/ads')}>
                        К списку
                    </Button>,
                ]}
            />
        );
    }
    if (!loading && !ad) {
        return (
            <Result
                status="404"
                title="Объявление не найдено"
                subTitle="Возможно, оно было удалено"
                extra={<Button type="primary" onClick={() => navigate('/ads')}>К списку объявлений</Button>}
            />
        )
    }

    const creationDate = ad ? dateFormatter.format(new Date(ad.createdAt)) : '';
    const updateDate = ad ? dateFormatter.format(new Date(ad.updatedAt)) : '';

    

    // ф-я отображения характеристик в зависимости от категории
    const renderCharacteristics = () => {
         if(!ad || !ad.params) return <p>Категория не указана</p>

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

    const missingFields = ad ? validateAdFields(ad) : [];

    return(
        
        <>
        {loading || !ad ? 
            
            (
                <div className="ad">
                    <div className="ad__header">
                        <div className="ad__header-main">
                            <h1><Skeleton width={300} /></h1>
                            <p><Skeleton width={120} /></p>
                        </div>
                        <div className="ad__header-extraInfo">
                            <Skeleton width={135} height={34} borderRadius={4} />
                            
                            <div className="ad__header-extraInfo-time">
                                <p><Skeleton width={180} /></p>
                                <p><Skeleton width={160} /></p>
                            </div>
                        </div>
                    </div>
                    <div className="divider-line"></div>
                    <div className="ad__main">
                        <div className="ad__picure-desc">
                            <div className="ad__picture" style={{ position: 'relative', aspectRatio: '4 / 3' }}>
                                <div style={{ position: 'absolute', inset: 0 }}>
                                    <Skeleton height="100%" containerClassName="skeleton-fill" />
                                </div>
                            </div>
                        </div>
                        <div className="ad__characteristics">
                            <div>
                                <h2 className="font-medium text-lg mb-[1rem]"><Skeleton width={150} /></h2>
                                <ul className="params-list">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <li key={index} className="param">
                                            <Skeleton width={220} height={20}/>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="ad-description">
                        <h2 className="font-medium text-lg mb-[1rem]"><Skeleton width={100} /></h2>
                        <p><Skeleton count={3} /></p>
                    </div>
                </div>
            )
            :
            (
                <div className="ad">
                    <div className="ad__header">
                        <div className="ad__header-main">
                            <h1>{ad?.title}</h1>
                            <p>{ad?.price} ₽</p>
                        </div>
                        <div className="ad__header-extraInfo">
                            <Link to={`/ads/${ad.id}/edit`} state={{from: `/ad/${ad.id}`}}>
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
        </>
    )
}

export default Ad;