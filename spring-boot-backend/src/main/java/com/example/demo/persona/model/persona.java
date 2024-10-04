
package com.example.demo.persona.model;

import javax.persistence.*;
import java.util.*;

@Entity

public class persona {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_class-1728027718213;
    private String ci;
    private String nombre;
    private String correo;
    private String contraseña;

    // Relaciones
    
    @OneToMany(mappedBy = "persona")
    private List<auto> autos = new ArrayList<>();
    

    public persona() {}

    
    public String getId_class-1728027718213() {
        return id_class-1728027718213;
    }

    public void setId_class-1728027718213(String id_class-1728027718213) {
        this.id_class-1728027718213 = id_class-1728027718213;
    }
    
    public String getCi() {
        return ci;
    }

    public void setCi(String ci) {
        this.ci = ci;
    }
    
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }
    
    public String getContraseña() {
        return contraseña;
    }

    public void setContraseña(String contraseña) {
        this.contraseña = contraseña;
    }
}
