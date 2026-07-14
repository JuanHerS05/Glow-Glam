package uptc.edu.swi.glowglam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uptc.edu.swi.glowglam.model.Client;
import uptc.edu.swi.glowglam.model.Role;
import uptc.edu.swi.glowglam.repository.UserRepository;

@Service
public class LoginServiceImpl implements ILoginService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Role login(String email, String userpass) {
        System.out.println("Intentando Login para Email: [" + email + "]");

        // Validaciones básicas de negocio
        if (email == null || userpass == null || email.trim().isEmpty() || userpass.trim().isEmpty()) {
            System.out.println("Datos de inicio de sesión vacíos o nulos.");
            return null;
        }

        // Buscamos en el repositorio. Si existe, JPA nos retornará automáticamente
        // la instancia polimórfica correcta (ya sea Admin o Client) gracias a la
        // herencia anotada.
        return userRepository.findByEmailAndUserpass(email.trim(), userpass.trim())
                .map(user -> {
                    System.out.println("Usuario encontrado con éxito. Rol detectado: " + user.getRole());
                    return user;
                })
                .orElseGet(() -> {
                    System.out.println("No se encontró ningún usuario con las credenciales proporcionadas.");
                    return null;
                });
    }

    @Override
    @Transactional
    public Client registrarCliente(Client cliente) {
        System.out.println("Registrando cliente polimórficamente con Email: [" + cliente.getEmail() + "]");

        // 1. Validar que no sea nulo o vacío
        if (cliente.getEmail() == null || cliente.getEmail().trim().isEmpty()) {
            System.out.println("Error: El correo electrónico está vacío.");
            return null;
        }

        if (!isValidEmail(cliente.getEmail().trim())) {
            System.out.println("Error: El formato del correo electrónico no es válido.");
            return null; // Retorna null para que el controlador lo redirija como error
        }

        // Validamos si el email ya existe buscando en la tabla padre 'roles'
        if (isDuplicatedEmail(cliente)) {
            System.out.println("Error: El correo ya se encuentra registrado en el sistema.");
            return null;
        }

        // Limpieza de datos por seguridad
        cliente.setEmail(cliente.getEmail().trim());
        cliente.setUserpass(cliente.getUserpass().trim());
        cliente.setName(cliente.getName().trim());

        // Asignamos el rol correspondiente
        cliente.setRole(uptc.edu.swi.glowglam.model.Enums.RoleEnum.CUSTOMER);

        return userRepository.save(cliente);
    }

    private boolean isDuplicatedEmail(Client cliente) {

        return userRepository.findByEmail(cliente.getEmail().trim()).isPresent();
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
        return email != null && email.trim().matches(emailRegex);
    }

}
