package com.example.demo.repository;

import com.example.demo.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Categoria e WHERE e.id = :id")
    Optional<Categoria> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Categoria e ORDER BY e.id ASC")
    List<Categoria> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Categoria e")
    Long countAll();
}