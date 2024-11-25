// src/config/swagger.ts
import type { OpenAPIV3 } from "openapi-types";

const swaggerConfig: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Education Management API",
    description: `
    API для управления образовательным процессом.

    ## Аутентификация
    API использует JWT токены для аутентификации. Получите токен через \`/auth/login\` или \`/auth/register\`
    и передавайте его в заголовке \`Authorization: Bearer {token}\`.
    `,
    version: "1.0.0",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API версии 1",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Методы аутентификации и управления доступом",
    },
    {
      name: "Cards",
      description:
        "Методы для управления карточками студентов, клиентов и групп",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT токен авторизации",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "password"],
        properties: {
          name: {
            type: "string",
            description: "Уникальное имя пользователя (логин)",
            minLength: 1,
            maxLength: 100,
            pattern: "^[a-zA-Z0-9_]+$",
            example: "john_doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email пользователя (опционально)",
            example: "john@example.com",
            nullable: true,
          },
          password: {
            type: "string",
            format: "password",
            description: "Пароль пользователя",
            minLength: 8,
            example: "securePass123",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["name", "password"],
        properties: {
          name: {
            type: "string",
            description: "Имя пользователя (логин)",
            example: "john_doe",
          },
          password: {
            type: "string",
            format: "password",
            description: "Пароль пользователя",
            example: "securePass123",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Уникальный идентификатор пользователя",
            example: "clh12345678",
          },
          name: {
            type: "string",
            description: "Имя пользователя",
            example: "john_doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email пользователя",
            example: "john@example.com",
            nullable: true,
          },
          role: {
            type: "string",
            enum: ["TEACHER", "ADMIN"],
            description: "Роль пользователя в системе",
            example: "TEACHER",
          },
        },
      },
      TokenInfo: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "ID пользователя из токена",
            example: "clh12345678",
          },
          name: {
            type: "string",
            description: "Имя пользователя из токена",
            example: "john_doe",
          },
          role: {
            type: "string",
            enum: ["TEACHER", "ADMIN"],
            description: "Роль пользователя",
            example: "TEACHER",
          },
          exp: {
            type: "number",
            description: "Timestamp истечения токена",
            example: 1679290275,
          },
          iat: {
            type: "number",
            description: "Timestamp создания токена",
            example: 1679286675,
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Статус операции",
            example: true,
          },
          data: {
            type: "object",
            properties: {
              user: {
                $ref: "#/components/schemas/User",
              },
              token: {
                type: "string",
                description: "JWT токен",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
            },
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "Время ответа",
            example: "2024-03-17T12:00:00.000Z",
          },
        },
      },
      TokenVerifyResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Статус операции",
            example: true,
          },
          data: {
            $ref: "#/components/schemas/TokenInfo",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "Время ответа",
            example: "2024-03-17T12:00:00.000Z",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
            description: "Описание ошибки",
            example: "Invalid credentials",
          },
          code: {
            type: "string",
            description: "Код ошибки",
            example: "INVALID_CREDENTIALS",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2024-03-17T12:00:00.000Z",
          },
        },
      },
      Student: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID студента",
            example: "clh12345678",
          },
          name: {
            type: "string",
            description: "Имя студента",
            example: "John Doe",
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "ARCHIVED", "DELETED", "CANCELLED"],
            description: "Статус студента",
            example: "ACTIVE",
          },
          contactName: {
            type: "string",
            description: "Имя контакта",
            example: "Parent Name",
            nullable: true,
          },
          email: {
            type: "string",
            format: "email",
            description: "Email студента",
            example: "john@example.com",
            nullable: true,
          },
          phone: {
            type: "string",
            description: "Телефон студента",
            example: "+123456789",
            nullable: true,
          },
          address: {
            type: "string",
            description: "Адрес студента",
            example: "123 Main St",
            nullable: true,
          },
          source: {
            type: "string",
            description: "Источник подачи заявки",
            example: "School",
            nullable: true,
          },
          level: {
            type: "integer",
            description: "Уровень студента",
            example: 1,
          },
          goals: {
            type: "string",
            description: "Цели студента",
            example: "Learn piano",
            nullable: true,
          },
          currentProgram: {
            type: "string",
            description: "Текущая программа обучения",
            example: "Monthly lessons",
            nullable: true,
          },
          lessonPrice: {
            type: "number",
            description: "Цена одного занятия",
            example: 30,
          },
          balance: {
            type: "number",
            description: "Баланс студента",
            example: 50,
          },
          totalPaid: {
            type: "number",
            description: "Всего оплачено",
            example: 150,
          },
          totalDebt: {
            type: "number",
            description: "Всего задолжено",
            example: 0,
          },
          totalExpenses: {
            type: "number",
            description: "Всего потрачено",
            example: 0,
          },
          totalLessons: {
            type: "integer",
            description: "Всего занятий",
            example: 5,
          },
          canceledLessons: {
            type: "integer",
            description: "Отмененных занятий",
            example: 1,
          },
          completedLessons: {
            type: "integer",
            description: "Завершенных занятий",
            example: 4,
          },
          averageLessonCost: {
            type: "number",
            description: "Средняя стоимость занятия",
            example: 30,
          },
          teacher: {
            $ref: "#/components/schemas/User",
          },
          groups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                studentGroup: {
                  type: "object",
                  properties: {
                    group: {
                      $ref: "#/components/schemas/Group",
                    },
                  },
                },
              },
            },
          },
          lessons: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/Lesson",
            },
          },
          payments: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Payment",
            },
          },
          files: {
            type: "array",
            items: {
              $ref: "#/components/schemas/File",
            },
          },
          links: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/Link",
            },
          },
          notes: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/Note",
            },
          },
          grades: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Grade",
            },
          },
          trialLesson: {
            $ref: "#/components/schemas/TrialLesson",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Время создания записи",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Время последнего обновления записи",
          },
        },
      },
      Client: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID клиента",
            example: "clh12345678",
          },
          name: {
            type: "string",
            description: "Имя клиента",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email клиента",
            example: "john@example.com",
            nullable: true,
          },
          phone: {
            type: "string",
            description: "Телефон клиента",
            example: "+123456789",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "ARCHIVED", "DELETED", "CANCELLED"],
            description: "Статус клиента",
            example: "ACTIVE",
          },
          teacher: {
            $ref: "#/components/schemas/User",
          },
          projects: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/Project",
            },
          },
          payments: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Payment",
            },
          },
          files: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/File",
            },
          },
          links: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/Link",
            },
          },
          notes: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/Note",
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Время создания записи",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Время последнего обновления записи",
          },
        },
      },
      Group: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID группы",
            example: "clh12345678",
          },
          name: {
            type: "string",
            description: "Название группы",
            example: "Group A",
          },
          description: {
            type: "string",
            description: "Описание группы",
            example: "Description of Group A",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "ARCHIVED", "DELETED", "CANCELLED"],
            description: "Статус группы",
            example: "ACTIVE",
          },
          subject: {
            $ref: "#/components/schemas/Subject",
          },
          subjectId: {
            type: "string",
            description: "ID предмета",
            example: "clh12345678",
          },
          level: {
            type: "integer",
            description: "Уровень группы",
            example: 1,
          },
          startDate: {
            type: "string",
            format: "date-time",
            description: "Дата начала группы",
            example: "2024-01-01T00:00:00.000Z",
          },
          endDate: {
            type: "string",
            format: "date-time",
            description: "Дата окончания группы",
            example: "2024-12-31T23:59:59.999Z",
          },
          lessonPrice: {
            type: "number",
            description: "Цена одного занятия",
            example: 20,
          },
          totalDebt: {
            type: "number",
            description: "Всего задолжено",
            example: 0,
          },
          totalPaid: {
            type: "number",
            description: "Всего оплачено",
            example: 0,
          },
          totalExpenses: {
            type: "number",
            description: "Всего потрачено",
            example: 0,
          },
          teacher: {
            $ref: "#/components/schemas/User",
          },
          teacherId: {
            type: "string",
            description: "ID преподавателя",
            example: "clh12345678",
          },
          students: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/StudentGroup",
            },
          },
          schedules: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/Schedule",
            },
          },
          lessons: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/Lesson",
            },
          },
          files: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/File",
            },
          },
          links: {
            type: "array",
            items: {
              type: "object",
              $ref: "#/components/schemas/Link",
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Время создания записи",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Время последнего обновления записи",
          },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Статус операции",
            example: true,
          },
          data: {
            type: "object",
            additionalProperties: true, // Adjust based on endpoint response
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "Время ответа",
          },
        },
      },
      PaginationParams: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            description: "Номер страницы",
            default: 1,
          },
          limit: {
            type: "integer",
            description: "Количество элементов на странице",
            default: 10,
          },
          sortBy: {
            type: "string",
            description: "Поле для сортировки",
            default: "name",
          },
          sortOrder: {
            type: "string",
            enum: ["asc", "desc"],
            description: "Направление сортировки",
            default: "asc",
          },
        },
      },
      CreateStudentRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            description: "Имя студента",
            example: "John Doe",
          },
          contactName: {
            type: "string",
            description: "Имя контакта",
            example: "Parent Name",
            nullable: true,
          },
          email: {
            type: "string",
            format: "email",
            description: "Email студента",
            example: "john@example.com",
            nullable: true,
          },
          phone: {
            type: "string",
            description: "Телефон студента",
            example: "+123456789",
            nullable: true,
          },
          address: {
            type: "string",
            description: "Адрес студента",
            example: "123 Main St",
            nullable: true,
          },
          source: {
            type: "string",
            description: "Источник подачи заявки",
            example: "School",
            nullable: true,
          },
          level: {
            type: "integer",
            description: "Уровень студента",
            example: 1,
          },
          goals: {
            type: "string",
            description: "Цели студента",
            example: "Learn piano",
            nullable: true,
          },
          currentProgram: {
            type: "string",
            description: "Текущая программа обучения",
            example: "Monthly lessons",
            nullable: true,
          },
          lessonPrice: {
            type: "number",
            description: "Цена одного занятия",
            example: 30,
          },
        },
      },
      UpdateStudentRequest: {
        type: "object",
        required: [],
        properties: {
          name: {
            type: "string",
            description: "Имя студента",
            example: "John Doe",
            nullable: true,
          },
          contactName: {
            type: "string",
            description: "Имя контакта",
            example: "Parent Name",
            nullable: true,
          },
          email: {
            type: "string",
            format: "email",
            description: "Email студента",
            example: "john@example.com",
            nullable: true,
          },
          phone: {
            type: "string",
            description: "Телефон студента",
            example: "+123456789",
            nullable: true,
          },
          address: {
            type: "string",
            description: "Адрес студента",
            example: "123 Main St",
            nullable: true,
          },
          source: {
            type: "string",
            description: "Источник подачи заявки",
            example: "School",
            nullable: true,
          },
          level: {
            type: "integer",
            description: "Уровень студента",
            example: 1,
            nullable: true,
          },
          goals: {
            type: "string",
            description: "Цели студента",
            example: "Learn piano",
            nullable: true,
          },
          currentProgram: {
            type: "string",
            description: "Текущая программа обучения",
            example: "Monthly lessons",
            nullable: true,
          },
          lessonPrice: {
            type: "number",
            description: "Цена одного занятия",
            example: 30,
            nullable: true,
          },
        },
      },
      CreateClientRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            description: "Имя клиента",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email клиента",
            example: "john@example.com",
            nullable: true,
          },
          phone: {
            type: "string",
            description: "Телефон клиента",
            example: "+123456789",
            nullable: true,
          },
        },
      },
      UpdateClientRequest: {
        type: "object",
        required: [],
        properties: {
          name: {
            type: "string",
            description: "Имя клиента",
            example: "John Doe",
            nullable: true,
          },
          email: {
            type: "string",
            format: "email",
            description: "Email клиента",
            example: "john@example.com",
            nullable: true,
          },
          phone: {
            type: "string",
            description: "Телефон клиента",
            example: "+123456789",
            nullable: true,
          },
        },
      },
      CreateGroupRequest: {
        type: "object",
        required: [
          "name",
          "subjectId",
          "level",
          "startDate",
          "endDate",
          "lessonPrice",
        ],
        properties: {
          name: {
            type: "string",
            description: "Название группы",
            example: "Group A",
          },
          description: {
            type: "string",
            description: "Описание группы",
            example: "Description of Group A",
            nullable: true,
          },
          subjectId: {
            type: "string",
            description: "ID предмета",
            example: "clh12345678",
          },
          level: {
            type: "integer",
            description: "Уровень группы",
            example: 1,
          },
          startDate: {
            type: "string",
            format: "date-time",
            description: "Дата начала группы",
            example: "2024-01-01T00:00:00.000Z",
          },
          endDate: {
            type: "string",
            format: "date-time",
            description: "Дата окончания группы",
            example: "2024-12-31T23:59:59.999Z",
          },
          lessonPrice: {
            type: "number",
            description: "Цена одного занятия",
            example: 20,
          },
        },
      },
      UpdateGroupRequest: {
        type: "object",
        required: [],
        properties: {
          name: {
            type: "string",
            description: "Название группы",
            example: "Group A",
            nullable: true,
          },
          description: {
            type: "string",
            description: "Описание группы",
            example: "Description of Group A",
            nullable: true,
          },
          subjectId: {
            type: "string",
            description: "ID предмета",
            example: "clh12345678",
            nullable: true,
          },
          level: {
            type: "integer",
            description: "Уровень группы",
            example: 1,
            nullable: true,
          },
          startDate: {
            type: "string",
            format: "date-time",
            description: "Дата начала группы",
            example: "2024-01-01T00:00:00.000Z",
            nullable: true,
          },
          endDate: {
            type: "string",
            format: "date-time",
            description: "Дата окончания группы",
            example: "2024-12-31T23:59:59.999Z",
            nullable: true,
          },
          lessonPrice: {
            type: "number",
            description: "Цена одного занятия",
            example: 20,
            nullable: true,
          },
        },
      },
      // Define other schemas like File, Link, Note, Grade, etc. as needed
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Регистрация нового пользователя",
        description:
          "Создает нового пользователя в системе и возвращает JWT токен",
        operationId: "register",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Пользователь успешно зарегистрирован",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse",
                },
              },
            },
          },
          "400": {
            description: "Ошибка валидации или пользователь уже существует",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  validation: {
                    value: {
                      success: false,
                      error: "Validation error",
                      code: "VALIDATION_ERROR",
                      timestamp: "2024-03-17T12:00:00.000Z",
                    },
                  },
                  exists: {
                    value: {
                      success: false,
                      error: "Username already taken",
                      code: "USER_EXISTS",
                      timestamp: "2024-03-17T12:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Вход в систему",
        description: "Аутентифицирует пользователя и возвращает JWT токен",
        operationId: "login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Успешная аутентификация",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse",
                },
              },
            },
          },
          "401": {
            description: "Неверные учетные данные",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/auth/verify": {
      get: {
        tags: ["Auth"],
        summary: "Проверка JWT токена",
        description:
          "Проверяет валидность JWT токена и возвращает информацию о пользователе",
        operationId: "verifyToken",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Токен валиден",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TokenVerifyResponse",
                },
              },
            },
          },
          "401": {
            description: "Невалидный или просроченный токен",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  noToken: {
                    value: {
                      success: false,
                      error: "No token provided",
                      code: "AUTH_NO_TOKEN",
                      timestamp: "2024-03-17T12:00:00.000Z",
                    },
                  },
                  invalidToken: {
                    value: {
                      success: false,
                      error: "Invalid or expired token",
                      code: "AUTH_INVALID_TOKEN",
                      timestamp: "2024-03-17T12:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/cards/students": {
      get: {
        tags: ["Cards"],
        summary: "Получить всех студентов",
        description: "Получает пагинированный список студентов",
        operationId: "getStudents",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: {
              type: "integer",
              default: 1,
            },
            description: "Номер страницы",
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              default: 10,
            },
            description: "Количество элементов на странице",
          },
          {
            in: "query",
            name: "sortBy",
            schema: {
              type: "string",
              default: "name",
            },
            description: "Поле для сортировки",
          },
          {
            in: "query",
            name: "sortOrder",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
            },
            description: "Направление сортировки",
          },
        ],
        responses: {
          "200": {
            description: "Успешный запрос",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        students: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/Student",
                          },
                        },
                        total: {
                          type: "integer",
                          description: "Общее количество студентов",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Cards"],
        summary: "Создать нового студента",
        description: "Создает новый студента и возвращает его данные",
        operationId: "createStudent",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateStudentRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Студент успешно создан",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/Student",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Ошибка валидации",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/cards/students/{id}": {
      get: {
        tags: ["Cards"],
        summary: "Получить студента по ID",
        description:
          "Получает данные студента по его уникальному идентификатору",
        operationId: "getStudentById",
        parameters: [
          {
            in: "path",
            name: "id",
            schema: {
              type: "string",
            },
            required: true,
            description: "ID студента",
          },
        ],
        responses: {
          "200": {
            description: "Успешный запрос",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/Student",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Студент не найден",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Cards"],
        summary: "Обновить студента по ID",
        description:
          "Обновляет данные студента по его уникальному идентификатору",
        operationId: "updateStudentById",
        parameters: [
          {
            in: "path",
            name: "id",
            schema: {
              type: "string",
            },
            required: true,
            description: "ID студента",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateStudentRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Данные студента успешно обновлены",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/Student",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Ошибка валидации",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "Студент не найден",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Cards"],
        summary: "Удалить студента по ID",
        description: "Удаляет студента по его уникальному идентификатору",
        operationId: "deleteStudentById",
        parameters: [
          {
            in: "path",
            name: "id",
            schema: {
              type: "string",
            },
            required: true,
            description: "ID студента",
          },
        ],
        responses: {
          "200": {
            description: "Студент успешно удален",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
              },
            },
          },
          "404": {
            description: "Студент не найден",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/cards/clients": {
      get: {
        tags: ["Cards"],
        summary: "Получить всех клиентов",
        description: "Получает пагинированный список клиентов",
        operationId: "getClients",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: {
              type: "integer",
              default: 1,
            },
            description: "Номер страницы",
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              default: 10,
            },
            description: "Количество элементов на странице",
          },
          {
            in: "query",
            name: "sortBy",
            schema: {
              type: "string",
              default: "name",
            },
            description: "Поле для сортировки",
          },
          {
            in: "query",
            name: "sortOrder",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
            },
            description: "Направление сортировки",
          },
        ],
        responses: {
          "200": {
            description: "Успешный запрос",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        clients: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/Client",
                          },
                        },
                        total: {
                          type: "integer",
                          description: "Общее количество клиентов",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Cards"],
        summary: "Создать нового клиента",
        description: "Создает нового клиента и возвращает его данные",
        operationId: "createClient",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateClientRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Клиент успешно создан",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/Client",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Ошибка валидации",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/cards/clients/{id}": {
      get: {
        tags: ["Cards"],
        summary: "Получить клиента по ID",
        description:
          "Получает данные клиента по его уникальному идентификатору",
        operationId: "getClientById",
        parameters: [
          {
            in: "path",
            name: "id",
            schema: {
              type: "string",
            },
            required: true,
            description: "ID клиента",
          },
        ],
        responses: {
          "200": {
            description: "Успешный запрос",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/Client",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Клиент не найден",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Cards"],
        summary: "Обновить клиента по ID",
        description:
          "Обновляет данные клиента по его уникальному идентификатору",
        operationId: "updateClientById",
        parameters: [
          {
            in: "path",
            name: "id",
            schema: {
              type: "string",
            },
            required: true,
            description: "ID клиента",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateClientRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Данные клиента успешно обновлены",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/Client",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Ошибка валидации",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "Клиент не найден",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Cards"],
        summary: "Удалить клиента по ID",
        description: "Удаляет клиента по его уникальному идентификатору",
        operationId: "deleteClientById",
        parameters: [
          {
            in: "path",
            name: "id",
            schema: {
              type: "string",
            },
            required: true,
            description: "ID клиента",
          },
        ],
        responses: {
          "200": {
            description: "Клиент успешно удален",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
              },
            },
          },
          "404": {
            description: "Клиент не найден",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/cards/groups": {
      get: {
        tags: ["Cards"],
        summary: "Получить все группы",
        description: "Получает пагинированный список групп",
        operationId: "getGroups",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: {
              type: "integer",
              default: 1,
            },
            description: "Номер страницы",
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              default: 10,
            },
            description: "Количество элементов на странице",
          },
          {
            in: "query",
            name: "sortBy",
            schema: {
              type: "string",
              default: "name",
            },
            description: "Поле для сортировки",
          },
          {
            in: "query",
            name: "sortOrder",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
            },
            description: "Направление сортировки",
          },
        ],
        responses: {
          "200": {
            description: "Успешный запрос",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        groups: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/Group",
                          },
                        },
                        total: {
                          type: "integer",
                          description: "Общее количество групп",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Cards"],
        summary: "Создать новую группу",
        description: "Создает новую группу и возвращает её данные",
        operationId: "createGroup",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateGroupRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Группа успешно создана",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/Group",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Ошибка валидации",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/cards/groups/{id}": {
      get: {
        tags: ["Cards"],
        summary: "Получить группу по ID",
        description: "Получает данные группы по её уникальному идентификатору",
        operationId: "getGroupById",
        parameters: [
          {
            in: "path",
            name: "id",
            schema: {
              type: "string",
            },
            required: true,
            description: "ID группы",
          },
        ],
        responses: {
          "200": {
            description: "Успешный запрос",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/Group",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Группа не найдена",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Cards"],
        summary: "Обновить группу по ID",
        description: "Обновляет данные группы по её уникальному идентификатору",
        operationId: "updateGroupById",
        parameters: [
          {
            in: "path",
            name: "id",
            schema: {
              type: "string",
            },
            required: true,
            description: "ID группы",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateGroupRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Данные группы успешно обновлены",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                  properties: {
                    data: {
                      $ref: "#/components/schemas/Group",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Ошибка валидации",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "Группа не найдена",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Cards"],
        summary: "Удалить группу по ID",
        description: "Удаляет группу по её уникальному идентификатору",
        operationId: "deleteGroupById",
        parameters: [
          {
            in: "path",
            name: "id",
            schema: {
              type: "string",
            },
            required: true,
            description: "ID группы",
          },
        ],
        responses: {
          "200": {
            description: "Группа успешно удалена",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
              },
            },
          },
          "404": {
            description: "Группа не найдена",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "500": {
            description: "Внутренняя ошибка сервера",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerConfig;
