
package com.example.demo.persona.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.persona.model.persona;
import com.example.demo.persona.repository.personaRepository;
import java.util.List;
import java.util.Optional;

@Service
public class personaService {
    @Autowired
    private personaRepository repository;

    public List<persona> findAll() {
        return repository.findAll();
    }

    public Optional<persona> findById(Long id) {
        return repository.findById(id);
    }

    public persona save(persona persona) {
        return repository.save(persona);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
