
package com.example.demo.persona.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.persona.model.persona;
import com.example.demo.persona.service.personaService;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/persona")
public class personaController {

    @Autowired
    private personaService service;

    @GetMapping
    public List<persona> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public persona getById(@PathVariable Long id) {
        return service.findById(id).orElse(null);
    }

    @PostMapping
    public persona create(@RequestBody persona persona) {
        return service.save(persona);
    }

    @PutMapping("/{id}")
    public persona update(@PathVariable Long id, @RequestBody persona persona) {
        persona.setId(id);
        return service.save(persona);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteById(id);
    }
}
