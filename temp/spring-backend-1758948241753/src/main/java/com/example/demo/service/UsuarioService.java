package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Usuario;
import com.example.demo.dto.UsuarioDTO;
import com.example.demo.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<UsuarioDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<UsuarioDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public UsuarioDTO create(UsuarioDTO usuarioDTO) {
        Usuario entity = convertToEntity(usuarioDTO);
        entity.setId(null); // Asegurar que es una creación
        Usuario savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public UsuarioDTO update(Long id, UsuarioDTO usuarioDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, usuarioDTO);
                    Usuario updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Usuario not found with id: " + id));
    }

    // Actualización parcial
    public UsuarioDTO partialUpdate(Long id, UsuarioDTO usuarioDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, usuarioDTO);
                    Usuario updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Usuario not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Usuario not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private UsuarioDTO convertToDTO(Usuario entity) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(entity.getId());
        
        // Mapear todos los campos específicos de la entidad
                dto.setNombre(entity.getNombre());
        dto.setEmail(entity.getEmail());
        dto.setTelefono(entity.getTelefono());
        dto.setActivo(entity.getActivo());

        
        return dto;
    }

    // Convertir DTO a Entity
    private Usuario convertToEntity(UsuarioDTO dto) {
        Usuario entity = new Usuario();
        entity.setId(dto.getId());
        
        // Mapear todos los campos específicos del DTO
                entity.setNombre(dto.getNombre());
        entity.setEmail(dto.getEmail());
        entity.setTelefono(dto.getTelefono());
        entity.setActivo(dto.getActivo());

        
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Usuario entity, UsuarioDTO dto) {
        // Actualizar todos los campos específicos de la entidad
                entity.setNombre(dto.getNombre());
        entity.setEmail(dto.getEmail());
        entity.setTelefono(dto.getTelefono());
        entity.setActivo(dto.getActivo());

    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Usuario entity, UsuarioDTO dto) {
        // Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        // Actualizar campos específicos solo si no son nulos
                if (dto.getNombre() != null) {
            entity.setNombre(dto.getNombre());
        }
        if (dto.getEmail() != null) {
            entity.setEmail(dto.getEmail());
        }
        if (dto.getTelefono() != null) {
            entity.setTelefono(dto.getTelefono());
        }
        if (dto.getActivo() != null) {
            entity.setActivo(dto.getActivo());
        }

    }
}