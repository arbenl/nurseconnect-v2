import { z } from "zod";

export * from './user';

/**
 * Defines the possible statuses for a request.
 */
export const RequestStatus = z.enum([
  "searching",
  "assigned",
  "en_route",
  "arrived",
  "in_service",
  "completed",
  "cancelled",
]);

/**
 * Represents a request for a nurse.
 */
export const Request = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  status: RequestStatus,
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    geohash: z.string().optional(),
  }),
  assignedNurseId: z.string().uuid().optional(),
  assignmentExpiresAt: z.number().optional(),
  etaSeconds: z.number().int().nonnegative().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Request = z.infer<typeof Request>;

/**
 * Represents an event that occurs in the system.
 */
export const Event = z.object({
  id: z.string().optional(),
  requestId: z.string(),
  type: z.string(),
  actorId: z.string(),
  at: z.number(),
  payload: z.record(z.any()).default({}),
});

export type Event = z.infer<typeof Event>;