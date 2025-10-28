package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Cliente;
import com.example.demo.dto.ClienteDTO;
import com.example.demo.repository.ClienteRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClienteService {
    
    @Autowired
    private ClienteRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<ClienteDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<ClienteDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public ClienteDTO create(ClienteDTO clienteDTO) {
        Cliente entity = convertToEntity(clienteDTO);
        entity.setId(null); // Asegurar que es una creación
        Cliente savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public ClienteDTO update(Long id, ClienteDTO clienteDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, clienteDTO);
                    Cliente updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Cliente not found with id: " + id));
    }

    // Actualización parcial
    public ClienteDTO partialUpdate(Long id, ClienteDTO clienteDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, clienteDTO);
                    Cliente updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Cliente not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cliente not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private ClienteDTO convertToDTO(Cliente entity) {
        ClienteDTO dto = new ClienteDTO();
        dto.setId(entity.getId());
        
        // Mapear todos los campos específicos de la entidad
                dto.setNombre(entity.getNombre());
        dto.setCorreo_electronico(entity.getCorreo_electronico());
        dto.setTelefono(entity.getTelefono());
        dto.setDireccion(entity.getDireccion());

        
        return dto;
    }

    // Convertir DTO a Entity
    private Cliente convertToEntity(ClienteDTO dto) {
        Cliente entity = new Cliente();
        entity.setId(dto.getId());
        
        // Mapear todos los campos específicos del DTO
                entity.setNombre(dto.getNombre());
        entity.setCorreo_electronico(dto.getCorreo_electronico());
        entity.setTelefono(dto.getTelefono());
        entity.setDireccion(dto.getDireccion());

        
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Cliente entity, ClienteDTO dto) {
        // Actualizar todos los campos específicos de la entidad
                entity.setNombre(dto.getNombre());
        entity.setCorreo_electronico(dto.getCorreo_electronico());
        entity.setTelefono(dto.getTelefono());
        entity.setDireccion(dto.getDireccion());

    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Cliente entity, ClienteDTO dto) {
        // Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        // Actualizar campos específicos solo si no son nulos
                if (dto.getNombre() != null) {
            entity.setNombre(dto.getNombre());
        }
        if (dto.getCorreo_electronico() != null) {
            entity.setCorreo_electronico(dto.getCorreo_electronico());
        }
        if (dto.getTelefono() != null) {
            entity.setTelefono(dto.getTelefono());
        }
        if (dto.getDireccion() != null) {
            entity.setDireccion(dto.getDireccion());
        }

    }
}