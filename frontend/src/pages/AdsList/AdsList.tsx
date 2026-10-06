import './AdsList.css'
import AddressBar from '../../components/AddressBar/AddressBar'

function AdList(){
    return(
        <>
            <AddressBar/>
            <div className='ads'>
            <div className="ads-list__header">

            </div>
            <div className="ads-list__search">

            </div>
            <div className="ads-list__feed">
                <div className="ads-feed-filters"></div>
                <div className="ads-feed-container"></div>
            </div>
        </div>
        </>
        
    )
}

export default AdList;
