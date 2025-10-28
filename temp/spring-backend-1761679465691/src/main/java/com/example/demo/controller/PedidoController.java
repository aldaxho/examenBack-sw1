package com.example.demo.controller;

import com.example.demo.dto.PedidoDTO;
import com.example.demo.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedido")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
public class PedidoController {
    
    @Autowired
    private PedidoService service;
    
    // GET /api/pedido - Obtener todos
    @GetMapping
    public ResponseEntity<List<PedidoDTO>> getAll() {
        try {
            List<PedidoDTO> list = service.findAll();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/pedido/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<PedidoDTO> getById(@PathVariable Long id) {
        try {
            Optional<PedidoDTO> entity = service.findById(id);
            return entity.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // POST /api/pedido - Crear nuevo
    @PostMapping
    public ResponseEntity<PedidoDTO> create(@Valid @RequestBody PedidoDTO dto) {
        try {
            PedidoDTO created = service.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PUT /api/pedido/{id} - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<PedidoDTO> update(@PathVariable Long id, @Valid @RequestBody PedidoDTO dto) {
        try {
            PedidoDTO updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PATCH /api/pedido/{id} - Actualizar parcialmente
    @PatchMapping("/{id}")
    public ResponseEntity<PedidoDTO> partialUpdate(@PathVariable Long id, @RequestBody PedidoDTO dto) {
        try {
            PedidoDTO updated = service.partialUpdate(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // DELETE /api/pedido/{id} - Eliminar
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
    
    // GET /api/pedido/count - Contar registros
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