package com.example.demo.repository;

import com.example.demo.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Producto e WHERE e.id = :id")
    Optional<Producto> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Producto e ORDER BY e.id ASC")
    List<Producto> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Producto e")
    Long countAll();
}