import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2, Search } from 'lucide-react';
import { getEvents, deleteEvent } from '../../services/eventsApi';
import toast from 'react-hot-toast';
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

const eventHeaders = [
  {
    key: 'title',
    label: 'Tên sự kiện',
    className: commonHeaderClass + ' border-r-0 rounded-tl-lg rounded-bl-lg pl-4 w-56',
    cellClass: 'w-56 max-w-[14rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2',
  },
  {
    key: 'image',
    label: 'Ảnh',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-36',
    cellClass: 'w-40',
  },
  {
    key: 'occurence_timestamp',
    label: 'Ngày diễn ra',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-36',
    cellClass: 'w-48',
  },
  {
    key: 'sale_end_timestamp',
    label: 'Kết thúc bán vé',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-36',
    cellClass: 'w-36',
  },
  {
    key: 'location',
    label: 'Địa điểm',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-40',
    cellClass: 'w-40 max-w-[10rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2',
  },
  {
    key: 'organizer',
    label: 'Ban tổ chức',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-32',
    cellClass: 'w-32 max-w-[8rem] text-ellipsis overflow-hidden whitespace-nowrap pr-2',
  },
  {
    key: 'price',
    label: 'Giá vé',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-28',
    cellClass: 'w-28',
  },
  {
    key: 'is_hot',
    label: 'Nổi bật',
    className: commonHeaderClass + ' border-l-0 border-r-0 w-24',
    cellClass: 'w-24',
  },
];

const renderCell = (event: any, key: string) => {
  switch (key) {
    case 'title':
      return <span className="whitespace-nowrap font-medium pl-4">{event.title}</span>;
    case 'image':
      return <img src={event.image} alt={event.title} className="py-2 w-32 object-cover aspect-16/10" />;
    case 'occurence_timestamp':
      return (
        <span className="whitespace-nowrap">
          {new Date(event.occurence_timestamp * 1000).toLocaleString('vi-VN', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </span>
      );
    case 'sale_end_timestamp':
      return <span className="whitespace-nowrap">{new Date(event.sale_end_timestamp * 1000).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>;
    case 'location':
      return <span className="whitespace-nowrap">{event.location}</span>;
    case 'organizer':
      return <span className="whitespace-nowrap">{event.organizer}</span>;
    case 'price':
      return event.price > 0 ? (
        <span className="font-medium">{event.price}<span className="text-xs">đ</span></span>
      ) : (
        <span className="text-green-600 font-semibold">Miễn phí</span>
      );
    case 'is_hot':
      return event.is_hot ? (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Có</span>
      ) : (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-destructive/70">Không</span>
      );
    default:
      return null;
  }
};

const EventsTable: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;
  const [search, setSearch] = useState('');

  const fetchEvents = () => {
    setLoading(true);
    getEvents()
      .then(data => setEvents(data || []))
      .catch(err => setError('Không thể tải danh sách sự kiện.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/events/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteEvent(id);
      toast.success('Đã xóa sự kiện thành công!');
      fetchEvents();
    } catch (err) {
      toast.error('Xóa sự kiện thất bại.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);
  const paginatedEvents = filteredEvents.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const emptyRows = rowsPerPage - paginatedEvents.length;

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;

  return (
    <div className="relative flex flex-col items-center gap-4 p-8 flex-1 h-[calc(100vh-80px)]">
      <Tooltip>
        <TooltipTrigger asChild>
      <Link
        to="/events/new"
        className="absolute bottom-8 right-8"
      >
        <Button size="icon" variant="default" className="rounded-full size-12 cursor-pointer">
          <PlusIcon className="size-6" />
        </Button>
      </Link>
        </TooltipTrigger>
        <TooltipContent><p>Thêm mới sự kiện</p></TooltipContent>
      </Tooltip>
      <div className="w-full flex items-center justify-between mb-2">
        <div className="w-7xl mx-auto flex items-center justify-between">
      <h1 className="text-2xl font-bold">Sự kiện</h1>
          <div className="relative w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="w-5 h-5" />
            </span>
            <Input
              placeholder="Tìm kiếm sự kiện..."
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
                {eventHeaders.map((header) => (
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
              {paginatedEvents.map(event => (
                <tr
                  key={event.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors h-24 cursor-pointer group"
                  onClick={e => {
                    if (openDialogId !== null) return;
                    if ((e.target as HTMLElement).closest('.delete-btn')) return;
                    handleEdit(event.id);
                  }}
                >
                  {eventHeaders.map(header => (
                    <td className={header.cellClass} key={header.key}>{renderCell(event, header.key)}</td>
                  ))}
                  <td className="pr-2 text-end">
                    <AlertDialog
                      open={openDialogId === event.id}
                      onOpenChange={open => setOpenDialogId(open ? event.id : null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/60 hover:text-background cursor-pointer delete-btn"
                          onClick={e => e.stopPropagation()}
                          disabled={deletingId === event.id}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc muốn xóa sự kiện này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Sự kiện sẽ bị xóa vĩnh viễn khỏi hệ thống.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(event.id)}
                            disabled={deletingId === event.id}
                            className="cursor-pointer"
                          >
                            {deletingId === event.id ? <span className="animate-spin">...</span> : 'Xóa'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
              {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-24 border-b last:border-0">
                  {eventHeaders.map((header, i) => (
                    <td key={i} className={header.cellClass} />
                  ))}
                  <td className="pr-2 text-end" />
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

export default EventsTable; 