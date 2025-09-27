package com.example.demo.repository;

import com.example.demo.model.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Persona e WHERE e.id = :id")
    Optional<Persona> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Persona e ORDER BY e.id ASC")
    List<Persona> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Persona e")
    Long countAll();
}