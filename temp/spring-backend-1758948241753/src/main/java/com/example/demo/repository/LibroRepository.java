package com.example.demo.repository;

import com.example.demo.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LibroRepository extends JpaRepository<Libro, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Libro e WHERE e.id = :id")
    Optional<Libro> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Libro e ORDER BY e.id ASC")
    List<Libro> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Libro e")
    Long countAll();
}