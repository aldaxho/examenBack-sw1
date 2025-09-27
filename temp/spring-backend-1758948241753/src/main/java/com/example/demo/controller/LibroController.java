package com.example.demo.controller;

import com.example.demo.dto.LibroDTO;
import com.example.demo.service.LibroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/libro")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
public class LibroController {
    
    @Autowired
    private LibroService service;
    
    // GET /api/libro - Obtener todos
    @GetMapping
    public ResponseEntity<List<LibroDTO>> getAll() {
        try {
            List<LibroDTO> list = service.findAll();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/libro/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<LibroDTO> getById(@PathVariable Long id) {
        try {
            Optional<LibroDTO> entity = service.findById(id);
            return entity.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // POST /api/libro - Crear nuevo
    @PostMapping
    public ResponseEntity<LibroDTO> create(@Valid @RequestBody LibroDTO dto) {
        try {
            LibroDTO created = service.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PUT /api/libro/{id} - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<LibroDTO> update(@PathVariable Long id, @Valid @RequestBody LibroDTO dto) {
        try {
            LibroDTO updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PATCH /api/libro/{id} - Actualizar parcialmente
    @PatchMapping("/{id}")
    public ResponseEntity<LibroDTO> partialUpdate(@PathVariable Long id, @RequestBody LibroDTO dto) {
        try {
            LibroDTO updated = service.partialUpdate(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // DELETE /api/libro/{id} - Eliminar
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
    
    // GET /api/libro/count - Contar registros
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