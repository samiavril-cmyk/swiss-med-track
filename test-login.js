// Simple test to check Supabase authentication
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://azthgtmchlqhtzlgwolw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dGhndG1jaGxxaHR6bGd3b2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjQ5ODksImV4cCI6MjA3MDkwMDk4OX0.h5Cl_qJHDWlnGArMe8pQCn0rwhYUYBcdaviIvpxryAo";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testLogin() {
  console.log('Testing login with samihosari@me.com...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'samihosari@me.com',
      password: 'password123'
    });
    
    if (error) {
      console.error('Login error:', error);
    } else {
      console.log('Login successful:', data.user?.id);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testLogin();
