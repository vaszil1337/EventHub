package hu.eventhub.infrastructure.persistence.jpa;

import hu.eventhub.domain.model.User;
import hu.eventhub.domain.model.UserId;
import hu.eventhub.domain.model.UserRole;

public final class UserPersistenceMapper {

    private UserPersistenceMapper() {}

    public static UserJpaEntity toJpaEntity(User user) {
        return new UserJpaEntity(
                user.getId().value(),
                user.getFullName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }

    public static User toDomain(UserJpaEntity entity) {
        return new User(
                UserId.of(entity.getId()),
                entity.getFullName(),
                entity.getEmail(),
                entity.getPasswordHash(),
                UserRole.fromHeader(entity.getRole()),
                entity.getCreatedAt()
        );
    }
}
