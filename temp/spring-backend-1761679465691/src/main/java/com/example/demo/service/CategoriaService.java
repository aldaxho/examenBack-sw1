package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Categoria;
import com.example.demo.dto.CategoriaDTO;
import com.example.demo.repository.CategoriaRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoriaService {
    
    @Autowired
    private CategoriaRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<CategoriaDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<CategoriaDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public CategoriaDTO create(CategoriaDTO categoriaDTO) {
        Categoria entity = convertToEntity(categoriaDTO);
        entity.setId(null); // Asegurar que es una creación
        Categoria savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public CategoriaDTO update(Long id, CategoriaDTO categoriaDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, categoriaDTO);
                    Categoria updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Categoria not found with id: " + id));
    }

    // Actualización parcial
    public CategoriaDTO partialUpdate(Long id, CategoriaDTO categoriaDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, categoriaDTO);
                    Categoria updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Categoria not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Categoria not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private CategoriaDTO convertToDTO(Categoria entity) {
        CategoriaDTO dto = new CategoriaDTO();
        dto.setId(entity.getId());
        
        // Mapear todos los campos específicos de la entidad
                dto.setNombre(entity.getNombre());

        
        return dto;
    }

    // Convertir DTO a Entity
    private Categoria convertToEntity(CategoriaDTO dto) {
        Categoria entity = new Categoria();
        entity.setId(dto.getId());
        
        // Mapear todos los campos específicos del DTO
                entity.setNombre(dto.getNombre());

        
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Categoria entity, CategoriaDTO dto) {
        // Actualizar todos los campos específicos de la entidad
                entity.setNombre(dto.getNombre());

    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Categoria entity, CategoriaDTO dto) {
        // Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        // Actualizar campos específicos solo si no son nulos
                if (dto.getNombre() != null) {
            entity.setNombre(dto.getNombre());
        }

    }
}