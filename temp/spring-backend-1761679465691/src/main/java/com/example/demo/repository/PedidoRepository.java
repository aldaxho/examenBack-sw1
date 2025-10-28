package com.example.demo.repository;

import com.example.demo.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Pedido e WHERE e.id = :id")
    Optional<Pedido> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Pedido e ORDER BY e.id ASC")
    List<Pedido> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Pedido e")
    Long countAll();
}