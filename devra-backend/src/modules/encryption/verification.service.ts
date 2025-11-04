import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface VerificationResponse {
  scores: Record<string, number>;
  issues: Array<{ type: string; message: string }>;
  status: string;
}

@Injectable()
export class VerificationService {
  private readonly aiVerificationUrl = 'http://localhost:8000/verify'; // FastAPI endpoint

  async verifyDataset(file: Express.Multer.File): Promise<{
    scores?: Record<string, number>;
    issues?: Array<{ type: string; message: string }>;
    status?: string;
    isValid: boolean;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob([new Uint8Array(file.buffer)]),
        file.originalname,
      );

      const response = await axios.post(this.aiVerificationUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });

      const { scores, issues, status } = response.data as VerificationResponse;

      return {
        scores,
        issues,
        status,
        isValid: status === 'VERIFIED',
      };
    } catch (error: unknown) {
      const errorMessage = 
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ AI verification failed:', errorMessage);
      return {
        isValid: false,
        error: 'AI verification service unavailable or failed',
      };
    }
  }
}
