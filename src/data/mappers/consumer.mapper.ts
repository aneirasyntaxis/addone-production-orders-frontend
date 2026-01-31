// Data - Consumer Mapper
import {
  Consumer,
  ConsumerLine,
  CreateConsumer,
  CreateConsumerLine,
} from '../../domain/entities/consumer.entity';
import {
  ConsumerDto,
  ConsumerLineDto,
  CreateConsumerDto,
  CreateConsumerLineDto,
} from '../dtos/consumer.dto';

export class ConsumerMapper {
  static lineToDomain(dto: ConsumerLineDto): ConsumerLine {
    return {
      baseLine: dto.baseLine,
      baseEntry: dto.baseEntry,
      quantity: dto.quantity,
      lineNumber: dto.lineNum,
      itemCode: dto.itemCode ?? undefined,
      itemDescription: dto.itemDescription ?? undefined,
      warehouseCode: dto.warehouseCode ?? undefined,
      projectCode: dto.projectCode ?? undefined,
      costingCode: dto.costingCode ?? undefined,
      batchNumbers: dto.batchNumbers,
    };
  }

  static toDomain(dto: ConsumerDto): Consumer {
    return {
      docEntry: dto.docEntry,
      docDate: dto.docDate,
      docDueDate: dto.docDueDate,
      docNum: dto.docNum,
      comments: dto.comments,
      journalMemo: dto.journalMemo,
      documentLines: dto.documentLines.map((line) => this.lineToDomain(line)),
    };
  }

  static toDomainList(dtos: ConsumerDto[]): Consumer[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  static lineToDto(line: CreateConsumerLine): CreateConsumerLineDto {
    return {
      Quantity: line.quantity,
      ItemCode: line.itemCode,
      WarehouseCode: line.warehouseCode,
      ProjectCode: line.projectCode,
      CostingCode: line.costingCode,
      BaseEntry: line.baseEntry,
      BaseLine: line.baseLine,
      BaseType: line.baseType,
    };
  }

  static toDto(consumer: CreateConsumer): CreateConsumerDto {
    return {
      DocDueDate: consumer.docDueDate,
      Comments: consumer.comments,
      JournalMemo: consumer.journalMemo,
      DocumentLines: consumer.documentLines.map((line) => this.lineToDto(line)),
    };
  }
}
