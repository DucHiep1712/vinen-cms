import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Plus, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getProductTags, updateProductTags } from '../services/tagsApi';

const ProductTags: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const tagsData = await getProductTags();
      setTags(tagsData);
    } catch (error) {
      toast.error('Không thể tải danh sách thẻ.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (!newTag.trim()) {
      toast.error('Vui lòng nhập tên thẻ.');
      return;
    }
    
    if (tags.includes(newTag.trim())) {
      toast.error('Thẻ này đã tồn tại.');
      return;
    }
    
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const saveTags = async () => {
    setSaving(true);
    try {
      await updateProductTags(tags);
      toast.success('Đã lưu thẻ thành công!');
    } catch (error) {
      toast.error('Không thể lưu thẻ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Quản lý thẻ sản phẩm</h1>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="mb-6">
            <Label htmlFor="newTag" className="text-sm font-medium">
              Thêm thẻ mới
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tên thẻ..."
                className="flex-1"
              />
              <Button onClick={addTag} size="sm" className="cursor-pointer">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">
              Danh sách thẻ ({tags.length})
            </Label>
            {tags.length === 0 ? (
              <p className="text-muted-foreground">Chưa có thẻ nào.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-md"
                  >
                    <span className="text-sm">{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={saveTags}
              disabled={saving}
              className="cursor-pointer"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTags; 