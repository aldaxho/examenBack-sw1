package com.example.demo.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

public class LibroDTO {
    
    private Long id;
    private String titulo;
    private String autor;
    private String isbn;
    private BigDecimal precio;

    // Constructores
    public LibroDTO() {}

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }
}