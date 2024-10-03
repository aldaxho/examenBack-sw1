
package com.example.demo.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.services.PersonaService;
import java.util.List;

@RestController
@RequestMapping("/api/persona")
public class PersonaController {

    @Autowired
    private PersonaService service;

    @GetMapping
    public List<Persona> getAll() {
        return service.findAll();
    }

    // Otros endpoints según sea necesario
}
