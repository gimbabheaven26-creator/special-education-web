// Server Component — 'use client' 없음
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/profile';

interface AdminOnlyProps {
  children: React.ReactNode;
}

export async function AdminOnly({ children }: AdminOnlyProps) {
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }
  return <>{children}</>;
}
