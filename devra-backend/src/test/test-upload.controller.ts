import { Controller, Get } from "@nestjs/common";
import { TestUploadService } from "./test-upload.service"

@Controller('test')
export class TestUploadController {
    constructor(private readonly testUploadService: TestUploadService) {}

    @Get('upload')
    async testUpload() {
     const filePath = './src/test/test.txt';
     return this.testUploadService.uploadToCrust(filePath);
  }
}