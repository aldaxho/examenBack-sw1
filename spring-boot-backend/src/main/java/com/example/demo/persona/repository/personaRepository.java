
package com.example.demo.persona.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.persona.model.persona;

public interface personaRepository extends JpaRepository<persona, Long> {
}
