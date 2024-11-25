// repitnew/server/src/controllers/cards.controller.ts
import { Elysia, t } from "elysia";
import { db } from "@/db";
import { AppError } from "../utils/errors";
import {
  cardIdSchema,
  cardSchema,
  cardTypeSchema,
  sidebarPageSchema,
  createStudentRequestSchema,
  updateStudentRequestSchema,
  createClientRequestSchema,
  updateClientRequestSchema,
  createGroupRequestSchema,
  updateGroupRequestSchema,
  studentSchema,
  clientSchema,
  groupSchema,
} from "../schemas/cards";
import { logger } from "../utils/logger";
import type {
  ApiResponse,
  DateRangeParams,
  PaginationParams,
} from "@/types/common";
import {
  EntityStatus,
  type Client,
  type Group,
  type Student,
} from "@prisma/client";
import { z } from "zod";

const cardsController = new Elysia({ prefix: "/cards" }).group(
  "/students",
  (app) =>
    app
      /**
       * Get all students
       */
      .get(
        "/",
        async ({
          query: { page = 1, limit = 10, sortBy = "name", sortOrder = "asc" },
        }: {
          query: PaginationParams;
        }): Promise<ApiResponse<{ students: Student[]; total: number }>> => {
          logger.debug("Get all students", { page, limit, sortBy, sortOrder });

          try {
            const total = await db.student.count();
            const students = await db.student.findMany({
              take: limit,
              skip: (page - 1) * limit,
              orderBy: {
                [sortBy]: sortOrder,
              },
            });

            return {
              success: true,
              data: {
                students,
                total,
              },
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            logger.error("Failed to get students", error);
            throw new AppError({
              statusCode: 500,
              message: "Failed to get students",
              code: "GET_STUDENTS_ERROR",
            });
          }
        },
        {
          query: t.Object({
            page: t.Number().default(1),
            limit: t.Number().default(10),
            sortBy: t.String().default("name"),
            sortOrder: t.String().enum(["asc", "desc"]).default("asc"),
          }),
          detail: {
            tags: ["Cards"],
            summary: "Get all students",
            description: "Retrieve a paginated list of students",
          },
        },
      )
      /**
       * Get a student by ID
       */
      .get(
        "/:id",
        async ({
          params: { id },
        }: {
          params: { id: string };
        }): Promise<ApiResponse<Student>> => {
          logger.debug("Get student by ID", { id });

          try {
            const student = await db.student.findUnique({
              where: { id },
              select: {
                id: true,
                name: true,
                status: true,
                contactName: true,
                email: true,
                phone: true,
                address: true,
                source: true,
                level: true,
                goals: true,
                currentProgram: true,
                lessonPrice: true,
                balance: true,
                totalPaid: true,
                totalDebt: true,
                totalExpenses: true,
                totalLessons: true,
                canceledLessons: true,
                completedLessons: true,
                averageLessonCost: true,
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                groups: {
                  select: {
                    studentGroup: {
                      select: {
                        group: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
                lessons: true,
                payments: true,
              },
            });

            if (!student) {
              logger.warn("Student not found", { id });
              throw new AppError({
                statusCode: 404,
                message: "Student not found",
                code: "STUDENT_NOT_FOUND",
              });
            }

            return {
              success: true,
              data: student,
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            logger.error("Failed to get student", error);
            throw new AppError({
              statusCode: 500,
              message: "Failed to get student",
              code: "GET_STUDENT_ERROR",
            });
          }
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["Cards"],
            summary: "Get a student by ID",
            description: "Retrieve a student by their unique ID",
          },
        },
      )
      /**
       * Create a new student
       */
      .post(
        "/",
        async ({ body }): Promise<ApiResponse<Student>> => {
          logger.debug("Create a new student", { body });

          // Validate request body
          const result = createStudentRequestSchema.safeParse(body);
          if (!result.success) {
            logger.warn("Create student validation failed", result.error);
            throw new AppError({
              statusCode: 400,
              message: "Validation error",
              code: "VALIDATION_ERROR",
            });
          }

          const {
            name,
            contactName,
            email,
            phone,
            address,
            source,
            level,
            goals,
            currentProgram,
            lessonPrice,
          } = result.data;

          try {
            const student = await db.student.create({
              data: {
                name,
                contactName,
                email,
                phone,
                address,
                source,
                level,
                goals,
                currentProgram,
                lessonPrice,
                status: EntityStatus.ACTIVE,
                // Add other default fields as needed
              },
              select: {
                id: true,
                name: true,
                status: true,
                contactName: true,
                email: true,
                phone: true,
                address: true,
                source: true,
                level: true,
                goals: true,
                currentProgram: true,
                lessonPrice: true,
                balance: true,
                totalPaid: true,
                totalDebt: true,
                totalExpenses: true,
                totalLessons: true,
                canceledLessons: true,
                completedLessons: true,
                averageLessonCost: true,
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                groups: {
                  select: {
                    studentGroup: {
                      select: {
                        group: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
                lessons: true,
                payments: true,
              },
            });

            logger.info("Student created successfully", {
              studentId: student.id,
            });

            return {
              success: true,
              data: student,
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            logger.error("Failed to create student", error);
            throw new AppError({
              statusCode: 500,
              message: "Failed to create student",
              code: "CREATE_STUDENT_ERROR",
            });
          }
        },
        {
          body: t.Object({
            name: t.String(),
            contactName: t.Optional(t.String()),
            email: t.Optional(t.String().email()),
            phone: t.Optional(t.String()),
            address: t.Optional(t.String()),
            source: t.Optional(t.String()),
            level: t.Optional(t.Number()),
            goals: t.Optional(t.String()),
            currentProgram: t.Optional(t.String()),
            lessonPrice: t.Optional(t.Number()),
          }),
          detail: {
            tags: ["Cards"],
            summary: "Create a new student",
            description: "Create a new student record",
          },
        },
      )
      /**
       * Update a student by ID
       */
      .patch(
        "/:id",
        async ({
          params: { id },
          body,
        }: {
          params: { id: string };
          body: any;
        }): Promise<ApiResponse<Student>> => {
          logger.debug("Update student by ID", { id, body });

          // Validate request body
          const result = updateStudentRequestSchema.safeParse(body);
          if (!result.success) {
            logger.warn("Update student validation failed", result.error);
            throw new AppError({
              statusCode: 400,
              message: "Validation error",
              code: "VALIDATION_ERROR",
            });
          }

          try {
            const student = await db.student.update({
              where: { id },
              data: result.data,
              select: {
                id: true,
                name: true,
                status: true,
                contactName: true,
                email: true,
                phone: true,
                address: true,
                source: true,
                level: true,
                goals: true,
                currentProgram: true,
                lessonPrice: true,
                balance: true,
                totalPaid: true,
                totalDebt: true,
                totalExpenses: true,
                totalLessons: true,
                canceledLessons: true,
                completedLessons: true,
                averageLessonCost: true,
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                groups: {
                  select: {
                    studentGroup: {
                      select: {
                        group: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
                lessons: true,
                payments: true,
              },
            });

            logger.info("Student updated successfully", {
              studentId: student.id,
            });

            return {
              success: true,
              data: student,
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            logger.error("Failed to update student", error);
            throw new AppError({
              statusCode: 500,
              message: "Failed to update student",
              code: "UPDATE_STUDENT_ERROR",
            });
          }
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            name: t.Optional(t.String()),
            contactName: t.Optional(t.String()),
            email: t.Optional(t.String().email()),
            phone: t.Optional(t.String()),
            address: t.Optional(t.String()),
            source: t.Optional(t.String()),
            level: t.Optional(t.Number()),
            goals: t.Optional(t.String()),
            currentProgram: t.Optional(t.String()),
            lessonPrice: t.Optional(t.Number()),
          }),
          detail: {
            tags: ["Cards"],
            summary: "Update a student by ID",
            description: "Update an existing student record",
          },
        },
      )
      /**
       * Delete a student by ID
       */
      .delete(
        "/:id",
        async ({
          params: { id },
        }: {
          params: { id: string };
        }): Promise<ApiResponse<void>> => {
          logger.debug("Delete student by ID", { id });

          try {
            await db.student.delete({
              where: { id },
            });

            logger.info("Student deleted successfully", { studentId: id });

            return {
              success: true,
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            logger.error("Failed to delete student", error);
            throw new AppError({
              statusCode: 500,
              message: "Failed to delete student",
              code: "DELETE_STUDENT_ERROR",
            });
          }
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["Cards"],
            summary: "Delete a student by ID",
            description: "Delete an existing student record",
          },
        },
      ),
);

cardsController.group("/clients", (app) =>
  app
    /**
     * Get all clients
     */
    .get(
      "/",
      async ({
        query: { page = 1, limit = 10, sortBy = "name", sortOrder = "asc" },
      }: {
        query: PaginationParams;
      }): Promise<ApiResponse<{ clients: Client[]; total: number }>> => {
        logger.debug("Get all clients", { page, limit, sortBy, sortOrder });

        try {
          const total = await db.client.count();
          const clients = await db.client.findMany({
            take: limit,
            skip: (page - 1) * limit,
            orderBy: {
              [sortBy]: sortOrder,
            },
          });

          return {
            success: true,
            data: {
              clients,
              total,
            },
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to get clients", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to get clients",
            code: "GET_CLIENTS_ERROR",
          });
        }
      },
      {
        query: t.Object({
          page: t.Number().default(1),
          limit: t.Number().default(10),
          sortBy: t.String().default("name"),
          sortOrder: t.String().enum(["asc", "desc"]).default("asc"),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Get all clients",
          description: "Retrieve a paginated list of clients",
        },
      },
    )
    /**
     * Get a client by ID
     */
    .get(
      "/:id",
      async ({
        params: { id },
      }: {
        params: { id: string };
      }): Promise<ApiResponse<Client>> => {
        logger.debug("Get client by ID", { id });

        try {
          const client = await db.client.findUnique({
            where: { id },
            select: {
              id: true,
              name: true,
              status: true,
              email: true,
              phone: true,
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          if (!client) {
            logger.warn("Client not found", { id });
            throw new AppError({
              statusCode: 404,
              message: "Client not found",
              code: "CLIENT_NOT_FOUND",
            });
          }

          return {
            success: true,
            data: client,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to get client", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to get client",
            code: "GET_CLIENT_ERROR",
          });
        }
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Get a client by ID",
          description: "Retrieve a client by their unique ID",
        },
      },
    )
    /**
     * Create a new client
     */
    .post(
      "/",
      async ({ body }): Promise<ApiResponse<Client>> => {
        logger.debug("Create a new client", { body });

        // Validate request body
        const result = createClientRequestSchema.safeParse(body);
        if (!result.success) {
          logger.warn("Create client validation failed", result.error);
          throw new AppError({
            statusCode: 400,
            message: "Validation error",
            code: "VALIDATION_ERROR",
          });
        }

        const { name, email, phone } = result.data;

        try {
          const client = await db.client.create({
            data: {
              name,
              email,
              phone,
              status: EntityStatus.ACTIVE,
              // Add other default fields as needed
            },
            select: {
              id: true,
              name: true,
              status: true,
              email: true,
              phone: true,
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          logger.info("Client created successfully", { clientId: client.id });

          return {
            success: true,
            data: client,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to create client", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to create client",
            code: "CREATE_CLIENT_ERROR",
          });
        }
      },
      {
        body: t.Object({
          name: t.String(),
          email: t.Optional(t.String().email()),
          phone: t.Optional(t.String()),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Create a new client",
          description: "Create a new client record",
        },
      },
    )
    /**
     * Update a client by ID
     */
    .patch(
      "/:id",
      async ({
        params: { id },
        body,
      }: {
        params: { id: string };
        body: any;
      }): Promise<ApiResponse<Client>> => {
        logger.debug("Update client by ID", { id, body });

        // Validate request body
        const result = updateClientRequestSchema.safeParse(body);
        if (!result.success) {
          logger.warn("Update client validation failed", result.error);
          throw new AppError({
            statusCode: 400,
            message: "Validation error",
            code: "VALIDATION_ERROR",
          });
        }

        try {
          const client = await db.client.update({
            where: { id },
            data: result.data,
            select: {
              id: true,
              name: true,
              status: true,
              email: true,
              phone: true,
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          logger.info("Client updated successfully", { clientId: client.id });

          return {
            success: true,
            data: client,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to update client", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to update client",
            code: "UPDATE_CLIENT_ERROR",
          });
        }
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: t.Object({
          name: t.Optional(t.String()),
          email: t.Optional(t.String().email()),
          phone: t.Optional(t.String()),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Update a client by ID",
          description: "Update an existing client record",
        },
      },
    )
    /**
     * Delete a client by ID
     */
    .delete(
      "/:id",
      async ({
        params: { id },
      }: {
        params: { id: string };
      }): Promise<ApiResponse<void>> => {
        logger.debug("Delete client by ID", { id });

        try {
          await db.client.delete({
            where: { id },
          });

          logger.info("Client deleted successfully", { clientId: id });

          return {
            success: true,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to delete client", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to delete client",
            code: "DELETE_CLIENT_ERROR",
          });
        }
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Delete a client by ID",
          description: "Delete an existing client record",
        },
      },
    ),
);

cardsController.group("/groups", (app) =>
  app
    /**
     * Get all groups
     */
    .get(
      "/",
      async ({
        query: { page = 1, limit = 10, sortBy = "name", sortOrder = "asc" },
      }: {
        query: PaginationParams;
      }): Promise<ApiResponse<{ groups: Group[]; total: number }>> => {
        logger.debug("Get all groups", { page, limit, sortBy, sortOrder });

        try {
          const total = await db.group.count();
          const groups = await db.group.findMany({
            take: limit,
            skip: (page - 1) * limit,
            orderBy: {
              [sortBy]: sortOrder,
            },
          });

          return {
            success: true,
            data: {
              groups,
              total,
            },
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to get groups", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to get groups",
            code: "GET_GROUPS_ERROR",
          });
        }
      },
      {
        query: t.Object({
          page: t.Number().default(1),
          limit: t.Number().default(10),
          sortBy: t.String().default("name"),
          sortOrder: t.String().enum(["asc", "desc"]).default("asc"),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Get all groups",
          description: "Retrieve a paginated list of groups",
        },
      },
    )
    /**
     * Get a group by ID
     */
    .get(
      "/:id",
      async ({
        params: { id },
      }: {
        params: { id: string };
      }): Promise<ApiResponse<Group>> => {
        logger.debug("Get group by ID", { id });

        try {
          const group = await db.group.findUnique({
            where: { id },
            select: {
              id: true,
              name: true,
              status: true,
              description: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
              students: true,
              lessons: true,
            },
          });

          if (!group) {
            logger.warn("Group not found", { id });
            throw new AppError({
              statusCode: 404,
              message: "Group not found",
              code: "GROUP_NOT_FOUND",
            });
          }

          return {
            success: true,
            data: group,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to get group", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to get group",
            code: "GET_GROUP_ERROR",
          });
        }
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Get a group by ID",
          description: "Retrieve a group by their unique ID",
        },
      },
    )
    /**
     * Create a new group
     */
    .post(
      "/",
      async ({ body }): Promise<ApiResponse<Group>> => {
        logger.debug("Create a new group", { body });

        // Validate request body
        const result = createGroupRequestSchema.safeParse(body);
        if (!result.success) {
          logger.warn("Create group validation failed", result.error);
          throw new AppError({
            statusCode: 400,
            message: "Validation error",
            code: "VALIDATION_ERROR",
          });
        }

        const {
          name,
          description,
          subjectId,
          level,
          startDate,
          endDate,
          lessonPrice,
        } = result.data;

        try {
          const group = await db.group.create({
            data: {
              name,
              description,
              subject: {
                connect: { id: subjectId },
              },
              teacher: {
                connect: { id: "teacherId" }, // Replace with actual teacher ID retrieval logic
              },
              level,
              startDate,
              endDate,
              lessonPrice,
              status: EntityStatus.ACTIVE,
              // Add other default fields as needed
            },
            select: {
              id: true,
              name: true,
              status: true,
              description: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
              students: true,
              lessons: true,
            },
          });

          logger.info("Group created successfully", { groupId: group.id });

          return {
            success: true,
            data: group,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to create group", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to create group",
            code: "CREATE_GROUP_ERROR",
          });
        }
      },
      {
        body: t.Object({
          name: t.String(),
          description: t.Optional(t.String()),
          subjectId: t.String().uuid(),
          level: t.Optional(t.Number()),
          startDate: t.String().datetime(), // Adjust as needed
          endDate: t.String().datetime(), // Adjust as needed
          lessonPrice: t.Number(),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Create a new group",
          description: "Create a new group record",
        },
      },
    )
    /**
     * Update a group by ID
     */
    .patch(
      "/:id",
      async ({
        params: { id },
        body,
      }: {
        params: { id: string };
        body: any;
      }): Promise<ApiResponse<Group>> => {
        logger.debug("Update group by ID", { id, body });

        // Validate request body
        const result = updateGroupRequestSchema.safeParse(body);
        if (!result.success) {
          logger.warn("Update group validation failed", result.error);
          throw new AppError({
            statusCode: 400,
            message: "Validation error",
            code: "VALIDATION_ERROR",
          });
        }

        try {
          const group = await db.group.update({
            where: { id },
            data: result.data,
            select: {
              id: true,
              name: true,
              status: true,
              description: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
              students: true,
              lessons: true,
            },
          });

          logger.info("Group updated successfully", { groupId: group.id });

          return {
            success: true,
            data: group,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to update group", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to update group",
            code: "UPDATE_GROUP_ERROR",
          });
        }
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: t.Object({
          name: t.Optional(t.String()),
          description: t.Optional(t.String()),
          subjectId: t.Optional(t.String().uuid()),
          level: t.Optional(t.Number()),
          startDate: t.Optional(t.String().datetime()), // Adjust as needed
          endDate: t.Optional(t.String().datetime()), // Adjust as needed
          lessonPrice: t.Optional(t.Number()),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Update a group by ID",
          description: "Update an existing group record",
        },
      },
    )
    /**
     * Delete a group by ID
     */
    .delete(
      "/:id",
      async ({
        params: { id },
      }: {
        params: { id: string };
      }): Promise<ApiResponse<void>> => {
        logger.debug("Delete group by ID", { id });

        try {
          await db.group.delete({
            where: { id },
          });

          logger.info("Group deleted successfully", { groupId: id });

          return {
            success: true,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error("Failed to delete group", error);
          throw new AppError({
            statusCode: 500,
            message: "Failed to delete group",
            code: "DELETE_GROUP_ERROR",
          });
        }
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          tags: ["Cards"],
          summary: "Delete a group by ID",
          description: "Delete an existing group record",
        },
      },
    ),
);

// Add the cardsController to the main app
export { cardsController };
