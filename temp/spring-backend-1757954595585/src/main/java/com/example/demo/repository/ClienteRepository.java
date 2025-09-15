package com.example.demo.repository;

import com.example.demo.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Cliente e WHERE e.id = :id")
    Optional<Cliente> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Cliente e ORDER BY e.id ASC")
    List<Cliente> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Cliente e")
    Long countAll();
}