package com.example.demo.repository;

import com.example.demo.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Branch e WHERE e.id = :id")
    Optional<Branch> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Branch e ORDER BY e.id ASC")
    List<Branch> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Branch e")
    Long countAll();
}