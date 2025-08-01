import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../services/supabaseClient';

async function seedEvents() {
  const mockEvents = [
    {
      title: 'Lễ hội mùa hè',
      image: 'https://source.unsplash.com/random/400x225?event',
      occurence_timestamp: Date.now() + 86400000,
      sale_end_timestamp: Date.now() + 43200000,
      location: 'Công viên Trung tâm',
      organizer: 'Maria Saris',
      price: 100000,
      description: '<p>Lễ hội mùa hè với âm nhạc, ẩm thực và trò chơi.</p>',
      is_hot: true,
    },
    {
      title: 'Triển lãm Công nghệ',
      image: 'https://source.unsplash.com/random/400x225?tech',
      occurence_timestamp: Date.now() + 172800000,
      sale_end_timestamp: Date.now() + 86400000,
      location: 'Trung tâm Triển lãm',
      organizer: 'John Doe',
      price: 0,
      description: '<p>Triển lãm công nghệ thường niên.</p>',
      is_hot: false,
    },
    // Add more mock events as needed
  ];

  const { data, error } = await supabase.from('events').insert(mockEvents);
  if (error) {
    console.error('Error inserting mock events:', error);
  } else {
    console.log('Inserted mock events:', data);
  }
}

seedEvents();