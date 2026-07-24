import { redirect } from 'next/navigation';

/** 루트 진입 시 대시보드로 리다이렉트 — 실제 인증 여부에 따른 분기는 middleware.ts(Chapter 2/4)가 담당 */
export default function RootPage() {
  redirect('/dashboard');
}
