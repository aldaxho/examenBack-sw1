
package com.example.demo.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.repositories.ClaseIntermediaRepository;
import java.util.List;

@Service
public class ClaseIntermediaService {
    @Autowired
    private ClaseIntermediaRepository repository;

    public List<ClaseIntermedia> findAll() {
        return repository.findAll();
    }

    // Otros métodos según sea necesario
}
