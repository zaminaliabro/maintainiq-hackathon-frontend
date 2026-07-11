import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import NavbarAuth from "./components/navbar";
import AssetList from "./components/AssetList";
import PublicAssetPage from "./page/PublicAssetPage";

// Layout jo har internal page par Navbar dikhata hai
function DashboardLayout() {
  return (
    <>
      <NavbarAuth />
      <AssetList />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Internal / admin side — navbar ke saath */}
        <Route path="/" element={<DashboardLayout />} />

        {/* Public QR page — koi navbar/login nahi, safe info hi dikhta hai */}
        <Route path="/assets/public/:assetCode" element={<PublicAssetPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
