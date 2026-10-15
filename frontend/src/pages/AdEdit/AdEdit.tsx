import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdEdit.css'
import { Input, Select, message } from 'antd';
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
import { fetchPriceRecommendation } from '../../aiResponses';


type EditableAd = AdFeatures;

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
    // состояния для ai статусов
    const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [aiResponse, setAiResponse] = useState<string>('');
    const [aiParsedPrice, setAiParsedPrice] = useState<number | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

    const handleGetAiPrice = async () => {
        if (!formParams) return;
        setAiStatus('loading');
        setIsPopoverOpen(true);

        try {
            const data = await fetchPriceRecommendation({
                category: formParams.category,
                title: formParams.title,
                description: formParams.description,
                params: formParams.params
            });

            setAiResponse(data.textAnalysis);
            setAiParsedPrice(data.recommendedPrice);
            setAiStatus('success');
        } catch (err) {
            console.error("ошибка при обращении к ИИ сервису:", err);
            setAiStatus('error');
        }
    };
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
    if (error || !formParams) {
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

    // ф-я изменения категории
    const handleCategoryChange = (value: 'auto' | 'real_estate' | 'electronics') => {
        setFormParams(prev => {
            if (!prev) return null;

            const isOriginalCategory = adInfo && adInfo.category === value;

            return{
                ...prev,
                category:value,
                params: isOriginalCategory ? { ...adInfo.params } : {}
            }
            
        })
    }

    const handleParamsChange = (paramaName:string, value:any) => {
        setFormParams(prev => {
            if(!prev) return null;

            return{
                ...prev,
                params:{
                    ...prev.params,
                    [paramaName]:value
                }
            }
        })
    }
    
    // ф-я проверки пустого поля
    const isEmtyValue = (val:any):boolean =>{
        if (val === undefined || val === null) return true;
        if (typeof val === 'string') return val.trim() === '';
        if (typeof val === 'number') return false;
        return false;
    }
    
    // ф-я запросов к AI для уточнения цены


    // ф-я отправки формы на сервер
    const handleSubmitForm = async(e:React.FormEvent) => {
        e.preventDefault();
        if(!formParams || !id) return;
        const needsRevision = validateAdFields(formParams).length > 0;
        try {
            const bodyToSend:ItemUpdateIn &{ needsRevision: boolean } = {
                category:formParams.category,
                title: formParams.title,
                description: formParams.description || '',
                price: +formParams.price,
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
            message.success('Изменения сохранены')

            console.log('парметры обновлены, статус: ', res.status);
            navigate(`/ad/${id}`)
            
        } catch (error) {
            console.error('не удалось сохранить изменения:', error);
            message.error('Ошибка сохранения. При попытке сохранить изменения произошла ошибка.')
        }
    }

    const isFormInvalid = isEmtyValue(formParams.category) || isEmtyValue(formParams.title.trim()) || isEmtyValue(formParams.price) || Number(formParams.price) <= 0;

    return(
        <div className="edit-container">
            <h1>Редактирование объявления</h1>
            <form action="" className='edit-form' onSubmit={handleSubmitForm}>
                <div className="edit edit-category">
                    {formParams.category ? (
                        <label htmlFor="">Категория</label>
                    ):(
                        <div>
                            <span style={{color:'rgba(255, 77, 79, 1)',marginRight:'0.5rem'}}>*</span>
                            <label htmlFor="">Категория</label>
                        </div>
                        
                    )}
                    <Select
                        onChange={(value) => handleCategoryChange(value)}
                        id='category-select'
                        value={formParams.category}
                        options={selectCategoryOptions}
                        className={`${formParams.category ? '' : 'input-required-error'}`}
                    />
                    {!formParams.category && (
                        <p style={{color:'rgba(255, 77, 79, 1)', fontSize:'0.7rem', marginTop:'0.5rem'}}>Категория должна быть заполнена</p>
                    )}
                </div>
                <div className="divider-line"></div>
                <div className="edit edit-title">
                    {formParams.title.trim() ? (
                        <label htmlFor="">Название</label>
                    ):(
                        <div>
                            <span style={{color:'rgba(255, 77, 79, 1)', marginRight:'0.5rem'}}>*</span>
                            <label htmlFor="">Название</label>
                        </div>
                        
                    )}
                    <Input 
                        className={`${formParams?.title.trim() ? '': 'input-required-error'}`}
                        onChange={(e)=> fieldChange('title', e.target.value)}
                        required 
                        allowClear
                        value={formParams?.title}
                    />
                    {!formParams.title.trim() && (
                        <p style={{color:'rgba(255, 77, 79, 1)', fontSize:'0.7rem'}}>Название должно быть заполнено</p>
                    )}
                </div>
                <div className="divider-line"></div>
                <div className='input-price-actions'>
                    <div className="edit edit-price">
                        {formParams.price ? (
                            <label htmlFor="price-input">Цена</label>
                        ) : (
                            <div>
                                <span style={{color:'rgba(255, 77, 79, 1)', marginRight:'0.5rem'}}>*</span>
                                <label htmlFor="price-input">Цена</label>
                            </div>
                        )}
                        <Input 
                            id="price-input"
                            type="number"
                            className={`${formParams?.price ? '': 'input-required-error'}`}
                            required
                            allowClear
                            value={formParams.price}
                            onChange={(e) => fieldChange('price', e.target.value)}

                            onKeyDown={(e) => {
                                if (['-', '+', '.', ',', 'e', 'E'].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                        {!formParams.price && (
                            <p style={{color:'rgba(255, 77, 79, 1)', fontSize:'0.7rem'}}>Цена должна быть заполнена</p>
                        )}
                    </div>
                    {formParams.price && (
                        <button type="button" className='ai-btn getprice' onClick={handleGetAiPrice}> Узнать рыночную цену</button>
                    )}
                    
                </div>

                <div className="divider-line"></div>
                <label htmlFor="">Характеристики</label>
                <div className="edit edit-cahracteristics">
                    {(() => {
                        const currentParams = formParams.params || {};
                        switch (formParams.category){
                            case 'auto':
                                return Object.entries(autoLabels).map(([key, label])=> {
                                    const params = currentParams as AutoItemParams;
                                    const currentValue = params[key as keyof AutoItemParams];
                                    const isParamEmty = isEmtyValue(currentValue);
                                    return (
                                        <div key={key} className="edit-param-field">
                                            <label className='edit-param-label'>{label}</label>
                                            <Input 
                                                className={`${isParamEmty ? 'input-empty': ''}`}
                                                value={currentValue ?? ''} 
                                                onChange={(e) => handleParamsChange(key,e.target.value)}
                                            />
                                        </div>
                                    );
                                })
                            case 'real_estate':
                            return Object.entries(realEstateLabels).map(([key, label]) => {
                                const params = currentParams as RealEstateItemParams;
                                const currentValue = params[key as keyof RealEstateItemParams];
                                const isParamEmty = isEmtyValue(currentValue);
                                return (
                                    <div key={key} className="edit-param-field">
                                        <label className='edit-param-label'>{label}</label>
                                        <Input 
                                            className={`${isParamEmty ? 'input-empty': ''}`}
                                            value={currentValue ?? ''}
                                            onChange={(e) => handleParamsChange(key,e.target.value)}
                                        />
                                    </div>
                                );
                            });
                            case 'electronics':
                            return Object.entries(electronicsLabels).map(([key, label]) => {
                                const params = currentParams as ElectronicsItemParams;
                                const currentValue = params[key as keyof ElectronicsItemParams];
                                const isParamEmty = isEmtyValue(currentValue);
                                return (
                                    <div key={key} className="edit-param-field">
                                        <label className='edit-param-label'>{label}</label>
                                        <Input 
                                            className={`${isParamEmty ? 'input-empty': ''}`}
                                            value={currentValue ?? ''}
                                            onChange={(e) => handleParamsChange(key,e.target.value)} 
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
                    <Input.TextArea
                        className={`${formParams.description ? '': 'input-empty' }`}
                        onChange={(e) => fieldChange('description', e.target.value)}
                        value={formParams?.description}
                        maxLength={1000}
                        showCount
                        autoSize={{ minRows: 4, maxRows: 8 }}
                    />
                    <button className='ai-btn improve-desc'>Улучшить описание</button>
                </div>
                <div className="form-actions">
                    <button 
                        type='submit' 
                        className='submitForm' 
                        disabled={isFormInvalid}
                        
                    >
                        Сохранить
                    </button>
                    <button   
                        type='button' 
                        className='cancelFormChanges'
                        onClick={() => navigate(`/ad/${id}`)}
                    >
                        Отменить
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AdEdit;