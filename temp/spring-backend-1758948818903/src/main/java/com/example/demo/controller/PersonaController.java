package com.example.demo.controller;

import com.example.demo.dto.PersonaDTO;
import com.example.demo.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/persona")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
public class PersonaController {
    
    @Autowired
    private PersonaService service;
    
    // GET /api/persona - Obtener todos
    @GetMapping
    public ResponseEntity<List<PersonaDTO>> getAll() {
        try {
            List<PersonaDTO> list = service.findAll();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/persona/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<PersonaDTO> getById(@PathVariable Long id) {
        try {
            Optional<PersonaDTO> entity = service.findById(id);
            return entity.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // POST /api/persona - Crear nuevo
    @PostMapping
    public ResponseEntity<PersonaDTO> create(@Valid @RequestBody PersonaDTO dto) {
        try {
            PersonaDTO created = service.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PUT /api/persona/{id} - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<PersonaDTO> update(@PathVariable Long id, @Valid @RequestBody PersonaDTO dto) {
        try {
            PersonaDTO updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PATCH /api/persona/{id} - Actualizar parcialmente
    @PatchMapping("/{id}")
    public ResponseEntity<PersonaDTO> partialUpdate(@PathVariable Long id, @RequestBody PersonaDTO dto) {
        try {
            PersonaDTO updated = service.partialUpdate(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // DELETE /api/persona/{id} - Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/persona/count - Contar registros
    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        try {
            Long count = service.count();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}