import { NestApplication } from './framework/application';

const baseSchemas = {
  Student: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      grade: { type: 'string' },
      guardianName: { type: 'string' },
      guardianPhone: { type: 'string' },
    },
    required: ['id', 'name', 'grade', 'guardianName', 'guardianPhone'],
  },
  CheckInRequest: {
    type: 'object',
    properties: {
      studentId: { type: 'string', format: 'uuid' },
      method: { type: 'string', enum: ['qr', 'face', 'manual'] },
      timestamp: { type: 'string', format: 'date-time' },
    },
    required: ['studentId', 'method'],
  },
  MarkAbsencesRequest: {
    type: 'object',
    properties: {
      date: { type: 'string', format: 'date' },
      studentIds: {
        type: 'array',
        items: { type: 'string', format: 'uuid' },
      },
    },
    required: ['studentIds'],
  },
  AttendanceFeedItem: {
    type: 'object',
    properties: {
      studentId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['on_time', 'late', 'absent'] },
      recordedAt: { type: 'string', format: 'date-time' },
      deliveredAt: { type: 'string', format: 'date-time', nullable: true },
      deliveryChannel: { type: 'string', nullable: true },
    },
  },
  DailyReport: {
    type: 'object',
    properties: {
      date: { type: 'string', format: 'date' },
      totals: {
        type: 'object',
        properties: {
          on_time: { type: 'integer' },
          late: { type: 'integer' },
          absent: { type: 'integer' },
        },
      },
      entries: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            studentId: { type: 'string', format: 'uuid' },
            status: { type: 'string' },
            notes: { type: 'string' },
          },
        },
      },
    },
  },
  NotificationEvent: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      studentId: { type: 'string', format: 'uuid' },
      channel: { type: 'string' },
      status: { type: 'string' },
      dispatchedAt: { type: 'string', format: 'date-time' },
    },
  },
};

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'API de Presença - EMEF Mário Leal Silva',
    description:
      'Endpoints REST usados pelo aplicativo React Native para registrar presença, consultar relatórios e acompanhar notificações.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:4000/api',
      description: 'Ambiente local de desenvolvimento',
    },
  ],
  tags: [
    { name: 'Students', description: 'Gerenciamento de estudantes e responsáveis' },
    { name: 'Attendance', description: 'Check-ins, faltas e relatórios' },
    { name: 'Notifications', description: 'Fila e status das notificações' },
  ],
  paths: {
    '/students': {
      get: {
        tags: ['Students'],
        summary: 'Lista estudantes e responsáveis registrados',
        responses: {
          200: {
            description: 'Lista com todos os estudantes',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Student' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Students'],
        summary: 'Cria um novo estudante',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  grade: { type: 'string' },
                  guardianName: { type: 'string' },
                  guardianPhone: { type: 'string' },
                },
                required: ['name', 'grade', 'guardianName', 'guardianPhone'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Estudante criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' },
              },
            },
          },
        },
      },
    },
    '/students/{id}': {
      get: {
        tags: ['Students'],
        summary: 'Busca um estudante pelo ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Estudante encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' },
              },
            },
          },
          404: { description: 'Estudante não encontrado' },
        },
      },
      patch: {
        tags: ['Students'],
        summary: 'Atualiza dados do estudante',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  grade: { type: 'string' },
                  guardianName: { type: 'string' },
                  guardianPhone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Estudante atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' },
              },
            },
          },
        },
      },
    },
    '/attendance/check-in': {
      post: {
        tags: ['Attendance'],
        summary: 'Registra um check-in e detecta atraso',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CheckInRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Check-in aceito e notificação disparada quando necessário',
          },
        },
      },
    },
    '/attendance/mark-absences': {
      post: {
        tags: ['Attendance'],
        summary: 'Marca ausências após o fechamento da chamada',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MarkAbsencesRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Ausências registradas',
          },
        },
      },
    },
    '/attendance/feed': {
      get: {
        tags: ['Attendance'],
        summary: 'Retorna o feed em tempo real dos eventos',
        parameters: [
          {
            name: 'date',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          200: {
            description: 'Eventos encontrados',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AttendanceFeedItem' } },
              },
            },
          },
        },
      },
    },
    '/attendance/reports/daily': {
      get: {
        tags: ['Attendance'],
        summary: 'Gera relatório diário resumido',
        parameters: [
          {
            name: 'date',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          200: {
            description: 'Relatório consolidado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DailyReport' },
              },
            },
          },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Lista eventos disparados para responsáveis',
        responses: {
          200: {
            description: 'Fila e histórico recentes',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/NotificationEvent' } },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: baseSchemas,
  },
};

export function setupSwagger(app: NestApplication) {
  app.registerHttpHandler('get', 'docs/json', (_req, res) => {
    res.json(swaggerDocument);
  });

  app.registerHttpHandler('get', 'docs', (_req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Swagger - API de Presença</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js" crossorigin="anonymous"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: 'docs/json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
        });
      };
    </script>
  </body>
</html>`);
  });
}
