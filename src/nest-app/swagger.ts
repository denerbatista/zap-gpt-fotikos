import { NestApplication } from './framework/application';

const baseSchemas = {
  GuardianContact: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      channel: { type: 'string', enum: ['push', 'whatsapp', 'sms', 'email'] },
      value: { type: 'string' },
      preferred: { type: 'boolean', nullable: true },
    },
    required: ['name', 'channel', 'value'],
  },
  Student: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'stu-a1b2c3' },
      name: { type: 'string' },
      grade: { type: 'string' },
      room: { type: 'string' },
      classStartTime: { type: 'string', pattern: '^(?:[01]\\d|2[0-3]):[0-5]\\d$' },
      gracePeriodMinutes: { type: 'integer', minimum: 0 },
      guardians: {
        type: 'array',
        items: { $ref: '#/components/schemas/GuardianContact' },
        minItems: 1,
      },
      tags: {
        type: 'array',
        nullable: true,
        items: { type: 'string' },
      },
    },
    required: ['id', 'name', 'grade', 'room', 'classStartTime', 'gracePeriodMinutes', 'guardians'],
  },
  CreateStudentRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      grade: { type: 'string' },
      room: { type: 'string' },
      classStartTime: { type: 'string', pattern: '^(?:[01]\\d|2[0-3]):[0-5]\\d$' },
      gracePeriodMinutes: { type: 'integer', minimum: 0 },
      guardians: {
        type: 'array',
        items: { $ref: '#/components/schemas/GuardianContact' },
        minItems: 1,
      },
      tags: {
        type: 'array',
        nullable: true,
        items: { type: 'string' },
      },
    },
    required: ['name', 'grade', 'room', 'classStartTime', 'gracePeriodMinutes', 'guardians'],
  },
  UpdateStudentRequest: {
    type: 'object',
    description: 'Informe ao menos um campo para atualização',
    properties: {
      name: { type: 'string' },
      grade: { type: 'string' },
      room: { type: 'string' },
      classStartTime: { type: 'string', pattern: '^(?:[01]\\d|2[0-3]):[0-5]\\d$' },
      gracePeriodMinutes: { type: 'integer', minimum: 0 },
      guardians: {
        type: 'array',
        items: { $ref: '#/components/schemas/GuardianContact' },
        minItems: 1,
      },
      tags: {
        type: 'array',
        nullable: true,
        items: { type: 'string' },
      },
    },
    additionalProperties: false,
  },
  CheckInRequest: {
    type: 'object',
    properties: {
      studentId: { type: 'string', example: 'stu-001' },
      timestamp: { type: 'string', format: 'date-time', nullable: true },
    },
    required: ['studentId'],
  },
  MarkAbsencesRequest: {
    type: 'object',
    properties: {
      timestamp: { type: 'string', format: 'date-time', nullable: true },
      room: { type: 'string', nullable: true },
    },
  },
  FaceEnrollmentRequest: {
    type: 'object',
    properties: {
      studentId: { type: 'string', example: 'stu-001' },
      imageBase64: {
        type: 'string',
        description: 'Data URI com o rosto em base64 (ex.: data:image/jpeg;base64,...)',
      },
    },
    required: ['studentId', 'imageBase64'],
  },
  FaceEnrollmentResponse: {
    type: 'object',
    properties: {
      student: { $ref: '#/components/schemas/Student' },
      registeredAt: { type: 'string', format: 'date-time' },
      templateVersion: { type: 'string' },
      vectorSize: { type: 'integer' },
    },
    required: ['student', 'registeredAt', 'templateVersion', 'vectorSize'],
  },
  FaceCheckInRequest: {
    type: 'object',
    properties: {
      imageBase64: {
        type: 'string',
        description: 'Data URI do rosto capturado',
      },
      timestamp: { type: 'string', format: 'date-time', nullable: true },
    },
    required: ['imageBase64'],
  },
  AttendanceRecord: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      studentId: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: ['ON_TIME', 'LATE', 'ABSENT'] },
      notifiedChannels: {
        type: 'array',
        items: { type: 'string', enum: ['push', 'whatsapp', 'sms', 'email'] },
      },
      reason: { type: 'string', nullable: true },
      minutesLate: { type: 'integer', nullable: true },
    },
    required: ['id', 'studentId', 'timestamp', 'status', 'notifiedChannels'],
  },
  DailyReport: {
    type: 'object',
    properties: {
      date: { type: 'string', format: 'date' },
      totals: {
        type: 'object',
        properties: {
          ON_TIME: { type: 'integer' },
          LATE: { type: 'integer' },
          ABSENT: { type: 'integer' },
          overall: { type: 'integer' },
        },
        required: ['ON_TIME', 'LATE', 'ABSENT', 'overall'],
      },
      delays: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            studentId: { type: 'string' },
            studentName: { type: 'string' },
            minutesLate: { type: 'integer' },
          },
          required: ['studentId', 'studentName', 'minutesLate'],
        },
      },
    },
    required: ['date', 'totals', 'delays'],
  },
  NotificationEvent: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      studentId: { type: 'string' },
      studentName: { type: 'string' },
      type: { type: 'string', enum: ['DELAY', 'ABSENCE'] },
      channels: {
        type: 'array',
        items: { type: 'string', enum: ['push', 'whatsapp', 'sms', 'email'] },
      },
      message: { type: 'string' },
      occurredAt: { type: 'string', format: 'date-time' },
      sentAt: { type: 'string', format: 'date-time' },
    },
    required: ['id', 'studentId', 'studentName', 'type', 'channels', 'message', 'occurredAt', 'sentAt'],
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
              schema: { $ref: '#/components/schemas/CreateStudentRequest' },
            },
          },
        },
        responses: {
          200: {
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
            schema: { type: 'string' },
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
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateStudentRequest' },
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
          200: {
            description: 'Check-in registrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AttendanceRecord' },
              },
            },
          },
        },
      },
    },
    '/attendance/mark-absences': {
      post: {
        tags: ['Attendance'],
        summary: 'Marca ausências após o fechamento da chamada',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MarkAbsencesRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Ausências registradas',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/AttendanceRecord' } },
              },
            },
          },
        },
      },
    },
    '/attendance/face/register': {
      post: {
        tags: ['Attendance'],
        summary: 'Associa um rosto ao estudante informado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FaceEnrollmentRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Template criado e pronto para reconhecimento',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FaceEnrollmentResponse' },
              },
            },
          },
        },
      },
    },
    '/attendance/face/check-in': {
      post: {
        tags: ['Attendance'],
        summary: 'Realiza um check-in automático a partir do rosto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FaceCheckInRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Check-in efetuado para o estudante reconhecido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AttendanceRecord' },
              },
            },
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
                schema: { type: 'array', items: { $ref: '#/components/schemas/AttendanceRecord' } },
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
    res
      .type('html')
      .send(`<!DOCTYPE html>
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
