import {useState, useEffect, type ChangeEvent } from 'react'
import {Link} from "react-router-dom"
import { observer } from 'mobx-react-lite'
import { adsUiStore } from '../../stores/adsui.store'
import { itemsStore } from '../../stores/items.store'
import './AdsList.css'
import AdItem from '../../components/AdItem/AdItem'
import {Switch, Result, Button} from 'antd';
import type {Item, ItemsGetOut, Filters, Sort,View} from "../../types"
import { categoryNames, itemsCategories } from '../../types';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

const AdList = observer(() => {
   
    useEffect(()=>{

        const params = {
            limit:adsUiStore.itemsPerPage,
            skip:adsUiStore.skip,
            searchQuery: adsUiStore.searchQuery,
            categories: adsUiStore.categoryFilters,
            needsRevision: adsUiStore.needsRevision,
            sort: adsUiStore.sort
        };
        itemsStore.fetchItems(params);

    }, [
            adsUiStore.currentPage,
            adsUiStore.searchQuery,
            adsUiStore.categoryFilters.length, 
            adsUiStore.needsRevision,
            adsUiStore.sort.column,
            adsUiStore.sort.direction,
            adsUiStore.itemsPerPage
    ])

    
    const totalPages = itemsStore.getTotalPages(adsUiStore.itemsPerPage);
    if (!itemsStore.isLoading && itemsStore.error) {
        return (
            <Result
                status="error"
                title="Не удалось загрузить объявления"
                subTitle="Проверьте соединение и попробуйте ещё раз"
                extra={[
                    <Button type="primary" key="retry" onClick={() => itemsStore.fetchItems({
                        limit: adsUiStore.itemsPerPage,
                        skip: adsUiStore.skip,
                        searchQuery: adsUiStore.searchQuery,
                        categories: adsUiStore.categoryFilters,
                        needsRevision: adsUiStore.needsRevision,
                        sort: adsUiStore.sort
                    })}>
                        Повторить
                    </Button>,
                ]}
            />
        );
    }

    return(
        <>
            {itemsStore.isLoading ?(
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
                            <div className={adsUiStore.displayType === 'grid' ? 'ads-items-grid' : 'ads-items-row'}>
                                {Array.from({ length: adsUiStore.itemsPerPage }).map((_, index) => (
                                    <AdItem key={index} isLoading={true} category="" name="" price={0} needsRevision={false} />
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
                    <p className='text-[#848388] font-normal'>{itemsStore.totalItems} объявления</p>
                </div>
                <div className="ads-list__search">
                    <div className="search">
                        <input 
                            type="text" 
                            className='search-input'
                            placeholder='Найти объявление...'
                            value={adsUiStore.searchQuery}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => adsUiStore.setSearchQuery(e.target.value)}
                        />
                        <button className='search-btn'>
                           
                        </button>
                    </div>
                    <div className="layout">
                        <button
                            style={{cursor:"pointer"}}
                            className={`layout-btn ${adsUiStore.displayType === 'grid' ? 'active' : ''}`}
                            onClick={() => adsUiStore.setDisplayType('grid')}
                        >
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className='layout-icon'>
                                <path d="M6.42857 0H0.321429C0.144643 0 0 0.144643 0 0.321429V6.42857C0 6.60536 0.144643 6.75 0.321429 6.75H6.42857C6.60536 6.75 6.75 6.60536 6.75 6.42857V0.321429C6.75 0.144643 6.60536 0 6.42857 0ZM5.38393 5.38393H1.36607V1.36607H5.38393V5.38393ZM14.4643 0H8.35714C8.18036 0 8.03572 0.144643 8.03572 0.321429V6.42857C8.03572 6.60536 8.18036 6.75 8.35714 6.75H14.4643C14.6411 6.75 14.7857 6.60536 14.7857 6.42857V0.321429C14.7857 0.144643 14.6411 0 14.4643 0ZM13.4196 5.38393H9.40179V1.36607H13.4196V5.38393ZM6.42857 8.03572H0.321429C0.144643 8.03572 0 8.18036 0 8.35714V14.4643C0 14.6411 0.144643 14.7857 0.321429 14.7857H6.42857C6.60536 14.7857 6.75 14.6411 6.75 14.4643V8.35714C6.75 8.18036 6.60536 8.03572 6.42857 8.03572ZM5.38393 13.4196H1.36607V9.40179H5.38393V13.4196ZM14.4643 8.03572H8.35714C8.18036 8.03572 8.03572 8.18036 8.03572 8.35714V14.4643C8.03572 14.6411 8.18036 14.7857 8.35714 14.7857H14.4643C14.6411 14.7857 14.7857 14.6411 14.7857 14.4643V8.35714C14.7857 8.18036 14.6411 8.03572 14.4643 8.03572ZM13.4196 13.4196H9.40179V9.40179H13.4196V13.4196Z" />
                            </svg>
                        </button>
                        <span style={{color:'rgba(255, 255, 255, 1)'}}>|</span>
                        <button
                            style={{cursor:"pointer"}}
                            className={`layout-btn ${adsUiStore.displayType === 'row' ? 'active' : ''}`}
                            onClick={() => adsUiStore.setDisplayType('row')}
                        >
                            <svg width="17" height="14" viewBox="0 0 17 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className='layout-icon' aria-hidden="true">
                                <path d="M16.2321 0.401786H4.5C4.41161 0.401786 4.33929 0.474107 4.33929 0.5625V1.6875C4.33929 1.77589 4.41161 1.84821 4.5 1.84821H16.2321C16.3205 1.84821 16.3929 1.77589 16.3929 1.6875V0.5625C16.3929 0.474107 16.3205 0.401786 16.2321 0.401786ZM16.2321 6.10714H4.5C4.41161 6.10714 4.33929 6.17946 4.33929 6.26786V7.39286C4.33929 7.48125 4.41161 7.55357 4.5 7.55357H16.2321C16.3205 7.55357 16.3929 7.48125 16.3929 7.39286V6.26786C16.3929 6.17946 16.3205 6.10714 16.2321 6.10714ZM16.2321 11.8125H4.5C4.41161 11.8125 4.33929 11.8848 4.33929 11.9732V13.0982C4.33929 13.1866 4.41161 13.2589 4.5 13.2589H16.2321C16.3205 13.2589 16.3929 13.1866 16.3929 13.0982V11.9732C16.3929 11.8848 16.3205 11.8125 16.2321 11.8125ZM0 1.125C-2.20145e-09 1.27274 0.029099 1.41903 0.0856356 1.55552C0.142172 1.69201 0.225039 1.81603 0.329505 1.9205C0.433971 2.02496 0.55799 2.10783 0.694481 2.16436C0.830973 2.2209 0.977263 2.25 1.125 2.25C1.27274 2.25 1.41903 2.2209 1.55552 2.16436C1.69201 2.10783 1.81603 2.02496 1.9205 1.9205C2.02496 1.81603 2.10783 1.69201 2.16436 1.55552C2.2209 1.41903 2.25 1.27274 2.25 1.125C2.25 0.977263 2.2209 0.830973 2.16436 0.694481C2.10783 0.55799 2.02496 0.433971 1.9205 0.329505C1.81603 0.225039 1.69201 0.142172 1.55552 0.0856354C1.41903 0.0290989 1.27274 0 1.125 0C0.977263 0 0.830973 0.0290989 0.694481 0.0856354C0.55799 0.142172 0.433971 0.225039 0.329505 0.329505C0.225039 0.433971 0.142172 0.55799 0.0856356 0.694481C0.029099 0.830973 -2.20145e-09 0.977263 0 1.125V1.125ZM0 6.83036C-2.20145e-09 6.97809 0.029099 7.12439 0.0856356 7.26088C0.142172 7.39737 0.225039 7.52139 0.329505 7.62585C0.433971 7.73032 0.55799 7.81319 0.694481 7.86972C0.830973 7.92626 0.977263 7.95536 1.125 7.95536C1.27274 7.95536 1.41903 7.92626 1.55552 7.86972C1.69201 7.81319 1.81603 7.73032 1.9205 7.62585C2.02496 7.52139 2.10783 7.39737 2.16436 7.26088C2.2209 7.12439 2.25 6.97809 2.25 6.83036C2.25 6.68262 2.2209 6.53633 2.16436 6.39984C2.10783 6.26335 2.02496 6.13933 1.9205 6.03486C1.81603 5.9304 1.69201 5.84753 1.55552 5.79099C1.41903 5.73446 1.27274 5.70536 1.125 5.70536C0.977263 5.70536 0.830973 5.73446 0.694481 5.79099C0.55799 5.84753 0.433971 5.9304 0.329505 6.03486C0.225039 6.13933 0.142172 6.26335 0.0856356 6.39984C0.029099 6.53633 -2.20145e-09 6.68262 0 6.83036V6.83036ZM0 12.5357C-2.20145e-09 12.6835 0.029099 12.8297 0.0856356 12.9662C0.142172 13.1027 0.225039 13.2267 0.329505 13.3312C0.433971 13.4357 0.55799 13.5185 0.694481 13.5751C0.830973 13.6316 0.977263 13.6607 1.125 13.6607C1.27274 13.6607 1.41903 13.6316 1.55552 13.5751C1.69201 13.5185 1.81603 13.4357 1.9205 13.3312C2.02496 13.2267 2.10783 13.1027 2.16436 12.9662C2.2209 12.8297 2.25 12.6835 2.25 12.5357C2.25 12.388 2.2209 12.2417 2.16436 12.1052C2.10783 11.9687 2.02496 11.8447 1.9205 11.7402C1.81603 11.6358 1.69201 11.5529 1.55552 11.4964C1.41903 11.4398 1.27274 11.4107 1.125 11.4107C0.977263 11.4107 0.830973 11.4398 0.694481 11.4964C0.55799 11.5529 0.433971 11.6358 0.329505 11.7402C0.225039 11.8447 0.142172 11.9687 0.0856356 12.1052C0.029099 12.2417 -2.20145e-09 12.388 0 12.5357V12.5357Z"  fillOpacity="0.85"/>
                            </svg>

                        </button>

                    </div>
                    <div className="select-filter">
                        <select 
                            name="select-sort" 
                            id="sort"
                            onChange={(e) => adsUiStore.setSort(e.target.value)}
                            value={adsUiStore.sort.column ? `${adsUiStore.sort.column}-${adsUiStore.sort.direction}` : ""}
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
                                
                                const isChecked = adsUiStore.categoryFilters.includes(category);

                                return (
                                    <label key={category} className='filter-item-category'>
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked}
                                            onChange={() => adsUiStore.toggleCategory(category)}
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
                                    checked={adsUiStore.needsRevision} 
                                    onChange={() => adsUiStore.toggleNeedsRevision()}
                                />
                            </div>
                        </div>
                        <button 
                            className={`reset-filters`}
                            onClick={() => adsUiStore.resetFilters()}
                            disabled={!adsUiStore.isFiltersEmpty}
                        >
                                Сбросить фильтры
                        </button>
                    </div>
                    <div className="ads-feed-container">
                        <div className={adsUiStore.displayType === 'grid' ? 'ads-items-grid' : 'ads-items-row'}>
                            {itemsStore.items.map(item => (
                                <Link to={`/ad/${item.id}`} key={item.id}>
                                    <AdItem
                                        category={categoryNames[item.category]}
                                        name={item.title}
                                        price={item.price}
                                        needsRevision={item.needsRevision}
                                        isLoading={itemsStore.isLoading}
                                    />
                                </Link> 
                        ))}
                        </div>
                        {totalPages > 1 && (
                            <div className='pagination'>
                                <button    
                                    className={`pageNum-btn  ${adsUiStore.currentPage > 1 ? 'active-back' : ''}`}
                                    onClick={ () => adsUiStore.currentPage > 1 && adsUiStore.setCurrentPage(adsUiStore.currentPage - 1) }
                                    disabled={adsUiStore.currentPage === 1}
                                >
                                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://w3.org">
                                        <path d="M5 9L1 5L5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                {Array.from({length:totalPages}, (_, index) => {
                                    const pageNumber = index + 1;
                                    const isBtnActive = adsUiStore.currentPage === pageNumber;

                                    return (
                                        <div className='pagination-btns' key={pageNumber}>
                                            <button 
                                                
                                                className={`pageNum-btn ${isBtnActive ? 'active' : ''}`}
                                                onClick={()=>adsUiStore.setCurrentPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        </div>
                                    )
                                })}
                                <button 
                                    className='pageNum-btn'
                                    onClick={() => adsUiStore.currentPage < totalPages && adsUiStore.setCurrentPage(adsUiStore.currentPage + 1)}
                                    disabled ={adsUiStore.currentPage == totalPages}
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
})


export default AdList;
