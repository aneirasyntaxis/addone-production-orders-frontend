// Data - Warehouse Mapper
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { WarehouseDto } from '../dtos/warehouse.dto';

export class WarehouseMapper {
  static toDomain(dto: WarehouseDto): Warehouse {
    return {
      warehouseCode: dto.warehouseCode,
    };
  }

  static toDomainList(dtos: WarehouseDto[]): Warehouse[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
