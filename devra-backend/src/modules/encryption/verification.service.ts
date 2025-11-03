import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class VerificationService {
  private readonly VERIFY_API = process.env.VERIFY_API_URL || 'http://localhost:8000/verify';

  async verifyDataset(file: Express.Multer.File): Promise<any> {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(file.path), file.originalname);

      const response = await axios.post(this.VERIFY_API, form, {
        headers: form.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('❌ AI Verification failed:', error.response?.data || error.message);
      throw new HttpException('AI verification failed', 500);
    }
  }
}
