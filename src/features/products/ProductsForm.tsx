import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Editor } from '@tinymce/tinymce-react';
import toast, { Toaster } from 'react-hot-toast';
import { getProductById, createProduct, updateProduct } from '../../services/productsApi';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';
import { Copy, ArrowLeft } from 'lucide-react';
import { isEqual } from 'lodash';
import { uploadFileFromInput } from '../../services/fileApi';
import { TagsInput, TagsInputLabel, TagsInputList, TagsInputItem, TagsInputInput, TagsInputClear } from '../../components/ui/tags-input';

const defaultProduct = {
  title: '',
  image: '',
  price: '',
  description: '',
  form_fields: '{"name": "false", "phone_number": "false", "address": "false", "org_type": "false", "product_of_interest": "false"}',
};

type ProductFormState = typeof defaultProduct & { [key: string]: any };

const productFields = [
  {
    name: 'title',
    label: 'Tên sản phẩm',
    type: 'text',
    required: true,
    placeholder: 'Nhập tên sản phẩm',
    colSpan: 1,
  },
  {
    name: 'price',
    label: 'Giá (VNĐ)',
    type: 'number',
    required: true,
    placeholder: 'Nhập giá sản phẩm hoặc 0 nếu miễn phí',
    colSpan: 1,
  },
];

const checkboxOptions = [
  { id: 'name', label: 'Tên' },
  { id: 'phone_number', label: 'Số điện thoại' },
  { id: 'address', label: 'Địa chỉ' },
  { id: 'org_type', label: 'Loại tổ chức' },
  { id: 'product_of_interest', label: 'Sản phẩm quan tâm' },
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

const ProductsForm: React.FC = () => {
  const [form, setForm] = useState<ProductFormState>(defaultProduct);
  const [initialForm, setInitialForm] = useState<ProductFormState>(defaultProduct);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [imageError, setImageError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [checkboxState, setCheckboxState] = useState<{ [key: string]: boolean }>({
    name: false,
    phone_number: false,
    address: false,
    org_type: false,
    product_of_interest: false,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [initialTags, setInitialTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getProductById(Number(id))
        .then(data => {
          console.log('Raw tags from DB:', data.tags);
          console.log('Type of tags:', typeof data.tags);
          
          // Parse tags from JSON string if it's a string, otherwise use as is
          const parseTags = (tags: any) => {
            if (typeof tags === 'string') {
              try {
                return JSON.parse(tags);
              } catch (error) {
                console.error('Error parsing tags:', error);
                return [];
              }
            }
            return Array.isArray(tags) ? tags : [];
          };
          
          const parsedTags = parseTags(data.tags);
          console.log('Parsed tags:', parsedTags);
          
          setForm({ 
            ...data,
            tags: parsedTags,
          });
          setInitialForm({ 
            ...data,
            tags: parsedTags,
          });
          setSelectedTags(parsedTags);
          setInitialTags(parsedTags);
          
          // Parse form_fields if it exists
          if (data.form_fields) {
            try {
              const parsedFields = JSON.parse(data.form_fields);
              setCheckboxState(parsedFields);
            } catch (error) {
              console.error('Error parsing form_fields:', error);
              setCheckboxState({
                name: false,
                phone_number: false,
                address: false,
                org_type: false,
                product_of_interest: false,
              });
            }
          }
        })
        .catch(() => toast.error('Không thể tải dữ liệu sản phẩm.'))
        .finally(() => setLoading(false));
    } else {
      setInitialForm(defaultProduct);
      setCheckboxState({
        name: false,
        phone_number: false,
        address: false,
        org_type: false,
        product_of_interest: false,
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: typeof form) => ({
      ...prev,
      [name]: value,
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

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    setCheckboxState(prev => ({
      ...prev,
      [optionId]: checked,
    }));
    // Update form state to trigger change detection
    setForm(prev => ({
      ...prev,
      form_fields: JSON.stringify({
        ...checkboxState,
        [optionId]: checked,
      }),
    }));
  };

  const isFieldInvalid = (field: string) => touched[field] && (!form[field] || form[field] === '');

  const exportHtml = () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent();
      window.navigator.clipboard.writeText(html);
      toast.success('Đã sao chép HTML vào clipboard!');
    }
  };

  const isFormChanged = !isEqual(form, initialForm) || !isEqual(checkboxState, JSON.parse(form.form_fields || '{"name": "false", "phone_number": "false", "address": "false", "org_type": "false", "product_of_interest": "false"}')) || !isEqual(selectedTags, initialTags);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!form.title || form.price === '' || !form.description) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường bắt buộc.');
      return;
    }
    setLoading(true);
    
    // Convert checkbox state to stringified JSON
    const formFieldsJson = JSON.stringify(checkboxState);
    
    const payload = {
      ...form,
      price: form.price === '' ? 0 : Number(form.price),
      form_fields: formFieldsJson,
      tags: JSON.stringify(selectedTags), // Convert array to JSON string for database storage
    };
    
    try {
      if (id) {
        await updateProduct(Number(id), payload);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await createProduct(payload);
        toast.success('Tạo sản phẩm thành công!');
      }
      // Do not navigate('/products')
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu sản phẩm.');
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
            <Button type="button" variant="default" size="sm" onClick={() => navigate('/products')} className="cursor-pointer">
              <ArrowLeft className="w-5 h-5" /> Quay lại
            </Button>
            <h2 className="text-2xl font-bold mb-6">{id ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</h2>
          </div>
          {productFields.map(field =>
            renderField(
              field,
              form[field.name],
              handleChange,
              handleBlur,
              isFieldInvalid(field.name)
            )
          )}
          
          {/* Checkbox section */}
          <div className="md:col-span-2">
            <Label className="mb-3 block">Các trường thông tin khách hàng</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
              {checkboxOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={checkboxState[option.id]}
                    onCheckedChange={(checked) => handleCheckboxChange(option.id, checked as boolean)}
                    className="cursor-pointer"
                  />
                  <Label htmlFor={option.id} className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Chọn các trường thông tin mà khách hàng cần điền khi quan tâm đến sản phẩm này
            </p>
          </div>

          {/* image and description fields remain as custom blocks below */}
          <div>
            <Label htmlFor="image" className="mb-1">Ảnh sản phẩm</Label>
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
              <TagsInput
                value={selectedTags}
                onValueChange={setSelectedTags}
                className="flex w-full flex-col"
                editable
              >
                <TagsInputLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Thẻ sản phẩm
                </TagsInputLabel>
                <TagsInputList className="flex mt-1 min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-3 focus-within:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50">
                  {selectedTags.map((tag: string) => (
                    <TagsInputItem
                      key={tag}
                      value={tag}
                      className="inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded-md border bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80"
                    >
                      {tag}
                    </TagsInputItem>
                  ))}
                  <TagsInputInput
                    placeholder="Thêm thẻ..."
                    className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </TagsInputList>
                {selectedTags.length > 0 && (
                  <TagsInputClear className="flex mt-2 h-8 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    Xóa tất cả
                  </TagsInputClear>
                )}
              </TagsInput>
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
                  powerpaste_word_import: 'clean',
                  powerpaste_html_import: 'clean',
                  powerpaste_keep_unsupported_src: false,
                  powerpaste_remove_unsupported_src: true,
                  powerpaste_upload_images: true,
                  powerpaste_images_upload_handler: (blobInfo: any, progress: any) => new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.withCredentials = false;
                    xhr.open('POST', '/api/upload-imgbb');

                    xhr.upload.onprogress = (e) => {
                      progress(e.loaded / e.total * 100);
                    };

                    xhr.onload = () => {
                      if (xhr.status === 403) {
                        reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
                        return;
                      }

                      if (xhr.status < 200 || xhr.status >= 300) {
                        reject('HTTP Error: ' + xhr.status);
                        return;
                      }

                      const json = JSON.parse(xhr.responseText);

                      if (!json || typeof json.location != 'string') {
                        reject('Invalid JSON: ' + xhr.responseText);
                        return;
                      }

                      resolve(json.location);
                    };

                    xhr.onerror = () => {
                      reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
                    };

                    const formData = new FormData();
                    formData.append('file', blobInfo.blob(), blobInfo.filename());

                    xhr.send(formData);
                  }),
                  images_upload_handler: (blobInfo: any, progress: any) => new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.withCredentials = false;
                    xhr.open('POST', '/api/upload-imgbb');

                    xhr.upload.onprogress = (e) => {
                      progress(e.loaded / e.total * 100);
                    };

                    xhr.onload = () => {
                      if (xhr.status === 403) {
                        reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
                        return;
                      }

                      if (xhr.status < 200 || xhr.status >= 300) {
                        reject('HTTP Error: ' + xhr.status);
                        return;
                      }

                      const json = JSON.parse(xhr.responseText);

                      if (!json || typeof json.location != 'string') {
                        reject('Invalid JSON: ' + xhr.responseText);
                        return;
                      }

                      resolve(json.location);
                    };

                    xhr.onerror = () => {
                      reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
                    };

                    const formData = new FormData();
                    formData.append('file', blobInfo.blob(), blobInfo.filename());

                    xhr.send(formData);
                  }),
                }}
                onEditorChange={content => setForm((prev: typeof form) => ({ ...prev, description: content }))}
              />
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/products')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !isFormChanged} className="cursor-pointer">
              {id ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductsForm; 