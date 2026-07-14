import { z } from "zod";

// Safely coerces standard Date objects, ISO strings, Epoch numbers,
// and Firestore Timestamp objects (having seconds & nanoseconds) into standard JS Dates.
export const TimestampSchema = z.union([
  z.date(),
  z.number().transform((val) => new Date(val)),
  z.string().transform((val) => new Date(val)),
  z
    .object({
      seconds: z.number(),
      nanoseconds: z.number(),
    })
    .transform((val) => new Date(val.seconds * 1000)),
]);

// Default auto-populated date field builder (coerces null to undefined so that default value kicks in)
export const DateField = z.preprocess(
  (val) => (val === null ? undefined : val),
  TimestampSchema.default(() => new Date()),
);

// Helper schema to support reference fields which can be either a string ID, a Firestore DocumentReference, or the fully populated object
export const Reference = <T extends z.ZodTypeAny>(
  schema: T,
  requiredMessage?: string,
) =>
  z.preprocess(
    (val) => {
      if (val && typeof val === "object") {
        if (
          "id" in val &&
          "path" in val &&
          typeof (val as any).path === "string"
        ) {
          return (val as any).id;
        }
      }
      return val;
    },
    z.union([
      requiredMessage ? z.string().min(1, requiredMessage) : z.string(),
      schema,
    ]),
  );
