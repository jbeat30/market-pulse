import { NextResponse } from 'next/server';
import { listCategories, createCategory } from '@/domains/category/service';
import { createCategorySchema } from '@/domains/category/schema';

/** GET /api/categories — 전체 카테고리 목록 조회 */
export async function GET() {
  const categories = await listCategories();
  return NextResponse.json(categories);
}

/** POST /api/categories — 카테고리 생성 */
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요', issues: parsed.error.issues }, { status: 400 });
  }

  const category = await createCategory(parsed.data);
  return NextResponse.json(category, { status: 201 });
}
