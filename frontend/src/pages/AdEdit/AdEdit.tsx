import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdEdit.css'
import { Input, Select } from 'antd';
import type { AdFeatures, ItemUpdateIn, AutoItemParams, RealEstateItemParams, ElectronicsItemParams, FormParams} from '../../types';
import {  
    autoLabels, 
    realEstateLabels, 
    electronicsLabels, 
    renderValue,
    itemsCategories,
    categoryNames,
    validateAdFields
} from '../../types';


type EditableAd = ItemUpdateIn & {id:string | number};

const selectCategoryOptions = itemsCategories.map(element => ({
    value:element,
    label:categoryNames[element]
}));

function AdEdit(){
    const {id} = useParams<{id:string}>();
    const navigate = useNavigate();
    const [adInfo, setAdInfo] = useState<EditableAd | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean | null>(null);
    // состояние для парметров формы
    const [formParams,setFormParams] = useState<AdFeatures | null>(null)

    // ф-я получения данных об объявлении
    useEffect(() => {
        const loadAdInfo = async() => {
            if(!id) return;

            try {
                const res = await fetch(`/items/${id}`);
                if(!res){
                    throw new Error('ошибка обращения к url объявления');
                }

                const data:AdFeatures = await res.json();
                console.log(data);
                setAdInfo(data);
                setFormParams(data);
            } catch (error) {
                console.error('ошибка получения данных об объявлении: ',error);
                setError(true);
            }finally{
                setLoading(false);
            }

        }
        loadAdInfo();
    }, [id])

    if (loading) {
        return <div className="ad-status">Загрузка объявления...</div>;
    }
    if (error || !adInfo) {
        return <div className="ad-status ad-status--error">Ошибка: {error || 'Объявление не найдено'}</div>;
    }

    // ф-я для изменения поля формы
    const fieldChange = (key:keyof AdFeatures, value:any) => {
        if(!formParams)return;

        setFormParams({
            ...formParams,
            [key]:value
        })
    }
    
    // ф-я отправки формы на сервер
    const handleSubmitForm = async(e:React.FormEvent) => {
        e.preventDefault();
        if(!formParams || !id) return;
        const needsRevision = validateAdFields(adInfo).length > 0;
        try {
            const bodyToSend:ItemUpdateIn &{ needsRevision: boolean } = {
                category:formParams.category,
                title: formParams.title,
                description: formParams.description || '',
                price: formParams.price,
                params: formParams.params,
                needsRevision:needsRevision
            }

            const res = await fetch(`/items/${id}`, {
                method:'PUT',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyToSend)
            })

            if(!res.ok){
                throw new Error('возникла ошибка отправления параметров формы на url');
            }

            console.log('парметры обновлены, статус: ', res.status);
            navigate(`/ad/${id}`)
            
        } catch (error) {
            console.error('не удалось сохранить изменения:', error);
        }
    }

    return(
        <div className="edit-container">
            <h1>Редактирование объявления</h1>
            <form action="" className='edit-form' onSubmit={handleSubmitForm}>
                <div className="edit edit-category">
                    <label htmlFor="">Категория</label>
                    <Select
                        id='category-select'
                        value={formParams ? formParams.category : adInfo.category}
                        options={selectCategoryOptions}
                    />
                </div>
                <div className="divider-line"></div>
                <div className="edit edit-title">
                    <label htmlFor="">Название</label>
                    <Input 
                        onChange={(e)=> fieldChange('title', e.target.value)}
                        required 
                        allowClear
                        value={adInfo.title}
                    />
                </div>
                <div className="divider-line"></div>
                <div className="edit edit-price">
                    <label htmlFor="">Цена</label>
                    <Input 
                        required
                        allowClear
                        value={adInfo.price}
                    />
                </div>
                <div className="divider-line"></div>
                <label htmlFor="">Характеристики</label>
                <div className="edit edit-cahracteristics">
                    {(() => {
                        const currentParams = adInfo.params || {};
                        switch (adInfo.category){
                            case 'auto':
                                return Object.entries(autoLabels).map(([key, label])=> {
                                    const params = currentParams as AutoItemParams;
                                    return (
                                        <div key={key} className="edit-param-field">
                                            <label className='edit-param-label'>{label}</label>
                                            <Input 
                                                defaultValue={renderValue(params[key as keyof AutoItemParams]) ?? ''} 
                                            />
                                        </div>
                                    );
                                })
                            case 'real_estate':
                            return Object.entries(realEstateLabels).map(([key, label]) => {
                                const params = currentParams as RealEstateItemParams;
                                return (
                                    <div key={key} className="edit-param-field">
                                        <label className='edit-param-label'>{label}</label>
                                        <Input 
                                            defaultValue={renderValue(params[key as keyof RealEstateItemParams]) ?? ''} 
                                        />
                                    </div>
                                );
                            });
                            case 'electronics':
                            return Object.entries(electronicsLabels).map(([key, label]) => {
                                const params = currentParams as ElectronicsItemParams;
                                return (
                                    <div key={key} className="edit-param-field">
                                        <label className='edit-param-label'>{label}</label>
                                        <Input 
                                            defaultValue={renderValue(params[key as keyof ElectronicsItemParams]) ?? ''} 
                                        />
                                    </div>
                                );
                            });
                        }
                    })()}
                </div>
                <div className="divider-line"></div>
                <div className="edit edit-desc">
                    <label htmlFor="">Описание</label>
                    <Input
                        onChange={(e) => fieldChange('description', e.target.value)}
                    />
                </div>
                <div className="form-actions">
                    <button type='submit'>Сохранить</button>
                    <button>Отменить</button>
                </div>
            </form>
        </div>
    )
}

export default AdEdit;