package com.example.demo.repository;

import com.example.demo.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Loan e WHERE e.id = :id")
    Optional<Loan> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Loan e ORDER BY e.id ASC")
    List<Loan> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Loan e")
    Long countAll();
}