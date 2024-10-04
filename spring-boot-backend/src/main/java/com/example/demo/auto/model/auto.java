
package com.example.demo.auto.model;

import javax.persistence.*;
import java.util.*;

@Entity

public class auto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_class-1728027739389;
    private String placa;
    private String modelo;

    // Relaciones
    

    public auto() {}

    
    public String getId_class-1728027739389() {
        return id_class-1728027739389;
    }

    public void setId_class-1728027739389(String id_class-1728027739389) {
        this.id_class-1728027739389 = id_class-1728027739389;
    }
    
    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }
    
    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }
}
