'use server';

/**
 * @fileOverview An AI flow for uploading images to Firebase Storage.
 *
 * - uploadImage - A function that handles the image upload process.
 * - UploadImageInput - The input type for the uploadImage function.
 * - UploadImageOutput - The return type for the uploadImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase'; // Import the initialized app

const UploadImageInputSchema = z.object({
  fileName: z.string().describe('The name of the file to upload.'),
  dataUri: z.string().describe("The image file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

const UploadImageOutputSchema = z.object({
  downloadUrl: z.string().describe('The public URL of the uploaded image.'),
});
export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;

export async function uploadImage(input: UploadImageInput): Promise<UploadImageOutput> {
  return uploadImageFlow(input);
}

const uploadImageFlow = ai.defineFlow(
  {
    name: 'uploadImageFlow',
    inputSchema: UploadImageInputSchema,
    outputSchema: UploadImageOutputSchema,
  },
  async ({ fileName, dataUri }) => {
    const storage = getStorage(app); // Pass the initialized app to getStorage
    const storageRef = ref(storage, `locations/${Date.now()}_${fileName}`);
    
    // Extract MIME type and base64 data from data URI
    const match = dataUri.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error('Invalid data URI format.');
    }
    const contentType = match[1];
    
    // uploadString handles base64 data correctly
    const snapshot = await uploadString(storageRef, dataUri, 'data_url', { contentType });
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return { downloadUrl };
  }
);
