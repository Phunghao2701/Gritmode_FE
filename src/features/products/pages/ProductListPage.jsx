import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories, useCollections } from '../hooks/useProducts';
import ProductFilterBar from '../components/ProductFilterBar';
import ProductGrid from '../components/ProductGrid';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category_id') || searchParams.get('category') || '';
  const initialCollection = searchParams.get('collection_id') || searchParams.get('collection') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = Number(searchParams.get('page')) || 1;

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState(initialCollection);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  // Fetch public categories and collections
  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();

  // Fetch filtered products
  const {
    products,
    total,
    totalPages,
    isLoadingProducts,
  } = useProducts({
    category_id: selectedCategory || undefined,
    collection_id: selectedCollection || undefined,
    search: searchQuery.trim() || undefined,
    sort: sortBy || 'newest',
    page,
    limit: 20,
  });

  // Sync state to URL search parameters
  const updateUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.category_id) params.set('category_id', newFilters.category_id);
    if (newFilters.collection_id) params.set('collection_id', newFilters.collection_id);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
    setSearchParams(params);
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
    updateUrlParams({
      category_id: catId,
      collection_id: selectedCollection,
      search: searchQuery,
      sort: sortBy,
      page: 1,
    });
  };

  const handleCollectionChange = (colId) => {
    setSelectedCollection(colId);
    setPage(1);
    updateUrlParams({
      category_id: selectedCategory,
      collection_id: colId,
      search: searchQuery,
      sort: sortBy,
      page: 1,
    });
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setPage(1);
    updateUrlParams({
      category_id: selectedCategory,
      collection_id: selectedCollection,
      search: val,
      sort: sortBy,
      page: 1,
    });
  };

  const handleSortChange = (sortVal) => {
    setSortBy(sortVal);
    setPage(1);
    updateUrlParams({
      category_id: selectedCategory,
      collection_id: selectedCollection,
      search: searchQuery,
      sort: sortVal,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams({
      category_id: selectedCategory,
      collection_id: selectedCollection,
      search: searchQuery,
      sort: sortBy,
      page: newPage,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedCollection('');
    setSearchQuery('');
    setSortBy('newest');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  // Find active category / collection name for banner title
  const activeCatObj = categories.find((c) => String(c.category_id) === String(selectedCategory));
  const activeColObj = collections.find((c) => String(c.collection_id) === String(selectedCollection));

  const pageTitle = activeCatObj
    ? activeCatObj.name_category
    : activeColObj
    ? `Bộ sưu tập ${activeColObj.name_collection}`
    : 'Tất cả sản phẩm';

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
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            Gritmode Streetwear Catalog
          </span>
          <h1 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white uppercase tracking-widest mt-1">
            {pageTitle}
          </h1>
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
          {total} sản phẩm
        </span>
      </div>

      {/* Filter and Search Bar */}
      <ProductFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        collections={collections}
        selectedCollection={selectedCollection}
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
        onResetFilter={handleResetFilters}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
