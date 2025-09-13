package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Branch;
import com.example.demo.dto.BranchDTO;
import com.example.demo.repository.BranchRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BranchService {
    
    @Autowired
    private BranchRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<BranchDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<BranchDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public BranchDTO create(BranchDTO branchDTO) {
        Branch entity = convertToEntity(branchDTO);
        entity.setId(null); // Asegurar que es una creación
        Branch savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public BranchDTO update(Long id, BranchDTO branchDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, branchDTO);
                    Branch updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
    }

    // Actualización parcial
    public BranchDTO partialUpdate(Long id, BranchDTO branchDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, branchDTO);
                    Branch updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Branch not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private BranchDTO convertToDTO(Branch entity) {
        BranchDTO dto = new BranchDTO();
        dto.setId(entity.getId());
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: dto.setName(entity.getName());
        return dto;
    }

    // Convertir DTO a Entity
    private Branch convertToEntity(BranchDTO dto) {
        Branch entity = new Branch();
        entity.setId(dto.getId());
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Branch entity, BranchDTO dto) {
        // TODO: Actualizar todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Branch entity, BranchDTO dto) {
        // TODO: Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        // Ejemplo: if (dto.getName() != null) { entity.setName(dto.getName()); }
        // Agregar más campos según sea necesario
    }
}