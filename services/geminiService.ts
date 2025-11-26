import { GoogleGenAI } from "@google/genai";
import { Vulnerability } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateRemediationReport = async (vuln: Vulnerability): Promise<string> => {
  if (!apiKey) {
    return "## Error\nAPI Key not configured. Please set process.env.API_KEY.";
  }

  try {
    const prompt = `
      You are a Senior Application Security Engineer for NCIIPC.
      Analyze the following detected vulnerability and provide a remediation report.
      
      **Vulnerability Details:**
      - Title: ${vuln.title}
      - Endpoint: ${vuln.endpoint}
      - Payload Used: \`${vuln.payload}\`
      - Severity: ${vuln.severity}
      
      **Required Output Format (Markdown):**
      1. **Executive Summary**: Brief explanation of the risk.
      2. **Technical Analysis**: How the attack works based on the payload.
      3. **Impact Assessment**: What could happen if exploited.
      4. **Remediation Strategy**: Concrete steps to fix it.
      5. **Code Fix Example**: Provide a generic code snippet (in Python, Go, or JS) showing a secure implementation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a strict cybersecurity auditing system. Output clean, professional Markdown.",
      }
    });

    return response.text || "No report generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## Error Generating Report\nFailed to contact AI analysis engine. Please check your connection or API limits.";
  }
};

export const analyzeTargetSurface = async (target: string, subdomains: string[]): Promise<string> => {
  if (!apiKey) return "API Key Missing";

  const prompt = `
    Target: ${target}
    Discovered Assets: ${subdomains.join(', ')}
    
    Provide a brief "Attack Surface Assessment" summarizing the potential risks based on these exposed subdomains. Keep it under 150 words.
  `;

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analysis failed.";
  } catch (e) {
    return "Analysis unavailable.";
  }
}