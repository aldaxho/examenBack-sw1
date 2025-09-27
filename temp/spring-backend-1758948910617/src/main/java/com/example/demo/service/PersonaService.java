package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Persona;
import com.example.demo.dto.PersonaDTO;
import com.example.demo.repository.PersonaRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PersonaService {
    
    @Autowired
    private PersonaRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<PersonaDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<PersonaDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public PersonaDTO create(PersonaDTO personaDTO) {
        Persona entity = convertToEntity(personaDTO);
        entity.setId(null); // Asegurar que es una creación
        Persona savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public PersonaDTO update(Long id, PersonaDTO personaDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, personaDTO);
                    Persona updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Persona not found with id: " + id));
    }

    // Actualización parcial
    public PersonaDTO partialUpdate(Long id, PersonaDTO personaDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, personaDTO);
                    Persona updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Persona not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Persona not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private PersonaDTO convertToDTO(Persona entity) {
        PersonaDTO dto = new PersonaDTO();
        dto.setId(entity.getId());
        
        // Mapear todos los campos específicos de la entidad
                dto.setNombre(entity.getNombre());
        dto.setApellido(entity.getApellido());

        
        return dto;
    }

    // Convertir DTO a Entity
    private Persona convertToEntity(PersonaDTO dto) {
        Persona entity = new Persona();
        entity.setId(dto.getId());
        
        // Mapear todos los campos específicos del DTO
                entity.setNombre(dto.getNombre());
        entity.setApellido(dto.getApellido());

        
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Persona entity, PersonaDTO dto) {
        // Actualizar todos los campos específicos de la entidad
                entity.setNombre(dto.getNombre());
        entity.setApellido(dto.getApellido());

    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Persona entity, PersonaDTO dto) {
        // Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        // Actualizar campos específicos solo si no son nulos
                if (dto.getNombre() != null) {
            entity.setNombre(dto.getNombre());
        }
        if (dto.getApellido() != null) {
            entity.setApellido(dto.getApellido());
        }

    }
}