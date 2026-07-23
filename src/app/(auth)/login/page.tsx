'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/common';

/**
 * 로그인 페이지
 *
 * @description 미들웨어 보호 밖의 유일한 공개 경로(05-security.md). Chapter 1은 폼 UI만 구현하며
 * 실제 세션 인증(httpOnly 쿠키, argon2 해시 검증)은 Chapter 2/4에서 연결
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1000);
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
            <Label htmlFor="email" className="mb-2 text-[13px] text-[var(--foreground-muted)]">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
