import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts, deleteProduct } from '../../services/productsApi';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';

const commonHeaderClass = 'bg-muted/60 text-muted-foreground/60 uppercase text-xs border border-muted-foreground/60 py-2 text-left font-medium';

const productHeaders = [
  {
    key: 'title',
    label: 'Tên sản phẩm',
    className: commonHeaderClass + ' border-r-0 rounded-tl-lg rounded-bl-lg pl-4 w-80',
    cellClass: 'w-80 max-w-[22rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2',
  },
  {
    key: 'image',
    label: 'Ảnh',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-64',
    cellClass: 'w-64 max-w-[20rem] py-2',
  },
  {
    key: 'price',
    label: 'Giá',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-32',
    cellClass: 'w-32',
  },
  {
    key: 'form_fields',
    label: 'Trường thông tin',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-48',
    cellClass: 'w-48 max-w-[12rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2',
  },
  {
    key: 'description',
    label: 'Mô tả',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-[24rem]',
    cellClass: 'w-[24rem] max-w-[24rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2',
  },
];

const renderCell = (product: any, key: string) => {
  switch (key) {
    case 'title':
      return <span className="whitespace-nowrap font-medium pl-4">{product.title}</span>;
    case 'image':
      return <img src={product.image} alt={product.title} className="py-2 w-32 object-cover aspect-16/10" />;
    case 'price':
      return product.price > 0 ? (
        <span className="font-medium">{product.price.toLocaleString('vi-VN')}<span className="text-xs">đ</span></span>
      ) : (
        <span className="text-green-600 font-semibold">Miễn phí</span>
      );
    case 'form_fields':
      try {
        const formFields = product.form_fields ? JSON.parse(product.form_fields) : {};
        const enabledFields = Object.entries(formFields)
          .filter(([_, value]) => value === true || value === 'true')
          .map(([key, _]) => {
            const fieldLabels: { [key: string]: string } = {
              name: 'Tên',
              phone_number: 'SĐT',
              address: 'Địa chỉ',
              org_type: 'Tổ chức',
              product_of_interest: 'Sản phẩm'
            };
            return fieldLabels[key] || key;
          });
        return enabledFields.length > 0 ? (
          <span className="whitespace-nowrap text-xs">
            {enabledFields.slice(0, 2).join(', ')}
            {enabledFields.length > 2 && ` +${enabledFields.length - 2}`}
          </span>
        ) : (
          <span className="whitespace-nowrap text-xs text-muted-foreground">Không có</span>
        );
      } catch (error) {
        return <span className="whitespace-nowrap text-xs text-muted-foreground">Lỗi</span>;
      }
    case 'description':
      return <span className="whitespace-nowrap">{product.description?.replace(/<[^>]+>/g, '').slice(0, 60) + (product.description?.length > 60 ? '...' : '')}</span>;
    default:
      return null;
  }
};

const ProductsTable: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const rowsPerPage = 6;
  
  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const paginatedProducts = filteredProducts.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const emptyRows = rowsPerPage - paginatedProducts.length;

  // Placeholder: Replace with real API call
  const fetchProducts = () => {
    setLoading(true);
    getProducts()
      .then(data => setProducts(data || []))
      .catch(() => setError('Không thể tải danh sách sản phẩm.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/products/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success('Đã xóa sản phẩm thành công!');
      fetchProducts();
    } catch (err) {
      toast.error('Xóa sản phẩm thất bại.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;

  return (
    <div className="relative flex flex-col items-center gap-4 p-8 flex-1 h-[calc(100vh-80px)]">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/products/new"
            className="absolute bottom-8 right-8"
          >
            <Button size="icon" variant="default" className="rounded-full size-12 cursor-pointer">
              <PlusIcon className="size-6" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent><p>Thêm mới sản phẩm</p></TooltipContent>
      </Tooltip>
              <div className="w-full flex items-center justify-between mb-2">
          <div className="w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">Sản phẩm</h1>
            <div className="relative w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-5 h-5" />
              </span>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      <div className="flex flex-col items-center gap-4">
        <div className="overflow-x-auto rounded-lg bg-background w-7xl relative z-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {productHeaders.map((header) => (
                  <th key={header.key} className={header.className}>{header.label}</th>
                ))}
                <th className={commonHeaderClass + " flex justify-end border-l-0 rounded-tr-lg rounded-br-lg pr-2 w-12 min-w-[3rem] max-w-[3rem]"}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                  </svg>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr
                  key={product.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors h-24 cursor-pointer group"
                  onClick={e => {
                    if (openDialogId !== null) return;
                    if ((e.target as HTMLElement).closest('.delete-btn')) return;
                    handleEdit(product.id);
                  }}
                >
                  {productHeaders.map(header => (
                    <td className={header.cellClass} key={header.key}>{renderCell(product, header.key)}</td>
                  ))}
                  <td className="pr-2 text-end w-12 min-w-[3rem] max-w-[3rem]">
                    <AlertDialog
                      open={openDialogId === product.id}
                      onOpenChange={open => setOpenDialogId(open ? product.id : null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/60 hover:text-background cursor-pointer"
                          onClick={e => e.stopPropagation()}
                          disabled={deletingId === product.id}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc muốn xóa sản phẩm này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="cursor-pointer"
                          >
                            {deletingId === product.id ? <span className="animate-spin">...</span> : 'Xóa'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
              {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-24 border-b last:border-0">
                  {productHeaders.map((header, i) => (
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
    </div>
  );
};

export default ProductsTable; 