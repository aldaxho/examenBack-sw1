
package com.example.demo.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.services.ClaseIntermediaService;
import java.util.List;

@RestController
@RequestMapping("/api/claseintermedia")
public class ClaseIntermediaController {

    @Autowired
    private ClaseIntermediaService service;

    @GetMapping
    public List<ClaseIntermedia> getAll() {
        return service.findAll();
    }

    // Otros endpoints según sea necesario
}
