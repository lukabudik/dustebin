import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

interface GeneratedContent {
  title: string;
  description: string;
}

/**
 * Generates a title and description for a paste using Gemini 2.0 Flash
 * @param content The content of the paste
 * @param language The language of the paste
 * @returns An object containing the generated title and description
 */
export async function generateTitleAndDescription(
  content: string,
  language: string
): Promise<GeneratedContent> {
  // Skip generation for very large pastes (close to 1M tokens)
  if (content.length > 900000) {
    return {
      title: `${language.charAt(0).toUpperCase() + language.slice(1)} Snippet`,
      description: 'Large code snippet',
    };
  }

  try {
    const prompt = `
      You are analyzing a code snippet or text content. 
      Based on the content below, generate a concise, descriptive title (max 50 chars) and a very brief description (max 100 chars).
      The content is written in ${language}.
      
      Content:
      \`\`\`${language}
      ${content.substring(0, 10000)} ${content.length > 10000 ? '...' : ''}
      \`\`\`
      
      Respond in JSON format with "title" and "description" fields only.
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 100,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: 'A concise, descriptive title for the code snippet',
            },
            description: {
              type: SchemaType.STRING,
              description: 'A very brief description of what the code does',
            },
          },
          required: ['title', 'description'],
        },
      },
    });

    const responseText = result.response.text();
    let responseJson;

    try {
      responseJson = JSON.parse(responseText);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      // Fallback values if parsing fails
      return {
        title: `${language.charAt(0).toUpperCase() + language.slice(1)} Snippet`,
        description: 'Code snippet',
      };
    }

    return {
      title:
        responseJson.title || `${language.charAt(0).toUpperCase() + language.slice(1)} Snippet`,
      description: responseJson.description || 'Code snippet',
    };
  } catch (error) {
    console.error('Error generating title and description:', error);
    // Fallback values if generation fails
    return {
      title: `${language.charAt(0).toUpperCase() + language.slice(1)} Snippet`,
      description: 'Code snippet',
    };
  }
}
