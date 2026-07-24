'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/common';

/**
 * 로그인 페이지
 *
 * @description proxy(구 middleware) 보호 밖의 유일한 공개 경로(05-security.md).
 * NextAuth Credentials provider로 실제 세션 인증 — 계정 존재 여부 비노출을 위해
 * 아이디/비밀번호 오류를 구분하지 않는 일관된 실패 메시지 사용
 */
export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await signIn('credentials', { userId, password, redirect: false });

    if (result?.error) {
      setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다');
      setIsSubmitting(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="toss-card w-full max-w-sm !p-8">
        <h1 className="font-emphasis text-[22px] font-bold text-[var(--foreground)]" style={{ letterSpacing: '-0.02em' }}>
          market-pulse
        </h1>
        <p className="mt-1.5 text-[14px] text-[var(--foreground-muted)]">관리자 계정으로 로그인하세요</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <Label htmlFor="userId" className="mb-2 text-[13px] text-[var(--foreground-muted)]">
              아이디
            </Label>
            <Input
              id="userId"
              type="text"
              autoComplete="username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="mb-2 text-[13px] text-[var(--foreground-muted)]">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && <p className="text-[13px] text-red-500">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="toss-btn toss-btn-primary mt-2 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" strokeWidth={2} />
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
