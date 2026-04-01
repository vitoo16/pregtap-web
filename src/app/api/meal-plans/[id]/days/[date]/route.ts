import { proxyGet } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Transform BE MealDayDetailDto → FE MealDay format
function transformMealDay(be: Record<string, unknown>): Record<string, unknown> {
  const meals = (be.meals as Record<string, unknown>[] | undefined)?.map((m: Record<string, unknown>) => ({
    id: m.id,
    title: m.itemName,
    mealType: m.mealType,
    description: m.notes,
    portionText: m.portionText,
    calories: m.caloriesKcal,
    nutrients: (m.nutrients as Record<string, unknown>[] | undefined)?.map((n: Record<string, unknown>) => ({
      code: n.nutrientCode,
      value: n.amount,
      unit: n.unit,
    })),
  })) ?? [];

  return {
    date: be.planDate,
    weekday: be.planDate ? format(new Date(be.planDate as string), 'EEEE', { locale: vi }) : '',
    meals,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; date: string }> }
) {
  const accessToken = getBearerToken(_request);
  const { id, date } = await params;

  const upstream = await fetch(
    `${process.env.AUTH_API_BASE_URL}/meal-plans/${id}/days/${date}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  );

  const contentType = upstream.headers.get('content-type') ?? '';
  let body: Record<string, unknown>;
  if (contentType.includes('application/json')) {
    body = await upstream.json();
  } else {
    body = { success: upstream.ok, statusCode: upstream.status };
  }

  // Transform data if success
  if (body.success && body.data) {
    body = { ...body, data: transformMealDay(body.data as Record<string, unknown>) };
  }

  return Response.json(body, { status: upstream.status });
}
