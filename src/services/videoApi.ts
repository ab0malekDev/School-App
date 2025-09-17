import { DocumentPickerAsset } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { API_URL, getAuthHeaders } from './api';

export async function uploadVideo(
  subjectId: string,
  unitId: string,
  lessonId: string,
  video: DocumentPickerAsset,
  data: { title: string; description: string; order: number }
) {
  try {
    const headers = await getAuthHeaders();
    const formData = new FormData();

    // Handle content:// URIs (Android) by copying to cache directory
    let fileUri = video.uri;
    if (fileUri.startsWith('content://')) {
      const newPath = FileSystem.cacheDirectory + video.name;
      await FileSystem.copyAsync({ from: fileUri, to: newPath });
      fileUri = newPath;
    }

    // Create file object with proper URI handling for Android
    const file = {
      uri: fileUri,
      name: video.name,
      type: video.mimeType || 'video/mp4',
    };

    // Append video file
    formData.append('video', file as any);

    // Append metadata
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('order', data.order.toString());

    // Extra debug logs
    console.log('API_URL:', API_URL);
    console.log('File URI:', fileUri);
    console.log('Headers:', headers);
    console.log('FormData:', formData);

    // Use fetch for the upload, do NOT set Content-Type
    const response = await fetch(
      `${API_URL}/subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/videos`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Accept': 'application/json',
          // Do NOT set Content-Type!
        },
        body: formData,
      }
    );
    console.log('Fetch response status:', response.status);
    const responseData = await response.json().catch(() => null);
    console.log('Fetch response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData?.message || 'Failed to upload video');
    }

    return responseData;
  } catch (error) {
    console.error('Error in video upload:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

/**
 * Upload a video file in chunks to the backend.
 * @param subjectId
 * @param unitId
 * @param lessonId
 * @param video
 * @param data { title, description, order }
 * @param onProgress (optional) - callback(percent: number)
 */
export async function uploadVideoInChunks(
  subjectId: string,
  unitId: string,
  lessonId: string,
  video: DocumentPickerAsset,
  data: { title: string; description: string; order: number },
  onProgress?: (percent: number) => void
) {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  let fileUri = video.uri;
  if (fileUri.startsWith('content://')) {
    const newPath = FileSystem.cacheDirectory + video.name;
    await FileSystem.copyAsync({ from: fileUri, to: newPath });
    fileUri = newPath;
  }
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists || !fileInfo.size) {
    throw new Error('File not found or size unknown');
  }
  const fileSize = fileInfo.size;
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
  const headers = await getAuthHeaders();

  for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
    const start = (chunkNumber - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fileSize);
    // Read chunk as base64 string
    const chunkBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
      position: start,
      length: end - start,
    });
    // Prepare JSON body
    const body: any = {
      chunkNumber,
      totalChunks,
      fileName: video.name,
      chunkBase64,
    };
    if (chunkNumber === 1) {
      body.title = data.title;
      body.description = data.description;
      body.order = data.order;
    }
    const response = await fetch(
      `${API_URL}/subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/videos/chunk`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to upload chunk');
    }
    if (onProgress) {
      onProgress((chunkNumber / totalChunks) * 100);
    }
  }
  return { success: true };
} 