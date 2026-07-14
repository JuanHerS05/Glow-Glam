package uptc.edu.swi.glowglam.service;

import uptc.edu.swi.glowglam.model.Client;
import uptc.edu.swi.glowglam.model.Role;

public interface ILoginService {
    Role login(String email, String userpass);

    Client registrarCliente(Client cliente);
}