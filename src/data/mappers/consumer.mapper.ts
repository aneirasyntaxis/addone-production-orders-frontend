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
    };
  }

  static toDomain(dto: ConsumerDto): Consumer {
    return {
      docEntry: dto.docEntry,
      docDate: dto.docDate,
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
      BaseLine: line.baseLine,
      BaseEntry: line.baseEntry,
      Quantity: line.quantity,
    };
  }

  static toDto(consumer: CreateConsumer): CreateConsumerDto {
    return {
      DocDate: consumer.docDate,
      Comments: consumer.comments,
      JournalMemo: consumer.journalMemo,
      DocumentLines: consumer.documentLines.map((line) => this.lineToDto(line)),
    };
  }
}
