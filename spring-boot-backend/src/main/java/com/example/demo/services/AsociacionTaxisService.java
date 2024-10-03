
package com.example.demo.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.repositories.AsociacionTaxisRepository;
import java.util.List;

@Service
public class AsociacionTaxisService {
    @Autowired
    private AsociacionTaxisRepository repository;

    public List<AsociacionTaxis> findAll() {
        return repository.findAll();
    }

    // Otros métodos según sea necesario
}
