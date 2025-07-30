import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Editor } from '@tinymce/tinymce-react';
import toast, { Toaster } from 'react-hot-toast';
import { getNewsById, createNews, updateNews, getTagsForNews, updateNewsTags } from '../../services/newsApi';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';
import { Copy, ArrowLeft } from 'lucide-react';
import { isEqual } from 'lodash';
import { Button as ShadcnButton } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Switch } from '../../components/ui/switch';
import { uploadFileFromInput } from '../../services/fileApi';

const defaultNews = {
  title: '',
  image: '',
  posted_timestamp: '',
  description: '',
  is_hot: false,
};

type NewsFormState = typeof defaultNews & { [key: string]: any };

const newsFields = [
  {
    name: 'title',
    label: 'Tiêu đề',
    type: 'text',
    required: true,
    placeholder: 'Nhập tiêu đề tin tức',
    colSpan: 1,
  },
  {
    name: 'posted_timestamp',
    label: 'Ngày & giờ đăng',
    type: 'datetime-local',
    required: true,
    colSpan: 1,
  },
];

const tagOptions = [
  { id: 0, label: 'Tin Hiệp hội' },
  { id: 1, label: 'Tin Hội viên' },
  { id: 2, label: 'Hoạt động' },
  { id: 3, label: 'Chính sách' },
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

const NewsForm: React.FC = () => {
  const [form, setForm] = useState<NewsFormState>(defaultNews);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [imageError, setImageError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const editorRef = useRef<any>(null);
  const [initialForm, setInitialForm] = useState<NewsFormState>(defaultNews);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [initialTags, setInitialTags] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        getNewsById(Number(id)),
        getTagsForNews(Number(id)),
      ])
        .then(([data, tags]) => {
          // Format timestamp for datetime-local input (convert from Unix seconds)
          const formatForInput = (val: number | string) => {
            if (!val) return '';
            const num = typeof val === 'string' ? parseInt(val, 10) : val;
            const d = new Date(num * 1000);
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          };
          setForm({
            ...data,
            posted_timestamp: formatForInput(data.posted_timestamp),
          });
          setInitialForm({
            ...data,
            posted_timestamp: formatForInput(data.posted_timestamp),
          });
          const tagIds = Array.isArray(tags) ? tags.map(t => t.id) : [];
          setSelectedTags(tagIds);
          setInitialTags(tagIds);
        })
        .catch(() => toast.error('Không thể tải dữ liệu tin tức.'))
        .finally(() => setLoading(false));
    } else {
      setInitialForm(defaultNews);
      setSelectedTags([]);
      setInitialTags([]);
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
      
      // Show local preview immediately
      const url = URL.createObjectURL(file);
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
      
      setImageUploading(false);
      e.target.value = '';
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

  const isFormChanged = !isEqual(form, initialForm) || !isEqual(selectedTags, initialTags);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!form.title || !form.posted_timestamp || !form.description) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường bắt buộc.');
      return;
    }
    setLoading(true);
    // Convert datetime-local string to Unix seconds
    const toUnixSeconds = (val: string) => val ? Math.floor(new Date(val).getTime() / 1000) : null;
    const payload = {
      ...form,
      posted_timestamp: toUnixSeconds(form.posted_timestamp),
      // tag_ids removed from payload
    };
    try {
      if (id) {
        await updateNews(Number(id), payload);
        await updateNewsTags(Number(id), selectedTags);
        toast.success('Cập nhật tin tức thành công!');
      } else {
        const created = await createNews(payload);
        if (created && created.id) {
          await updateNewsTags(created.id, selectedTags);
        }
        toast.success('Tạo tin tức thành công!');
      }
      // Do not navigate('/news')
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu tin tức.');
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
            <Button type="button" variant="default" size="sm" onClick={() => navigate('/news')} className="cursor-pointer">
              <ArrowLeft className="w-5 h-5" /> Quay lại
            </Button>
            <h2 className="text-2xl font-bold mb-6">{id ? 'Chỉnh sửa tin tức' : 'Tạo tin tức mới'}</h2>
          </div>
          {newsFields.map(field =>
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
            <Label htmlFor="image" className="mb-1">Ảnh Banner</Label>
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
          <div className="flex flex-col gap-8">
            <div>
              <Label className="mb-1 block">Thẻ tin tức</Label>
              <div className="flex flex-wrap gap-1">
                {tagOptions.map(tag => {
                  const selected = selectedTags.includes(tag.id);
                  return (
                    <ShadcnButton
                      key={tag.id}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors border-2 ${selected ? 'bg-primary text-white border-primary' : 'bg-transparent text-primary border-primary/40 hover:bg-primary/10'} shadow-none`}
                      onClick={() => {
                        setSelectedTags(prev =>
                          selected ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                        );
                      }}
                    >
                      {tag.label}
                    </ShadcnButton>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="is_hot" className="font-medium">Nổi bật</Label>
              <Switch
                id="is_hot"
                checked={form.is_hot}
                onCheckedChange={checked => setForm((prev: typeof form) => ({ ...prev, is_hot: !!checked }))}
              />
            </div>
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
                  images_upload_handler: (
                    blobInfo: any,
                    success: (url: string) => void,
                    failure: (err: string) => void
                  ) => {
                    const reader = new FileReader();
                    reader.onload = () => success(reader.result as string);
                    reader.onerror = () => failure('Không thể tải ảnh');
                    reader.readAsDataURL(blobInfo.blob());
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
              onClick={() => navigate('/news')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !isFormChanged} className="cursor-pointer">
              {id ? 'Lưu thay đổi' : 'Tạo tin tức'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsForm; 