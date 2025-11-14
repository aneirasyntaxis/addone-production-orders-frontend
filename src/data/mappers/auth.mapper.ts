// Data - Auth Mapper
import { AuthSession, User, SapToken } from '../../domain/entities/user.entity';
import { UserLoginResponseDto, SapTokenInfoDto } from '../dtos/auth.dto';

export class AuthMapper {
  static toDomain(dto: UserLoginResponseDto): AuthSession {
    const user: User = {
      userId: dto.userId,
      username: dto.username,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : undefined,
    };

    const sapToken: SapToken | undefined = dto.sapToken
      ? {
          sessionId: dto.sapToken.sessionId,
          version: dto.sapToken.version,
          expiresAt: new Date(dto.sapToken.expiresAt),
          companyDB: dto.sapToken.companyDB,
          sessionTimeoutMinutes: dto.sapToken.sessionTimeoutMinutes,
          isActive: dto.sapToken.isActive,
        }
      : undefined;

    if (!sapToken) {
      throw new Error('SAP token is required in login response');
    }

    return {
      user,
      sapToken,
    };
  }
}
