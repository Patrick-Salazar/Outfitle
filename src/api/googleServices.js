import { GoogleGenerativeAI } from '@google/generative-ai';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

// LLM Integration - using Google Gemini
export const InvokeLLM = async (options) => {
  try {
    // Handle both old format (string prompt) and new format (object with prompt, file_urls, etc.)
    let prompt, fileUrls, base64Images, responseJsonSchema, modelName;

    if (typeof options === 'string') {
      // Old format: simple string prompt
      prompt = options;
      modelName = 'gemini-pro';
    } else {
      // New format: object with prompt, file_urls, base64_images, response_json_schema
      prompt = options.prompt;
      fileUrls = options.file_urls;
      base64Images = options.base64_images;
      responseJsonSchema = options.response_json_schema;
      // Use Gemini 2.0 Flash for both vision and text tasks
      modelName = 'gemini-2.0-flash-exp';
    }

    // Configure model with JSON schema if provided
    const modelConfig = {};

    // gemini-1.5-pro supports JSON mode
    if (responseJsonSchema) {
      modelConfig.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: responseJsonSchema
      };
    }

    const geminiModel = genAI.getGenerativeModel({
      model: modelName,
      ...modelConfig
    });

    let result;

    if (base64Images && base64Images.length > 0) {
      // Image analysis with base64 images (avoid CORS issues)
      const imageParts = base64Images.map((base64) => {
        // Extract mime type and data from data URL (data:image/jpeg;base64,...)
        const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
        const mimeType = matches ? matches[1] : 'image/jpeg';
        const data = matches ? matches[2] : base64;

        return {
          inlineData: {
            data,
            mimeType
          }
        };
      });

      result = await geminiModel.generateContent([prompt, ...imageParts]);
    } else if (fileUrls && fileUrls.length > 0) {
      // Image analysis with vision model (fetching from URLs)
      const imageParts = await Promise.all(
        fileUrls.map(async (url) => {
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          return {
            inlineData: {
              data: base64,
              mimeType: response.headers.get('content-type') || 'image/jpeg'
            }
          };
        })
      );

      result = await geminiModel.generateContent([prompt, ...imageParts]);
    } else {
      // Text-only generation
      result = await geminiModel.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    // If response_json_schema was provided, parse JSON response
    if (responseJsonSchema) {
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON response:', text);
        throw new Error('Invalid JSON response from LLM: ' + text);
      }
    }

    return {
      text,
      success: true
    };
  } catch (error) {
    console.error('Error invoking LLM:', error);
    throw error;
  }
};

// File Upload to Firebase Storage
export const UploadFile = async (options) => {
  try {
    // Handle both old format (file object) and new format (object with file property)
    const file = options.file || options;
    const path = options.path || 'uploads';

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      file_url: downloadURL,  // Changed from 'url' to 'file_url' to match expected format
      url: downloadURL,
      path: snapshot.ref.fullPath,
      name: fileName,
      success: true
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Upload Private File (with metadata)
export const UploadPrivateFile = async (file, path = 'private', metadata = {}) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file, { customMetadata: metadata });
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      name: fileName,
      metadata,
      success: true
    };
  } catch (error) {
    console.error('Error uploading private file:', error);
    throw error;
  }
};

// Create Signed URL (Firebase Storage URL is already signed)
export const CreateFileSignedUrl = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(storageRef);
    return {
      url: downloadURL,
      success: true
    };
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
};

// Image Generation using Gemini (if available) or placeholder
export const GenerateImage = async (prompt) => {
  try {
    // Note: Gemini doesn't support image generation directly
    // You would need to use Google's Imagen API or another service
    console.warn('Image generation requires separate Google Imagen API setup');

    // Placeholder - you'll need to implement actual Imagen API integration
    return {
      url: null,
      message: 'Image generation requires Google Imagen API configuration',
      success: false
    };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

// Extract Data from Uploaded File using Gemini Vision
export const ExtractDataFromUploadedFile = async (fileUrl, prompt = 'Extract all text and data from this image') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Fetch the image
    const response = await fetch(fileUrl);
    const imageData = await response.arrayBuffer();
    const base64Image = Buffer.from(imageData).toString('base64');

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: response.headers.get('content-type') || 'image/jpeg'
        }
      }
    ]);

    const extractedText = result.response.text();

    return {
      text: extractedText,
      success: true
    };
  } catch (error) {
    console.error('Error extracting data from file:', error);
    throw error;
  }
};

// Send Email - using Firebase Extensions or Cloud Functions
export const SendEmail = async (to, subject, body) => {
  try {
    // Note: This requires Firebase Extensions (Trigger Email) or Cloud Functions
    console.warn('Email sending requires Firebase Extensions setup or Cloud Functions');

    // Placeholder - you'll need to set up Firebase Email Extension or Cloud Function
    return {
      message: 'Email sending requires Firebase Extensions or Cloud Functions configuration',
      success: false
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Export all integrations as Core object for compatibility
export const Core = {
  InvokeLLM,
  UploadFile,
  UploadPrivateFile,
  CreateFileSignedUrl,
  GenerateImage,
  ExtractDataFromUploadedFile,
  SendEmail
};
