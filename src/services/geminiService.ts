import { GoogleGenAI } from "@google/genai";
import { Cadet, AttendanceRecord, AttendanceStatus } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateExecutiveSummary = async (
  cadets: Cadet[],
  attendanceHistory: Record<string, Record<string, AttendanceStatus>>,
  date: string
): Promise<string> => {
  if (!apiKey) return "API Key is missing. Please configure the environment.";

  const recordsForDate = attendanceHistory[date] || {};
  const presentCount = Object.values(recordsForDate).filter(s => s === AttendanceStatus.PRESENT).length;
  const totalStrength = cadets.length;
  
  const absentees = cadets
    .filter(c => recordsForDate[c.id] === AttendanceStatus.ABSENT)
    .map(c => `${c.rank} ${c.fullName} (${c.platoon})`)
    .join(', ');

  const prompt = `
    You are the Adjutant of an NCC Unit. Write a crisp, formal military-style executive summary for the Commanding Officer based on the following daily attendance report.
    
    Date: ${date}
    Total Strength: ${totalStrength}
    Present on Parade: ${presentCount}
    Absentees: ${absentees || "None"}
    
    Attendance Data (JSON): ${JSON.stringify(recordsForDate)}
    
    Include:
    1. Parade State Summary.
    2. Brief analysis of absenteeism (if any).
    3. Recommendations for the next drill.
    
    Keep it professional, concise, and use military terminology.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating report. Please try again.";
  }
};

export const generateDrillSchedule = async (
  cadets: Cadet[],
  focusArea: string
): Promise<string> => {
  if (!apiKey) return "API Key is missing.";

  const prompt = `
    Create a 1-day NCC training schedule focused on "${focusArea}".
    Total Cadets: ${cadets.length}.
    
    Format the output as a structured Markdown table with columns: Time, Activity, Instructor (suggest generic rank), and Remarks.
    Add a motivational quote at the end.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate schedule.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating schedule.";
  }
};