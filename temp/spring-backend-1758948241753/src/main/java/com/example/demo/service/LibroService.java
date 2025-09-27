package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.Libro;
import com.example.demo.dto.LibroDTO;
import com.example.demo.repository.LibroRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LibroService {
    
    @Autowired
    private LibroRepository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<LibroDTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<LibroDTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public LibroDTO create(LibroDTO libroDTO) {
        Libro entity = convertToEntity(libroDTO);
        entity.setId(null); // Asegurar que es una creación
        Libro savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public LibroDTO update(Long id, LibroDTO libroDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, libroDTO);
                    Libro updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Libro not found with id: " + id));
    }

    // Actualización parcial
    public LibroDTO partialUpdate(Long id, LibroDTO libroDTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, libroDTO);
                    Libro updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("Libro not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Libro not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private LibroDTO convertToDTO(Libro entity) {
        LibroDTO dto = new LibroDTO();
        dto.setId(entity.getId());
        
        // Mapear todos los campos específicos de la entidad
                dto.setTitulo(entity.getTitulo());
        dto.setAutor(entity.getAutor());
        dto.setIsbn(entity.getIsbn());
        dto.setPrecio(entity.getPrecio());

        
        return dto;
    }

    // Convertir DTO a Entity
    private Libro convertToEntity(LibroDTO dto) {
        Libro entity = new Libro();
        entity.setId(dto.getId());
        
        // Mapear todos los campos específicos del DTO
                entity.setTitulo(dto.getTitulo());
        entity.setAutor(dto.getAutor());
        entity.setIsbn(dto.getIsbn());
        entity.setPrecio(dto.getPrecio());

        
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(Libro entity, LibroDTO dto) {
        // Actualizar todos los campos específicos de la entidad
                entity.setTitulo(dto.getTitulo());
        entity.setAutor(dto.getAutor());
        entity.setIsbn(dto.getIsbn());
        entity.setPrecio(dto.getPrecio());

    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(Libro entity, LibroDTO dto) {
        // Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        // Actualizar campos específicos solo si no son nulos
                if (dto.getTitulo() != null) {
            entity.setTitulo(dto.getTitulo());
        }
        if (dto.getAutor() != null) {
            entity.setAutor(dto.getAutor());
        }
        if (dto.getIsbn() != null) {
            entity.setIsbn(dto.getIsbn());
        }
        if (dto.getPrecio() != null) {
            entity.setPrecio(dto.getPrecio());
        }

    }
}