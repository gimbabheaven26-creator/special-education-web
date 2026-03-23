import Link from 'next/link';
import { Settings, FileText, BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export async function AdminQuickAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return null;

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <Settings className="h-4 w-4" />
        <span className="text-sm font-semibold">관리자</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/admin/editor"
          className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-card border border-border hover:bg-muted/50 transition-colors"
        >
          <FileText className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium">문제 관리</span>
        </Link>
        <Link
          href="/admin"
          className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-card border border-border hover:bg-muted/50 transition-colors"
        >
          <BarChart3 className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium">통계 대시보드</span>
        </Link>
      </div>
    </div>
  );
}
