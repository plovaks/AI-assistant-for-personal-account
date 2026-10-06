import './AddressBar.css'
import avitoImg from "../../assets/avito.svg"

function AddressBar(){
    return (
        <div className="w-full bg-[#FFFFFF] border-b border-[#e5e5e5] rounded-t-lg p-2 flex items-center justify-between select-none">
        <div className="flex gap-1.5 pl-2 w-1/4">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></span>
        </div>

        <div className="bg-[#3D3D3D33] text-[#3D3D3D] w-full flex items-center py-1 rounded-2">
            <img src={avitoImg} alt='avito img'/>
            <span >avito.ru</span>
        </div>

        <div className="w-1/4"></div>
        </div>
    )
}

export default AddressBar;