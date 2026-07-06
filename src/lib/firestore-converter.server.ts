import { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { z } from "zod";

/**
 * Creates a Firestore Data Converter mapped to a Zod schema.
 * Automatically injects the Firestore document ID as the `id` field,
 * and coerces/validates the fields upon fetching and saving.
 */
export function createZodConverter<T extends z.ZodObject<any>>(
  schema: T
): FirestoreDataConverter<z.infer<T>> {
  return {
    toFirestore(model: z.infer<T>): DocumentData {
      // Validate schema on save (toFirestore receives the parsed typescript type)
      const parsed = schema.parse(model);
      
      // Strip 'id' field before saving to Firestore document data,
      // as the document ID resides in the document reference itself.
      const { id, ...dataWithoutId } = parsed;
      return dataWithoutId;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): z.infer<T> {
      const data = snapshot.data();
      
      // Inject document ID as 'id' property so the Zod schema checks it
      const rawData = {
        ...data,
        id: snapshot.id,
      };

      // Safely parse/coerce data. Zod handles Timestamp coercions automatically.
      const result = schema.safeParse(rawData);
      if (!result.success) {
        console.error(`[Firestore Schema Validation Mismatch] Collection: ${snapshot.ref.parent.id}, Doc: ${snapshot.id}`, result.error.format());
        throw new Error(
          `Data validation failed for collection "${snapshot.ref.parent.id}", doc "${snapshot.id}": ${JSON.stringify(result.error.format())}`
        );
      }
      return result.data;
    },
  };
}
