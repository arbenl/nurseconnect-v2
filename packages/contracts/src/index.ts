import { z } from "zod";
export const Role = z.enum(["patient","nurse","admin"]);
export const User = z.object({ id: z.string(), role: Role, isAvailable: z.boolean().optional(), currentLocation: z.object({ lat: z.number(), lng: z.number(), geohash: z.string().optional(), updatedAt: z.number().optional() }).optional() });
export type User = z.infer<typeof User>;
export const RequestStatus = z.enum(["searching","assigned","en_route","arrived","in_service","completed","cancelled"]);
export const Request = z.object({ id: z.string(), patientId: z.string(), status: RequestStatus, location: z.object({ lat: z.number(), lng: z.number(), geohash: z.string().optional() }), assignedNurseId: z.string().optional(), assignmentExpiresAt: z.number().optional(), etaSeconds: z.number().int().nonnegative().optional(), createdAt: z.number(), updatedAt: z.number() });
export type Request = z.infer<typeof Request>;
export const Event = z.object({ id: z.string().optional(), requestId: z.string(), type: z.string(), actorId: z.string(), at: z.number(), payload: z.record(z.any()).default({}) });
export type Event = z.infer<typeof Event>;
