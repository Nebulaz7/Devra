import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  HttpException, 
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiParam, 
  ApiBody,
} from '@nestjs/swagger';
import { MintDatasetService } from './mint-dataset.service';
import { DatasetRecordService } from '../encryption/dataset-record.service';
import { PrepareMintDto } from './dto/prepare-mint.dto';

@ApiTags('Blockchain')
@Controller('blockchain')
export class MintDatasetController {
  private readonly logger = new Logger(MintDatasetController.name);

  constructor(
    private readonly mintDatasetService: MintDatasetService,
    private readonly datasetRecordService: DatasetRecordService,
  ) {}

  @Post('mint/:datasetId/prepare')
  @ApiOperation({ summary: 'Prepare mint transaction for frontend wallet' })
  @ApiParam({ name: 'datasetId', description: 'Dataset ID to mint' })
  @ApiBody({ type: PrepareMintDto })
  async prepareMint(
    @Param('datasetId') datasetId: string,
    @Body() body: PrepareMintDto,
  ) {
    try {

      if (!body || typeof body !== 'object') {
        throw new HttpException(
          'Invalid request body. Expected JSON object with owner property',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        !body.owner ||
        typeof body.owner !== 'string' ||
        body.owner.trim() === ''
      ) {
        this.logger.error(`Invalid owner address received`);
        throw new HttpException(
          'Owner address is required and must be a valid non-empty string',
          HttpStatus.BAD_REQUEST,
        );
      }

      const ownerAddress = body.owner.trim();

      const dataset = await this.datasetRecordService.findById(datasetId);

      if (!dataset) {
        this.logger.error(`Dataset not found`);
        throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Dataset found with status`);

      if (dataset.status !== 'uploaded') {
        throw new HttpException(
          `Dataset must be uploaded before minting. Current status`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const mintData = this.mintDatasetService.prepareMint(
        dataset,
        ownerAddress,
      );

      await this.datasetRecordService.updateTokenUri(
        datasetId,
        mintData.tokenURI,
      );

      this.logger.log(`Mint prepared successfully for dataset`);

      return {
        success: true,
        message: 'Mint transaction prepared successfully',
        data: {
          tx: mintData.tx,
          tokenURI: mintData.tokenURI,
          datasetId: dataset.id,
          datasetName: dataset.name,
        },
      };
    } catch (error) {
      this.logger.error(
        `Prepare mint error: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        (error as Error).message || 'Failed to prepare mint transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('dataset/:datasetId/token/:tokenId')
  @ApiOperation({ summary: 'Update dataset with minted token ID' })
  @ApiParam({ name: 'datasetId', description: 'Dataset ID' })
  @ApiParam({ name: 'tokenId', description: 'NFT Token ID' })
  @ApiResponse({ status: 200, description: 'Token ID updated successfully' })
  async updateTokenId(
    @Param('datasetId') datasetId: string,
    @Param('tokenId') tokenId: string,
  ) {
    try {

      const dataset = await this.datasetRecordService.findById(datasetId);

      if (!dataset) {
        throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
      }

      const updated = await this.datasetRecordService.updateTokenId(
        datasetId,
        parseInt(tokenId),
      );

      return {
        success: true,
        message: 'Token ID updated successfully',
        data: updated,
      };
    } catch (error) {
      this.logger.error(`Update token ID error: ${(error as Error).message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        (error as Error).message || 'Failed to update token ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dataset/:datasetId/token-uri')
  @ApiOperation({ summary: 'Get token URI for a dataset' })
  @ApiParam({ name: 'datasetId', description: 'Dataset ID' })
  @ApiResponse({ status: 200, description: 'Token URI retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Dataset not found' })
  async getTokenURI(@Param('datasetId') datasetId: string) {
    try {

      const dataset = await this.datasetRecordService.findById(datasetId);

      if (!dataset) {
        this.logger.error(`Dataset not found: ${datasetId}`);
        throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
      }

      const tokenURI = this.mintDatasetService.getTokenURI(dataset);

      this.logger.log(`Token URI retrieved for dataset: ${datasetId}`);

      return {
        success: true,
        datasetId,
        tokenURI,
      };
    } catch (error) {
      this.logger.error(`Get token URI error: ${(error as Error).message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        (error as Error).message || 'Failed to retrieve token URI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dataset/token/:tokenId')
  @ApiOperation({ summary: 'Get dataset by token ID' })
  @ApiParam({ name: 'tokenId', description: 'NFT Token ID' })
  @ApiResponse({ status: 200, description: 'Dataset retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Dataset not found' })
  async getDatasetByTokenId(@Param('tokenId') tokenId: string) {
    try {
      const dataset = await this.datasetRecordService.findByTokenId(
        parseInt(tokenId),
      );

      if (!dataset) {
        throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: {
          id: dataset.id,
          name: dataset.name,
          owner: dataset.owner,
          tokenId: dataset.tokenId,
          status: dataset.status,
          hash: dataset.hash,
          cid: dataset.cid,
          ipfsUrl: dataset.ipfsUrl,
          createdAt: dataset.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(
        `Get dataset by token ID error: ${(error as Error).message}`,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        (error as Error).message || 'Failed to retrieve dataset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dataset/:datasetId')
  @ApiOperation({ summary: 'Get dataset details' })
  @ApiParam({ name: 'datasetId', description: 'Dataset ID' })
  @ApiResponse({ status: 200, description: 'Dataset retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Dataset not found' })
  async getDataset(@Param('datasetId') datasetId: string) {
    try {
      this.logger.log(`Getting dataset details: ${datasetId}`);

      const dataset = await this.datasetRecordService.findById(datasetId);

      if (!dataset) {
        this.logger.error(`Dataset not found: ${datasetId}`);
        throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(
        `Dataset found: ${dataset.id}, status: ${dataset.status}`,
      );

      return {
        success: true,
        data: {
          id: dataset.id,
          name: dataset.name,
          owner: dataset.owner,
          status: dataset.status,
          hash: dataset.hash,
          cid: dataset.cid,
          ipfsUrl: dataset.ipfsUrl,
          tokenId: dataset.tokenId,
          createdAt: dataset.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(
        `Get dataset error: ${(error as Error).message}`, 
        error,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        (error as Error).message || 'Failed to retrieve dataset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('datasets')
  @ApiOperation({ summary: 'Get all datasets' })
  @ApiResponse({ status: 200, description: 'Datasets retrieved successfully' })
  async getAllDatasets() {
    try {
      this.logger.log('Getting all datasets');

      const datasets = await this.datasetRecordService.findAll();

      return {
        success: true,
        count: datasets.length,
        data: datasets.map((dataset) => ({
          id: dataset.id,
          name: dataset.name,
          owner: dataset.owner,
          status: dataset.status,
          hash: dataset.hash,
          cid: dataset.cid,
          ipfsUrl: dataset.ipfsUrl,
          tokenId: dataset.tokenId,
          createdAt: dataset.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error(`Get all datasets error: ${(error as Error).message}`);
      throw new HttpException(
        (error as Error).message || 'Failed to retrieve datasets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
