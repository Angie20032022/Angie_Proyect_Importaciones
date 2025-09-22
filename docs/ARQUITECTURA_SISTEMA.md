# ARQUITECTURA DEL SISTEMA DE IMPORTACIONES

## DIAGRAMA DE ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │  Dashboard  │ │ Materiales  │ │Importaciones│ │   Reportes  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/REST
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 8080)                    │
│                    ┌─────────────────────────┐                  │
│                    │   Spring Cloud Gateway  │                  │
│                    │   - Routing             │                  │
│                    │   - Authentication      │                  │
│                    │   - Rate Limiting       │                  │
│                    └─────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│  MATERIALES SERVICE │ │IMPORTACIONES SERVICE│ │NOTIFICACIONES SERVICE│
│     (Port 8081)     │ │     (Port 8082)     │ │     (Port 8083)     │
│                     │ │                     │ │                     │
│ ┌─────────────────┐ │ │ ┌─────────────────┐ │ │ ┌─────────────────┐ │
│ │MaterialController│ │ │ │ImportController │ │ │ │NotifController  │ │
│ │MaterialService  │ │ │ │ImportService    │ │ │ │EmailService     │ │
│ │MaterialRepository│ │ │ │ImportRepository │ │ │ │SMSService       │ │
│ └─────────────────┘ │ │ └─────────────────┘ │ │ └─────────────────┘ │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   PostgreSQL DB     │ │   PostgreSQL DB     │ │     RabbitMQ        │
│   (Materiales)      │ │  (Importaciones)    │ │   (Message Queue)   │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

## ESTRUCTURA DE MICROSERVICIOS

### 1. MICROSERVICIO DE MATERIALES

**Responsabilidades:**
- Gestión CRUD de materiales
- Gestión de proveedores
- Cálculo de precios y aranceles
- Validación de datos de materiales

**Estructura del Proyecto:**
```
materiales-service/
├── src/main/java/com/empresa/materiales/
│   ├── MaterialesServiceApplication.java
│   ├── controllers/
│   │   └── MaterialController.java
│   ├── services/
│   │   ├── MaterialService.java
│   │   └── ProveedorService.java
│   ├── repositories/
│   │   ├── MaterialRepository.java
│   │   └── ProveedorRepository.java
│   ├── models/
│   │   ├── Material.java
│   │   ├── Proveedor.java
│   │   └── DocumentoRequerido.java
│   ├── dto/
│   │   ├── MaterialDTO.java
│   │   └── MaterialCreateDTO.java
│   └── config/
│       ├── DatabaseConfig.java
│       └── SecurityConfig.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
│       └── V1__Create_materiales_tables.sql
├── Dockerfile
└── pom.xml
```

**APIs Expuestas:**
```
GET    /api/materiales              # Listar materiales
POST   /api/materiales              # Crear material
GET    /api/materiales/{id}         # Obtener material por ID
PUT    /api/materiales/{id}         # Actualizar material
DELETE /api/materiales/{id}         # Eliminar material
GET    /api/materiales/categoria/{categoria} # Filtrar por categoría
GET    /api/materiales/proveedor/{proveedor} # Filtrar por proveedor
```

### 2. MICROSERVICIO DE IMPORTACIONES

**Responsabilidades:**
- Gestión de órdenes de importación
- Seguimiento de estados
- Cálculo de costos totales
- Gestión de documentos

**Estructura del Proyecto:**
```
importaciones-service/
├── src/main/java/com/empresa/importaciones/
│   ├── ImportacionesServiceApplication.java
│   ├── controllers/
│   │   └── ImportacionController.java
│   ├── services/
│   │   ├── ImportacionService.java
│   │   ├── CostoService.java
│   │   └── DocumentoService.java
│   ├── repositories/
│   │   ├── ImportacionRepository.java
│   │   └── DocumentoRepository.java
│   ├── models/
│   │   ├── Importacion.java
│   │   ├── DocumentoImportacion.java
│   │   └── EstadoImportacion.java
│   ├── dto/
│   │   ├── ImportacionDTO.java
│   │   └── ImportacionCreateDTO.java
│   ├── clients/
│   │   └── MaterialServiceClient.java
│   └── config/
│       ├── DatabaseConfig.java
│       └── FeignConfig.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
│       └── V1__Create_importaciones_tables.sql
├── Dockerfile
└── pom.xml
```

**APIs Expuestas:**
```
GET    /api/importaciones           # Listar importaciones
POST   /api/importaciones           # Crear importación
GET    /api/importaciones/{id}      # Obtener importación por ID
PUT    /api/importaciones/{id}      # Actualizar importación
PUT    /api/importaciones/{id}/estado # Cambiar estado
GET    /api/importaciones/estado/{estado} # Filtrar por estado
POST   /api/importaciones/{id}/documentos # Subir documento
```

### 3. MICROSERVICIO DE NOTIFICACIONES

**Responsabilidades:**
- Envío de notificaciones por email
- Envío de SMS
- Gestión de plantillas
- Cola de mensajes

**Estructura del Proyecto:**
```
notificaciones-service/
├── src/main/java/com/empresa/notificaciones/
│   ├── NotificacionesServiceApplication.java
│   ├── controllers/
│   │   └── NotificacionController.java
│   ├── services/
│   │   ├── EmailService.java
│   │   ├── SMSService.java
│   │   └── PlantillaService.java
│   ├── models/
│   │   ├── Notificacion.java
│   │   ├── PlantillaEmail.java
│   │   └── TipoNotificacion.java
│   ├── dto/
│   │   └── NotificacionDTO.java
│   ├── listeners/
│   │   └── ImportacionEventListener.java
│   └── config/
│       ├── RabbitMQConfig.java
│       └── EmailConfig.java
├── src/main/resources/
│   ├── application.yml
│   └── templates/
│       ├── importacion-creada.html
│       └── estado-cambiado.html
├── Dockerfile
└── pom.xml
```

## CONFIGURACIÓN DE DESARROLLO EN INTELLIJ IDEA

### Configuración del Workspace

1. **Crear Workspace Principal:**
```
importaciones-system/
├── frontend/                    # Proyecto React
├── api-gateway/                # Spring Cloud Gateway
├── materiales-service/         # Microservicio Materiales
├── importaciones-service/      # Microservicio Importaciones
├── notificaciones-service/     # Microservicio Notificaciones
├── docker-compose.yml          # Orquestación de servicios
├── README.md
└── docs/
```

2. **Configuración de IntelliJ IDEA:**
   - Abrir como "Multi-module project"
   - Configurar JDK 17 para todos los módulos
   - Instalar plugins: Spring Boot, Docker, Database Navigator

### Configuración de Base de Datos

**Docker Compose para Desarrollo:**
```yaml
version: '3.8'
services:
  postgres-materiales:
    image: postgres:15
    environment:
      POSTGRES_DB: materiales_db
      POSTGRES_USER: materiales_user
      POSTGRES_PASSWORD: materiales_pass
    ports:
      - "5432:5432"
    volumes:
      - materiales_data:/var/lib/postgresql/data

  postgres-importaciones:
    image: postgres:15
    environment:
      POSTGRES_DB: importaciones_db
      POSTGRES_USER: importaciones_user
      POSTGRES_PASSWORD: importaciones_pass
    ports:
      - "5433:5432"
    volumes:
      - importaciones_data:/var/lib/postgresql/data

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin

volumes:
  materiales_data:
  importaciones_data:
```

### Configuración de Aplicaciones Spring Boot

**application.yml para Materiales Service:**
```yaml
server:
  port: 8081

spring:
  application:
    name: materiales-service
  datasource:
    url: jdbc:postgresql://localhost:5432/materiales_db
    username: materiales_user
    password: materiales_pass
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

**application.yml para API Gateway:**
```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: materiales-service
          uri: lb://materiales-service
          predicates:
            - Path=/api/materiales/**
        - id: importaciones-service
          uri: lb://importaciones-service
          predicates:
            - Path=/api/importaciones/**
        - id: notificaciones-service
          uri: lb://notificaciones-service
          predicates:
            - Path=/api/notificaciones/**

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

## FLUJO DE DATOS

### Creación de Importación

```
1. Frontend → API Gateway → Importaciones Service
   POST /api/importaciones
   {
     "materialId": "uuid",
     "cantidad": 100,
     "fechaPedido": "2024-01-15"
   }

2. Importaciones Service → Materiales Service
   GET /api/materiales/{materialId}
   (Obtener datos del material)

3. Importaciones Service → Database
   INSERT INTO importaciones (...)
   (Guardar importación)

4. Importaciones Service → RabbitMQ
   Publish: ImportacionCreada Event

5. Notificaciones Service ← RabbitMQ
   Listen: ImportacionCreada Event
   Send Email/SMS notification

6. Frontend ← API Gateway ← Importaciones Service
   Response: ImportacionDTO
```

### Actualización de Estado

```
1. Frontend → API Gateway → Importaciones Service
   PUT /api/importaciones/{id}/estado
   { "estado": "En Tránsito" }

2. Importaciones Service → Database
   UPDATE importaciones SET estado = 'En Tránsito'

3. Importaciones Service → RabbitMQ
   Publish: EstadoCambiado Event

4. Notificaciones Service ← RabbitMQ
   Listen: EstadoCambiado Event
   Send notification based on new state

5. Frontend ← Response: Updated ImportacionDTO
```

## SEGURIDAD

### Autenticación y Autorización

**JWT Token Flow:**
```
1. Usuario → API Gateway: Login credentials
2. API Gateway → Auth Service: Validate credentials
3. Auth Service → API Gateway: JWT Token
4. API Gateway → Frontend: JWT Token
5. Frontend → API Gateway: Requests with JWT in header
6. API Gateway: Validate JWT and route to services
```

**Configuración de Seguridad:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/materiales/**").hasRole("USER")
                .requestMatchers("/api/importaciones/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);
        return http.build();
    }
}
```

## MONITOREO Y LOGGING

### Configuración de Logging

**logback-spring.xml:**
```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/application.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>
</configuration>
```

### Métricas con Micrometer

```java
@Component
public class ImportacionMetrics {
    
    private final Counter importacionesCreadas;
    private final Timer tiempoProcesamientoImportacion;
    
    public ImportacionMetrics(MeterRegistry meterRegistry) {
        this.importacionesCreadas = Counter.builder("importaciones.creadas")
            .description("Número total de importaciones creadas")
            .register(meterRegistry);
            
        this.tiempoProcesamientoImportacion = Timer.builder("importaciones.tiempo.procesamiento")
            .description("Tiempo de procesamiento de importaciones")
            .register(meterRegistry);
    }
}
```

## DESPLIEGUE CON DOCKER

### Dockerfile para Microservicios

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose para Producción

```yaml
version: '3.8'
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - materiales-service
      - importaciones-service
    environment:
      - SPRING_PROFILES_ACTIVE=docker

  materiales-service:
    build: ./materiales-service
    ports:
      - "8081:8081"
    depends_on:
      - postgres-materiales
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - DATABASE_URL=jdbc:postgresql://postgres-materiales:5432/materiales_db

  importaciones-service:
    build: ./importaciones-service
    ports:
      - "8082:8082"
    depends_on:
      - postgres-importaciones
      - rabbitmq
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - DATABASE_URL=jdbc:postgresql://postgres-importaciones:5432/importaciones_db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api-gateway
```

Esta arquitectura proporciona una base sólida, escalable y mantenible para el sistema de gestión de importaciones.