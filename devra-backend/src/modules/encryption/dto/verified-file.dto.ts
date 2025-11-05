import { ApiProperty } from '@nestjs/swagger';

class IssueDto {
  @ApiProperty({ description: 'Type of issue found during verification' })
  type: string;

  @ApiProperty({ description: 'Detailed message describing the issue' })
  message: string;
}

export class VerifyResultDto {
  @ApiProperty({
    description: 'Verification scores for each evaluation category',
  })
  scores?: Record<string, number>;

  @ApiProperty({
    description: 'List of issues detected during verification',
    type: [IssueDto],
  })
  issues?: IssueDto[];

  @ApiProperty({
    description: 'Overall verification status',
  })
  status?: string;

  @ApiProperty({ 
    description: 'Indicates if the dataset passed verification checks',
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Optional error message if verification fails',
    required: false,
  })
  error?: string;
}
