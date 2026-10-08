import {useState, useEffect, type ChangeEvent } from 'react'
import './AdsList.css'
import AdItem from '../../components/AdItem/AdItem'
import {Switch} from 'antd';

// тип объявления
type AdItem = {
    id: string | number,
    category:"auto" | "real_estate" | "electronics",
    title:string,
    price:number,
    needsRevesion:boolean
}

// тип получаемого списка объявлений
type ItemsGetOut = {
    items: AdItem[],
    total:number
}

// тип для фильтрации
type Filters = {
    category: string[],
    needsRevision:boolean
}

function AdList(){
    const [items, setItems] = useState<AdItem[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // состояние для строки поиска
    const [searchQuery, setSearchQuery] = useState<string>('');
    // состояние для фильтров
    const [filters, setFilters] = useState<Filters>({category:[], needsRevision:false});
    
    // состояние для пагинации
    const [currentPage, setCurrentPage] = useState<number>(1);

    const itemsPerPage: number = 10;
    const itemsCategories = ["auto", "real_estate", "electronics"];

    // русификация категорий
    const categoryNames: Record<string, string> = {
        auto: "Транспорт",
        real_estate: "Недвижимость",
        electronics: "Электроника"
    }
    const skip = (currentPage - 1) * itemsPerPage;
    const totalPages = Math.ceil(totalItems/itemsPerPage);
    
    // ф-я получения товаров с сервера
    const getItems = async() => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                limit:itemsPerPage.toLocaleString(),
                skip:skip.toLocaleString()
            })

            if(searchQuery.trim()){
                queryParams.append('q', searchQuery.trim());
            }

            if (filters.category.length > 0){
                queryParams.append('categories', filters.category.join(','));
            }

            if(filters.needsRevision){
                queryParams.append('needsRevision', 'true')
            }

            const response = await fetch(`/items?${queryParams.toString()}`);

            if (!response.ok){
                throw new Error('не удалось загрузить объявления');
            }

            const data: ItemsGetOut = await response.json();

            setItems(data.items);
            setTotalItems(data.total);

        } catch (error: any) {
            setError(error.message || 'произошла ошибка получения объявлений');
            console.log(error) 
        }finally{
            setIsLoading(false);
        }
    }

    // обновление получения товаров при фильтрации
    useEffect(()=>{
        getItems();
    }, [filters.category, filters.needsRevision, searchQuery, currentPage])

    // ф-я обновления категорий
    const handleCategoryChange = (category: string) => {
        setFilters(prev => {
            const currentCategories = prev.category || [];
            let updateCategories;

            if(currentCategories.includes(category)){
                updateCategories= currentCategories.filter(c => c!=category);
            }else{
                updateCategories = [...currentCategories, category]
            }
            return{
                ...prev,
                category:updateCategories
            }
        })
        setCurrentPage(1);
    }
    // изменение фильтра "требующие доработки"
    const handleToggleNeedsRevision = () => {
        setFilters(prev => ({...prev, needsRevision:!prev.needsRevision}))
        setCurrentPage(1);
    } 

    // изменение строки поиска
    const handleSearch = (e:ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    }

    // ф-я сброса фильтров
    const resetFilters = () => {
        setFilters({category:[], needsRevision:false})
        setCurrentPage(1)
    }
    const filtersEmpty = filters.category.length > 0 || filters.needsRevision;
    return(
        <>
            <div className='ads '>
                <div className="ads-list__header">
                    <h2 className='font-medium'>Мои объявления</h2>
                    <p className='text-[#848388] font-normal'>{totalItems} объявления</p>
                </div>
                <div className="ads-list__search">
                    <div className="search">
                        <input 
                            type="text" 
                            className='search-input'
                            placeholder='Найти объявление...'
                            value={searchQuery}
                            onChange={handleSearch}
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
                                {itemsCategories.map((category:string) => {
                                
                                const isChecked = filters.category?.includes(category) || false;

                                return (
                                    <label key={category} className='filter-item-category'>
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked}
                                            onChange={() => handleCategoryChange(category)}
                                        />
                                        <span>{categoryNames[category]}</span>
                                    </label>
                                )
                                    
                            })}
                            </div>
                            <div className='divider-filters-line'></div>
                            <div className="filter-toggle">
                                <span className='font-bold'>Только требующие доработок</span>
                                <Switch
                                    checked={filters.needsRevision} 
                                    onChange={handleToggleNeedsRevision} 
                                />
                            </div>
                        </div>
                        <button 
                            className={`reset-filters`}
                            onClick={resetFilters}
                            disabled={!filtersEmpty}
                        >
                                Сбросить фильтры
                        </button>
                    </div>
                    <div className="ads-feed-container">
                        <div className='ads-items'>
                            {items.map(item => (
                                <AdItem
                                    key={item.id}
                                    category={categoryNames[item.category]}
                                    name={item.title}
                                    price={item.price}
                                />
                        ))}
                        </div>
                        {totalPages > 1 && (
                            <div className='pagination'>
                                <button    
                                    className={`pageNum-btn  ${currentPage > 1 ? 'active-back' : ''}`}
                                    onClick={ () => currentPage > 1 && setCurrentPage(prev=> prev-1) }
                                    disabled={currentPage === 1}
                                >
                                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://w3.org">
                                        <path d="M5 9L1 5L5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                {Array.from({length:totalPages}, (_, index) => {
                                    const pageNumber = index + 1;
                                    const isBtnActive = currentPage === pageNumber;

                                    return (
                                        <div className='pagination-btns'>
                                            <button 
                                                key={pageNumber}
                                                className={`pageNum-btn ${isBtnActive ? 'active' : ''}`}
                                                onClick={()=>setCurrentPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        </div>
                                    )
                                })}
                                <button 
                                    className='pageNum-btn'
                                    onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
                                    disabled ={currentPage == totalPages}
                                >
                                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://w3.org">
                                        <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                        
                    </div>
                    
                </div>
            </div>
        </>
        
    )
}

export default AdList;
