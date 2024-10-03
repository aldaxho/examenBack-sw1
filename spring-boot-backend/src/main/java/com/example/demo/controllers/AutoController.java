
package com.example.demo.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.services.AutoService;
import java.util.List;

@RestController
@RequestMapping("/api/auto")
public class AutoController {

    @Autowired
    private AutoService service;

    @GetMapping
    public List<Auto> getAll() {
        return service.findAll();
    }

    // Otros endpoints según sea necesario
}
