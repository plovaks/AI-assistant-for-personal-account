import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import './App.css'
import AdList from './pages/AdsList/AdsList'
import Ad from "./pages/Ad/Ad"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/ads"  replace />}/>
        <Route path="/ads" element={<AdList/>}/>
        <Route path="/ad/:id" element={<Ad/>}/>
      </Routes>

    </BrowserRouter>
  )
}

export default App
