import { supabase } from './supabaseClient';

export interface Member {
  id: string;
  is_member: boolean;
  username: string;
  phone_number: string;
  dob: string | null;
  org: string | null;
  title: string | null;
  org_location: string | null;
  referrer_info: string | null;
  avatar: string | null;
}

export const getMembers = async (): Promise<Member[]> => {
  try {
    console.log('Fetching members from database...');
    
    // First, let's check if we can access the table at all
    const { count, error: countError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting members:', countError);
    } else {
      console.log('Total count from database:', count);
    }
    
    // Now fetch the actual data
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('username', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Raw data from Supabase:', data);
    console.log('Data length:', data?.length);
    
    // Check for any null or undefined values
    if (data) {
      data.forEach((member, index) => {
        console.log(`Member ${index + 1}:`, member);
        if (!member.username) {
          console.warn(`Member ${index + 1} has no username:`, member);
        }
      });
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

export const deleteMember = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

// Debug function to check table structure
export const checkTableStructure = async () => {
  try {
    console.log('Checking table structure...');
    
    // Try to get table info
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Table access error:', error);
      return false;
    }
    
    console.log('Table accessible, sample data:', data);
    return true;
  } catch (error) {
    console.error('Error checking table structure:', error);
    return false;
  }
};

// Function to insert test data if needed
export const insertTestMember = async (memberData: Partial<Member>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('members')
      .insert([memberData]);

    if (error) {
      throw error;
    }
    
    console.log('Test member inserted successfully');
  } catch (error) {
    console.error('Error inserting test member:', error);
    throw error;
  }
}; 