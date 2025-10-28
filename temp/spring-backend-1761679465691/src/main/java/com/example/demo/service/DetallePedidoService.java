package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.DetallePedido;
import com.example.demo.dto.DetallePedidoDTO;
import com.example.demo.repository.DetallePedidoRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DetallePedidoService {
    
    @Autowired
    private DetallePedidoRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<DetallePedidoDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<DetallePedidoDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public DetallePedidoDTO create(DetallePedidoDTO detallepedidoDTO) {
        DetallePedido entity = convertToEntity(detallepedidoDTO);
        entity.setId(null); // Asegurar que es una creación
        DetallePedido savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public DetallePedidoDTO update(Long id, DetallePedidoDTO detallepedidoDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, detallepedidoDTO);
                    DetallePedido updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("DetallePedido not found with id: " + id));
    }

    // Actualización parcial
    public DetallePedidoDTO partialUpdate(Long id, DetallePedidoDTO detallepedidoDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, detallepedidoDTO);
                    DetallePedido updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("DetallePedido not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("DetallePedido not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private DetallePedidoDTO convertToDTO(DetallePedido entity) {
        DetallePedidoDTO dto = new DetallePedidoDTO();
        dto.setId(entity.getId());
        
        // Mapear todos los campos específicos de la entidad
                dto.setCantidad(entity.getCantidad());
        dto.setPrecio_unitario(entity.getPrecio_unitario());

        
        return dto;
    }

    // Convertir DTO a Entity
    private DetallePedido convertToEntity(DetallePedidoDTO dto) {
        DetallePedido entity = new DetallePedido();
        entity.setId(dto.getId());
        
        // Mapear todos los campos específicos del DTO
                entity.setCantidad(dto.getCantidad());
        entity.setPrecio_unitario(dto.getPrecio_unitario());

        
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(DetallePedido entity, DetallePedidoDTO dto) {
        // Actualizar todos los campos específicos de la entidad
                entity.setCantidad(dto.getCantidad());
        entity.setPrecio_unitario(dto.getPrecio_unitario());

    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(DetallePedido entity, DetallePedidoDTO dto) {
        // Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        // Actualizar campos específicos solo si no son nulos
                if (dto.getCantidad() != null) {
            entity.setCantidad(dto.getCantidad());
        }
        if (dto.getPrecio_unitario() != null) {
            entity.setPrecio_unitario(dto.getPrecio_unitario());
        }

    }
}