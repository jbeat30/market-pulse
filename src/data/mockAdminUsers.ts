import type { AdminUser } from '@/types/domain';

/** 어드민 계정 mock 데이터 */
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'user_1',
    email: 'owner@example.com',
    name: 'jbeat',
    role: 'SUPER_ADMIN',
    isActive: true,
    lastLoginAt: '2026-07-23T14:55:00+09:00',
    createdAt: '2026-06-01T09:00:00+09:00',
  },
  {
    id: 'user_2',
    email: 'admin@example.com',
    name: '관리자',
    role: 'ADMIN',
    isActive: true,
    lastLoginAt: '2026-07-21T11:20:00+09:00',
    createdAt: '2026-06-10T09:00:00+09:00',
  },
  {
    id: 'user_3',
    email: 'viewer@example.com',
    name: '조회자',
    role: 'VIEWER',
    isActive: false,
    lastLoginAt: null,
    createdAt: '2026-07-01T09:00:00+09:00',
  },
];
