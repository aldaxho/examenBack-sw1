
package com.example.demo.models;

import javax.persistence.*;

@Entity
public class Auto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Agregar atributos según tu diagrama

    public Auto() {}
    // Getters y Setters
}
