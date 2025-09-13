package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Loan;
import com.example.demo.dto.LoanDTO;
import com.example.demo.repository.LoanRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LoanService {
    
    @Autowired
    private LoanRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<LoanDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<LoanDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public LoanDTO create(LoanDTO loanDTO) {
        Loan entity = convertToEntity(loanDTO);
        entity.setId(null); // Asegurar que es una creación
        Loan savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public LoanDTO update(Long id, LoanDTO loanDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, loanDTO);
                    Loan updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));
    }

    // Actualización parcial
    public LoanDTO partialUpdate(Long id, LoanDTO loanDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, loanDTO);
                    Loan updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Loan not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private LoanDTO convertToDTO(Loan entity) {
        LoanDTO dto = new LoanDTO();
        dto.setId(entity.getId());
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: dto.setName(entity.getName());
        return dto;
    }

    // Convertir DTO a Entity
    private Loan convertToEntity(LoanDTO dto) {
        Loan entity = new Loan();
        entity.setId(dto.getId());
        // TODO: Mapear todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Loan entity, LoanDTO dto) {
        // TODO: Actualizar todos los campos específicos de la entidad
        // Ejemplo: entity.setName(dto.getName());
    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Loan entity, LoanDTO dto) {
        // TODO: Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        // Ejemplo: if (dto.getName() != null) { entity.setName(dto.getName()); }
        // Agregar más campos según sea necesario
    }
}