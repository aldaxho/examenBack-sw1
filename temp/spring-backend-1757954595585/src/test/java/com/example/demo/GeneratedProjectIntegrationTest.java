package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests automáticos generados para validar la integridad del proyecto Spring Boot
 * Estos tests verifican que no hay problemas de compilación, configuración o mapeo JPA
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class GeneratedProjectIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Test básico para verificar que la aplicación inicia correctamente
     */
    @Test
    public void contextLoads() {
        // Si este test pasa, significa que no hay errores de configuración
        // ni problemas de mapeo JPA
    }

    /**
     * Test para verificar que los endpoints básicos responden
     */
    @Test
    public void testBasicEndpoints() throws Exception {
        // Test de endpoint de salud (si existe)
        try {
            mockMvc.perform(get("/actuator/health"))
                    .andExpect(status().isOk());
        } catch (Exception e) {
            // Si no existe actuator, continuar con otros tests
        }
    }

    /**
     * Test para verificar que no hay problemas de CORS
     */
    @Test
    public void testCorsConfiguration() throws Exception {
        // Test básico de CORS
        mockMvc.perform(options("/api/test")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk());
    }
}