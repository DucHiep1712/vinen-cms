import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2, Search } from 'lucide-react';
// import RowActionsMenu if needed in the future
import toast from 'react-hot-toast';
import { getNews, deleteNews } from '../../services/newsApi';
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
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';

const commonHeaderClass = 'bg-muted/60 text-muted-foreground/60 uppercase text-xs border border-muted-foreground/60 py-2 text-left font-medium';

const newsHeaders = [
  {
    key: 'title',
    label: 'Tiêu đề',
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
    key: 'posted_timestamp',
    label: 'Ngày đăng',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-36',
    cellClass: 'w-48',
  },
  {
    key: 'description',
    label: 'Mô tả',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-[32rem]',
    cellClass: 'w-[32rem] max-w-[32rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2',
  },
  {
    key: 'is_hot',
    label: 'Nổi bật',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-24',
    cellClass: 'w-24',
  },
];

const renderCell = (news: any, key: string) => {
  switch (key) {
    case 'title':
      return <span className="whitespace-nowrap font-medium pl-4">{news.title}</span>;
    case 'image':
      return <img src={news.image} alt={news.title} className="py-2 w-32 object-cover aspect-16/10" />;
    case 'posted_timestamp':
      return (
        <span className="whitespace-nowrap">
          {new Date(news.posted_timestamp * 1000).toLocaleString('vi-VN', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </span>
      );
    case 'description':
      return <span className="whitespace-nowrap">{news.description?.replace(/<[^>]+>/g, '').slice(0, 60) + (news.description?.length > 60 ? '...' : '')}</span>;
    case 'is_hot':
      return news.is_hot ? (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Có</span>
      ) : (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-destructive/70">Không</span>
      );
    default:
      return null;
  }
};

const NewsTable: React.FC = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const rowsPerPage = 6;
  const filteredNews = newsList.filter(news =>
    news.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredNews.length / rowsPerPage);
  const paginatedNews = filteredNews.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const emptyRows = rowsPerPage - paginatedNews.length;

  const fetchNews = () => {
    setLoading(true);
    getNews()
      .then(data => setNewsList(data || []))
      .catch(() => setError('Không thể tải danh sách tin tức.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/news/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteNews(id);
      toast.success('Đã xóa tin tức thành công!');
      fetchNews();
    } catch (err) {
      toast.error('Xóa tin tức thất bại.');
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
            to="/news/new"
            className="fixed bottom-8 right-8"
          >
            <Button size="icon" variant="default" className="rounded-full size-12 cursor-pointer">
              <PlusIcon className="size-6" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent><p>Thêm mới tin tức</p></TooltipContent>
      </Tooltip>
      <div className="w-7xl mx-auto flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Tin tức</h1>
        <div className="relative w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="w-5 h-5" />
          </span>
          <Input
            placeholder="Tìm kiếm tin tức..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="overflow-x-auto rounded-lg bg-background w-7xl relative z-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {newsHeaders.map((header) => (
                  <th key={header.key} className={header.className}>{header.label}</th>
                ))}
                <th className={commonHeaderClass + " flex justify-end border-l-0 rounded-tr-lg rounded-br-lg pr-4 w-12 min-w-[3rem] max-w-[3rem]"}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                  </svg>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedNews.map(news => (
                <tr
                  key={news.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors h-24 cursor-pointer group"
                  onClick={e => {
                    if (openDialogId !== null) return;
                    if ((e.target as HTMLElement).closest('.delete-btn')) return;
                    handleEdit(news.id);
                  }}
                >
                  {newsHeaders.map(header => (
                    <td className={header.cellClass} key={header.key}>{renderCell(news, header.key)}</td>
                  ))}
                  <td className="pr-2 text-end w-12 min-w-[3rem] max-w-[3rem]">
                    <AlertDialog
                      open={openDialogId === news.id}
                      onOpenChange={open => setOpenDialogId(open ? news.id : null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/60 hover:text-background cursor-pointer delete-btn"
                          onClick={e => e.stopPropagation()}
                          disabled={deletingId === news.id}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc muốn xóa tin tức này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Tin tức sẽ bị xóa vĩnh viễn khỏi hệ thống.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(news.id)}
                            disabled={deletingId === news.id}
                            className="cursor-pointer"
                          >
                            {deletingId === news.id ? <span className="animate-spin">...</span> : 'Xóa'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
              {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-24 border-b last:border-0">
                  {newsHeaders.map((header, i) => (
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

export default NewsTable; 