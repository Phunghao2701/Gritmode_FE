import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import Icon from '../../shared/components/Icon';
import PrimaryButton from '../../shared/components/Button/PrimaryButton';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import CartDrawer from '../../features/cart/components/CartDrawer';
import ROUTES from '../routes/routePaths';
import { logoutApi } from '../../features/auth/apis/auth.api';
import { tokenService } from '../../features/auth/services/token.service';
import { toast } from '../../shared/utils/toast';
import { clearQueryCache } from '../../shared/services/queryClient';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { getTotalItems, openDrawer } = useCartStore();

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Dù API fail vẫn clear local
    } finally {
      await clearQueryCache();
      tokenService.clearAllTokens();
      clearAuth();
      toast.info('Đã đăng xuất tài khoản.');
      navigate(ROUTES.LOGIN);
    }
  }, [clearAuth, navigate]);
  
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'shop' | 'collections' | null
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState('shop');
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

  // Mega Menu Data mirroring DirtyCoins exact structure
  const shopMegaMenu = {
    tops: {
      title: 'Tops',
      items: [
        { label: 'T-shirts & Polo Shirts', path: '/products?category=ao-thun' },
        { label: 'Jerseys', path: '/products?category=ao-thun' },
        { label: 'Shirts', path: '/products?category=ao-thun' },
        { label: 'Sweaters & Cardigans', path: '/products?category=hoodie' },
        { label: 'Sweatshirts & Hoodies', path: '/products?category=hoodie' },
        { label: 'Outerwear', path: '/products?category=ao-khoac' },
      ],
    },
    bottoms: {
      title: 'Bottoms',
      items: [
        { label: 'Pants', path: '/products?category=quan' },
        { label: 'Shorts', path: '/products?category=quan' },
      ],
    },
    accessories: {
      title: 'Accessories',
      items: [
        { label: 'Other accessories', path: '/products?category=phu-kien' },
        { label: 'Caps/Hats', path: '/products?category=phu-kien' },
        { label: 'Slides', path: '/products?category=phu-kien' },
        { label: 'Phone cases', path: '/products?category=phu-kien' },
        { label: 'Wallets', path: '/products?category=phu-kien' },
        { label: 'Underwear', path: '/products?category=phu-kien' },
      ],
    },
    bags: {
      title: 'Bags',
      items: [
        { label: 'Backpacks', path: '/products?category=phu-kien' },
        { label: 'Crossbody bags', path: '/products?category=phu-kien' },
        { label: 'Bowler bags', path: '/products?category=phu-kien' },
      ],
    },
    womenswear: {
      title: 'Womenswear',
      items: [
        { label: 'Tops & Baby Tees', path: '/products?category=ao-thun' },
        { label: 'Skirts & Pants', path: '/products?category=quan' },
      ],
    },
  };

  const collectionsMegaMenu = {
    collaborations: {
      title: 'Collaborations',
      items: [
        { label: 'The Rolling Stones x Gritmode', path: '/collections' },
        { label: 'Dragon Ball Z x Gritmode', path: '/collections' },
        { label: 'One Piece Red x Gritmode', path: '/collections' },
        { label: 'Cyber Demon x Gritmode', path: '/collections' },
      ],
    },
    dicoCollections: {
      title: 'DICO Collections',
      items: [
        { label: 'Blokecore SS26', path: '/collections' },
        { label: 'Heritages Urban Series', path: '/collections' },
        { label: 'Vandalism Street Drop', path: '/collections' },
      ],
    },
  };

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
          
          {/* 1. Left Nav: SHOP | THE ROLLING STONES | COLLECTIONS */}
          <div className="flex items-center gap-6 lg:w-1/3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isWhiteTheme
                  ? 'text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  : isTextSolidWhite ? 'text-white hover:bg-white/10' : 'text-white/40 hover:text-white'
              }`}
              aria-label="Open mobile menu"
            >
              <Icon icon="solar:hamburger-menu-linear" className="text-2xl" />
            </button>

            <nav className={`hidden lg:flex items-center gap-6 text-xs font-black tracking-widest uppercase transition-colors duration-300 ${
              isWhiteTheme
                ? 'text-black dark:text-white'
                : isTextSolidWhite ? 'text-white' : 'text-white/40'
            }`}>
              {/* SHOP with Mega Dropdown */}
              <div 
                className="relative py-7 cursor-pointer"
                onMouseEnter={() => setActiveMegaMenu('shop')}
              >
                <Link
                  to="/products"
                  className={`transition-all pb-1 ${
                    activeMegaMenu === 'shop'
                      ? isWhiteTheme ? 'border-b-2 border-black dark:border-white' : 'border-b-2 border-white text-white'
                      : isWhiteTheme ? 'hover:opacity-60' : isTextSolidWhite ? 'hover:opacity-75 text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  SHOP
                </Link>
              </div>

              {/* THE ROLLING STONES */}
              <div className="relative py-7">
                <Link
                  to="/collections"
                  className={`transition-all ${
                    isWhiteTheme ? 'hover:opacity-60' : isTextSolidWhite ? 'hover:opacity-75 text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  THE ROLLING STONES
                </Link>
              </div>

              {/* COLLECTIONS with Dropdown */}
              <div 
                className="relative py-7 cursor-pointer"
                onMouseEnter={() => setActiveMegaMenu('collections')}
              >
                <Link
                  to="/collections"
                  className={`transition-all pb-1 ${
                    activeMegaMenu === 'collections'
                      ? isWhiteTheme ? 'border-b-2 border-black dark:border-white' : 'border-b-2 border-white text-white'
                      : isWhiteTheme ? 'hover:opacity-60' : isTextSolidWhite ? 'hover:opacity-75 text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  COLLECTIONS
                </Link>
              </div>
            </nav>
          </div>

          {/* 2. Center Brand Logo */}
          <div 
            className="flex flex-col items-center justify-center lg:w-1/3 text-center cursor-pointer select-none" 
            onClick={() => navigate('/')}
          >
            <span className={`font-display font-black text-2xl sm:text-3xl tracking-tight uppercase leading-none transition-colors duration-300 ${
              isWhiteTheme
                ? 'text-black dark:text-white'
                : isTextSolidWhite ? 'text-white' : 'text-white/40'
            }`}>
              GRITMODE<span className="text-xs align-super ml-0.5 font-sans font-black">®</span>
            </span>
            <span className={`text-[9px] font-black tracking-widest uppercase mt-1 transition-colors duration-300 ${
              isWhiteTheme
                ? 'text-neutral-400 dark:text-neutral-500'
                : isTextSolidWhite ? 'text-white/70' : 'text-white/30'
            }`}>
              madeinvietnam
            </span>
          </div>

          {/* 3. Right Nav */}
          <div className="flex items-center justify-end gap-5 lg:w-1/3">
            <nav className={`hidden xl:flex items-center gap-5 text-xs font-black tracking-widest uppercase transition-colors duration-300 ${
              isWhiteTheme
                ? 'text-black dark:text-white'
                : isTextSolidWhite ? 'text-white/90' : 'text-white/40'
            }`}>
              <a href="#" className={isWhiteTheme ? "hover:opacity-60 transition-opacity" : "hover:text-white transition-colors"}>NEWS</a>
              <a href="#" className={isWhiteTheme ? "hover:opacity-60 transition-opacity" : "hover:text-white transition-colors"}>CONTACT</a>
              <a href="#" className={isWhiteTheme ? "hover:opacity-60 transition-opacity" : "hover:text-white transition-colors"}>ABOUT US</a>
            </nav>

            {/* Capsule Action Pill */}
            <div className={`flex items-center rounded-full px-3.5 py-1.5 transition-all duration-300 ${
              isWhiteTheme
                ? 'border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white shadow-sm'
                : isTextSolidWhite
                  ? 'border border-white/40 bg-white/15 backdrop-blur-xl shadow-inner text-white'
                  : 'border border-white/15 bg-black/20 backdrop-blur-sm text-white/40'
            }`}>
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-1 transition-colors cursor-pointer ${
                  isWhiteTheme ? 'hover:opacity-60' : 'hover:text-white'
                }`}
                title="Tìm kiếm"
                aria-label="Search"
              >
                <Icon icon="solar:magnifer-linear" className="text-base sm:text-lg" />
              </button>

              <span className={`w-px h-3.5 mx-2 ${
                isWhiteTheme ? 'bg-neutral-300 dark:bg-neutral-700' : 'bg-white/20'
              }`} />

              {/* User Profile / Login */}
              <button
                onClick={() => navigate(isAuthenticated ? (user?.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.PROFILE) : ROUTES.LOGIN)}
                className={`p-1 transition-colors cursor-pointer ${
                  isWhiteTheme ? 'hover:opacity-60' : 'hover:text-white'
                }`}
                title={isAuthenticated ? user?.fullName || 'Tài khoản' : 'Đăng nhập'}
                aria-label="Account"
              >
                <Icon icon="solar:user-linear" className="text-base sm:text-lg" />
              </button>

              <span className={`w-px h-3.5 mx-2 ${
                isWhiteTheme ? 'bg-neutral-300 dark:bg-neutral-700' : 'bg-white/20'
              }`} />

              {/* Shopping Bag with live count badge */}
              <button
                onClick={openDrawer}
                className={`relative p-1 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isWhiteTheme ? 'hover:opacity-60' : 'hover:text-white'
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
                
                <div className="space-y-4">
                  <h3 className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                    isWhiteTheme ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800' : 'text-white border-white/10'
                  }`}>
                    {collectionsMegaMenu.collaborations.title}
                  </h3>
                  <ul className={`space-y-2.5 text-xs font-medium ${
                    isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                  }`}>
                    {collectionsMegaMenu.collaborations.items.map((item, idx) => (
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

                <div className="space-y-4">
                  <h3 className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                    isWhiteTheme ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800' : 'text-white border-white/10'
                  }`}>
                    {collectionsMegaMenu.dicoCollections.title}
                  </h3>
                  <ul className={`space-y-2.5 text-xs font-medium ${
                    isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                  }`}>
                    {collectionsMegaMenu.dicoCollections.items.map((item, idx) => (
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

      {/* Slide-out Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-black/95 text-white backdrop-blur-2xl p-6 flex flex-col justify-between shadow-2xl border-r border-white/10 animate-in slide-in-from-left duration-300">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex flex-col">
                  <span className="font-display font-black text-xl tracking-tight text-white uppercase leading-none">
                    GRITMODE®
                  </span>
                  <span className="text-[8px] font-black tracking-widest uppercase text-white/50">madeinvietnam</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-2xl text-white/60 hover:text-white cursor-pointer">
                  <Icon icon="solar:close-circle-linear" />
                </button>
              </div>

              {/* Mobile Accordion Nav */}
              <nav className="flex flex-col space-y-3 text-xs font-black uppercase tracking-wider">
                
                {/* SHOP Accordion */}
                <div className="border-b border-white/10 pb-2">
                  <button 
                    onClick={() => setMobileExpandedSection(mobileExpandedSection === 'shop' ? '' : 'shop')}
                    className="w-full flex items-center justify-between py-2 text-left text-sm text-white cursor-pointer"
                  >
                    <span>SHOP</span>
                    <Icon icon={mobileExpandedSection === 'shop' ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} />
                  </button>
                  {mobileExpandedSection === 'shop' && (
                    <div className="pl-3 py-2 space-y-3 text-white/70">
                      <div>
                        <p className="font-bold text-white text-[11px] mb-1">TOPS</p>
                        {shopMegaMenu.tops.items.map((i, idx) => (
                          <Link key={idx} to={i.path} onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                            {i.label}
                          </Link>
                        ))}
                      </div>
                      <div>
                        <p className="font-bold text-white text-[11px] mb-1">BOTTOMS</p>
                        {shopMegaMenu.bottoms.items.map((i, idx) => (
                          <Link key={idx} to={i.path} onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                            {i.label}
                          </Link>
                        ))}
                      </div>
                      <div>
                        <p className="font-bold text-white text-[11px] mb-1">ACCESSORIES & BAGS</p>
                        {shopMegaMenu.accessories.items.map((i, idx) => (
                          <Link key={idx} to={i.path} onClick={() => setIsMobileMenuOpen(false)} className="block py-1">
                            {i.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/10 block text-sm text-white">
                  THE ROLLING STONES
                </Link>

                <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-white/10 block text-sm text-white">
                  COLLECTIONS
                </Link>

                <a href="#" className="py-2 text-white/60 hover:text-white block">NEWS</a>
                <a href="#" className="py-2 text-white/60 hover:text-white block">CONTACT</a>
                <a href="#" className="py-2 text-white/60 hover:text-white block">ABOUT US</a>
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-white/60">{user?.email}</p>
                  <PrimaryButton 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-white border-white/30 hover:bg-white/10"
                    onClick={() => { setIsMobileMenuOpen(false); navigate(ROUTES.PROFILE); }}
                  >
                    Tài khoản của tôi
                  </PrimaryButton>
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full py-2 text-xs font-bold text-neutral-400 hover:text-white underline text-center cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <PrimaryButton 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-white border-white/30 hover:bg-white/10"
                    onClick={() => { setIsMobileMenuOpen(false); navigate(ROUTES.LOGIN); }}
                  >
                    Đăng nhập
                  </PrimaryButton>
                  <PrimaryButton 
                    size="sm" 
                    className="flex-1 bg-white text-black hover:bg-white/90"
                    onClick={() => { setIsMobileMenuOpen(false); navigate(ROUTES.REGISTER); }}
                  >
                    Đăng ký
                  </PrimaryButton>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-black dark:text-white">
                GIA NHẬP CỘNG ĐỒNG GRITMODE® SQUAD
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Nhận thông tin sớm nhất về các đợt Drop giới hạn và ưu đãi đặc quyền 20% đơn đầu.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto max-w-md">
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn..."
                className="flex-1 px-4 py-3 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              <button className="px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-85 cursor-pointer">
                ĐĂNG KÝ
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl tracking-tight text-black dark:text-white uppercase leading-none">
                  GRITMODE<span className="text-xs align-super ml-0.5 font-sans font-black">®</span>
                </span>
                <span className="text-[9px] font-black tracking-widest uppercase text-neutral-400 mt-1">madeinvietnam</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Thương hiệu thời trang đường phố Việt Nam đại diện cho tinh thần bền bỉ, phong cách sống độc bản và năng lượng bứt phá.
              </p>
              <div className="flex items-center gap-3 pt-2 text-xl text-black dark:text-white">
                <a href="#" className="hover:opacity-75 transition-opacity"><Icon icon="simple-icons:facebook" /></a>
                <a href="#" className="hover:opacity-75 transition-opacity"><Icon icon="simple-icons:instagram" /></a>
                <a href="#" className="hover:opacity-75 transition-opacity"><Icon icon="simple-icons:tiktok" /></a>
                <a href="#" className="hover:opacity-75 transition-opacity"><Icon icon="simple-icons:youtube" /></a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-4">
                HỆ THỐNG CỬA HÀNG
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-500">
                <li>• Flagship: 123 Phố Huế, Q. Hai Bà Trưng, Hà Nội</li>
                <li>• Store 2: 456 Lê Văn Sỹ, Quận 3, TP. Hồ Chí Minh</li>
                <li>• Store 3: 789 Nguyễn Văn Linh, Q. Hải Châu, Đà Nẵng</li>
                <li className="font-bold text-black dark:text-white pt-1">Hotline: 1900 8921 (9:00 - 22:00)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-4">
                CHÍNH SÁCH KHÁCH HÀNG
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-500">
                <li><a href="#" className="hover:underline text-black dark:text-white">Chính sách đổi trả trong 30 ngày</a></li>
                <li><a href="#" className="hover:underline text-black dark:text-white">Bảng quy đổi kích cỡ (Size Chart)</a></li>
                <li><a href="#" className="hover:underline text-black dark:text-white">Chính sách vận chuyển & giao hàng</a></li>
                <li><a href="#" className="hover:underline text-black dark:text-white">Bảo mật thông tin khách hàng</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-4">
                CHỨNG NHẬN & THANH TOÁN
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                Hỗ trợ đa dạng phương thức thanh toán an toàn qua VNPay, Thẻ Visa/Master, Chuyển khoản QR & COD.
              </p>
              <div className="flex items-center gap-3 text-2xl text-neutral-400">
                <Icon icon="logos:visa" />
                <Icon icon="logos:mastercard" />
                <Icon icon="simple-icons:vimeo" className="text-neutral-500" />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            <p>© {new Date().getFullYear()} GRITMODE STREETWEAR CO., LTD. ALL RIGHTS RESERVED.</p>
            <p>DESIGNED FOR VIETNAMESE STREET CULTURE</p>
          </div>
        </div>

      </footer>

    </div>
  );
}
