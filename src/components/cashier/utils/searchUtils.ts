import { CashierProduct } from '../types/cashier.types';

export const filterProducts = (
  products: CashierProduct[],
  searchTerm: string,
  selectedCategory: string
): CashierProduct[] => {
  return products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
};

export const paginateProducts = (
  products: CashierProduct[],
  currentPage: number,
  productsPerPage: number
) => {
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + productsPerPage);
  
  return {
    products: paginatedProducts,
    totalPages,
    startIndex,
    endIndex: Math.min(startIndex + productsPerPage, products.length)
  };
};