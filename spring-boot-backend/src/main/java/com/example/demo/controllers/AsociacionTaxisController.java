
package com.example.demo.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.services.AsociacionTaxisService;
import java.util.List;

@RestController
@RequestMapping("/api/asociaciontaxis")
public class AsociacionTaxisController {

    @Autowired
    private AsociacionTaxisService service;

    @GetMapping
    public List<AsociacionTaxis> getAll() {
        return service.findAll();
    }

    // Otros endpoints según sea necesario
}
