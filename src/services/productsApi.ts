import { supabase } from './supabaseClient';

const TABLE = 'products';

export async function getProducts() {
  // TEMP: Load from local mock JSON
  const data = await import('../features/products/products.mock.json');
  return data.default;
}

export async function getProductById(id: number) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createProduct(product: any) {
  const { data, error } = await supabase.from(TABLE).insert([product]).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, product: any) {
  const { data, error } = await supabase.from(TABLE).update(product).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function seedProducts() {
  const mockProducts = [
    {
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
      title: 'Bút thông minh',
      price: 120000,
      description: 'Bút thông minh với khả năng ghi chú và đồng bộ hóa dữ liệu qua Bluetooth.'
    },
    {
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      title: 'Sổ tay điện tử',
      price: 250000,
      description: 'Sổ tay điện tử hỗ trợ lưu trữ và tìm kiếm ghi chú nhanh chóng.'
    },
    {
      image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
      title: 'Bàn phím cơ mini',
      price: 800000,
      description: 'Bàn phím cơ mini nhỏ gọn, phù hợp cho làm việc di động.'
    },
    {
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      title: 'Đèn bàn LED cảm ứng',
      price: 180000,
      description: 'Đèn bàn LED cảm ứng với nhiều chế độ sáng, tiết kiệm điện năng.'
    },
    {
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
      title: 'Chuột không dây',
      price: 150000,
      description: 'Chuột không dây kết nối nhanh, pin lâu dài.'
    }
  ];
  const { data, error } = await supabase.from(TABLE).insert(mockProducts);
  if (error) throw error;
  return data;
} 