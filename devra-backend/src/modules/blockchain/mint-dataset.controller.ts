import { Controller } from '@nestjs/common';
import { CrustService } from '../crust/crust.service';

@Controller('mint-dataset')
export class MintController {
  constructor(private readonly crustService: CrustService) {}

};