import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './AdEdit.css'
import { Input, Select, message,Popover, Skeleton, Button, Result } from 'antd';
import type { AdFeatures, ItemUpdateIn, AutoItemParams, RealEstateItemParams, ElectronicsItemParams, FormParams} from '../../types';
import {  
    autoLabels, 
    realEstateLabels, 
    electronicsLabels, 
    itemsCategories,
    categoryNames,
    validateAdFields
} from '../../types';
import { fetchPriceRecommendation, fetchDescription } from '../../aiResponses';


type EditableAd = AdFeatures;

const selectCategoryOptions = itemsCategories.map(element => ({
    value:element,
    label:categoryNames[element]
}));

function AdEdit(){
    const {id} = useParams<{id:string}>();
    const navigate = useNavigate();
    const location = useLocation();
    const [reloadKey, setReloadKey] = useState(0);
    const fromPath = location.state?.from || `/ad/${id}`;
    const [adInfo, setAdInfo] = useState<EditableAd | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // состояние для парметров формы
    const [formParams,setFormParams] = useState<AdFeatures | null>(null)
    // состояния для ai статусов
    const [aiStatus, setAiStatus] = useState<'idle' | 'success' | 'loading' | 'error'>('idle');
    const [aiResponse, setAiResponse] = useState<string>('');
    const [aiParsedPrice, setAiParsedPrice] = useState<number | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [isAiRequestedBefore, setIsAiRequestedBefore] = useState<boolean>(false);

    // состояния для ai-кнопки описания
    const [aiDescStatus, setDescStatus] = useState<'idle' | 'succes' | 'loading' | 'error'>('idle');
    const [aidescription, setAiDescription] = useState<null | string> (null);
    const [aiDescLoading, setAiDescLoading] = useState(false);
    const [isAiDescRequested, setIsAiDescRequested] = useState<boolean>(false);
    const [isDescPopoverOpen, setIsDescPopoverOpen] = useState(false);


    const draftKey = (id: string) => `ad-draft-${id}`;
    // получение рыночной стоиомтси от ai
    const handleGetAiPrice = async () => {
        if (aiLoading || !formParams) return;
        setAiLoading(true);
        setIsAiRequestedBefore(true);
        setAiStatus('loading');
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
            setIsPopoverOpen(true);
        } catch (err) {
            console.error("ошибка при обращении к ИИ сервису:", err);
            setAiStatus('error');
        } finally {
            setAiLoading(false);
        }
    };

    const handleGetAiDescription = async () => {
        if (!formParams) return;
        setDescStatus('loading');
        setAiDescLoading(true);
        setIsAiDescRequested(true);
        try {
            const data = await fetchDescription({
                category: formParams.category,
                title: formParams.title,
                description: formParams.description,
                params: formParams.params
            });
            setAiDescription(data.description);
            setDescStatus('succes')
            setIsDescPopoverOpen(true);
        } catch (error) {
            console.error("ошибка при обращении к ИИ сервису:", error);
            setDescStatus('error')
        }finally{
            setAiDescLoading(false);
        }
    }

    // ф-я получения данных об объявлении
    useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadAdInfo = async () => {
        setLoading(true);   
        setError(null);     
        try {
            const res = await fetch(`/items/${id}`);
            if (!res.ok) {  
                throw new Error(`ошибка обращения к url объявления: ${res.status}`);
            }
            const data: AdFeatures = await res.json();
            if (!cancelled) {
                setAdInfo(data);
                const saved = localStorage.getItem(draftKey(id));
                setFormParams(saved ? JSON.parse(saved) : data);
            }
        } catch (err) {
            console.error('ошибка получения данных об объявлении: ', err);
            if (!cancelled) setError('Не удалось загрузить объявление');
        } finally {
            if (!cancelled) setLoading(false);
        }
    };

    loadAdInfo();
    return () => {
        cancelled = true;
    };
    }, [id, reloadKey]);

    useEffect(() => {
        if (!id || !formParams || formParams === adInfo) return;
        localStorage.setItem(draftKey(id), JSON.stringify(formParams));
    }, [formParams, adInfo, id]);

    if (loading) {
    return (
        <div className="edit-container">
            <h1>Редактирование объявления</h1>
            <div className="edit-form">
                <div className="edit edit-category">
                    <Skeleton.Input active size="small" style={{ width: 90 }} />
                    <Skeleton.Input active block />
                </div>
                <div className="divider-line"></div>

                <div className="edit edit-title">
                    <Skeleton.Input active size="small" style={{ width: 90 }} />
                    <Skeleton.Input active block />
                </div>
                <div className="divider-line"></div>

                <div className="input-price-actions">
                    <div className="edit edit-price">
                        <Skeleton.Input active size="small" style={{ width: 60 }} />
                        <Skeleton.Input active block />
                    </div>
                    <Skeleton.Button active style={{ width: 170 }} />
                </div>
                <div className="divider-line"></div>

                <Skeleton.Input active size="small" style={{ width: 120 }} />
                <div className="edit edit-cahracteristics">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="edit-param-field">
                            <Skeleton.Input active size="small" style={{ width: 100, marginBottom:'10px'}} />
                            <Skeleton.Input active block />
                        </div>
                    ))}
                </div>
                <div className="divider-line"></div>

                <div className="edit edit-desc">
                    <Skeleton.Input active size="small" style={{ width: 90 }} />
                    <Skeleton active title={false} paragraph={{ rows: 4 }} />
                </div>

                <div className="form-actions">
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                </div>
            </div>
        </div>
    );
    }
    
    if (error || !formParams){
    return (
        <Result
            status="error"
            title="Не удалось загрузить форму редактирования"
            subTitle="Проверьте соединение и попробуйте ещё раз"
            extra={[
                <Button type="primary" key="retry" onClick={() => setReloadKey(k => k + 1)}>
                    Повторить
                </Button>,
                <Button key="back" onClick={() => navigate(`/ads`)}>
                    К списку объявлений
                </Button>,
            ]}
        />
    );
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
            localStorage.removeItem(draftKey(id));
            console.log('парметры обновлены, статус: ', res.status);
            navigate(fromPath, { replace: true });
            
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
                        <Popover
                            trigger={'click'}
                            open={isPopoverOpen}
                            onOpenChange={(open) => { if (!open) setIsPopoverOpen(false); }}
                            placement="top"
                            align={{offset:[80, -10] }}
                            content={
                                <div style={{ maxWidth: '21rem' ,}}>
                                    {/* {aiStatus === 'loading' && <p>Анализ данных о товаре...</p>} */}
                                    {aiStatus === 'error' && (
                                        <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                                            <h4 style={{fontWeight:500, color:'rgba(192, 15, 12, 1)'}}>Произошла ошибка при запросе к AI</h4>
                                            <p style={{ color: 'rgba(30, 30, 30, 1)' }}>
                                                Попробуйте повторить запрос или закройте уведомление
                                            </p>
                                            <button type="button" onClick={() => setIsPopoverOpen(false)} style={{backgroundColor:'rgba(252, 179, 173, 1)', color:'rgba(0, 0, 0, 0.85)', fontWeight:400, paddingInline:'0.5rem',borderRadius:'0.25rem', width:'fit-content'}}>
                                                Закрыть
                                            </button>
                                        </div>
                                    )}
                                    {aiStatus === 'success' && (
                                        <div>
                                            <h4>Ответ AI</h4>
                                            <p><b>Рекомендуемая цена: {aiParsedPrice?.toLocaleString('ru-RU')} ₽</b></p>
                                            <p style={{ whiteSpace: 'pre-line', margin: '10px 0' }}>{aiResponse}</p>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                <button
                                                    type="button"
                                                    className="submitForm"
                                                    style={{ padding: '4px 12px', height: 'auto' }}
                                                    onClick={() => {
                                                        if (aiParsedPrice !== null) fieldChange('price', String(aiParsedPrice));
                                                        setIsPopoverOpen(false);
                                                    }}
                                                >
                                                    Применить
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cancelFormChanges"
                                                    style={{ padding: '4px 12px', height: 'auto' }}
                                                    onClick={() => setIsPopoverOpen(false)}
                                                >
                                                    Закрыть
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            }
                           
                        >
                            <button type="button" onClick={handleGetAiPrice} disabled={aiLoading} className='ai-btn'>
                                {aiLoading 
                                    ? 'Выполняется запрос' 
                                    : isAiRequestedBefore 
                                        ? 'Повторить запрос' 
                                        : 'Узнать рыночную цену'
                                }
                            </button>
                        </Popover>
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
                    <Popover
                        open={isDescPopoverOpen}
                        trigger={'click'}
                        onOpenChange={(open) => { if (!open) setIsDescPopoverOpen(false); }}
                        placement="top"
                        align={{offset:[80, -10] }}
                        content={
                            <div style={{ maxWidth: '21rem'}}>
                                {aiDescStatus === 'error' && (
                                    <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                                        <h4 style={{fontWeight:500, color:'rgba(192, 15, 12, 1)'}}>Произошла ошибка при запросе к AI</h4>
                                        <p style={{ color: 'rgba(30, 30, 30, 1)' }}>
                                            Попробуйте повторить запрос или закройте уведомление
                                        </p>
                                        <button type="button" onClick={() => setIsDescPopoverOpen(false)} style={{backgroundColor:'rgba(252, 179, 173, 1)', color:'rgba(0, 0, 0, 0.85)', fontWeight:400, paddingInline:'0.5rem',borderRadius:'0.25rem', width:'fit-content'}}>
                                            Закрыть
                                        </button>
                                    </div>
                                )}

                                {aiDescStatus === 'succes' && (
                                    <div>
                                            <h4>Ответ AI</h4>
                                            <p style={{ whiteSpace: 'pre-line', margin: '10px 0' }}>{aidescription}</p>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                <button
                                                    type="button"
                                                    className="submitForm"
                                                    style={{ padding: '4px 12px', height: 'auto' }}
                                                    onClick={() => {
                                                        fieldChange('description', String(aidescription));
                                                        setIsDescPopoverOpen(false);
                                                    }}
                                                >
                                                    Применить
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cancelFormChanges"
                                                    style={{ padding: '4px 12px', height: 'auto' }}
                                                    onClick={() => setIsDescPopoverOpen(false)}
                                                >
                                                    Закрыть
                                                </button>
                                            </div>
                                    </div>
                                )}
                            </div>
                        }
                    >
                        <button 
                            className='ai-btn improve-desc'
                            onClick={handleGetAiDescription}
                            type='button'
                            disabled={aiDescLoading || !formParams.title.trim()}
                        >
                            {aiDescLoading 
                                ? 'Выполняется запрос' 
                                : isAiDescRequested
                                    ? 'Повторить запрос'
                                    : formParams.description 
                                        ? 'Улучшить описание'
                                        : 'Придумать опсиание'
                            }
                        </button>
                    </Popover>
                    
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
                        onClick={() => {
                            if (id) localStorage.removeItem(draftKey(id));
                            navigate(fromPath, { replace: true });
                        }}
                    >
                        Отменить
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AdEdit;