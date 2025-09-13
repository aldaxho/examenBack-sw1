package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Transaction;
import com.example.demo.dto.TransactionDTO;
import com.example.demo.repository.TransactionRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransactionService {
    
    @Autowired
    private TransactionRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<TransactionDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<TransactionDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public TransactionDTO create(TransactionDTO transactionDTO) {
        Transaction entity = convertToEntity(transactionDTO);
        entity.setId(null); // Asegurar que es una creación
        Transaction savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public TransactionDTO update(Long id, TransactionDTO transactionDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, transactionDTO);
                    Transaction updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
    }

    // Actualización parcial
    public TransactionDTO partialUpdate(Long id, TransactionDTO transactionDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, transactionDTO);
                    Transaction updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Transaction not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private TransactionDTO convertToDTO(Transaction entity) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(entity.getId());
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: dto.setName(entity.getName());
        return dto;
    }

    // Convertir DTO a Entity
    private Transaction convertToEntity(TransactionDTO dto) {
        Transaction entity = new Transaction();
        entity.setId(dto.getId());
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Transaction entity, TransactionDTO dto) {
        // TODO: Actualizar todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Transaction entity, TransactionDTO dto) {
        // TODO: Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        // Ejemplo: if (dto.getName() != null) { entity.setName(dto.getName()); }
        // Agregar más campos según sea necesario
    }
}