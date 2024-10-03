
package com.example.demo.models;

import javax.persistence.*;

@Entity
public class AsociacionTaxis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Agregar atributos según tu diagrama

    public AsociacionTaxis() {}
    // Getters y Setters
}
