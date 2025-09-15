package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Cuenta;
import com.example.demo.dto.CuentaDTO;
import com.example.demo.repository.CuentaRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CuentaService {
    
    @Autowired
    private CuentaRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<CuentaDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<CuentaDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public CuentaDTO create(CuentaDTO cuentaDTO) {
        Cuenta entity = convertToEntity(cuentaDTO);
        entity.setId(null); // Asegurar que es una creación
        Cuenta savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public CuentaDTO update(Long id, CuentaDTO cuentaDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, cuentaDTO);
                    Cuenta updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Cuenta not found with id: " + id));
    }

    // Actualización parcial
    public CuentaDTO partialUpdate(Long id, CuentaDTO cuentaDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, cuentaDTO);
                    Cuenta updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Cuenta not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cuenta not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private CuentaDTO convertToDTO(Cuenta entity) {
        CuentaDTO dto = new CuentaDTO();
        dto.setId(entity.getId());
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: dto.setName(entity.getName());
        return dto;
    }

    // Convertir DTO a Entity
    private Cuenta convertToEntity(CuentaDTO dto) {
        Cuenta entity = new Cuenta();
        entity.setId(dto.getId());
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Cuenta entity, CuentaDTO dto) {
        // TODO: Actualizar todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Cuenta entity, CuentaDTO dto) {
        // TODO: Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        // Ejemplo: if (dto.getName() != null) { entity.setName(dto.getName()); }
        // Agregar más campos según sea necesario
    }
}