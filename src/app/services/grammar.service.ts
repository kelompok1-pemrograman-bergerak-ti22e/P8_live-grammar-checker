import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrammarService {

  // 🔑 GANTI DENGAN API KEY ANDA (dapat dari https://aistudio.google.com)
  private API_KEY = 'AIzaSyAF411yOErVF0GxAFxiH71uFXywsqG3dJk';
  
  // 🤖 Gunakan model stabil
  private API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  constructor(private http: HttpClient) {}

  checkGrammar(text: string): Observable<any> {
    // Prompt sesuai spesifikasi
    const prompt = `Check grammar for: "${text}". 
Return valid JSON { "status": "Correct/Incorrect", "correction": "the corrected sentence if Incorrect, or empty string if Correct" }`;

    const url = `${this.API_URL}?key=${this.API_KEY}`;
    
    return this.http.post<any>(url, {
      contents: [{ parts: [{ text: prompt }] }]
    }).pipe(
      map(res => {
        // Validasi response
        if (!res.candidates || !res.candidates[0]) {
          throw new Error('Invalid response');
        }

        const output = res.candidates[0].content.parts[0].text;
        
        // Bersihkan jika AI mengirim markdown JSON
        const cleaned = output
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        return JSON.parse(cleaned);
      }),
      catchError(err => {
        console.error('Error:', err);
        return of({ 
          status: 'Error', 
          correction: 'Gagal terhubung ke AI' 
        });
      })
    );
  }
}