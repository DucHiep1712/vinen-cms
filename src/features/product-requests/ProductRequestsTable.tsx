import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Search, RefreshCw, User, MapPin, Building, Phone, LayoutDashboard } from 'lucide-react';
import { type ProductRequest, getProductRequests, deleteProductRequest } from '@/services/productRequestsApi';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Function to highlight search terms
const highlightText = (text: string, searchTerm: string) => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className="bg-yellow-200 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
};

// Function to generate pagination items with ellipsis
const generatePaginationItems = (currentPage: number, totalPages: number) => {
  const items = [];
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        items.push(i);
      }
      items.push('...');
      items.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      items.push(1);
      items.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      items.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        items.push(i);
      }
      items.push('...');
      items.push(totalPages);
    }
  }

  return items;
};

const ProductRequestsTable: React.FC = () => {
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [filteredProductRequests, setFilteredProductRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedProductRequest, setSelectedProductRequest] = useState<ProductRequest | null>(null);
  const [showProductRequestDialog, setShowProductRequestDialog] = useState(false);
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const itemsPerPage = 6;

  // Column headers configuration - Updated to show only name, username, phone_number, and actions
  const commonHeaderClass = 'bg-muted/60 text-muted-foreground/60 uppercase text-xs border border-muted-foreground/60 py-2 text-left font-medium';

  const productRequestHeaders = [
    { key: 'name', label: 'Tên sản phẩm', className: `${commonHeaderClass} border-r-0 rounded-tl-lg rounded-bl-lg pl-4 w-80`, cellClass: 'w-80 max-w-[22rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2' },
    { key: 'username', label: 'Tên đăng nhập', className: `${commonHeaderClass} border-l-0 border-r-0 w-64`, cellClass: 'w-64 max-w-[20rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2' },
    { key: 'phone_number', label: 'Số điện thoại', className: `${commonHeaderClass} border-l-0 border-r-0 w-48`, cellClass: 'w-48 max-w-[12rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2' },
  ];

  // Calculate pagination
  const totalPages = Math.ceil(filteredProductRequests.length / itemsPerPage);
  const paginationItems = generatePaginationItems(page, totalPages);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredProductRequests.slice(startIndex, endIndex);
  const emptyRows = Math.max(0, itemsPerPage - currentPageData.length);

  // Fetch product requests
  const fetchProductRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductRequests();
      setProductRequests(data);
      setRetryCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProductRequests();
  }, [fetchProductRequests]);

  // Filter data when search term changes
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredProductRequests(productRequests);
    } else {
      const filtered = productRequests.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      );
      setFilteredProductRequests(filtered);
    }
    setPage(1); // Reset to first page when searching
  }, [debouncedSearchTerm, productRequests]);

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteProductRequest(id);
      setProductRequests(prev => prev.filter(item => item.id !== id));
      setOpenDialogId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle row click to show dialog
  const handleRowClick = (productRequest: ProductRequest) => {
    setSelectedProductRequest(productRequest);
    setShowProductRequestDialog(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent, productRequest: ProductRequest) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(productRequest);
    }
  };

  // Render cell content - Updated to match other tables
  const renderCell = (item: ProductRequest, key: string) => {
    const value = item[key as keyof ProductRequest];

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }

    if (key === 'name') {
      return <span className="whitespace-nowrap font-medium pl-4">{highlightText(value.toString(), debouncedSearchTerm)}</span>;
    }

    return (
      <span className="whitespace-nowrap">
        {highlightText(value.toString(), debouncedSearchTerm)}
      </span>
    );
  };

  if (loading && productRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error && productRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <p className="text-red-600 mb-2">Có lỗi xảy ra: {error}</p>
          <Button onClick={fetchProductRequests} disabled={retryCount >= 3}>
            {retryCount >= 3 ? 'Đã thử tối đa' : 'Thử lại'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-4 p-8 flex-1 w-full">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Yêu cầu sản phẩm</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="w-5 h-5" />
            </span>
            <Input
              placeholder="Tìm kiếm yêu cầu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="overflow-x-auto rounded-lg bg-background w-full max-w-7xl relative z-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {productRequestHeaders.map((header) => (
                  <th key={header.key} className={header.className}>{header.label}</th>
                ))}
                <th className={commonHeaderClass + " flex justify-end border-l-0 rounded-tr-lg rounded-br-lg pr-4"}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                  </svg>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors h-20 cursor-pointer group"
                  onClick={(e) => {
                    if (openDialogId !== null) return;
                    if ((e.target as HTMLElement).closest('.delete-btn')) return;
                    handleRowClick(item);
                  }}
                >
                  {productRequestHeaders.map((header) => (
                    <td key={header.key} className={header.cellClass}>
                      {renderCell(item, header.key)}
                    </td>
                  ))}
                  <td className="pr-2 text-end w-12 min-w-[3rem] max-w-[3rem]">
                    <AlertDialog
                      open={openDialogId === item.id}
                      onOpenChange={open => setOpenDialogId(open ? item.id : null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/60 hover:text-background cursor-pointer delete-btn"
                          onClick={e => e.stopPropagation()}
                          disabled={deletingId === item.id}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa yêu cầu "{item.name}"? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deletingId === item.id ? <span className="animate-spin">...</span> : 'Xóa'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
              {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-24 border-b last:border-0">
                  {productRequestHeaders.map((header, i) => (
                    <td key={i} className={header.cellClass} />
                  ))}
                  <td className="pr-2 text-end w-12 min-w-[3rem] max-w-[3rem]" />
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center w-full mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setPage(p => Math.max(1, p - 1));
                    }}
                    aria-disabled={page === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      isActive={page === i + 1}
                      onClick={e => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setPage(p => Math.min(totalPages, p + 1));
                    }}
                    aria-disabled={page === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* Product Request Details Dialog */}
      <Dialog open={showProductRequestDialog} onOpenChange={setShowProductRequestDialog}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Thông tin chi tiết yêu cầu sản phẩm
            </DialogTitle>
          </DialogHeader>
          {selectedProductRequest && (
            <div className="p-6 pt-0">
              <div className="bg-background rounded-2xl p-6 relative border border-border">
                <div className="flex items-start gap-4">

                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-black">{"Yêu cầu tư vấn sản phẩm " + selectedProductRequest.name}</h3>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedProductRequest.username || 'N/A'}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tên đăng nhập</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedProductRequest.phone_number || 'N/A'}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Số điện thoại</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedProductRequest.org_type || 'N/A'}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Loại tổ chức</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{"TP " + selectedProductRequest.city || 'N/A'}{", Quận / Huyện " + selectedProductRequest.district || 'N/A'}{", " + selectedProductRequest.specific_address || 'N/A'}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Địa chỉ</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductRequestsTable;