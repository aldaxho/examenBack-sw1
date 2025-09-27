package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "libro")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Libro {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "titulo")
    private String titulo;
    @Column(name = "autor")
    private String autor;
    @Column(name = "isbn")
    private String isbn;
    @Column(name = "precio")
    private BigDecimal precio;

    // Constructores
    public Libro() {}

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}