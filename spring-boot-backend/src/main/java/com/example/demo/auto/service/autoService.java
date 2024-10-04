
package com.example.demo.auto.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.auto.model.auto;
import com.example.demo.auto.repository.autoRepository;
import java.util.List;
import java.util.Optional;

@Service
public class autoService {
    @Autowired
    private autoRepository repository;

    public List<auto> findAll() {
        return repository.findAll();
    }

    public Optional<auto> findById(Long id) {
        return repository.findById(id);
    }

    public auto save(auto auto) {
        return repository.save(auto);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
