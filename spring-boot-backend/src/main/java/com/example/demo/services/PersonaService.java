
package com.example.demo.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.repositories.PersonaRepository;
import java.util.List;

@Service
public class PersonaService {
    @Autowired
    private PersonaRepository repository;

    public List<Persona> findAll() {
        return repository.findAll();
    }

    // Otros métodos según sea necesario
}
