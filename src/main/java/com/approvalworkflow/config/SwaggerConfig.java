package com.approvalworkflow.config;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info().title("Approval Workflow Engine API")
                .description("Configurable multi-step approval workflow engine. Supports dynamic approver chains, state machine transitions, and full audit history. Built with Spring Boot 3 + MySQL + JWT.")
                .version("1.0.0"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
            .components(new Components().addSecuritySchemes("Bearer Auth",
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer")
                    .bearerFormat("JWT").description("Enter JWT token from /api/auth/login")));
    }
}
