package hu.eventhub.domain.model;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(UserId id);

    Optional<User> findByEmail(String email);

    User save(User user);

    List<User> findAll();
}
