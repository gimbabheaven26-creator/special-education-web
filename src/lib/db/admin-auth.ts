import { createClient } from '@/lib/supabase/server';

export async function verifyAdmin(): Promise<{ authorized: boolean; userId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      return { authorized: true, userId: user.id };
    }
  }

  return { authorized: false };
}

export async function verifyAdminOrApiKey(
  request: Request,
): Promise<{ authorized: boolean; userId?: string; isApiKey?: boolean }> {
  // API 키 우선 확인 (Google Sheets 등 외부 연동용)
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.ADMIN_API_KEY;

  if (apiKey && authHeader === `Bearer ${apiKey}`) {
    return { authorized: true, userId: 'api-key', isApiKey: true };
  }

  // 세션 인증 fallback
  return verifyAdmin();
}
