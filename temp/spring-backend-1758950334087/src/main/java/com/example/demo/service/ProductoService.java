package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Producto;
import com.example.demo.dto.ProductoDTO;
import com.example.demo.repository.ProductoRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductoService {
    
    @Autowired
    private ProductoRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<ProductoDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<ProductoDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public ProductoDTO create(ProductoDTO productoDTO) {
        Producto entity = convertToEntity(productoDTO);
        entity.setId(null); // Asegurar que es una creación
        Producto savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public ProductoDTO update(Long id, ProductoDTO productoDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, productoDTO);
                    Producto updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Producto not found with id: " + id));
    }

    // Actualización parcial
    public ProductoDTO partialUpdate(Long id, ProductoDTO productoDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, productoDTO);
                    Producto updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Producto not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Producto not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private ProductoDTO convertToDTO(Producto entity) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(entity.getId());
        
        // Mapear todos los campos específicos de la entidad
                dto.setNombre(entity.getNombre());
        dto.setPrecio(entity.getPrecio());
        dto.setStock(entity.getStock());
        dto.setDescripcion(entity.getDescripcion());

        
        return dto;
    }

    // Convertir DTO a Entity
    private Producto convertToEntity(ProductoDTO dto) {
        Producto entity = new Producto();
        entity.setId(dto.getId());
        
        // Mapear todos los campos específicos del DTO
                entity.setNombre(dto.getNombre());
        entity.setPrecio(dto.getPrecio());
        entity.setStock(dto.getStock());
        entity.setDescripcion(dto.getDescripcion());

        
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Producto entity, ProductoDTO dto) {
        // Actualizar todos los campos específicos de la entidad
                entity.setNombre(dto.getNombre());
        entity.setPrecio(dto.getPrecio());
        entity.setStock(dto.getStock());
        entity.setDescripcion(dto.getDescripcion());

    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Producto entity, ProductoDTO dto) {
        // Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        // Actualizar campos específicos solo si no son nulos
                if (dto.getNombre() != null) {
            entity.setNombre(dto.getNombre());
        }
        if (dto.getPrecio() != null) {
            entity.setPrecio(dto.getPrecio());
        }
        if (dto.getStock() != null) {
            entity.setStock(dto.getStock());
        }
        if (dto.getDescripcion() != null) {
            entity.setDescripcion(dto.getDescripcion());
        }

    }
}