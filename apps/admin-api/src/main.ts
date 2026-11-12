import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ ok: true }));

app.post('/tenants', async (request, reply) => {
  const body = request.body as { name?: string };

  if (!body?.name) {
    return reply.code(400).send({ error: 'name is required' });
  }

  return reply.code(201).send({
    id: crypto.randomUUID(),
    name: body.name,
    status: 'created'
  });
});

const port = Number(process.env.PORT ?? 3001);

app.listen({ port, host: '0.0.0.0' });
