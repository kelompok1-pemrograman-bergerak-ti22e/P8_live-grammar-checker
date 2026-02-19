import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonTextarea, 
  IonCard, 
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonChip,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';
import { Subject, debounceTime, switchMap, of, catchError } from 'rxjs';
import { GrammarService } from '../services/grammar.service';
import { addIcons } from 'ionicons';
import { alertCircle } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonTextarea,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonSpinner,
    IonChip,
    IonLabel,
    IonIcon
  ]
})
export class HomePage implements OnDestroy {
  userText: string = '';
  result: any = null;
  isLoading: boolean = false;
  error: string | null = null;

  // Subject untuk menampung input stream
  private textSubject = new Subject<string>();

  constructor(private grammarService: GrammarService) {
    // Register icon
    addIcons({ alertCircle });

    // 🔥 OBSERVABLE PIPELINE (WAJIB PAKAI debounceTime & switchMap)
    this.textSubject.pipe(
      // 1. debounceTime: tunggu 1 detik setelah user berhenti mengetik
      debounceTime(1000),
      
      // 2. switchMap: batalkan request sebelumnya jika ada input baru
      switchMap((text: string) => {
        console.log('📝 Checking grammar for:', text);
        
        // Reset jika teks kosong
        if (!text || text.trim().length === 0) {
          this.result = null;
          this.error = null;
          this.isLoading = false;
          return of(null);
        }

        // Set loading
        this.isLoading = true;
        this.error = null;

        // Panggil service
        return this.grammarService.checkGrammar(text).pipe(
          catchError((err) => {
            console.error('Service error:', err);
            return of({
              status: 'Error',
              correction: 'Gagal terhubung ke AI'
            });
          })
        );
      })
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res) {
          this.result = res;
          if (res.status === 'Error') {
            this.error = res.correction;
          }
        }
      },
      error: (err) => {
        console.error('Subscription error:', err);
        this.isLoading = false;
        this.error = 'Terjadi kesalahan sistem';
      }
    });
  }

  // Dipanggil setiap kali user mengetik
  onTextChange(event: any) {
    const value = event.detail?.value || '';
    this.userText = value;
    this.textSubject.next(value);
  }

  // Cleanup subscription
  ngOnDestroy() {
    this.textSubject.complete();
  }
}