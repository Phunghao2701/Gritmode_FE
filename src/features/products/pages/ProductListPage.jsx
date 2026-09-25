'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useProducts, useCategories, useCollections } from '../hooks/useProducts';
import ProductFilterBar from '../components/ProductFilterBar';
import ProductGrid from '../components/ProductGrid';

export default function ProductListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialCategory = searchParams.get('category') || searchParams.get('category_id') || '';
  const initialCategoryIsSlug = Boolean(searchParams.get('category'));
  const initialCollection = searchParams.get('collection_id') || searchParams.get('collection') || '';
  const initialCollectionIsSlug = Boolean(searchParams.get('collection'));
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = Number(searchParams.get('page')) || 1;

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCategoryIsSlug, setSelectedCategoryIsSlug] = useState(initialCategoryIsSlug);
  const [selectedCollection, setSelectedCollection] = useState(initialCollection);
  const [selectedCollectionIsSlug, setSelectedCollectionIsSlug] = useState(initialCollectionIsSlug);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  // Fetch public categories and collections
  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // Fetch filtered products
  const {
    products,
    total,
    totalPages,
    isLoadingProducts,
    isFetching,
  } = useProducts({
    ...(selectedCategory ? (selectedCategoryIsSlug ? { categorySlug: selectedCategory } : { category_id: selectedCategory }) : {}),
    ...(selectedCollection ? (selectedCollectionIsSlug ? { collectionSlug: selectedCollection } : { collection_id: selectedCollection }) : {}),
    search: debouncedSearch.trim() || undefined,
    sort: sortBy || 'newest',
    page,
    limit: 20,
  });

  // Sync state to URL search parameters
  const updateUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.category_id) params.set('category_id', newFilters.category_id);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.collection_id) params.set('collection_id', newFilters.collection_id);
    if (newFilters.collection) params.set('collection', newFilters.collection);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const categoryUrlFilter = () => (selectedCategoryIsSlug
    ? { category: selectedCategory }
    : { category_id: selectedCategory });

  const collectionUrlFilter = () => (selectedCollectionIsSlug
    ? { collection: selectedCollection }
    : { collection_id: selectedCollection });

  // Sync state from URL search params whenever URL changes (e.g. MegaMenu links, browser navigation)
  useEffect(() => {
    const cat = searchParams.get('category') || searchParams.get('category_id') || '';
    const catSlug = Boolean(searchParams.get('category'));
    const col = searchParams.get('collection') || searchParams.get('collection_id') || '';
    const colSlug = Boolean(searchParams.get('collection'));
    const sort = searchParams.get('sort') || 'newest';
    const p = Number(searchParams.get('page')) || 1;
    const q = searchParams.get('search') || '';

    setSelectedCategory(cat);
    setSelectedCategoryIsSlug(catSlug);
    setSelectedCollection(col);
    setSelectedCollectionIsSlug(colSlug);
    setSortBy(sort);
    setPage(p);
    setSearchQuery(q);
    setDebouncedSearch(q);
  }, [searchParams]);

  const handleCategoryChange = (catIdOrSlug) => {
    if (!catIdOrSlug) {
      setSelectedCategory('');
      setSelectedCategoryIsSlug(false);
      setPage(1);
      updateUrlParams({
        ...collectionUrlFilter(),
        search: searchQuery,
        sort: sortBy,
        page: 1,
      });
      return;
    }

    const category = categories.find((item) =>
      String(item.category_id || item.id) === String(catIdOrSlug) ||
      String(item.slug_category || item.slug) === String(catIdOrSlug)
    );
    const slug = category?.slug_category || category?.slug;
    const isSlug = Boolean(slug) || isNaN(Number(catIdOrSlug));
    const finalVal = slug || catIdOrSlug;

    setSelectedCategory(finalVal);
    setSelectedCategoryIsSlug(isSlug);
    setPage(1);
    updateUrlParams({
      category_id: isSlug ? undefined : finalVal,
      category: isSlug ? finalVal : undefined,
      ...collectionUrlFilter(),
      search: searchQuery,
      sort: sortBy,
      page: 1,
    });
  };

  const handleCollectionChange = (colId) => {
    setSelectedCollection(colId);
    const collection = collections.find((item) => String(item.collection_id || item.id) === String(colId));
    const slug = collection?.slug_collection || collection?.slug;
    setSelectedCollectionIsSlug(Boolean(slug));
    setPage(1);
    updateUrlParams({
      ...categoryUrlFilter(),
      collection_id: slug ? undefined : colId,
      collection: slug,
      search: searchQuery,
      sort: sortBy,
      page: 1,
    });
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setPage(1);
    updateUrlParams({
      ...categoryUrlFilter(),
      ...collectionUrlFilter(),
      search: val,
      sort: sortBy,
      page: 1,
    });
  };

  const handleSortChange = (sortVal) => {
    setSortBy(sortVal);
    setPage(1);
    updateUrlParams({
      ...categoryUrlFilter(),
      ...collectionUrlFilter(),
      search: searchQuery,
      sort: sortVal,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams({
      ...categoryUrlFilter(),
      ...collectionUrlFilter(),
      search: searchQuery,
      sort: sortBy,
      page: newPage,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedCategoryIsSlug(false);
    setSelectedCollection('');
    setSelectedCollectionIsSlug(false);
    setSearchQuery('');
    setDebouncedSearch('');
    setSortBy('newest');
    setPage(1);
    router.replace(pathname);
  };

  // Find active category / collection name for banner title
  const activeCatObj = categories.find((c) => selectedCategoryIsSlug
    ? String(c.slug_category || c.slug) === String(selectedCategory)
    : String(c.category_id) === String(selectedCategory));
  const activeColObj = collections.find((c) => selectedCollectionIsSlug
    ? String(c.slug_collection || c.slug) === String(selectedCollection)
    : String(c.collection_id) === String(selectedCollection));
  const selectedCollectionId = selectedCollectionIsSlug
    ? String(activeColObj?.collection_id || '')
    : selectedCollection;

  const pageTitle = activeCatObj
    ? activeCatObj.name_category
    : activeColObj
    ? `Bộ sưu tập ${activeColObj.name_collection}`
    : 'Shop';

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[70vh] animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 select-none">
        <span onClick={() => { handleResetFilters(); }} className="font-normal hover:text-black dark:hover:text-white cursor-pointer transition-colors">
          Trang chủ
        </span>
        <span>/</span>
        <span className="text-black dark:text-white font-[550]">{pageTitle}</span>
      </div>

      {/* Header Banner */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white uppercase tracking-widest mt-1">
            {pageTitle}
          </h1>
        </div>
        <span className="text-xs font-normal uppercase tracking-wider text-neutral-500">
          {total} sản phẩm
        </span>
      </div>

      {/* Filter and Search Bar */}
      <ProductFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        collections={collections}
        selectedCollection={selectedCollectionId}
        onSelectCollection={handleCollectionChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
      />

      {/* Product Grid & Pagination */}
      <ProductGrid
        products={products}
        isLoading={isLoadingProducts}
        isFetching={isFetching}
        onResetFilter={handleResetFilters}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
