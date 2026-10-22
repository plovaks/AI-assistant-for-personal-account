import './AdItem.css'
import placeholderImg from "../../assets/placeholder-image.png"
import { Badge } from 'antd'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

type AdItemProps = {
    category:string,
    name:string,
    price:number,
    needsRevision:boolean,
    isLoading:boolean,
}

function AdItem ({category, name, price, needsRevision, isLoading} : AdItemProps){
    return (
        <>
            {isLoading ? 
                (
                    <div className='item-container'>
                        <div>
                            <p style={{paddingInline:'0.75rem'}}>
                                <Skeleton width={80} height={16} />
                            </p>
                        </div>
                    
                        <div className='item-body-container'>
                            <p className='item-name'>
                                <Skeleton width="90%" height={20} />
                            </p>
                            
                            <p className='item-price'>
                                <Skeleton width={60} height={18} />
                            </p>
                            <div >
                                <Skeleton width={130} height={20} borderRadius={4} />
                            </div>
                        </div>
                    </div>
                )
                : 
                (
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
        </>
        
        
    )
}

export default AdItem;