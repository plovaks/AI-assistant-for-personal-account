import { useMemo, useState } from 'react'
import './AdsList.css'
import iconImg from "../../assets/icon-wrapper.svg"
import items from "../../../../server/data/items.json"
import AdItem from '../../components/AdItem/AdItem'

function AdList(){
    // переменные для пагинации
    const [currentPage, setCurruntPage] = useState<number>(1);
    const itemsPerPage: number = 10;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // карточки для текущей страницы
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    const itemsCategories: string[] = useMemo (() => {
        const categories = items.map(item => item.category);
        return [...new Set(categories)]
    }, []);

    return(
        <>
            <div className='ads '>
                <div className="ads-list__header">
                    <h2 className='font-medium'>Мои объявления</h2>
                    <p className='text-[#848388] font-normal'>{items.length} объявления</p>
                </div>
                <div className="ads-list__search">
                    <div className="search">
                        <input 
                            type="text" 
                            className='search-input'
                            placeholder='Найти объявление...'
                        />
                        <button className='search-btn'>
                           
                        </button>
                    </div>
                    <div className="layout">
                        <button>
                            
                        </button>

                        <button>

                        </button>

                    </div>
                    <div className="select-filter">

                    </div>
                </div>
                <div className="ads-list__feed">
                    <div className="ads-feed-filters-container">
                        <div className="filters">
                            <h3 className='font-medium'>Фильтры</h3>
                            <p>Категория</p>
                            <div className='dropdown-content'>
                                {itemsCategories.map((category:string) => (
                                    <label key={category} className='filter-item-category'>
                                        <input type="checkbox" />
                                        <span>{category}</span>
                                    </label>
                                ))}
                            </div>
                            <div className='divider-filters-line'></div>
                            <div className="filter-toggle">
                                <span className='font-bold'>Только требующие доработок</span>
                                <button></button>
                            </div>
                        </div>
                        <button>

                        </button>
                    </div>
                    <div className="ads-feed-container">
                        {currentItems.map(item => (
                            <AdItem
                                key={item.id}
                                category={item.category}
                                name={item.title}
                                price={item.price}
                            />
                        ))}
                        <div className='pagination'>
                            <button className='pagination-back'></button>
                            {Array.from({length:totalPages}, (_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button 
                                        key={pageNumber}
                                        className='pageNum-btn'
                                        onClick={()=>setCurruntPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                )
                            })}
                            <button className='pagination-right'></button>
                        </div>
                    </div>
                    
                </div>
            </div>
        </>
        
    )
}

export default AdList;
