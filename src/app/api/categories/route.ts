import { NextResponse } from 'next/server';
import { listCategories, createCategory } from '@/domains/category/service';
import { createCategorySchema } from '@/domains/category/schema';
import { requireAuth } from '@/lib/apiAuth';

/** GET /api/categories — 전체 카테고리 목록 조회 */
export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  const categories = await listCategories();
  const mapped = categories.map((category) => ({
    id: category.id,
    name: category.name,
    naverCode: category.naverCode,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    keywordCount: category._count.keywords,
  }));
  return NextResponse.json(mapped);
}

/** POST /api/categories — 카테고리 생성 */
export async function POST(request: Request) {
  const { response } = await requireAuth();
  if (response) return response;

  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요', issues: parsed.error.issues }, { status: 400 });
  }

  const category = await createCategory(parsed.data);
  return NextResponse.json(category, { status: 201 });
}
