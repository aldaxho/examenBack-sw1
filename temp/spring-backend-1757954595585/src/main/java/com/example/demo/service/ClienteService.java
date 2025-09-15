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
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: dto.setName(entity.getName());
        return dto;
    }

    // Convertir DTO a Entity
    private Cliente convertToEntity(ClienteDTO dto) {
        Cliente entity = new Cliente();
        entity.setId(dto.getId());
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Cliente entity, ClienteDTO dto) {
        // TODO: Actualizar todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Cliente entity, ClienteDTO dto) {
        // TODO: Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        // Ejemplo: if (dto.getName() != null) { entity.setName(dto.getName()); }
        // Agregar más campos según sea necesario
    }
}