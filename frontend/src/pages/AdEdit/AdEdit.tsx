import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './AdEdit.css'
import { Input } from 'antd';
import type { Item , ItemUpdateIn} from '../../types';

type EditableAd = ItemUpdateIn & {id:string | number};


function AdEdit(){
    const {id} = useParams<{id:string}>();
    const [adInfo, setAdInfo] = useState<Item | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean | null>(null);


    // ф-я получения данных об объявлении
    useEffect(() => {
        const loadAdInfo = async() => {
            if(!id) return;

            try {
                const res = await fetch(`/items/${id}`);
                if(!res){
                    throw new Error('ошибка обращения к url объявления');

                }
            } catch (error) {
                
            }

        }
    }, [id])

    return(
        <div className="edit-container">
            <h1>Редактирование объявления</h1>
            <form action="" className='edit-form'>
                <div className="edit edit-category">
                    <label htmlFor="">Категория</label>
                    <select name="" id="" required>
                        <option value=""></option>
                    </select>
                </div>
                <div className="divider-line"></div>
                <div className="edit edit-title">
                    <label htmlFor="">Название</label>
                    <Input required/>
                </div>
                <div className="divider-line"></div>
                <div className="edit edit-price">
                    <label htmlFor="">Цена</label>
                    <Input required/>
                </div>
                <div className="divider-line"></div>
                <div className="edit edit-cahracteristics">

                </div>
                <div className="divider-line"></div>
                <div className="edit edit-desc">
                    <label htmlFor="">Описание</label>
                    <Input/>
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