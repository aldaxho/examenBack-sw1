
package com.example.demo.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.repositories.AutoRepository;
import java.util.List;

@Service
public class AutoService {
    @Autowired
    private AutoRepository repository;

    public List<Auto> findAll() {
        return repository.findAll();
    }

    // Otros métodos según sea necesario
}
