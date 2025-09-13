package com.example.demo.repository;

import com.example.demo.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Customer e WHERE e.id = :id")
    Optional<Customer> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Customer e ORDER BY e.id ASC")
    List<Customer> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Customer e")
    Long countAll();
}