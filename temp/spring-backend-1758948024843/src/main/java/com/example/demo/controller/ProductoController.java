package com.example.demo.controller;

import com.example.demo.dto.ProductoDTO;
import com.example.demo.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/producto")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
public class ProductoController {
    
    @Autowired
    private ProductoService service;
    
    // GET /api/producto - Obtener todos
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> getAll() {
        try {
            List<ProductoDTO> list = service.findAll();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/producto/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> getById(@PathVariable Long id) {
        try {
            Optional<ProductoDTO> entity = service.findById(id);
            return entity.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // POST /api/producto - Crear nuevo
    @PostMapping
    public ResponseEntity<ProductoDTO> create(@Valid @RequestBody ProductoDTO dto) {
        try {
            ProductoDTO created = service.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PUT /api/producto/{id} - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> update(@PathVariable Long id, @Valid @RequestBody ProductoDTO dto) {
        try {
            ProductoDTO updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PATCH /api/producto/{id} - Actualizar parcialmente
    @PatchMapping("/{id}")
    public ResponseEntity<ProductoDTO> partialUpdate(@PathVariable Long id, @RequestBody ProductoDTO dto) {
        try {
            ProductoDTO updated = service.partialUpdate(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // DELETE /api/producto/{id} - Eliminar
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
    
    // GET /api/producto/count - Contar registros
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