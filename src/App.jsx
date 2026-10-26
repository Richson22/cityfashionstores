import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import Shop from './Pages/Shop.jsx'
import Categories from './Pages/Categories.jsx'
import Product from './Pages/Product.jsx'
import Cart from './Pages/Cart.jsx'
import Track from './Pages/Track.jsx'
import OrderSuccess from './Pages/OrderSuccess.jsx'
import Returns from './Pages/Returns.jsx'
import AdminLogin from './Admin/AdminLogin.jsx'
import Loader from './components/Loader.jsx'
import RequireAdmin from './Admin/RequireAdmin.jsx'
import AdminLayout from './Admin/AdminLayout.jsx'
import Overview from './Admin/Overview.jsx'
import Soon from './Admin/Soon.jsx'
import Products from './Admin/Products.jsx'
import AdminCategories from './Admin/Categories.jsx'
import Orders from './Admin/Orders.jsx'
import Banners from './Admin/Banners.jsx'
import Settings from './Admin/Settings.jsx'
import About from "./Pages/About.jsx";
import Policy from "./Pages/Policy.jsx";

function App() {
  return (
    <BrowserRouter>
      <Loader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/track" element={<Track />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/order-success/:no" element={<OrderSuccess />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Policy kind="terms" />} />
        <Route path="/privacy" element={<Policy kind="privacy" />} />
        <Route path="/shipping" element={<Policy kind="shipping" />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Overview />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="banners" element={<Banners />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Soon />} />
        
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App