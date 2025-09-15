package com.example.demo.repository;

import com.example.demo.model.Cuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CuentaRepository extends JpaRepository<Cuenta, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Cuenta e WHERE e.id = :id")
    Optional<Cuenta> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Cuenta e ORDER BY e.id ASC")
    List<Cuenta> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Cuenta e")
    Long countAll();
}