package com.example.demo.controller;

import com.example.demo.dto.DetallePedidoDTO;
import com.example.demo.service.DetallePedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/detallepedido")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
public class DetallePedidoController {
    
    @Autowired
    private DetallePedidoService service;
    
    // GET /api/detallepedido - Obtener todos
    @GetMapping
    public ResponseEntity<List<DetallePedidoDTO>> getAll() {
        try {
            List<DetallePedidoDTO> list = service.findAll();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/detallepedido/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<DetallePedidoDTO> getById(@PathVariable Long id) {
        try {
            Optional<DetallePedidoDTO> entity = service.findById(id);
            return entity.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // POST /api/detallepedido - Crear nuevo
    @PostMapping
    public ResponseEntity<DetallePedidoDTO> create(@Valid @RequestBody DetallePedidoDTO dto) {
        try {
            DetallePedidoDTO created = service.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PUT /api/detallepedido/{id} - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<DetallePedidoDTO> update(@PathVariable Long id, @Valid @RequestBody DetallePedidoDTO dto) {
        try {
            DetallePedidoDTO updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PATCH /api/detallepedido/{id} - Actualizar parcialmente
    @PatchMapping("/{id}")
    public ResponseEntity<DetallePedidoDTO> partialUpdate(@PathVariable Long id, @RequestBody DetallePedidoDTO dto) {
        try {
            DetallePedidoDTO updated = service.partialUpdate(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // DELETE /api/detallepedido/{id} - Eliminar
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
    
    // GET /api/detallepedido/count - Contar registros
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