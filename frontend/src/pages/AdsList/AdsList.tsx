import {useState, useEffect, type ChangeEvent } from 'react'
import {Link} from "react-router-dom"
import './AdsList.css'
import AdItem from '../../components/AdItem/AdItem'
import {Switch, Result, Button} from 'antd';
import type {Item, ItemsGetOut, Filters, Sort} from "../../types"
import { categoryNames, itemsCategories } from '../../types';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

function AdList(){
    const [items, setItems] = useState<Item[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    // состояние для строки поиска
    const [searchQuery, setSearchQuery] = useState<string>('');
    // состояние для фильтров
    const [filters, setFilters] = useState<Filters>({category:[], needsRevision:false});
    
    // состояние для пагинации
    const [currentPage, setCurrentPage] = useState<number>(1);

    // состояние для сортировки
    const [sort, setSort] = useState<Sort>({column:'', direction:''})

    const itemsPerPage: number = 10;
    
    
    const skip = (currentPage - 1) * itemsPerPage;
    const totalPages = Math.ceil(totalItems/itemsPerPage);
    
    // ф-я изменения сортировки
    const handleSortChange = (sortType:string) => {
        const sortColumn = sortType.split('-')[0];
        const sortDirection = sortType.split('-')[1];
        setSort({column: sortColumn as 'title' | 'createdAt' | '', direction:sortDirection as 'asc' | 'desc'});
        setCurrentPage(1);
    }

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

            if(sort.column && sort.direction){
                queryParams.append('sortColumn', sort.column)
                queryParams.append('sortDirection', sort.direction)
            }

            const response = await fetch(`/items?${queryParams.toString()}`);

            if (!response.ok){
                throw new Error('не удалось загрузить объявления');
            }

            const data: ItemsGetOut = await response.json();

            setItems(data.items);
            // sconsole.log(data.items)
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
    }, [filters.category, filters.needsRevision, searchQuery, currentPage, sort,reloadKey])

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

    if (!isLoading && error) {
        return (
            <Result
                status="error"
                title="Не удалось загрузить объявления"
                subTitle="Проверьте соединение и попробуйте ещё раз"
                extra={[
                    <Button type="primary" key="retry" onClick={() => setReloadKey(k => k + 1)}>
                        Повторить
                    </Button>,
                ]}
            />
        );
    }
    return(
        <>
            {isLoading ?(
                <div className='ads'>
                    <div className="ads-list__header">
                        <h2><Skeleton width={180} /></h2>
                        <p><Skeleton width={100} /></p>
                    </div>
                    <div className="ads-list__search">
                        <div className="search">
                            <div >
                                <Skeleton width="100%"/>
                            </div>
                        </div>
                        <div >
                            <Skeleton width={200}  />
                        </div>
                    </div>

                    <div className="ads-list__feed">
                        <div className="ads-feed-filters-container">
                            <div className="filters">
                                <h3><Skeleton width={100} /></h3>
                                <p><Skeleton width={80} /></p>
                                <div className='dropdown-content'>
                                    {itemsCategories.map((category: string, index) => (
                                        <label key={index} className='filter-item-category' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Skeleton circle width={16} height={16} />
                                            <Skeleton width={120} />
                                        </label>
                                    ))}
                                </div>
                                <div className='divider-filters-line'></div>
                                <div className="filter-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span><Skeleton width={150} /></span>
                                    <Skeleton width={44} height={22} borderRadius={100} />
                                </div>
                            </div>
                            <div>
                                <Skeleton width="100%" height={40}/>
                            </div>
                        </div>
                        <div className="ads-feed-container">
                            <div className='ads-items'>
                                {Array.from({ length: itemsPerPage }).map((_, index) => (
                                    <AdItem key={index} isLoading={true} category="" name='' price={0} needsRevision={true}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )
            :
            (<div className='ads '>
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
                        <select 
                            name="select-sort" 
                            id="sort"
                            onChange={(e) => handleSortChange(e.target.value)}
                            value={sort.column ? `${sort.column}-${sort.direction}` : ""}
                        >
                             <option value="">Сортировка по умолчанию</option>
                            <option value="title-asc">{ `По названию (А -> Я)`}</option>
                            <option value="title-desc">{ `По названию (Я -> А)`}</option>

                            <option value="createdAt-desc">{ `По новизне (сначала новые)`}</option>
                            <option value="createdAt-asc">{ `По новизне (сначала старые)`}</option>

                        </select>
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
                                <Link to={`/ad/${item.id}`} key={item.id}>
                                    <AdItem
                                        category={categoryNames[item.category]}
                                        name={item.title}
                                        price={item.price}
                                        needsRevision={item.needsRevision}
                                        isLoading={isLoading}
                                    />
                                </Link> 
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
            </div>)
        }       
        </>
        
    )
}

export default AdList;
