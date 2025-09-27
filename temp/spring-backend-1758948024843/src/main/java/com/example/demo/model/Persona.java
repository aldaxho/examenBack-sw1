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
@Table(name = "persona")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Persona {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre")
    private String nombre;
    @Column(name = "edad")
    private Integer edad;
    @Column(name = "email")
    private String email;
    @Column(name = "activo")
    private Boolean activo;

    // Constructores
    public Persona() {}

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}