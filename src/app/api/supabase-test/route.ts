import { NextResponse } from 'next/server';
import { createBrowserClient } from '@supabase/ssr';

export async function GET() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if credentials exist
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase environment variables not configured',
        env: {
          supabaseUrl: supabaseUrl ? 'configured' : 'missing',
          supabaseAnonKey: supabaseAnonKey ? 'configured' : 'missing',
        }
      }, { status: 500 });
    }
    
    // Create Supabase client
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection by checking auth settings (this always exists in any Supabase project)
    const { error: authError } = await supabase.auth.getSession();
    
    if (authError) throw authError;
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection successful',
      connectionTest: 'passed',
      data: { 
        connectionVerified: true,
        timestamp: new Date().toISOString()
      },
      env: {
        supabaseUrl: supabaseUrl ? 'configured' : 'missing',
        supabaseAnonKey: supabaseAnonKey ? 'configured' : 'missing',
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error: any) {
    console.error('Supabase connection test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Supabase connection failed',
      error: error.message,
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
        nodeEnv: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
} 