package com.example.demo.controller;

import com.example.demo.dto.UsuarioDTO;
import com.example.demo.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuario")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
public class UsuarioController {
    
    @Autowired
    private UsuarioService service;
    
    // GET /api/usuario - Obtener todos
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> getAll() {
        try {
            List<UsuarioDTO> list = service.findAll();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/usuario/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> getById(@PathVariable Long id) {
        try {
            Optional<UsuarioDTO> entity = service.findById(id);
            return entity.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // POST /api/usuario - Crear nuevo
    @PostMapping
    public ResponseEntity<UsuarioDTO> create(@Valid @RequestBody UsuarioDTO dto) {
        try {
            UsuarioDTO created = service.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PUT /api/usuario/{id} - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> update(@PathVariable Long id, @Valid @RequestBody UsuarioDTO dto) {
        try {
            UsuarioDTO updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PATCH /api/usuario/{id} - Actualizar parcialmente
    @PatchMapping("/{id}")
    public ResponseEntity<UsuarioDTO> partialUpdate(@PathVariable Long id, @RequestBody UsuarioDTO dto) {
        try {
            UsuarioDTO updated = service.partialUpdate(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // DELETE /api/usuario/{id} - Eliminar
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
    
    // GET /api/usuario/count - Contar registros
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