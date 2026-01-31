// Domain - Create Production Order Use Case
import { ProductionOrder, CreateProductionOrder } from '../entities/production-order.entity';
import { IProductionOrderRepository } from '../repositories/production-order.repository.interface';
import { logger } from '../../core/logging/logger';

export class CreateProductionOrderUseCase {
  constructor(private productionOrderRepository: IProductionOrderRepository) {}

  async execute(order: CreateProductionOrder): Promise<ProductionOrder> {
    logger.debug('CreateProductionOrderUseCase: Executing', { order });

    // Validation
    if (!order.itemNo || order.itemNo.trim() === '') {
      throw new Error('El código de producto es requerido');
    }

    if (!order.dueDate) {
      throw new Error('La fecha de entrega es requerida');
    }

    if (order.plannedQuantity <= 0) {
      throw new Error('La cantidad planificada debe ser mayor a 0');
    }

    if (!order.productionOrderLines || order.productionOrderLines.length === 0) {
      throw new Error('Debe agregar al menos un material');
    }

    // Validate lines
    for (const line of order.productionOrderLines) {
      // Solo validar itemNo si no es tipo texto (pit_Text)
      if (line.itemType !== 'pit_Text') {
        if (!line.itemNo || line.itemNo.trim() === '') {
          throw new Error('Todos los materiales deben tener un código de producto');
        }
      }
    }

    const result = await this.productionOrderRepository.create(order);
    
    logger.info('CreateProductionOrderUseCase: Production order created', { 
      absoluteEntry: result.absoluteEntry 
    });
    
    return result;
  }
}
