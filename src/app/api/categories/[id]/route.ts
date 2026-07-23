import { NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/domains/category/service';
import { updateCategorySchema } from '@/domains/category/schema';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** PATCH /api/categories/:id — 카테고리 수정 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요', issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const category = await updateCategory(id, parsed.data);
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ message: '카테고리를 찾을 수 없습니다' }, { status: 404 });
  }
}

/** DELETE /api/categories/:id — 카테고리 삭제(하위 잡 이력은 SetNull로 보존) */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await deleteCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: '카테고리를 찾을 수 없습니다' }, { status: 404 });
  }
}
