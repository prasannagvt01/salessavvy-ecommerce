import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon, XMarkIcon, SparklesIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productsAPI, categoriesAPI } from '../services/api';

const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest Arrivals' },
  { value: 'reviewCount-desc', label: 'Most Popular' },
  { value: 'averageRating-desc', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortDir: searchParams.get('sortDir') || 'desc',
  });

  const page = parseInt(searchParams.get('page') || '0', 10);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || '',
      sortBy: searchParams.get('sortBy') || prev.sortBy,
      sortDir: searchParams.get('sortDir') || prev.sortDir,
    }));
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let response;
        const params = {
          page,
          size: 12,
          sortBy: filters.sortBy,
          sortDir: filters.sortDir,
        };

        if (searchQuery) {
          response = await productsAPI.search(searchQuery, params);
        } else if (filters.minRating) {
          response = await productsAPI.filterByRating(filters.minRating, params);
        } else if (filters.minPrice && filters.maxPrice) {
          response = await productsAPI.filterByPrice(filters.minPrice, filters.maxPrice, params);
        } else if (filters.category) {
          response = await productsAPI.getByCategory(filters.category, params);
        } else {
          response = await productsAPI.getAll(params);
        }

        const pageData = response.data?.data;
        setProducts(pageData?.content || []);
        setTotalPages(pageData?.totalPages || 0);
        setTotalElements(pageData?.totalElements || pageData?.content?.length || 0);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page, searchQuery, filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handleSortChange = (sortValue) => {
    const [sortBy, sortDir] = sortValue.split('-');
    setFilters((prev) => ({ ...prev, sortBy, sortDir }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sortBy);
    newParams.set('sortDir', sortDir);
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sortBy: 'createdAt',
      sortDir: 'desc',
    });
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeSort = `${filters.sortBy}-${filters.sortDir}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 text-white p-6 sm:p-10 mb-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">
            <SparklesIcon className="h-4 w-4" />
            <span>SalesSavvy Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : filters.category
              ? `${filters.category}`
              : 'All Curated Collections'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Showing {totalElements} verified products with authentic ratings & reviews
          </p>
        </div>

        {(filters.category || filters.minRating || filters.minPrice || searchQuery) && (
          <button
            onClick={clearFilters}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/15 transition-all"
          >
            Reset All Filters
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside
          className={`${
            isFilterOpen ? 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm' : 'hidden'
          } lg:block lg:relative lg:bg-transparent lg:z-auto lg:w-72 flex-shrink-0`}
        >
          <div
            className={`${
              isFilterOpen ? 'absolute left-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto shadow-2xl' : ''
            }`}
          >
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-6 sticky top-28">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Refine By</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearFilters}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Reset
                  </button>
                  <button onClick={() => setIsFilterOpen(false)} className="lg:hidden">
                    <XMarkIcon className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Department / Categories */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Department</h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => handleFilterChange('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      !filters.category
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    All Departments
                  </button>
                  {categories.map((cat) => {
                    const isSelected =
                      filters.category === String(cat.id) ||
                      filters.category.toLowerCase() === cat.name?.toLowerCase();
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleFilterChange('category', cat.name)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Rating */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Customer Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        handleFilterChange('minRating', filters.minRating === String(r) ? '' : String(r))
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all border ${
                        filters.minRating === String(r)
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <StarIcon className="h-4 w-4 text-amber-400" />
                        <span>{r}.0 & above</span>
                      </span>
                      <span className="text-xs text-slate-400">Verified</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Price Range (₹)</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input-field py-2 px-3 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input-field py-2 px-3 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Products Column */}
        <div className="flex-1 min-w-0">
          {/* Sort & Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card mb-6 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Sort:</span>
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeSort === opt.value
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden btn-secondary py-2 px-3.5 text-xs"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex justify-center py-24">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="btn-secondary py-2 px-4 text-xs disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(6, totalPages))].map((_, i) => {
                    const pageNum = page < 3 ? i : page - 2 + i;
                    if (pageNum >= totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="btn-secondary py-2 px-4 text-xs disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card py-20 px-6 text-center">
              <p className="text-xl font-bold text-slate-800 mb-2">No matching products found</p>
              <p className="text-sm text-slate-500 mb-6">Try clearing your filters or searching another keyword.</p>
              <button onClick={clearFilters} className="btn-primary">
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
