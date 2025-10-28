package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Pedido;
import com.example.demo.dto.PedidoDTO;
import com.example.demo.repository.PedidoRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PedidoService {
    
    @Autowired
    private PedidoRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<PedidoDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<PedidoDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public PedidoDTO create(PedidoDTO pedidoDTO) {
        Pedido entity = convertToEntity(pedidoDTO);
        entity.setId(null); // Asegurar que es una creación
        Pedido savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public PedidoDTO update(Long id, PedidoDTO pedidoDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, pedidoDTO);
                    Pedido updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Pedido not found with id: " + id));
    }

    // Actualización parcial
    public PedidoDTO partialUpdate(Long id, PedidoDTO pedidoDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, pedidoDTO);
                    Pedido updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Pedido not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Pedido not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private PedidoDTO convertToDTO(Pedido entity) {
        PedidoDTO dto = new PedidoDTO();
        dto.setId(entity.getId());
        
        // Mapear todos los campos específicos de la entidad
                dto.setFecha(entity.getFecha());
        dto.setTotal(entity.getTotal());

        
        return dto;
    }

    // Convertir DTO a Entity
    private Pedido convertToEntity(PedidoDTO dto) {
        Pedido entity = new Pedido();
        entity.setId(dto.getId());
        
        // Mapear todos los campos específicos del DTO
                entity.setFecha(dto.getFecha());
        entity.setTotal(dto.getTotal());

        
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Pedido entity, PedidoDTO dto) {
        // Actualizar todos los campos específicos de la entidad
                entity.setFecha(dto.getFecha());
        entity.setTotal(dto.getTotal());

    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Pedido entity, PedidoDTO dto) {
        // Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        // Actualizar campos específicos solo si no son nulos
                if (dto.getFecha() != null) {
            entity.setFecha(dto.getFecha());
        }
        if (dto.getTotal() != null) {
            entity.setTotal(dto.getTotal());
        }

    }
}