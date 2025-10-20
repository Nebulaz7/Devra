import { Module } from "@nestjs/common";
import { CrustController } from "./crust.controller";
import { CrustService } from "./crust.service";

@Module({
    imports: [],
    controllers: [CrustController],
    providers: [CrustService],
})

export class CrustModule {}