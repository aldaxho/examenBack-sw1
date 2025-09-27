package com.example.demo.repository;

import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM Usuario e WHERE e.id = :id")
    Optional<Usuario> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM Usuario e ORDER BY e.id ASC")
    List<Usuario> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM Usuario e")
    Long countAll();
}