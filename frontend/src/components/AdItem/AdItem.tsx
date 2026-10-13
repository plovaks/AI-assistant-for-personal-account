import './AdItem.css'
import placeholderImg from "../../assets/placeholder-image.png"
import { Badge } from 'antd'

type AdItemProps = {
    category:string,
    name:string,
    price:number,
    needsRevision:boolean
}

function AdItem ({category, name, price, needsRevision} : AdItemProps){
    return (
        <div className='item-container'>
            <div className='item-img-container'>
                <img src={placeholderImg} alt="item image" />
                <p className='item-category'>{category}</p>
            </div>
            
            <div className='item-body-container'>
                <p className='item-name'>{name}</p>
                <p className='item-price'>{price} {'\u20BD'}</p>
                {needsRevision && (
                <div className='status-badge-container'>
                    <Badge status="warning" text="Требует доработок"/>
                </div>
            )}
            </div>
            
        </div>
    )
}

export default AdItem;