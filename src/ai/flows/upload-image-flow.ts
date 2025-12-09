'use server';
/**
 * @fileOverview An AI agent for uploading images to Firebase Storage.
 *
 * - uploadImage - A function that uploads an image and returns its public URL.
 * - UploadImageInput - The input type for the uploadImage function.
 * - UploadImageOutput - The return type for the uploadImage function.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';


// Ensure Firebase is initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const UploadImageInputSchema = z.object({
  fileName: z.string().describe('The name of the file to upload.'),
  dataUri: z
    .string()
    .describe(
      "The image file as a data URI, including a MIME type and Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

const UploadImageOutputSchema = z.object({
  downloadUrl: z.string().describe('The public URL of the uploaded image.'),
});
export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;

const uploadImageFlow = ai.defineFlow(
  {
    name: 'uploadImageFlow',
    inputSchema: UploadImageInputSchema,
    outputSchema: UploadImageOutputSchema,
  },
  async ({ fileName, dataUri }) => {
    const storage = getStorage();
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const storageRef = ref(storage, `locations/${uniqueFileName}`);
    
    // Upload the file from the data URI
    await uploadString(storageRef, dataUri, 'data_url');

    // Get the public download URL
    const downloadUrl = await getDownloadURL(storageRef);

    return { downloadUrl };
  }
);


export async function uploadImage(
  input: UploadImageInput
): Promise<UploadImageOutput> {
  return uploadImageFlow(input);
}
