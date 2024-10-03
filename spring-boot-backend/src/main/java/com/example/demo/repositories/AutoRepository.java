
package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Auto;

public interface AutoRepository extends JpaRepository<Auto, Long> {
}
