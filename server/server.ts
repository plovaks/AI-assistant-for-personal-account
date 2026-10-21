import Fastify from 'fastify';

import items from 'data/items.json' with { type: 'json' };
import { Item } from 'src/types.ts';
import { ItemsGetInQuerySchema, ItemUpdateInSchema } from 'src/validation.ts';
import { treeifyError, ZodError } from 'zod';
import { doesItemNeedRevision } from './src/utils.ts';
import 'dotenv/config'; 


const ITEMS = items as Item[];


const fastify = Fastify({
  logger: true,
});

await fastify.register((await import('@fastify/middie')).default);

// Искуственная задержка ответов, чтобы можно было протестировать состояния загрузки
fastify.use((_, __, next) =>
  new Promise(res => setTimeout(res, 300 + Math.random() * 700)).then(next),
);

// Настройка CORS
fastify.use((_, reply, next) => {
  reply.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

interface ItemGetRequest extends Fastify.RequestGenericInterface {
  Params: {
    id: string;
  };
}

fastify.get<ItemGetRequest>('/items/:id', (request, reply) => {
  const itemId = Number(request.params.id);

  if (!Number.isFinite(itemId)) {
    reply
      .status(400)
      .send({ success: false, error: 'Item ID path param should be a number' });
    return;
  }

  const item = ITEMS.find(item => item.id === itemId);

  if (!item) {
    reply
      .status(404)
      .send({ success: false, error: "Item with requested id doesn't exist" });
    return;
  }

  return {
    ...item,
    needsRevision: doesItemNeedRevision(item),
  };
});

interface ItemsGetRequest extends Fastify.RequestGenericInterface {
  Querystring: {
    q?: string;
    limit?: string;
    skip?: string;
    categories?: string;
    needsRevision?: string;
  };
}

fastify.get<ItemsGetRequest>('/items', request => {
  const {
    q,
    limit,
    skip,
    needsRevision,
    categories,
    sortColumn,
    sortDirection,
  } = ItemsGetInQuerySchema.parse(request.query);

  const filteredItems = ITEMS.filter(item => {
    return (
      item.title.toLowerCase().includes(q.toLowerCase()) &&
      (!needsRevision || doesItemNeedRevision(item)) &&
      (!categories?.length ||
        categories.some(category => item.category === category))
    );
  });

  return {
    items: filteredItems
      .toSorted((item1, item2) => {
        let comparisonValue = 0;

        if (!sortDirection) return comparisonValue;

        if (sortColumn === 'title') {
          comparisonValue = item1.title.localeCompare(item2.title);
        } else if (sortColumn === 'createdAt') {
          comparisonValue =
            new Date(item1.createdAt).valueOf() -
            new Date(item2.createdAt).valueOf();
        }

        return (sortDirection === 'desc' ? -1 : 1) * comparisonValue;
      })
      .slice(skip, skip + limit)
      .map(item => ({
        id:item.id,
        category: item.category,
        title: item.title,
        price: item.price,
        needsRevision: doesItemNeedRevision(item),
      })),
    total: filteredItems.length,
  };
});

interface ItemUpdateRequest extends Fastify.RequestGenericInterface {
  Params: {
    id: string;
  };
}

fastify.put<ItemUpdateRequest>('/items/:id', (request, reply) => {
  const itemId = Number(request.params.id);

  if (!Number.isFinite(itemId)) {
    reply
      .status(400)
      .send({ success: false, error: 'Item ID path param should be a number' });
    return;
  }

  const itemIndex = ITEMS.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    reply
      .status(404)
      .send({ success: false, error: "Item with requested id doesn't exist" });
    return;
  }

  try {
    const parsedData = ItemUpdateInSchema.parse({
      category: ITEMS[itemIndex].category,
      ...(request.body as {}),
    });

    ITEMS[itemIndex] = {
      id: ITEMS[itemIndex].id,
      createdAt: ITEMS[itemIndex].createdAt,
      updatedAt: new Date().toISOString(),
      ...parsedData,
    };

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      reply.status(400).send({ success: false, error: treeifyError(error) });
      return;
    }

    throw error;
  }
});

// эндпоинт для работы с AI ollama
const OLLAMA_URL = 'https://ollama.com/api/chat';
const OLLAMA_MODEL = 'gpt-oss:120b'; 

fastify.post('/items/ai-recommend-price', async (request, reply) => {
  const apiKey = process.env.OLLAMA_API_KEY;

  if (!apiKey) {
    return reply
      .status(500)
      .send({ success: false, error: 'OLLAMA_API_KEY не задан в .env сервера' });
  }

  const { category, title, description, params } = request.body as any;

  const prompt = `
  Категория: ${category}
  Название: ${title}
  Описание: ${description || 'Не указано'}
  Характеристики: ${JSON.stringify(params)}
  `.trim();

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        options: { temperature: 0.2 },
        format: {
          type: 'object',
          properties: {
            textAnalysis: { type: 'string' },
            recommendedPrice: { type: 'number' },
          },
          required: ['textAnalysis', 'recommendedPrice'],
        },
        messages: [
          {
            role: 'system',
            content: `
              Ты эксперт по оценке рыночной стоимости на российском рынке (ориентир: Авито). Отвечай строго на русском.

              Тебе даны категория, название, описание и характеристики товара. Верни JSON с двумя полями.

              "textAnalysis" — краткая справка по рыночной цене. Без вступлений и выводов. Оценивай так, как если бы сравнивал с похожими объявлениями с теми же характеристиками.
              Строки разделяй символом \\n, каждая начинается с «• ». В каждой строке сначала цена, потом через « — » пояснение из 5–7 слов, на чём основана оценка.

              Формат:
              • Рыночная цена: <от> – <до> ₽ — <3–5 слов пояснения>
              • Быстрая продажа: около <цена> ₽ — <3–5 слов пояснения>
              • Дорогой сегмент: до <цена> ₽ — <3–5 слов пояснения> (если для этого товара неуместно, пропусти строку)

              Пример:
              • Рыночная цена: 42 000 – 48 000 ₽ — похожие объявления с таким пробегом
              • Быстрая продажа: около 39 000 ₽ — цена ниже большинства аналогов
              • Дорогой сегмент: до 52 000 ₽ — редкая комплектация, отличное состояние

              "recommendedPrice" — одно целое число в рублях: цена, по которой товар продастся достаточно быстро без лишнего занижения. Она должна лежать внутри рыночного диапазона из textAnalysis.

              Правила:
              - Все цены в рублях, в тексте с символом ₽.
              - Пояснение не длиннее 7 слов, без повторов характеристик товара целиком.
              - Если данных мало, опирайся на название и категорию, ничего не выдумывай.
              - Если не уверен, дай осторожный диапазон вместо точной цифры.
              `.trim()
          },
          { role: 'user', content: prompt },
        ]
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return reply
        .status(response.status)
        .send({ success: false, error: `Ошибка Ollama: ${errText}` });
    }

    const data = (await response.json()) as { message?: { content?: string } };
    const raw = data.message?.content;

    if (!raw) {
      return reply.status(500).send({ success: false, error: 'ИИ вернул пустой ответ' });
    }

    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    const price = Math.round(Number(parsed.recommendedPrice));

    if (!Number.isFinite(price)) {
      request.log.warn({ raw }, 'ИИ вернул ответ без числовой цены');
      return reply.status(502).send({
        success: false,
        error: 'ИИ вернул непонятный ответ, попробуйте ещё раз',
      });
    }

    return {
      textAnalysis: String(parsed.textAnalysis ?? ''),
      recommendedPrice: price,
    };
  } catch (err: any) {
    request.log.error(err);
    return reply
      .status(500)
      .send({ success: false, error: err.message || 'Внутренняя ошибка сервера' });
  }
});


const port = Number(process.env.PORT || process.env.port) || 8080;

fastify.listen({ port }, function (err, _address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  fastify.log.debug(`Server is listening on port ${port}`);
});
