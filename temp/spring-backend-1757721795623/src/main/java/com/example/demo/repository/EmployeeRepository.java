package com.example.demo.repository;

import com.example.demo.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Employee e WHERE e.id = :id")
    Optional<Employee> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Employee e ORDER BY e.id ASC")
    List<Employee> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Employee e")
    Long countAll();
}