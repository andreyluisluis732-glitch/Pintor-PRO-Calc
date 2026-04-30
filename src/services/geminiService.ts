import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AISmartEstimateResponse {
  propertyType: string;
  estimatedArea: number;
  materialsNeeded: string[];
  suggestedProducts: string[];
  description: string;
  estimatedLaborCost: number;
  estimatedMaterialCost: number;
}

export const analyzePropertyPhoto = async (base64Image: string, details: string): Promise<AISmartEstimateResponse> => {
  const model = "gemini-2.0-flash";
  
  const prompt = `Analise esta foto de um imóvel e os detalhes fornecidos pelo cliente: "${details}".
    Extraia as seguintes informações para um orçamento de pintura profissional:
    1. Tipo de imóvel (Casa, Apartamento, Prédio, Galpão, Condomínio ou Comercial)
    2. Área estimada em m2 (seja realista baseado na escala da foto se não informado)
    3. Materiais necessários (ex: Massa, Textura, Grafiato, Tintas específicas)
    4. Produtos sugeridos
    5. Uma breve descrição técnica do estado da parede e o que precisa ser feito.
    6. Estimativa de custo de mão de obra (valor numérico em Reais, baseando-se em R$ 20-40 por m2)
    7. Estimativa de custo de materiais (valor numérico em Reais)

    Forneça a resposta em formato JSON estrito.`;

  const generativeModel = ai.getGenerativeModel({
    model: model,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          propertyType: { type: Type.STRING },
          estimatedArea: { type: Type.NUMBER },
          materialsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedProducts: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
          estimatedLaborCost: { type: Type.NUMBER },
          estimatedMaterialCost: { type: Type.NUMBER },
        },
        required: ["propertyType", "estimatedArea", "materialsNeeded", "description", "estimatedLaborCost", "estimatedMaterialCost"]
      }
    }
  });

  const response = await generativeModel.generateContent([
    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
    { text: prompt }
  ]);

  return JSON.parse(response.response.text());
};

export const generatePreviewImage = async (base64Image: string, instructions: string): Promise<string> => {
  const model = "gemini-2.5-flash-image";
  
  const generativeModel = ai.getGenerativeModel({ model: model });
  
  const response = await generativeModel.generateContent([
    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
    { text: `GERE UMA NOVA IMAGEM baseada nesta foto original. Transforme o imóvel aplicando as seguintes mudanças de pintura: ${instructions}. 
    Mantenha EXATAMENTE a mesma estrutura arquitetônica, janelas e portas do imóvel original. 
    Apenas mude a cor e textura das paredes externas para as solicitadas. 
    O resultado deve parecer uma foto real de um serviço de pintura finalizado com alta qualidade.` }
  ]);

  const candidates = response.response.candidates;
  if (candidates && candidates.length > 0) {
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("Não foi possível gerar a prévia da imagem.");
};
