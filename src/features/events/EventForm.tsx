import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { getEventById, createEvent, updateEvent } from '../../services/eventsApi';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';
import { Copy } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { isEqual } from 'lodash';
import { uploadFileFromInput, uploadBlobToCloud } from '../../services/fileApi';

const defaultEvent = {
  title: '',
  image: '',
  occurence_timestamp: '',
  sale_end_timestamp: '',
  location: '',
  organizer: '',
  price: '',
  description: '',
  is_hot: false,
};

type EventFormState = typeof defaultEvent & { [key: string]: any };

  const eventFields = [
    {
      name: 'title',
      label: 'Tên sự kiện',
      type: 'text',
      required: true,
      placeholder: 'Nhập tên sự kiện',
      colSpan: 1,
    },
    {
      name: 'occurence_timestamp',
      label: 'Ngày & giờ diễn ra',
      type: 'datetime-local',
      required: true,
      colSpan: 1,
    },
    {
      name: 'sale_end_timestamp',
      label: 'Kết thúc bán vé',
      type: 'datetime-local',
      required: true,
      colSpan: 1,
    },
    {
      name: 'location',
      label: 'Địa điểm',
      type: 'text',
      required: true,
      placeholder: 'Nhập địa điểm',
      colSpan: 1,
    },
    {
      name: 'organizer',
      label: 'Ban tổ chức',
      type: 'text',
      required: true,
      placeholder: 'Nhập tên ban tổ chức',
      colSpan: 1,
    },
    {
      name: 'price',
      label: 'Giá vé (VNĐ)',
      type: 'number',
      required: true,
      placeholder: 'Nhập giá vé hoặc 0 nếu miễn phí',
      colSpan: 1,
    },
  ];

  function renderField(field: any, value: any, onChange: any, onBlur: any, isInvalid: boolean) {
    return (
      <div key={field.name} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
        <Label htmlFor={field.name} className="mb-1">
          {field.label}
        {field.required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={field.name}
          name={field.name}
          type={field.type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={field.required}
          placeholder={field.placeholder}
        />
      {isInvalid && <span className="text-destructive text-xs">Trường này là bắt buộc.</span>}
      </div>
    );
  }

const EventForm: React.FC = () => {
  const [form, setForm] = useState<EventFormState>(defaultEvent);
  const [initialForm, setInitialForm] = useState<EventFormState>(defaultEvent);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [imageError, setImageError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getEventById(Number(id))
        .then(data => {
          // Format timestamps for datetime-local input (convert from Unix seconds)
          const formatForInput = (val: number | string) => {
            if (!val) return '';
            // If value is a string, try to parse as number
            const num = typeof val === 'string' ? parseInt(val, 10) : val;
            const d = new Date(num * 1000);
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          };
          setForm({
            ...data,
            occurence_timestamp: formatForInput(data.occurence_timestamp),
            sale_end_timestamp: formatForInput(data.sale_end_timestamp),
          });
          setInitialForm({
            ...data,
            occurence_timestamp: formatForInput(data.occurence_timestamp),
            sale_end_timestamp: formatForInput(data.sale_end_timestamp),
          });
        })
        .catch(() => toast.error('Không thể tải dữ liệu sự kiện.'))
        .finally(() => setLoading(false));
    } else {
      setInitialForm(defaultEvent);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev: typeof form) => ({
      ...prev,
      [name]: type === 'checkbox' && e.target instanceof HTMLInputElement ? e.target.checked : value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageUploading(true);
      setImageError('');
      
      // First validate aspect ratio
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = async () => {
        const aspect = img.width / img.height;
        const is16by9 = Math.abs(aspect - 16 / 9) < 0.05;
        const is16by10 = Math.abs(aspect - 16 / 10) < 0.05;
        
        if (is16by9 || is16by10) {
          // Show local preview immediately
          setForm((prev: typeof form) => ({ ...prev, image: url }));
          
          // Upload to AWS S3
          try {
            const cdnUrl = await uploadFileFromInput(file, false);
            if (cdnUrl) {
              // Update form with CDN URL
              setForm((prev: typeof form) => ({ ...prev, image: cdnUrl }));
              toast.success('Ảnh đã được tải lên thành công!');
            } else {
              setImageError('Không thể tải ảnh lên cloud storage.');
              // Remove the local preview if upload failed
              setForm((prev: typeof form) => ({ ...prev, image: '' }));
            }
          } catch (error) {
            console.error('Upload error:', error);
            setImageError('Lỗi khi tải ảnh lên cloud storage.');
            // Remove the local preview if upload failed
            setForm((prev: typeof form) => ({ ...prev, image: '' }));
          }
        } else {
          setImageError('Ảnh phải có tỉ lệ 16:9 hoặc 16:10.');
          setForm((prev: typeof form) => ({ ...prev, image: '' }));
        }
        setImageUploading(false);
        e.target.value = '';
      };
      img.onerror = () => {
        setImageError('Không thể đọc ảnh.');
        setForm((prev: typeof form) => ({ ...prev, image: '' }));
        setImageUploading(false);
        e.target.value = '';
      };
      img.src = url;
    } else {
      e.target.value = '';
    }
  };

  const isFieldInvalid = (field: string) => touched[field] && (!form[field] || form[field] === '');

  const exportHtml = () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent();
      window.navigator.clipboard.writeText(html);
      toast.success('Đã sao chép HTML vào clipboard!');
    }
  };

  const isFormChanged = !isEqual(form, initialForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!form.title || !form.occurence_timestamp || !form.sale_end_timestamp || !form.location || !form.organizer || form.price === '' || !form.description) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường bắt buộc.');
      return;
    }
    setLoading(true);
    // Convert timestamps to Unix seconds
    const toUnixSeconds = (val: string) => val ? Math.floor(new Date(val).getTime() / 1000) : null;
    const payload = {
      ...form,
      occurence_timestamp: toUnixSeconds(form.occurence_timestamp),
      sale_end_timestamp: toUnixSeconds(form.sale_end_timestamp),
    };
    try {
      if (id) {
        await updateEvent(Number(id), payload);
        toast.success('Cập nhật sự kiện thành công!');
      } else {
        await createEvent(payload);
        toast.success('Tạo sự kiện thành công!');
      }
      // Do not navigate('/events')
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu sự kiện.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-fit w-full bg-background p-0 m-0 overflow-auto flex flex-col">
      <Toaster position="top-center" />
      <div className="flex-1 flex flex-col justify-start items-center">
        <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-2 mb-2 flex flex-col items-start gap-8">
            <Button type="button" variant="default" size="sm" onClick={() => navigate('/events')} className="cursor-pointer">
              <ArrowLeft className="w-5 h-5" /> Quay lại
            </Button>
            <h2 className="text-2xl font-bold mb-6">{id ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</h2>
          </div>
          {eventFields.map(field =>
            renderField(
              field,
              form[field.name],
              handleChange,
              handleBlur,
              isFieldInvalid(field.name)
            )
          )}
          {/* image, is_hot, description fields remain as custom blocks below */}
          <div>
            <Label htmlFor="image" className="mb-1">Ảnh Banner (16:9 hoặc 16:10)</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={imageUploading}
            />
            {imageUploading && (
              <div className="text-blue-600 text-sm mt-1">Đang tải ảnh lên cloud storage...</div>
            )}
            {imageError && (
              <div className="text-destructive text-sm mt-1">{imageError}</div>
            )}
            {form.image && !imageError && (
              <img src={form.image} alt="Preview" className="mt-2 rounded max-h-40 object-contain border" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="is_hot" className="font-medium">Nổi bật</Label>
            <Switch
              id="is_hot"
              checked={form.is_hot}
              onCheckedChange={checked => setForm((prev: typeof form) => ({ ...prev, is_hot: !!checked }))}
            />
          </div>
          <div className="md:col-span-2">
            <div className="w-full flex justify-between items-center">
              <Label htmlFor="description" className="mb-1 inline-block">Mô tả (soạn thảo văn bản, chèn ảnh)</Label>
              <div className="flex items-center justify-end mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={exportHtml}
                      className="ml-2 cursor-pointer"
                    >
                      <Copy className="w-5 h-5 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sao chép HTML</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="rounded bg-background">
            <Editor
              apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
              onInit={(_evt, editor) => (editorRef.current = editor)}
              value={form.description}
              init={{
                height: 500,
                menubar: false,
                plugins: [
                  'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                  'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'mentions', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
                ],
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                content_style:
                  'body { font-family: TikTok Sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif; font-size:16px }',
                language: 'vi',
                images_upload_url: '/api/upload-imgbb',
                automatic_uploads: true,
                images_upload_handler: function (blobInfo: any, success: any, failure: any) {
                  const formData = new FormData();
                  formData.append('file', blobInfo.blob(), blobInfo.filename());
                  
                  fetch('/api/upload-imgbb', {
                    method: 'POST',
                    body: formData
                  })
                  .then(response => response.json())
                  .then(result => {
                    if (result.success && result.location) {
                      success(result.location);
                    } else {
                      failure(result.error || 'Upload failed');
                    }
                  })
                  .catch(error => {
                    failure('Upload failed: ' + error.message);
                  });
                },
              }}
              onEditorChange={content => setForm((prev: typeof form) => ({ ...prev, description: content }))}
            />
          </div>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !isFormChanged} className="cursor-pointer">
              {id ? 'Lưu thay đổi' : 'Tạo sự kiện'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm; 