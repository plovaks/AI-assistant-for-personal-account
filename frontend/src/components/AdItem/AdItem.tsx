import './AdItem.css'
import placeholderImg from "../../assets/placeholder-image.png"

type AdItemProps = {
    category:string,
    name:string,
    price:number
}

function AdItem ({category, name, price} : AdItemProps){
    return (
        <div className='item-container'>
            <div className='item-img-container'>
                <img src={placeholderImg} alt="item image" />
                <p className='item-category'>{category}</p>
            </div>
            
            <div className='item-body-container'>
                <p className='item-name'>{name}</p>
                <p className='item-price'>{price} {'\u20BD'}</p>
            </div>
        </div>
    )
}

export default AdItem;