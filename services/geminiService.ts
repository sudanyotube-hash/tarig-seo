import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GenerateParams, SEOResponse, MarketingParams, MarketingCopyResponse, PerformanceParams, PerformanceResponse } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

const seoSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 5 high-CTR, click-worthy video titles optimized for YouTube search and recommendations.",
    },
    description: {
      type: Type.STRING,
      description: "A highly engaging, professionally formatted YouTube video description. It must include a strong hook in the first 2 lines, a 'Question of the Day' to drive comments, a clear 'Subscribe' CTA, and placeholders for timestamps and social links.",
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 20-30 high-volume, low-competition tags/keywords separated by commas.",
    },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 5-10 trending and relevant hashtags including the # symbol.",
    },
    category: {
      type: Type.STRING,
      description: "The most appropriate YouTube category for this video (e.g., Education, Entertainment, Tech).",
    },
    algorithmStrategy: {
      type: Type.STRING,
      description: "A brief analysis of why this content works with the current algorithm (focus on retention, click-through rate, and engagement signals).",
    },
    thumbnailIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Detailed visual description of the thumbnail image (scene, facial expression, colors, background)." },
          text: { type: Type.STRING, description: "Short, punchy text overlay (max 3-5 words) to be placed on the image." }
        },
        required: ["description", "text"]
      },
      description: "List of 3 distinct, high-click-through-rate thumbnail concepts that complement the titles."
    }
  },
  required: ["titles", "description", "keywords", "hashtags", "category", "algorithmStrategy", "thumbnailIdeas"],
};

const marketingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    strategy: {
      type: Type.STRING,
      description: "A brief, punchy marketing strategy explaining the tone and approach for the campaign.",
    },
    posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING, description: "The social media platform (e.g., Instagram, Twitter, LinkedIn, Facebook)." },
          content: { type: Type.STRING, description: "The post content/caption. Use emojis where appropriate." },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant hashtags for the post." }
        },
        required: ["platform", "content", "hashtags"]
      },
      description: "A list of 4 distinct posts optimized for Instagram, Twitter, LinkedIn, and Facebook."
    }
  },
  required: ["strategy", "posts"]
};

const titlesSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 5 NEW high-CTR, click-worthy video titles.",
    }
  },
  required: ["titles"]
};

const descriptionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A NEW highly engaging, professionally formatted YouTube video description.",
    }
  },
  required: ["description"]
};

export const generateSEO = async (params: GenerateParams): Promise<SEOResponse> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Act as a world-class YouTube SEO Expert and Content Strategist.
    I need you to generate a publishing strategy and metadata for a NEW YouTube video idea based on the following:
    
    - Video Idea: ${params.topic}
    - Niche/Category: ${params.category}
    - Target Audience: ${params.audience}
    - Language: ${params.language} (Output must be in ${params.language})

    Please strictly follow the latest YouTube Algorithm best practices (2024/2025):
    1. Titles: Generate 5 click-worthy titles (under 60 chars) that evoke curiosity or promise value.
    2. Description: Write a highly engaging, professional description optimized for retention and conversion.
       - **First 2 lines**: Must be a strong hook/summary for high CTR in search results.
       - **Body**: Explain the value of the video using the AIDA framework.
       - **Engagement**: Include a specific "Question of the Day" (appropriate for the language/culture) to encourage comments.
       - **CTA**: Include a compelling call-to-action to subscribe and like the video.
       - **Structure**: Use emojis, bullet points, and clear spacing. Include a "Timestamps" placeholder.
    3. Keywords: Mix broad and specific long-tail tags relevant to the specific Category.
    4. Provide a strategy on how to classify this content for the algorithm.
    5. Suggest 3 high-CTR thumbnail ideas with text overlays.
    
    Output strictly in JSON format matching the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: seoSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    return JSON.parse(text) as SEOResponse;
  } catch (error) {
    console.error("Error generating SEO data:", error);
    throw error;
  }
};

export const generateTitles = async (params: GenerateParams): Promise<string[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Act as a YouTube Title Expert.
    Generate 5 NEW, different, high-CTR titles for this video idea. 
    Focus on: Curiosity, Urgency, or Strong Value Proposition.
    
    - Video Idea: ${params.topic}
    - Category: ${params.category}
    - Audience: ${params.audience}
    - Language: ${params.language}
    
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: titlesSchema,
        temperature: 0.8, // Higher temperature for creativity
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    const json = JSON.parse(text) as { titles: string[] };
    return json.titles;
  } catch (error) {
    console.error("Error regenerating titles:", error);
    throw error;
  }
};

export const generateDescription = async (params: GenerateParams): Promise<string> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Act as a YouTube Copywriting Expert.
    Write a NEW, engaging description for this video.
    
    - Video Idea: ${params.topic}
    - Category: ${params.category}
    - Audience: ${params.audience}
    - Language: ${params.language}
    
    Include: Hook (first 2 lines), Value Body, Question of the Day, Call to Action, Timestamps placeholder.
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: descriptionSchema,
        temperature: 0.7,
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    const json = JSON.parse(text) as { description: string };
    return json.description;
  } catch (error) {
    console.error("Error regenerating description:", error);
    throw error;
  }
};

export const generateMarketingCopy = async (params: MarketingParams): Promise<MarketingCopyResponse> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Act as a Senior Social Media Marketing Specialist.
    I need you to generate a content strategy and social media posts for a product/service.

    - Product/Service Name: ${params.productName}
    - Target Audience: ${params.audience}
    - Language: ${params.language} (Output must be in ${params.language})

    Tasks:
    1. Develop a brief, high-impact strategy statement tailored to the audience.
    2. Write 4 distinct social media posts customized for:
       - **Instagram**: Visual focus, engaging, storytelling, lots of emojis.
       - **Twitter (X)**: Short, punchy, conversational, or thread-hook style.
       - **LinkedIn**: Professional, value-driven, business-focused.
       - **Facebook**: Community-focused, conversational, encourages sharing.
    
    Output strictly in JSON format matching the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: marketingSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    return JSON.parse(text) as MarketingCopyResponse;
  } catch (error) {
    console.error("Error generating marketing copy:", error);
    throw error;
  }
};

export const analyzeVideoPerformance = async (params: PerformanceParams): Promise<PerformanceResponse> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are a YouTube Analytics Expert.
    1.  Search for the YouTube video at this URL: "${params.url}".
    2.  Based on the search results (snippets, titles, metadata), identify or estimate the current number of **Views**, **Likes**, and **Comments**.
    3.  Provide a brief, professional **Analysis** of why this video is performing well or poorly based on its topic, title, and engagement visible in search.
    
    CRITICAL: You must format your response EXACTLY like this (use "Not found" if data is missing):
    
    VIEWS: [Number]
    LIKES: [Number]
    COMMENTS: [Number]
    ANALYSIS: [Your analysis text here in Arabic]
  `;

  try {
    // When using Google Search tool, we cannot use responseSchema. We must parse text manually.
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
      },
    });

    const text = response.text || "";
    
    // Parse the text response
    const viewsMatch = text.match(/VIEWS:\s*(.+)/i);
    const likesMatch = text.match(/LIKES:\s*(.+)/i);
    const commentsMatch = text.match(/COMMENTS:\s*(.+)/i);
    const analysisMatch = text.match(/ANALYSIS:\s*([\s\S]*)/i);

    return {
      views: viewsMatch ? viewsMatch[1].trim() : "غير متوفر",
      likes: likesMatch ? likesMatch[1].trim() : "غير متوفر",
      comments: commentsMatch ? commentsMatch[1].trim() : "غير متوفر",
      analysis: analysisMatch ? analysisMatch[1].trim() : "لم يتم العثور على تحليل كافٍ."
    };

  } catch (error) {
    console.error("Error analyzing video performance:", error);
    throw error;
  }
};