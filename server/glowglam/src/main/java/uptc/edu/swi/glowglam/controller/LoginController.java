package uptc.edu.swi.glowglam.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import uptc.edu.swi.glowglam.model.Role;
import uptc.edu.swi.glowglam.model.Client;
import uptc.edu.swi.glowglam.service.ILoginService; 

@RestController
@RequestMapping("/api/auth") // Todas las rutas empezarán con /api/auth
public class LoginController {

    private final ILoginService loginService;

    public LoginController(ILoginService loginService) {
        this.loginService = loginService;
    }

    // POST: http://localhost:8080/api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        System.out.println("Intento de login con: " + loginRequest.getEmail());

        Role user = loginService.login(loginRequest.getEmail(), loginRequest.getUserpass());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas.");
        }

        // Guardamos el usuario completo en la sesión
        session.setAttribute("usuarioLogueado", user);

        // Devolvemos el objeto usuario (que contiene su rol) para que Vite decida a dónde redirigir en el Front
        return ResponseEntity.ok(user);
    }

    // POST: http://localhost:8080/api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> registrarCliente(@RequestBody RegisterRequest registerRequest) {
        
        Client nuevoCliente = new Client(
            registerRequest.getEmail(), 
            registerRequest.getUserpass(), 
            registerRequest.getName()
        );
        
        Client clienteGuardado = loginService.registrarCliente(nuevoCliente);

        if (clienteGuardado == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El correo electrónico ya se encuentra registrado.");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(clienteGuardado);
    }

    // POST o GET: http://localhost:8080/api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate(); 
        return ResponseEntity.ok("Sesión cerrada correctamente.");
    }

    // --- clases DTO para mapear las peticiones JSON del Frontend ---
    public static class LoginRequest {
        private String email;
        private String userpass;

        // Getters y Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getUserpass() { return userpass; }
        public void setUserpass(String userpass) { this.userpass = userpass; }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String userpass;

        // Getters y Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getUserpass() { return userpass; }
        public void setUserpass(String userpass) { this.userpass = userpass; }
    }
}