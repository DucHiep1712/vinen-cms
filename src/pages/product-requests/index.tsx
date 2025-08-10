import React from 'react';
import ProductRequestsTable from '@/features/product-requests/ProductRequestsTable';

const ProductRequestsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductRequestsTable />
    </div>
  );
};

export default ProductRequestsPage; 