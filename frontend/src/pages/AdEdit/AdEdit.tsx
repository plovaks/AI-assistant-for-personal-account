import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
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
import { adEditUiStore } from '../../stores/adEditUi.store';
import { adDetailsStore } from '../../stores/adDetails.store';

type EditableAd = AdFeatures;

const selectCategoryOptions = itemsCategories.map(element => ({
    value:element,
    label:categoryNames[element]
}));
const draftKey = (id: string) => `ad-draft-${id}`;

const AdEdit = observer(() => {
    const {id} = useParams<{id:string}>();
    const navigate = useNavigate();
    const location = useLocation();
    const fromPath = location.state?.from || `/ad/${id}`;

    // ф-я получения данных об объявлении
    useEffect(() => {
        if (!id) return;
        const initData = async() => {
            if(!adDetailsStore.ad || adDetailsStore.ad.id !== id){
                await adDetailsStore.fetchAdById(id)
            }

            if(adDetailsStore.ad){
                const saved = localStorage.getItem(draftKey(id));
                adEditUiStore.initForm(adDetailsStore.ad,saved);
            }
        }

        initData();
        return () => {
            adEditUiStore.clearUiState();
        }
        
    }, [id]);

    useEffect(() => {
        if (!id || !adEditUiStore.formParams || adEditUiStore.formParams === adDetailsStore.ad) return;
        localStorage.setItem(draftKey(id), JSON.stringify(adEditUiStore.formParams));
    }, [adEditUiStore.formParams, id]);

    if (adDetailsStore.loading || !adEditUiStore.formParams) {
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
    
    if (adDetailsStore.error){
    return (
        <Result
            status="error"
            title="Не удалось загрузить форму редактирования"
            subTitle="Проверьте соединение и попробуйте ещё раз"
            extra={[
                <Button type="primary" key="retry" onClick={() => id && adDetailsStore.fetchAdById(id)}>
                    Повторить
                </Button>,
                <Button key="back" onClick={() => navigate(`/ads`)}>
                    К списку объявлений
                </Button>,
            ]}
        />
    );
}

    const formParams = adEditUiStore.formParams;

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

            const res = await adDetailsStore.updatedAd(id,bodyToSend);
            message.success('Изменения сохранены')
            localStorage.removeItem(draftKey(id));
            navigate(fromPath, { replace: true });
            
        } catch (error) {
            console.error('не удалось сохранить изменения:', error);
            message.error('Ошибка сохранения. При попытке сохранить изменения произошла ошибка.')
        }
    }

    const isEmptyValue = (val: any): boolean => {
        if (val === undefined || val === null) return true;
        if (typeof val === 'string') return val.trim() === '';
        return false;
    };

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
                        onChange={(value) => adEditUiStore.changeCategory(value, adDetailsStore.ad)}
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
                        onChange={(e)=> adEditUiStore.changeField('title',e.target.value)}
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
                            onChange={(e) => adEditUiStore.changeField('price', Number(e.target.value))}

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
                            open={adEditUiStore.isPopoverOpen}
                            onOpenChange={(open) => adEditUiStore.setPopoverOpen(open)}
                            placement="top"
                            align={{offset:[80, -10] }}
                            content={
                                <div style={{ maxWidth: '21rem' ,}}>
                                    {/* {aiStatus === 'loading' && <p>Анализ данных о товаре...</p>} */}
                                    {adEditUiStore.aiStatus === 'error' && (
                                        <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                                            <h4 style={{fontWeight:500, color:'rgba(192, 15, 12, 1)'}}>Произошла ошибка при запросе к AI</h4>
                                            <p style={{ color: 'rgba(30, 30, 30, 1)' }}>
                                                Попробуйте повторить запрос или закройте уведомление
                                            </p>
                                            <button type="button" onClick={() => adEditUiStore.setPopoverOpen(false)} style={{backgroundColor:'rgba(252, 179, 173, 1)', color:'rgba(0, 0, 0, 0.85)', fontWeight:400, paddingInline:'0.5rem',borderRadius:'0.25rem', width:'fit-content'}}>
                                                Закрыть
                                            </button>
                                        </div>
                                    )}
                                    {adEditUiStore.aiStatus === 'success' && (
                                        <div>
                                            <h4>Ответ AI</h4>
                                            <p><b>Рекомендуемая цена: {adEditUiStore.aiParsedPrice?.toLocaleString('ru-RU')} ₽</b></p>
                                            <p style={{ whiteSpace: 'pre-line', margin: '10px 0' }}>{adEditUiStore.aiResponse}</p>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                <button
                                                    type="button"
                                                    className="submitForm"
                                                    style={{ padding: '4px 12px', height: 'auto' }}
                                                    onClick={() => {
                                                        if (adEditUiStore.aiParsedPrice !== null) adEditUiStore.changeField('price', adEditUiStore.aiParsedPrice);
                                                        adEditUiStore.setPopoverOpen(false);
                                                    }}
                                                >
                                                    Применить
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cancelFormChanges"
                                                    style={{ padding: '4px 12px', height: 'auto' }}
                                                    onClick={() => adEditUiStore.setPopoverOpen(false)}
                                                >
                                                    Закрыть
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            }
                           
                        >
                            <button type="button" onClick={adEditUiStore.getAiPrice} disabled={adEditUiStore.aiLoading} className='ai-btn'>
                                {adEditUiStore.aiLoading 
                                    ? 'Выполняется запрос' 
                                    : adEditUiStore.isAiRequestedBefore 
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
                                    const isParamEmty = isEmptyValue(currentValue);
                                    return (
                                        <div key={key} className="edit-param-field">
                                            <label className='edit-param-label'>{label}</label>
                                            <Input 
                                                className={`${isParamEmty ? 'input-empty': ''}`}
                                                value={currentValue ?? ''} 
                                                onChange={(e) => adEditUiStore.changeParam(key, e.target.value)}
                                            />
                                        </div>
                                    );
                                })
                            case 'real_estate':
                            return Object.entries(realEstateLabels).map(([key, label]) => {
                                const params = currentParams as RealEstateItemParams;
                                const currentValue = params[key as keyof RealEstateItemParams];
                                const isParamEmty = isEmptyValue(currentValue);
                                return (
                                    <div key={key} className="edit-param-field">
                                        <label className='edit-param-label'>{label}</label>
                                        <Input 
                                            className={`${isParamEmty ? 'input-empty': ''}`}
                                            value={currentValue ?? ''}
                                            onChange={(e) => adEditUiStore.changeParam(key, e.target.value)}
                                        />
                                    </div>
                                );
                            });
                            case 'electronics':
                            return Object.entries(electronicsLabels).map(([key, label]) => {
                                const params = currentParams as ElectronicsItemParams;
                                const currentValue = params[key as keyof ElectronicsItemParams];
                                const isParamEmty = isEmptyValue(currentValue);
                                return (
                                    <div key={key} className="edit-param-field">
                                        <label className='edit-param-label'>{label}</label>
                                        <Input 
                                            className={`${isParamEmty ? 'input-empty': ''}`}
                                            value={currentValue ?? ''}
                                            onChange={(e) => adEditUiStore.changeParam(key, e.target.value)}
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
                        onChange={(e) => adEditUiStore.changeField('description', e.target.value)}
                        value={formParams?.description}
                        maxLength={1000}
                        showCount
                        autoSize={{ minRows: 4, maxRows: 8 }}
                    />
                    <Popover
                        open={adEditUiStore.isDescPopoverOpen}
                        trigger={'click'}
                        onOpenChange={(open) => adEditUiStore.setDescPopoverOpen(open)}
                        placement="top"
                        align={{offset:[80, -10] }}
                        content={
                            <div style={{ maxWidth: '21rem'}}>
                                {adEditUiStore.aiDescStatus === 'error' && (
                                    <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                                        <h4 style={{fontWeight:500, color:'rgba(192, 15, 12, 1)'}}>Произошла ошибка при запросе к AI</h4>
                                        <p style={{ color: 'rgba(30, 30, 30, 1)' }}>
                                            Попробуйте повторить запрос или закройте уведомление
                                        </p>
                                        <button type="button" onClick={() => adEditUiStore.setDescPopoverOpen(false)} style={{backgroundColor:'rgba(252, 179, 173, 1)', color:'rgba(0, 0, 0, 0.85)', fontWeight:400, paddingInline:'0.5rem',borderRadius:'0.25rem', width:'fit-content'}}>
                                            Закрыть
                                        </button>
                                    </div>
                                )}
                                

                                {adEditUiStore.aiDescStatus === 'success' && (
                                    <div>
                                            <h4>Ответ AI</h4>
                                            <p style={{ whiteSpace: 'pre-line', margin: '10px 0' }}>{adEditUiStore.aidescription}</p>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                <button
                                                    type="button"
                                                    className="submitForm"
                                                    style={{ padding: '4px 12px', height: 'auto' }}
                                                    onClick={() => {
                                                        adEditUiStore.changeField('description', String(adEditUiStore.aidescription));
                                                        adEditUiStore.setDescPopoverOpen(false);
                                                    }}
                                                >
                                                    Применить
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cancelFormChanges"
                                                    style={{ padding: '4px 12px', height: 'auto' }}
                                                    onClick={() => adEditUiStore.setDescPopoverOpen(false)}
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
                            onClick={adEditUiStore.getAiDescription}
                            type='button'
                            disabled={adEditUiStore.aiDescLoading || !formParams.title.trim()}
                        >
                            {adEditUiStore.aiDescLoading 
                                ? 'Выполняется запрос' 
                                : adEditUiStore.isAiDescRequested
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
                        disabled={adEditUiStore.isFormInvalid}
                        
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
})


export default AdEdit;