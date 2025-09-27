package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

/**
 * Tests de validación de entidades generadas
 * Verifica que no hay campos duplicados ni problemas de mapeo JPA
 */
@SpringBootTest
@ActiveProfiles("test")
public class EntityValidationTest {

    /**
     * Test para verificar que las entidades se pueden instanciar sin errores
     */
    @Test
    public void testEntityInstantiation() {
        // Este test verifica que no hay problemas de compilación en las entidades
        // Si hay campos duplicados o problemas de mapeo, este test fallará
        
        try {
            // Intentar cargar las clases de entidad
            Class.forName("com.example.demo.model.Account");
            Class.forName("com.example.demo.model.Customer");
            Class.forName("com.example.demo.model.Branch");
            Class.forName("com.example.demo.model.Employee");
            Class.forName("com.example.demo.model.Loan");
            Class.forName("com.example.demo.model.Transaction");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Error cargando entidades: " + e.getMessage());
        }
    }

    /**
     * Test para verificar que los repositorios se pueden instanciar
     */
    @Test
    public void testRepositoryInstantiation() {
        try {
            // Intentar cargar las clases de repositorio
            Class.forName("com.example.demo.repository.AccountRepository");
            Class.forName("com.example.demo.repository.CustomerRepository");
            Class.forName("com.example.demo.repository.BranchRepository");
            Class.forName("com.example.demo.repository.EmployeeRepository");
            Class.forName("com.example.demo.repository.LoanRepository");
            Class.forName("com.example.demo.repository.TransactionRepository");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Error cargando repositorios: " + e.getMessage());
        }
    }
}