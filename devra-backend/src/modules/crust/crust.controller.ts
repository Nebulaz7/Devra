import { Controller, Get } from "@nestjs/common";
import { CrustService } from "./crust.service"

@Controller('crust')
export class CrustController {
    constructor(private readonly testUploadService: CrustService) {}

    @Get()
    async crustUpload() {
     const filePath = './src/test/test.txt';
     return this.testUploadService.uploadToCrust(filePath);
  }
}