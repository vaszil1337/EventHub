package hu.eventhub.infrastructure.persistence.jpa;

import hu.eventhub.domain.model.User;
import hu.eventhub.domain.model.UserId;
import hu.eventhub.domain.model.UserRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class JpaUserRepositoryAdapter implements UserRepository {

    private final UserSpringDataRepository springDataRepository;

    public JpaUserRepositoryAdapter(UserSpringDataRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Optional<User> findById(UserId id) {
        return springDataRepository.findById(id.value())
                .map(UserPersistenceMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        if (email == null) {
            return Optional.empty();
        }
        return springDataRepository.findByEmailIgnoreCase(email.trim())
                .map(UserPersistenceMapper::toDomain);
    }

    @Override
    public User save(User user) {
        UserJpaEntity saved = springDataRepository.save(UserPersistenceMapper.toJpaEntity(user));
        return UserPersistenceMapper.toDomain(saved);
    }

    @Override
    public List<User> findAll() {
        return springDataRepository.findAll().stream()
                .map(UserPersistenceMapper::toDomain)
                .toList();
    }
}
