import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import Icon from '../../shared/components/Icon';
import PrimaryButton from '../../shared/components/Button/PrimaryButton';
import { useAuthStore } from '../store/authStore';
import useAuth from '../../features/auth/hooks/useAuth';
import ROUTES from '../routes/routePaths';
import { useCartStore } from '../store/cartStore';
import CartDrawer from '../../features/cart/components/CartDrawer';
import { useCategories } from '../../features/categories/hooks/useCategory';
import { useCollections } from '../../features/collections/hooks/useCollection';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const { getTotalItems, openDrawer } = useCartStore();
  const { categoryTree } = useCategories();
  const { collections } = useCollections();

  
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'shop' | 'collections' | null
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuLevel, setMobileMenuLevel] = useState('main'); // 'main' | 'shop' | 'collections'
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = getTotalItems();
  const isHomePage = location.pathname === '/';

  // Listen to scroll for:
  // 1. Detecting when scrolled past Hero (for Homepage)
  // 2. Detecting scroll direction for Sticky on Scroll Up (for Non-homepage)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;

      // Threshold to detect when past Hero (Hero is ~75-92vh, using ~75% of viewport height)
      const heroThreshold = (window.innerHeight || 700) * 0.75;
      setIsScrolledPastHero(currentScrollY >= heroThreshold);

      // Sticky on scroll up logic (for non-homepage)
      if (currentScrollY <= 80) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY + 6) {
        // Scrolling down -> hide navbar on non-homepage
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY - 6) {
        // Scrolling up -> show navbar
        setIsHeaderVisible(true);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    // Initial check
    updateScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Build the shop menu exclusively from the category tree returned by the API.
  const menuSlots = ['tops', 'bottoms', 'accessories', 'bags', 'womenswear'];
  const shopMegaMenu = Object.fromEntries(menuSlots.map((slot, index) => {
    const root = categoryTree[index];
    const menuItems = root?.children?.length ? root.children : (root ? [root] : []);
    return [slot, {
      title: root?.name_category || '',
      items: menuItems.map((item) => ({
        label: item.name_category,
        path: `/products?category=${item.slug_category || item.slug}`,
      })),
    }];
  }));

  const collectionRoots = collections.filter((collection) => !collection.parent_collection_id);
  const collectionsMegaMenu = collectionRoots.map((parent) => ({
    id: parent.collection_id,
    title: parent.name_collection,
    items: collections
      .filter((collection) => Number(collection.parent_collection_id) === Number(parent.collection_id))
      .map((collection) => ({
        id: collection.collection_id,
        label: collection.name_collection,
        path: `/products?collection=${collection.slug_collection || collection.slug}`,
      })),
  })).filter((group) => group.items.length > 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // State calculations:
  // 1. Is the header in "Hero Transparent" state? (Only on Homepage when BEFORE hero end)
  const isHeroState = isHomePage && !isScrolledPastHero;

  // 2. Is the header in "White background + Black text" state?
  // -> True on Non-homepage OR on Homepage when scrolled past hero!
  const isWhiteTheme = !isHeroState;

  // 3. When in hero state, is text solid white? (Hovered or mega menu open)
  const isTextSolidWhite = isHeroState && (isHeaderHovered || activeMegaMenu !== null);

  // 4. Non-homepage Sticky on Scroll Up: hide when scrolling down unless hovered/menu open
  const isHeaderHidden = !isHomePage && !isHeaderVisible && !isHeaderHovered && activeMegaMenu === null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Top Announcement Marquee Ticker */}
      <div className="bg-black text-white dark:bg-neutral-950 border-b border-neutral-800 text-[10px] sm:text-[11px] font-black uppercase tracking-widest py-2 overflow-hidden select-none z-50">
        <div className="marquee-track flex items-center gap-12 animate-marquee">
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">⚡</span> MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO MỌI ĐƠN HÀNG</span>
          <span className="text-neutral-500">•</span>
          <span className="flex items-center gap-1.5"><span className="text-amber-400">🔥</span> BỘ SƯU TẬP SIGNATURE STREETWEAR DROP 2026</span>
          <span className="text-neutral-500">•</span>
          <span className="flex items-center gap-1.5"><span>🛡️</span> 100% PREMIUM HEAVYWEIGHT COTTON 280GSM</span>
          <span className="text-neutral-500">•</span>
          <span className="flex items-center gap-1.5"><span className="text-blue-400">🔄</span> ĐỔI TRẢ THOẢI MÁI TRONG VÒNG 7 NGÀY</span>
          <span className="text-neutral-500">•</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">⚡</span> MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC CHO MỌI ĐƠN HÀNG</span>
          <span className="text-neutral-500">•</span>
          <span className="flex items-center gap-1.5"><span className="text-amber-400">🔥</span> BỘ SƯU TẬP SIGNATURE STREETWEAR DROP 2026</span>
          <span className="text-neutral-500">•</span>
          <span className="flex items-center gap-1.5"><span>🛡️</span> 100% PREMIUM HEAVYWEIGHT COTTON 280GSM</span>
          <span className="text-neutral-500">•</span>
          <span className="flex items-center gap-1.5"><span className="text-blue-400">🔄</span> ĐỔI TRẢ THOẢI MÁI TRONG VÒNG 7 NGÀY</span>
        </div>
      </div>

      {/* Main Streetwear Header */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
        } ${
          isWhiteTheme
            ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-sm'
            : isHeaderHovered || activeMegaMenu !== null
              ? 'bg-black/75 backdrop-blur-xl border-b border-white/10 shadow-2xl'
              : 'bg-transparent border-b border-transparent'
        }`}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => {
          setIsHeaderHovered(false);
          setActiveMegaMenu(null);
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* 1. Left Nav: SHOP | COLLECTIONS */}
          <div className="flex items-center gap-6 lg:w-1/3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-[color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
                isWhiteTheme
                  ? 'text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  : isTextSolidWhite ? 'text-white hover:bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Open mobile menu"
            >
              <Icon icon="solar:hamburger-menu-linear" className="text-2xl" />
            </button>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-black tracking-widest uppercase select-none">
              {/* SHOP with Mega Dropdown */}
              <div 
                className="relative py-7 cursor-pointer"
                onMouseEnter={() => setActiveMegaMenu('shop')}
              >
                <Link
                  to="/products"
                  className={`pb-1 transition-[color,opacity,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded ${
                    activeMegaMenu === 'shop'
                      ? isWhiteTheme ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'border-b-2 border-white text-white'
                      : isWhiteTheme ? 'text-black dark:text-white hover:opacity-60' : isTextSolidWhite ? 'text-white hover:opacity-75' : 'text-white/60 hover:text-white hover:opacity-100'
                  }`}
                >
                  SHOP
                </Link>
              </div>

              {/* COLLECTIONS with Dropdown */}
              <div 
                className="relative py-7 cursor-pointer"
                onMouseEnter={() => setActiveMegaMenu('collections')}
              >
                <Link
                  to="/collections"
                  className={`pb-1 transition-[color,opacity,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded ${
                    activeMegaMenu === 'collections'
                      ? isWhiteTheme ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'border-b-2 border-white text-white'
                      : isWhiteTheme ? 'text-black dark:text-white hover:opacity-60' : isTextSolidWhite ? 'text-white hover:opacity-75' : 'text-white/60 hover:text-white hover:opacity-100'
                  }`}
                >
                  COLLECTIONS
                </Link>
              </div>
            </nav>
          </div>

          {/* 2. Center Brand Logo */}
          <div 
            className="flex flex-col items-center justify-center lg:w-1/3 text-center cursor-pointer select-none group" 
            onClick={() => navigate('/')}
          >
            <span className={`font-display font-black text-2xl sm:text-3xl tracking-tight uppercase leading-none transition-[color,opacity] duration-150 ease-out group-hover:opacity-75 ${
              isWhiteTheme
                ? 'text-black dark:text-white'
                : isTextSolidWhite ? 'text-white' : 'text-white/70'
            }`}>
              GRITMODE<span className="text-xs align-super ml-0.5 font-sans font-black">®</span>
            </span>
            <span className={`text-[9px] font-black tracking-widest uppercase mt-1 transition-[color,opacity] duration-150 ease-out ${
              isWhiteTheme
                ? 'text-neutral-400 dark:text-neutral-500'
                : isTextSolidWhite ? 'text-white/70' : 'text-white/40'
            }`}>
              madeinvietnam
            </span>
          </div>

          {/* 3. Right Nav */}
          <div className="flex items-center justify-end gap-5 lg:w-1/3">
            <nav className="hidden xl:flex items-center gap-6 text-xs font-black tracking-widest uppercase select-none">
              {[
                { label: 'CONTACT', to: ROUTES.CONTACT },
                { label: 'ABOUT US', to: ROUTES.ABOUT_US },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`transition-[color,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded ${
                    isWhiteTheme
                      ? 'text-black dark:text-white hover:opacity-60'
                      : isTextSolidWhite ? 'text-white hover:opacity-75' : 'text-white/60 hover:text-white hover:opacity-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Capsule Action Pill */}
            <div className={`flex items-center rounded-full px-3.5 py-1.5 transition-[border-color,background-color] duration-150 ease-out ${
              isWhiteTheme
                ? 'border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white shadow-sm'
                : isTextSolidWhite
                  ? 'border border-white/40 bg-white/15 backdrop-blur-xl shadow-inner text-white'
                  : 'border border-white/15 bg-black/20 backdrop-blur-sm text-white/60'
            }`}>
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-1 transition-[color,opacity,transform] duration-150 ease-out cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-full ${
                  isWhiteTheme ? 'text-black dark:text-white hover:opacity-60' : isTextSolidWhite ? 'text-white hover:opacity-75' : 'text-white/60 hover:text-white hover:opacity-100'
                }`}
                title="Tìm kiếm"
                aria-label="Search"
              >
                <Icon icon="solar:magnifer-linear" className="text-base sm:text-lg" />
              </button>

              <span className={`w-px h-3.5 mx-2 transition-colors duration-150 ease-out ${
                isWhiteTheme ? 'bg-neutral-300 dark:bg-neutral-700' : 'bg-white/20'
              }`} />

              {/* User Profile / Login Direct Link */}
              <Link
                to={isAuthenticated ? (user?.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.PROFILE) : ROUTES.LOGIN}
                className={`p-1 transition-[color,opacity,transform] duration-150 ease-out cursor-pointer flex items-center hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-full ${
                  isWhiteTheme ? 'text-black dark:text-white hover:opacity-60' : isTextSolidWhite ? 'text-white hover:opacity-75' : 'text-white/60 hover:text-white hover:opacity-100'
                }`}
                title={isAuthenticated ? user?.fullName || user?.email || 'Tài khoản' : 'Đăng nhập'}
                aria-label="Account"
              >
                <Icon icon="solar:user-linear" className="text-base sm:text-lg" />
              </Link>

              <span className={`w-px h-3.5 mx-2 transition-colors duration-150 ease-out ${
                isWhiteTheme ? 'bg-neutral-300 dark:bg-neutral-700' : 'bg-white/20'
              }`} />

              {/* Shopping Bag with live count badge */}
              <button
                onClick={openDrawer}
                className={`relative p-1 transition-[color,opacity,transform] duration-150 ease-out flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-full ${
                  isWhiteTheme ? 'text-black dark:text-white hover:opacity-60' : isTextSolidWhite ? 'text-white hover:opacity-75' : 'text-white/60 hover:text-white hover:opacity-100'
                }`}
                title="Giỏ hàng"
                aria-label="Cart"
              >
                <Icon icon="solar:bag-3-bold" className="text-base sm:text-lg" />
                <span className="text-xs font-black min-w-[14px] text-center">
                  {cartItemCount}
                </span>
              </button>
            </div>

          </div>

        </div>

        {/* --- MEGA MENU: SHOP --- */}
        {activeMegaMenu === 'shop' && (
          <div 
            className={`hidden lg:block absolute inset-x-0 top-full backdrop-blur-2xl border-b shadow-2xl animate-fade-in ${
              isWhiteTheme
                ? 'bg-white/95 dark:bg-black/95 text-black dark:text-white border-neutral-200 dark:border-neutral-800'
                : 'bg-black/85 text-white border-white/10'
            }`}
            onMouseEnter={() => setActiveMegaMenu('shop')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="max-w-7xl mx-auto px-8 py-10">
              <div className="grid grid-cols-5 gap-8">
                
                {/* 1. Tops */}
                <div className="space-y-4">
                  <h3 className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                    isWhiteTheme ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800' : 'text-white border-white/10'
                  }`}>
                    {shopMegaMenu.tops.title}
                  </h3>
                  <ul className={`space-y-2.5 text-xs font-medium ${
                    isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                  }`}>
                    {shopMegaMenu.tops.items.map((item, idx) => (
                      <li key={idx}>
                        <Link 
                          to={item.path} 
                          onClick={() => setActiveMegaMenu(null)}
                          className={`${isWhiteTheme ? 'hover:text-black dark:hover:text-white' : 'hover:text-white'} hover:translate-x-1 inline-block transition-all`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Bottoms */}
                <div className="space-y-4">
                  <h3 className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                    isWhiteTheme ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800' : 'text-white border-white/10'
                  }`}>
                    {shopMegaMenu.bottoms.title}
                  </h3>
                  <ul className={`space-y-2.5 text-xs font-medium ${
                    isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                  }`}>
                    {shopMegaMenu.bottoms.items.map((item, idx) => (
                      <li key={idx}>
                        <Link 
                          to={item.path} 
                          onClick={() => setActiveMegaMenu(null)}
                          className={`${isWhiteTheme ? 'hover:text-black dark:hover:text-white' : 'hover:text-white'} hover:translate-x-1 inline-block transition-all`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Accessories */}
                <div className="space-y-4">
                  <h3 className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                    isWhiteTheme ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800' : 'text-white border-white/10'
                  }`}>
                    {shopMegaMenu.accessories.title}
                  </h3>
                  <ul className={`space-y-2.5 text-xs font-medium ${
                    isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                  }`}>
                    {shopMegaMenu.accessories.items.map((item, idx) => (
                      <li key={idx}>
                        <Link 
                          to={item.path} 
                          onClick={() => setActiveMegaMenu(null)}
                          className={`${isWhiteTheme ? 'hover:text-black dark:hover:text-white' : 'hover:text-white'} hover:translate-x-1 inline-block transition-all`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Bags */}
                <div className="space-y-4">
                  <h3 className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                    isWhiteTheme ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800' : 'text-white border-white/10'
                  }`}>
                    {shopMegaMenu.bags.title}
                  </h3>
                  <ul className={`space-y-2.5 text-xs font-medium ${
                    isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                  }`}>
                    {shopMegaMenu.bags.items.map((item, idx) => (
                      <li key={idx}>
                        <Link 
                          to={item.path} 
                          onClick={() => setActiveMegaMenu(null)}
                          className={`${isWhiteTheme ? 'hover:text-black dark:hover:text-white' : 'hover:text-white'} hover:translate-x-1 inline-block transition-all`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. Womenswear */}
                <div className="space-y-4">
                  <h3 className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                    isWhiteTheme ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800' : 'text-white border-white/10'
                  }`}>
                    {shopMegaMenu.womenswear.title}
                  </h3>
                  <ul className={`space-y-2.5 text-xs font-medium ${
                    isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                  }`}>
                    {shopMegaMenu.womenswear.items.map((item, idx) => (
                      <li key={idx}>
                        <Link 
                          to={item.path} 
                          onClick={() => setActiveMegaMenu(null)}
                          className={`${isWhiteTheme ? 'hover:text-black dark:hover:text-white' : 'hover:text-white'} hover:translate-x-1 inline-block transition-all`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- MEGA MENU: COLLECTIONS --- */}
        {activeMegaMenu === 'collections' && (
          <div 
            className={`hidden lg:block absolute inset-x-0 top-full backdrop-blur-2xl border-b shadow-2xl animate-fade-in ${
              isWhiteTheme
                ? 'bg-white/95 dark:bg-black/95 text-black dark:text-white border-neutral-200 dark:border-neutral-800'
                : 'bg-black/85 text-white border-white/10'
            }`}
            onMouseEnter={() => setActiveMegaMenu('collections')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="max-w-7xl mx-auto px-8 py-10">
              <div className="grid grid-cols-4 gap-8">
                
                {collectionsMegaMenu.map((group) => (
                  <div key={group.id} className="space-y-4">
                    <h3 className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                      isWhiteTheme ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800' : 'text-white border-white/10'
                    }`}>
                      {group.title}
                    </h3>
                    <ul className={`space-y-2.5 text-xs font-medium ${
                      isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                    }`}>
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <Link
                            to={item.path}
                            onClick={() => setActiveMegaMenu(null)}
                            className={`${isWhiteTheme ? 'hover:text-black dark:hover:text-white' : 'hover:text-white'} hover:translate-x-1 inline-block transition-all`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {collectionsMegaMenu.length === 0 && (
                  <p className="col-span-4 text-xs text-neutral-400">Chưa có nhóm và bộ sưu tập con đang hiển thị.</p>
                )}

              </div>
            </div>
          </div>
        )}

      </header>

      {/* Full-Screen Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col justify-start pt-20 px-4 sm:px-6 animate-fade-in">
          <div className="max-w-3xl w-full mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-xl uppercase tracking-wider text-white">
                TÌM KIẾM SẢN PHẨM
              </span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-white/70 hover:text-white text-2xl transition-colors cursor-pointer"
              >
                <Icon icon="solar:close-circle-linear" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Nhập tên áo thun, hoodie, quần cargo, phụ kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white/60 focus:border-white py-4 pl-4 pr-12 text-lg sm:text-2xl font-bold text-white placeholder:text-white/40 focus:outline-none transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-2xl hover:opacity-70 transition-opacity cursor-pointer">
                <Icon icon="solar:arrow-right-linear" />
              </button>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/50">Gợi ý tìm kiếm:</p>
              <div className="flex flex-wrap gap-2">
                {['T-shirts & Polo', 'Sweatshirts & Hoodies', 'Tactical Cargo', 'Caps & Hats', 'Crossbody Bags'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/products?search=${encodeURIComponent(tag)}`);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Mobile Navigation Drawer (Light Theme Drill-down Navigation) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setMobileMenuLevel('main');
            }} 
          />
          
          <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-white text-black shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
            {/* 1. Header Bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setMobileMenuLevel('main');
                }}
                className="p-1 text-2xl text-neutral-800 hover:text-black cursor-pointer"
                aria-label="Đóng menu"
              >
                <Icon icon="solar:close-linear" />
              </button>

              <div className="flex flex-col items-center">
                <span className="font-display font-black text-lg tracking-tight text-black uppercase leading-none">
                  GRITMODE®
                </span>
                <span className="text-[8px] font-black tracking-widest uppercase text-neutral-500">madeinvietnam</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="p-1.5 text-neutral-800 hover:text-black cursor-pointer text-lg"
                  aria-label="Tìm kiếm"
                >
                  <Icon icon="solar:magnifer-linear" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN);
                  }}
                  className="p-1.5 text-neutral-800 hover:text-black cursor-pointer text-lg"
                  aria-label="Tài khoản"
                >
                  <Icon icon="solar:user-linear" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openDrawer();
                  }}
                  className="relative p-1.5 text-neutral-800 hover:text-black cursor-pointer text-lg"
                  aria-label="Giỏ hàng"
                >
                  <Icon icon="solar:bag-linear" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Menu Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {/* LEVEL 1: Main Menu */}
              {mobileMenuLevel === 'main' && (
                <nav className="space-y-4 text-sm font-bold uppercase tracking-wider text-neutral-900">
                  <button
                    onClick={() => setMobileMenuLevel('shop')}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    <span>SHOP</span>
                    <Icon icon="solar:alt-arrow-right-linear" className="text-base text-neutral-800" />
                  </button>

                  <button
                    onClick={() => setMobileMenuLevel('collections')}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    <span>COLLECTIONS</span>
                    <Icon icon="solar:alt-arrow-right-linear" className="text-base text-neutral-800" />
                  </button>

                  <Link
                    to={ROUTES.CONTACT}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 hover:text-neutral-600 transition-colors"
                  >
                    CONTACT
                  </Link>

                  <Link
                    to={ROUTES.ABOUT_US}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 hover:text-neutral-600 transition-colors"
                  >
                    ABOUT US
                  </Link>
                </nav>
              )}

              {/* LEVEL 2: Shop Submenu */}
              {mobileMenuLevel === 'shop' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-200">
                  {/* Back Bar */}
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                    <button
                      onClick={() => setMobileMenuLevel('main')}
                      className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                      aria-label="Quay lại"
                    >
                      <Icon icon="solar:arrow-left-linear" className="text-sm" />
                    </button>
                    <span className="text-xs text-neutral-400 font-normal">
                      Menu/<span className="text-black font-semibold">Shop</span>
                    </span>
                  </div>

                  {/* Categories Tree */}
                  <div className="space-y-3">
                    {categoryTree && categoryTree.length > 0 ? (
                      categoryTree.map((cat) => {
                        const hasChildren = cat.children && cat.children.length > 0;
                        const isExpanded = mobileExpandedCategory === cat.category_id;

                        return (
                          <div key={cat.category_id} className="border-b border-neutral-100 pb-2">
                            <div className="flex items-center justify-between">
                              <Link
                                to={`/products?category=${cat.slug_category || cat.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-sm font-bold uppercase tracking-wider text-black hover:text-neutral-600 py-1"
                              >
                                {cat.name_category}
                              </Link>
                              {hasChildren && (
                                <button
                                  onClick={() => setMobileExpandedCategory(isExpanded ? null : cat.category_id)}
                                  className="p-1.5 text-neutral-700 hover:text-black cursor-pointer"
                                >
                                  <Icon
                                    icon={isExpanded ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-right-linear"}
                                    className="text-base"
                                  />
                                </button>
                              )}
                            </div>

                            {/* Subcategories list */}
                            {hasChildren && isExpanded && (
                              <div className="pl-3 pt-2 pb-1 space-y-2 text-neutral-600 text-xs font-normal">
                                {cat.children.map((sub) => (
                                  <Link
                                    key={sub.category_id}
                                    to={`/products?category=${sub.slug_category || sub.slug}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-1 hover:text-black"
                                  >
                                    {sub.name_category}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      // Fallback categories
                      ['TOPS', 'BOTTOMS', 'ACCESSORIES', 'BAGS', 'WOMENSWEAR'].map((name, idx) => (
                        <div key={idx} className="border-b border-neutral-100 pb-2">
                          <Link
                            to="/products"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-sm font-bold uppercase tracking-wider text-black hover:text-neutral-600 py-1 block"
                          >
                            {name}
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* LEVEL 2: Collections Submenu */}
              {mobileMenuLevel === 'collections' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-200">
                  {/* Back Bar */}
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                    <button
                      onClick={() => setMobileMenuLevel('main')}
                      className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                      aria-label="Quay lại"
                    >
                      <Icon icon="solar:arrow-left-linear" className="text-sm" />
                    </button>
                    <span className="text-xs text-neutral-400 font-normal">
                      Menu/<span className="text-black font-semibold">Collections</span>
                    </span>
                  </div>

                  {/* Collections List */}
                  <div className="space-y-2 text-sm font-bold uppercase tracking-wider">
                    <Link
                      to="/collections"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-black hover:text-neutral-600 border-b border-neutral-100"
                    >
                      TẤT CẢ BỘ SƯU TẬP
                    </Link>
                    {collections && collections.length > 0 ? (
                      collections.map((col) => (
                        <Link
                          key={col.collection_id}
                          to={`/products?collection=${col.slug_collection || col.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-neutral-700 hover:text-black border-b border-neutral-100 font-normal text-xs"
                        >
                          {col.name_collection}
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-400 py-2 font-normal">Đang cập nhật...</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Footer Auth Bar */}
            <div className="p-6 border-t border-neutral-200 bg-neutral-50 space-y-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-xs font-normal text-neutral-600">{user?.email}</p>
                  <PrimaryButton
                    variant="outline"
                    size="sm"
                    className="w-full text-black border-neutral-300 hover:bg-neutral-200 text-xs font-[550]"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setMobileMenuLevel('main');
                      navigate(ROUTES.PROFILE);
                    }}
                  >
                    Tài khoản của tôi
                  </PrimaryButton>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      setMobileMenuLevel('main');
                    }}
                    className="w-full text-center text-xs font-normal text-neutral-500 hover:text-rose-600 cursor-pointer pt-1"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setMobileMenuLevel('main');
                      navigate(ROUTES.LOGIN);
                    }}
                    className="py-2.5 rounded-xl border border-neutral-300 text-black text-xs font-[550] uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setMobileMenuLevel('main');
                      navigate(ROUTES.LOGIN);
                    }}
                    className="py-2.5 rounded-xl bg-black text-white text-xs font-[550] uppercase tracking-wider hover:opacity-85 transition-opacity"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* DirtyCoins Style Streetwear Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400">
        
        {/* Top Newsletter & Culture Section */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 py-12">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="text-[10px] font-[550] uppercase tracking-widest text-neutral-400 block">
                GRITMODE® SQUAD
              </span>
              <h3 className="font-sans font-[550] text-xl sm:text-2xl uppercase tracking-widest text-black dark:text-white mt-0.5">
                GIA NHẬP CỘNG ĐỒNG STREETWEAR
              </h3>
              <p className="text-xs text-neutral-500 mt-1 font-[550] uppercase tracking-widest leading-relaxed">
                Nhận thông báo sớm nhất về các đợt phát hành Drop giới hạn và ưu đãi đặc quyền.
              </p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const emailInput = e.target.elements.newsletter_email?.value?.trim();
                if (emailInput) {
                  import('../../shared/utils/toast').then(({ toast }) => {
                    toast.success('Cảm ơn bạn đã đăng ký nhận tin từ Gritmode!');
                  });
                  e.target.reset();
                }
              }} 
              className="flex gap-2 w-full md:w-auto max-w-md"
            >
              <input
                name="newsletter_email"
                type="email"
                autoComplete="email"
                placeholder="Nhập địa chỉ email của bạn..."
                required
                className="min-w-0 flex-1 px-4 py-3 text-xs font-[550] rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 placeholder:font-normal focus:outline-none focus:border-black dark:focus:border-white transition-all"
              />
              <button 
                type="submit" 
                className="px-4 sm:px-6 py-3 text-xs font-[550] uppercase tracking-wider rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-85 transition-opacity cursor-pointer shrink-0"
              >
                ĐĂNG KÝ
              </button>
            </form>
          </div>
        </div>

        {/* Footer Navigation Columns (5 Columns) */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            
            {/* Column 1: Brand & Manifesto */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col">
                <span className="font-sans font-[550] text-2xl tracking-tight text-black dark:text-white uppercase leading-none">
                  GRITMODE<span className="text-xs align-super ml-0.5 font-sans font-[550]">®</span>
                </span>
                <span className="text-[9px] font-[550] tracking-widest uppercase text-neutral-400 mt-1">madeinvietnam</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Thương hiệu thời trang đường phố Việt Nam đại diện cho tinh thần bền bỉ, phong cách sống độc bản và chất liệu Heavyweight Cotton nguyên bản.
              </p>
              <div className="flex items-center gap-3 pt-2 text-xl text-black dark:text-white">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Gritmode Facebook Page"
                  className="hover:opacity-60 transition-opacity"
                >
                  <Icon icon="simple-icons:facebook" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Gritmode Instagram Official"
                  className="hover:opacity-60 transition-opacity"
                >
                  <Icon icon="simple-icons:instagram" />
                </a>
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Gritmode TikTok Channel"
                  className="hover:opacity-60 transition-opacity"
                >
                  <Icon icon="simple-icons:tiktok" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Gritmode YouTube Channel"
                  className="hover:opacity-60 transition-opacity"
                >
                  <Icon icon="simple-icons:youtube" />
                </a>
              </div>
            </div>

            {/* Column 2: Hệ thống Store */}
            <div>
              <h4 className="text-xs font-[550] uppercase tracking-widest text-black dark:text-white mb-4">
                HỆ THỐNG CỬA HÀNG
              </h4>
              <ul className="space-y-3 text-xs text-neutral-500">
                <li className="space-y-0.5">
                  <strong className="text-black dark:text-white font-[550] block">• Flagship Store Saigon:</strong>
                  <span className="text-[11px] leading-relaxed block">42 Tôn Thất Thiệp, P. Bến Nghé, Q.1, TP. HCM</span>
                  <span className="text-[10px] text-neutral-400 block">09:30 – 21:30 (Hàng ngày)</span>
                </li>
                <li className="space-y-0.5">
                  <strong className="text-black dark:text-white font-[550] block">• Concept Store Hanoi:</strong>
                  <span className="text-[11px] leading-relaxed block">12 Đặng Thái Thân, P. Phan Chu Trinh, Q. Hoàn Kiếm, HN</span>
                  <span className="text-[10px] text-neutral-400 block">10:00 – 21:30 (Hàng ngày)</span>
                </li>
                <li className="pt-1 border-t border-neutral-100 dark:border-neutral-900 font-[550] text-black dark:text-white font-sans">
                  Hotline: 0901 234 567
                </li>
              </ul>
            </div>

            {/* Column 3: Hỗ trợ mua hàng */}
            <div>
              <h4 className="text-xs font-[550] uppercase tracking-widest text-black dark:text-white mb-4">
                HỖ TRỢ MUA HÀNG
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-500">
                <li>
                  <Link to="/size-guide" className="hover:text-black dark:hover:text-white transition-colors">
                    Bảng quy đổi kích cỡ
                  </Link>
                </li>
                <li>
                  <Link to="/how-to-order" className="hover:text-black dark:hover:text-white transition-colors">
                    Hướng dẫn mua hàng & thanh toán
                  </Link>
                </li>
                <li>
                  <Link to="/orders/lookup" className="hover:text-black dark:hover:text-white transition-colors">
                    Tra cứu & theo dõi đơn hàng
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-black dark:hover:text-white transition-colors">
                    Liên hệ hỗ trợ khách hàng
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Chính sách khách hàng */}
            <div>
              <h4 className="text-xs font-[550] uppercase tracking-widest text-black dark:text-white mb-4">
                CHÍNH SÁCH KHÁCH HÀNG
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-500">
                <li>
                  <Link to="/policies/return" className="hover:text-black dark:hover:text-white transition-colors">
                    Chính sách đổi trả & hoàn tiền (7 ngày)
                  </Link>
                </li>
                <li>
                  <Link to="/policies/shipping" className="hover:text-black dark:hover:text-white transition-colors">
                    Chính sách vận chuyển (Freeship 0đ)
                  </Link>
                </li>
                <li>
                  <Link to="/policies/warranty" className="hover:text-black dark:hover:text-white transition-colors">
                    Chính sách bảo hành sản phẩm (30 ngày)
                  </Link>
                </li>
                <li>
                  <Link to="/policies/payment" className="hover:text-black dark:hover:text-white transition-colors">
                    Quy định & hình thức thanh toán
                  </Link>
                </li>
                <li>
                  <Link to="/policies/privacy" className="hover:text-black dark:hover:text-white transition-colors">
                    Chính sách bảo mật thông tin
                  </Link>
                </li>
                <li>
                  <Link to="/policies/terms" className="hover:text-black dark:hover:text-white transition-colors">
                    Điều khoản dịch vụ & sử dụng
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Phương thức thanh toán (Verified Only) */}
            <div>
              <h4 className="text-xs font-[550] uppercase tracking-widest text-black dark:text-white mb-4">
                PHƯƠNG THỨC THANH TOÁN
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                Thanh toán an toàn, bảo mật và tiện lợi qua 2 hình thức chính thức:
              </p>
              
              <div className="space-y-2">
                {/* VietQR / payOS Badge */}
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm shrink-0">
                    <Icon icon="solar:qr-code-bold" />
                  </div>
                  <div>
                    <h5 className="font-[550] text-xs uppercase text-black dark:text-white">VietQR / payOS</h5>
                    <p className="text-[10px] text-neutral-400">Chuẩn NAPAS247 tự động 24/7</p>
                  </div>
                </div>

                {/* COD Badge */}
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm shrink-0">
                    <Icon icon="solar:hand-money-bold" />
                  </div>
                  <div>
                    <h5 className="font-[550] text-xs uppercase text-black dark:text-white">Tiền mặt (COD)</h5>
                    <p className="text-[10px] text-neutral-400">Kiểm tra hàng khi nhận</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Culture Bar */}
          <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-[550] text-neutral-400 uppercase tracking-wider">
            <p>© {new Date().getFullYear()} GRITMODE STREETWEAR CO., LTD. ALL RIGHTS RESERVED.</p>
            <p>DESIGNED FOR VIETNAMESE STREET CULTURE</p>
          </div>
        </div>

      </footer>

    </div>
  );
}
