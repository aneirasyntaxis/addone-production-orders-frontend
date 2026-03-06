// Data - Batch Mapper
import { Batch } from '../../domain/entities/batch.entity';
import { BatchDto } from '../dtos/batch.dto';

export class BatchMapper {
  static toDomain(dto: BatchDto): Batch {
    return {
      batchNum: dto.batchNum,
      itemCode: dto.itemCode,
      quantity: dto.quantity,
      whsCode: dto.whsCode,
    };
  }

  static toDomainList(dtos: BatchDto[]): Batch[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
