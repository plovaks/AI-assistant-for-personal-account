import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ItemsGetOut, AdItem } from "../AdsList/AdsList";
import img from "../../assets/placeholder-image.png"

type AdFeatures = AdItem & {
    createdAt:string,
    updatedAt:string
}

function Ad(){
    const {id} = useParams<{id:string}>();
    // состояние для объявления
    const [ad, setAd] = useState<AdFeatures | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean | null>(null);


    useEffect(() => {
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

    return(
        <div className="ad">
            <div className="ad__header">
                <h1>{ad?.title}</h1>
                <button className="edit-btn">Редактировать</button>
                <p>{ad?.price}</p>
                <p>Опубликовано: {ad?.createdAt}</p>
                <p>Отредактировано: {ad?.updatedAt}</p>
            </div>
            <div className="divider-line"></div>
            <div className="ad__main">
                <img src={img} alt="placeholder-img" />
                <h3>Описание</h3>
                <p></p>
            </div>
            <div className="ad__characteristics">
                {ad?.needsRevision && (
                    <></>
                )}
            </div>
        </div>
    )
}

export default Ad;