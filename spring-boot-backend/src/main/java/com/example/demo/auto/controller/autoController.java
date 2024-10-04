
package com.example.demo.auto.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.auto.model.auto;
import com.example.demo.auto.service.autoService;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auto")
public class autoController {

    @Autowired
    private autoService service;

    @GetMapping
    public List<auto> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public auto getById(@PathVariable Long id) {
        return service.findById(id).orElse(null);
    }

    @PostMapping
    public auto create(@RequestBody auto auto) {
        return service.save(auto);
    }

    @PutMapping("/{id}")
    public auto update(@PathVariable Long id, @RequestBody auto auto) {
        auto.setId(id);
        return service.save(auto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteById(id);
    }
}
