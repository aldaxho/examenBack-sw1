package com.example.demo.repository;

import com.example.demo.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Account e WHERE e.id = :id")
    Optional<Account> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Account e ORDER BY e.id ASC")
    List<Account> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Account e")
    Long countAll();
}