'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCategories } from '@/features/categories/hooks/useCategory';
import { useCollections } from '@/features/collections/hooks/useCollection';

export default function HeaderNav({ isWhiteTheme = true, isTextSolidWhite = false }) {
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'shop' | 'collections' | null
  const { categoryTree = [] } = useCategories();
  const { collections = [] } = useCollections();

  const collectionRoots = collections.filter((c) => !c.parent_collection_id);
  const collectionsMegaMenu = collectionRoots
    .map((parent) => ({
      id: parent.collection_id,
      title: parent.name_collection,
      items: collections
        .filter((c) => Number(c.parent_collection_id) === Number(parent.collection_id))
        .map((c) => ({
          id: c.collection_id,
          label: c.name_collection,
          path: `/products?collection=${c.slug_collection || c.slug}`,
        })),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav
      className="hidden lg:flex items-center gap-6 text-xs font-black tracking-widest uppercase select-none"
      onMouseLeave={() => setActiveMegaMenu(null)}
    >
      {/* SHOP with Mega Dropdown */}
      <div
        className="relative py-7 cursor-pointer"
        onMouseEnter={() => setActiveMegaMenu('shop')}
      >
        <Link
          href="/products"
          className={`pb-1 transition-[color,opacity,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded ${
            activeMegaMenu === 'shop'
              ? isWhiteTheme
                ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
                : 'border-b-2 border-white text-white'
              : isWhiteTheme
              ? 'text-black dark:text-white hover:opacity-60'
              : isTextSolidWhite
              ? 'text-white hover:opacity-75'
              : 'text-white/60 hover:text-white hover:opacity-100'
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
          href="/collections"
          className={`pb-1 transition-[color,opacity,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded ${
            activeMegaMenu === 'collections'
              ? isWhiteTheme
                ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
                : 'border-b-2 border-white text-white'
              : isWhiteTheme
              ? 'text-black dark:text-white hover:opacity-60'
              : isTextSolidWhite
              ? 'text-white hover:opacity-75'
              : 'text-white/60 hover:text-white hover:opacity-100'
          }`}
        >
          COLLECTIONS
        </Link>
      </div>

      {/* MEGA MENU: SHOP */}
      {activeMegaMenu === 'shop' && (
        <div
          className={`absolute inset-x-0 top-full backdrop-blur-2xl border-b shadow-2xl animate-fade-in ${
            isWhiteTheme
              ? 'bg-white/95 dark:bg-black/95 text-black dark:text-white border-neutral-200 dark:border-neutral-800'
              : 'bg-black/85 text-white border-white/10'
          }`}
          onMouseEnter={() => setActiveMegaMenu('shop')}
          onMouseLeave={() => setActiveMegaMenu(null)}
        >
          <div className="max-w-7xl mx-auto px-8 py-10">
            {categoryTree && categoryTree.length > 0 ? (
              <div className={`grid grid-cols-${Math.min(categoryTree.length, 5)} gap-8`}>
                {categoryTree.map((cat) => (
                  <div key={cat.category_id} className="space-y-4">
                    <h3
                      className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                        isWhiteTheme
                          ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800'
                          : 'text-white border-white/10'
                      }`}
                    >
                      <Link
                        href={`/products?category=${cat.slug_category || cat.slug}`}
                        onClick={() => setActiveMegaMenu(null)}
                        className="hover:opacity-75 transition-opacity"
                      >
                        {cat.name_category}
                      </Link>
                    </h3>
                    {cat.children && cat.children.length > 0 && (
                      <ul
                        className={`space-y-2.5 text-xs font-medium ${
                          isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                        }`}
                      >
                        {cat.children.map((sub) => (
                          <li key={sub.category_id}>
                            <Link
                              href={`/products?category=${sub.slug_category || sub.slug}`}
                              onClick={() => setActiveMegaMenu(null)}
                              className={`${
                                isWhiteTheme
                                  ? 'hover:text-black dark:hover:text-white'
                                  : 'hover:text-white'
                              } hover:translate-x-1 inline-block transition-all`}
                            >
                              {sub.name_category}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-400 text-xs font-normal">
                Chưa có danh mục nào.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEGA MENU: COLLECTIONS */}
      {activeMegaMenu === 'collections' && (
        <div
          className={`absolute inset-x-0 top-full backdrop-blur-2xl border-b shadow-2xl animate-fade-in ${
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
                  <h3
                    className={`font-display font-black text-sm uppercase tracking-wider pb-2 border-b ${
                      isWhiteTheme
                        ? 'text-black dark:text-white border-neutral-200 dark:border-neutral-800'
                        : 'text-white border-white/10'
                    }`}
                  >
                    {group.title}
                  </h3>
                  <ul
                    className={`space-y-2.5 text-xs font-medium ${
                      isWhiteTheme ? 'text-neutral-600 dark:text-neutral-300' : 'text-white/75'
                    }`}
                  >
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.path}
                          onClick={() => setActiveMegaMenu(null)}
                          className={`${
                            isWhiteTheme
                              ? 'hover:text-black dark:hover:text-white'
                              : 'hover:text-white'
                          } hover:translate-x-1 inline-block transition-all`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {collectionsMegaMenu.length === 0 && (
                <p className="col-span-4 text-xs text-neutral-400">
                  Chưa có nhóm và bộ sưu tập con đang hiển thị.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
