package com.example.demo.repository;

import com.example.demo.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM DetallePedido e WHERE e.id = :id")
    Optional<DetallePedido> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM DetallePedido e ORDER BY e.id ASC")
    List<DetallePedido> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM DetallePedido e")
    Long countAll();
}