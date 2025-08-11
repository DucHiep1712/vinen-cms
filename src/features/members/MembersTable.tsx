import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon, Search, User, MapPin, Calendar, Building, Phone, RefreshCw, Handshake, Filter, ChevronDown, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMembers } from '../../services/membersApi';
import type { Member } from '../../services/membersApi';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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


const commonHeaderClass = 'bg-muted/60 text-muted-foreground/60 uppercase text-xs border border-muted-foreground/60 py-3 font-medium';

const memberHeaders = [
  {
    key: 'id',
    label: 'ID',
    className: commonHeaderClass + ' border-r-0 rounded-tl-lg rounded-bl-lg pl-4 w-48 text-left',
    cellClass: 'pl-4 py-4 font-mono text-sm',
  },
  {
    key: 'username',
    label: 'Tên đăng nhập',
    className: commonHeaderClass + ' border-l-0 border-r-0 min-w-[200px] text-left',
    cellClass: 'py-4 font-medium',
  },
  {
    key: 'phone_number',
    label: 'Số điện thoại',
    className: commonHeaderClass + ' border-l-0 border-r-0 min-w-[140px] text-left',
    cellClass: 'py-4',
  },
  {
    key: 'org',
    label: 'Tổ chức',
    className: commonHeaderClass + ' border-l-0 border-r-0 min-w-[180px] text-left',
    cellClass: 'py-4',
  },
  {
    key: 'is_member',
    label: 'Trạng thái',
    className: commonHeaderClass + ' border-l-0 rounded-tr-lg rounded-br-lg min-w-[120px] text-right pr-4',
    cellClass: 'py-4 text-right',
  },
];

// Debounce hook for search
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

// Highlight search terms in text
const highlightText = (text: string, searchTerm: string) => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : part
  );
};

const renderCell = (member: Member, key: string, searchTerm: string = '') => {
  switch (key) {
    case 'id':
      return (
        <span className="font-mono text-sm">
          {highlightText(member.id, searchTerm)}
        </span>
      );
    case 'username':
      return (
        <span className="font-medium truncate block">
          {member.username ?
            highlightText(member.username, searchTerm) :
            <span className="text-muted-foreground italic">Chưa có tên</span>
          }
        </span>
      );
    case 'phone_number':
      return (
        <span className="truncate block">
          {member.phone_number ?
            highlightText(member.phone_number, searchTerm) :
            <span className="text-muted-foreground italic">Chưa có số điện thoại</span>
          }
        </span>
      );
    case 'org':
      return (
        <span className="truncate block">
          {member.org ?
            highlightText(member.org, searchTerm) :
            <span className="text-muted-foreground italic">Chưa có tổ chức</span>
          }
        </span>
      );
    case 'is_member':
      return (
        <span className="flex justify-end pr-4">
          <span className={`inline-flex items-end px-2 py-1 rounded-full text-xs font-medium ${member.is_member
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
            }`}>
            {member.is_member ? 'Thành viên' : 'Không phải thành viên'}
          </span>
        </span>
      );
    default:
      return null;
  }
};

// Generate pagination items with ellipsis
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

const MembersTable: React.FC = () => {
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'members' | 'non-members'>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const itemsPerPage = 6;

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, memberFilter]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-dropdown')) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMembers();
      setMembersList(data);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching members:', err);
      const errorMessage = 'Không thể tải danh sách người dùng';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchMembers();
  };

  const handleRowClick = (member: Member) => {
    setSelectedMember(member);
    setShowMemberDialog(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent, member: Member) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(member);
    }
  };

  const exportToExcel = () => {
    try {
      // Import xlsx dynamically to avoid SSR issues
      import('xlsx').then((XLSX) => {
        // Prepare data for export
        const exportData = filteredMembers.map(member => ({
          'ID': member.id,
          'Tên đăng nhập': member.username || 'N/A',
          'Số điện thoại': member.phone_number || 'N/A',
          'Tổ chức': member.org || 'N/A',
          'Chức vụ': member.title || 'N/A',
          'Địa chỉ': member.org_location || 'N/A',
          'Ngày sinh': member.dob ? new Date(member.dob).toLocaleDateString('vi-VN') : 'N/A',
          'Người giới thiệu': member.referrer_info || 'N/A',
          'Trạng thái': member.is_member ? 'Thành viên' : 'Không phải thành viên'
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        const colWidths = [
          { wch: 20 }, // ID
          { wch: 25 }, // Tên đăng nhập
          { wch: 15 }, // Số điện thoại
          { wch: 30 }, // Tổ chức
          { wch: 20 }, // Chức vụ
          { wch: 25 }, // Địa chỉ
          { wch: 15 }, // Ngày sinh
          { wch: 20 }, // Người giới thiệu
          { wch: 20 }  // Trạng thái
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách người dùng');

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const filename = `danh_sach_nguoi_dung_${date}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);

        toast.success(`Xuất Excel thành công! ${filteredMembers.length} bản ghi đã được xuất.`);
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Có lỗi khi xuất Excel');
    }
  };

  const filteredMembers = useMemo(() => {
    let filtered = membersList;

    // Apply member status filter
    if (memberFilter !== 'all') {
      filtered = filtered.filter(member => {
        if (memberFilter === 'members') {
          return member.is_member === true;
        } else if (memberFilter === 'non-members') {
          return member.is_member === false;
        }
        return true;
      });
    }

    // Apply search filter
    if (debouncedSearch) {
      filtered = filtered.filter(member => {
        const searchTerm = debouncedSearch.toLowerCase();

        // Search in multiple fields
        const fields = [
          member.id || '',
          member.username || '',
          member.phone_number || '',
          member.org || '',
          member.title || '',
          member.org_location || ''
        ];

        return fields.some(field =>
          field.toLowerCase().includes(searchTerm)
        );
      });
    }

    return filtered;
  }, [membersList, debouncedSearch, memberFilter]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  const emptyRows = Math.max(0, itemsPerPage - paginatedMembers.length);

  const paginationItems = generatePaginationItems(page, totalPages);

  if (loading && membersList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error && membersList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-500 mb-4">{error}</div>
          <Button onClick={handleRetry} variant="outline">
            Thử lại
          </Button>
          {retryCount > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              Đã thử {retryCount} lần
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-4 p-8 min-h-full">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Người dùng</h1>
            {loading && (
              <div className="text-sm text-muted-foreground">
                Đang cập nhật...
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Export to Excel Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={exportToExcel}
              className="flex items-center gap-2 px-3 py-1 h-8 cursor-pointer"
              title="Xuất danh sách ra file Excel"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Xuất Excel</span>
            </Button>
            {/* Member Status Filter Dropdown */}
            <div className="relative filter-dropdown">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1 h-8 cursor-pointer"
              >
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {memberFilter === 'all' && 'Tất cả'}
                  {memberFilter === 'members' && 'Thành viên'}
                  {memberFilter === 'non-members' && 'Không phải thành viên'}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>

              {filterDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMemberFilter('all');
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${memberFilter === 'all'
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-l-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMemberFilter('members');
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${memberFilter === 'members'
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-l-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Thành viên
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMemberFilter('non-members');
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${memberFilter === 'non-members'
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-l-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Không phải thành viên
                    </button>
                  </div>
                </div>
              )}
            </div>


            {/* Search Bar */}
            <div className="relative w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-5 h-5" />
              </span>
              <Input
                placeholder="Tìm kiếm theo ID, tên, SĐT, tổ chức..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Tìm kiếm người dùng"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearch('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 cursor-pointer"
                  aria-label="Xóa tìm kiếm"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <div className="overflow-x-auto rounded-lg bg-background w-full max-w-7xl relative z-0">
          <table className="w-full text-sm table-fixed" role="table" aria-label="Danh sách người dùng">
            <thead>
              <tr>
                {memberHeaders.map((header) => (
                  <th key={header.key} className={header.className} scope="col">
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={memberHeaders.length} className="text-center py-8 text-muted-foreground">
                    {(debouncedSearch || memberFilter !== 'all') ? (
                      <div>
                        <div className="text-lg font-medium mb-2">Không tìm thấy kết quả</div>
                        <div className="text-sm mb-3">
                          {debouncedSearch && `Từ khóa: "${debouncedSearch}"`}
                          {debouncedSearch && memberFilter !== 'all' && ' | '}
                          {memberFilter !== 'all' && `Lọc: ${memberFilter === 'members' ? 'Thành viên' : 'Không phải thành viên'}`}
                        </div>
                        <div className="flex gap-2 justify-center">
                          {debouncedSearch && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearch('')}
                              className="cursor-pointer"
                            >
                              Xóa tìm kiếm
                            </Button>
                          )}
                          {memberFilter !== 'all' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMemberFilter('all')}
                              className="cursor-pointer"
                            >
                              Xóa bộ lọc
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-lg font-medium mb-2">Không có dữ liệu</div>
                        <div className="text-sm text-muted-foreground">
                          Hãy thêm người dùng đầu tiên
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedMembers.map(member => (
                    <tr
                      key={member.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors h-20 cursor-pointer group"
                      onClick={() => handleRowClick(member)}
                      onKeyDown={(e) => handleKeyDown(e, member)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Xem chi tiết người dùng ${member.username || member.id}`}
                    >
                      {memberHeaders.map(header => (
                        <td className={header.cellClass} key={header.key}>
                          {renderCell(member, header.key, debouncedSearch)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-20 border-b last:border-0">
                      {memberHeaders.map((header, i) => (
                        <td key={i} className={header.cellClass} />
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Always show for better UX */}
        <div className="mt-6">
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
                  aria-label="Trang trước"
                />
              </PaginationItem>

              {paginationItems.map((item, index) => (
                <PaginationItem key={index}>
                  {item === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={page === item}
                      onClick={e => {
                        e.preventDefault();
                        setPage(item as number);
                      }}
                      aria-label={`Trang ${item}`}
                    >
                      {item}
                    </PaginationLink>
                  )}
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
                  aria-label="Trang sau"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {filteredMembers.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Không tìm thấy thành viên nào phù hợp với tìm kiếm và bộ lọc.
            </p>
          )}
        </div>
      </div>

      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin chi tiết người dùng
            </DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="p-6 pt-0">
              <div className="bg-background rounded-2xl p-6 relative border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {selectedMember.avatar ? (
                      <img
                        src={selectedMember.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-black">{selectedMember.username}</h3>
                    <p className="text-black text-sm leading-relaxed">
                      {selectedMember.title ? `${selectedMember.title} tại ${selectedMember.org || 'tổ chức'}` :
                        selectedMember.org ? `Nhân viên tại ${selectedMember.org}` : 'Thành viên'}
                    </p>
                    <span className={`inline-flex items-end px-2 py-1 rounded-full text-xs font-medium w-fit ${selectedMember.is_member
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {selectedMember.is_member ? 'Thành viên' : 'Không phải thành viên'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedMember.phone_number || 'N/A'}</span>
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
                        <span className="text-sm">{selectedMember.title || 'N/A'}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chức vụ</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedMember.org_location || 'N/A'}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Địa chỉ</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {selectedMember.dob ? new Date(selectedMember.dob).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ngày sinh</p>
                    </TooltipContent>
                  </Tooltip>
                  {selectedMember.referrer_info && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Handshake className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {selectedMember.referrer_info}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Người giới thiệu</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembersTable; 