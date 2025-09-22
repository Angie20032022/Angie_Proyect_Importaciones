# GUÍA DE IMPLEMENTACIÓN PASO A PASO

## PREREQUISITOS

### Software Requerido
- **Java 17** o superior
- **Node.js 18** o superior
- **IntelliJ IDEA Ultimate** (versión 2023.3 o superior)
- **PostgreSQL 15** o superior
- **Docker Desktop**
- **Git**

### Verificación de Instalación
```bash
# Verificar Java
java -version

# Verificar Node.js
node --version
npm --version

# Verificar PostgreSQL
psql --version

# Verificar Docker
docker --version
docker-compose --version
```

## FASE 1: CONFIGURACIÓN DEL ENTORNO

### 1.1 Configuración de IntelliJ IDEA

1. **Instalar Plugins Necesarios:**
   - Spring Boot
   - Docker
   - Database Navigator
   - Lombok
   - SonarLint

2. **Configurar JDK:**
   - File → Project Structure → SDKs
   - Agregar JDK 17
   - Establecer como default

3. **Configurar Maven:**
   - File → Settings → Build Tools → Maven
   - Verificar Maven home directory
   - Configurar settings.xml si es necesario

### 1.2 Configuración de Base de Datos

1. **Crear Bases de Datos:**
```sql
-- Conectar como superusuario
CREATE DATABASE materiales_db;
CREATE USER materiales_user WITH PASSWORD 'materiales_pass';
GRANT ALL PRIVILEGES ON DATABASE materiales_db TO materiales_user;

CREATE DATABASE importaciones_db;
CREATE USER importaciones_user WITH PASSWORD 'importaciones_pass';
GRANT ALL PRIVILEGES ON DATABASE importaciones_db TO importaciones_user;
```

2. **Configurar Docker Compose para Desarrollo:**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres-materiales:
    image: postgres:15
    container_name: postgres-materiales
    environment:
      POSTGRES_DB: materiales_db
      POSTGRES_USER: materiales_user
      POSTGRES_PASSWORD: materiales_pass
    ports:
      - "5432:5432"
    volumes:
      - materiales_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d

  postgres-importaciones:
    image: postgres:15
    container_name: postgres-importaciones
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
    container_name: rabbitmq
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

3. **Iniciar Servicios de Base de Datos:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## FASE 2: DESARROLLO DEL BACKEND

### 2.1 Crear Proyecto Principal en IntelliJ

1. **Nuevo Proyecto:**
   - File → New → Project
   - Seleccionar "Empty Project"
   - Nombre: `importaciones-system`

2. **Estructura de Directorios:**
```
importaciones-system/
├── api-gateway/
├── materiales-service/
├── importaciones-service/
├── notificaciones-service/
├── frontend/
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

### 2.2 Crear Microservicio de Materiales

1. **Crear Módulo Spring Boot:**
   - File → New → Module
   - Spring Initializr
   - Configuración:
     - Group: `com.empresa`
     - Artifact: `materiales-service`
     - Package: `com.empresa.materiales`
     - Java Version: 17
     - Dependencies:
       - Spring Web
       - Spring Data JPA
       - PostgreSQL Driver
       - Spring Boot Actuator
       - Lombok
       - Validation

2. **Estructura del Proyecto:**
```java
// src/main/java/com/empresa/materiales/MaterialesServiceApplication.java
@SpringBootApplication
@EnableJpaRepositories
public class MaterialesServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MaterialesServiceApplication.class, args);
    }
}
```

3. **Configuración application.yml:**
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
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

logging:
  level:
    com.empresa.materiales: DEBUG
    org.springframework.web: DEBUG

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

4. **Modelo de Datos:**
```java
// src/main/java/com/empresa/materiales/models/Material.java
@Entity
@Table(name = "materiales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(unique = true, nullable = false)
    private String codigo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Categoria categoria;
    
    private String descripcion;
    
    @Column(nullable = false)
    private String proveedor;
    
    @Column(name = "pais_origen", nullable = false)
    private String paisOrigen;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Unidad unidad;
    
    @Column(name = "cantidad_minima", nullable = false)
    private Integer cantidadMinima;
    
    @Column(name = "tiempo_entrega", nullable = false)
    private Integer tiempoEntrega;
    
    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado;
    
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal aranceles;
    
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DocumentoRequerido> documentosRequeridos = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// Enums
public enum Categoria {
    METALES, QUIMICOS, TEXTILES, ELECTRONICOS, CONSTRUCCION, OTRO
}

public enum Unidad {
    KG, TON, MT, PCS, LT, M3
}

public enum Estado {
    ACTIVO, DESCONTINUADO, EN_PROCESO
}
```

5. **Repositorio:**
```java
// src/main/java/com/empresa/materiales/repositories/MaterialRepository.java
@Repository
public interface MaterialRepository extends JpaRepository<Material, UUID> {
    
    List<Material> findByCategoria(Categoria categoria);
    
    List<Material> findByEstado(Estado estado);
    
    List<Material> findByProveedorContainingIgnoreCase(String proveedor);
    
    @Query("SELECT m FROM Material m WHERE " +
           "LOWER(m.nombre) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.codigo) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.proveedor) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Material> findBySearchTerm(@Param("searchTerm") String searchTerm);
    
    boolean existsByCodigo(String codigo);
}
```

6. **Servicio:**
```java
// src/main/java/com/empresa/materiales/services/MaterialService.java
@Service
@Transactional
@Slf4j
public class MaterialService {
    
    private final MaterialRepository materialRepository;
    private final MaterialMapper materialMapper;
    
    public MaterialService(MaterialRepository materialRepository, MaterialMapper materialMapper) {
        this.materialRepository = materialRepository;
        this.materialMapper = materialMapper;
    }
    
    public List<MaterialDTO> findAll() {
        log.debug("Obteniendo todos los materiales");
        return materialRepository.findAll()
                .stream()
                .map(materialMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public MaterialDTO findById(UUID id) {
        log.debug("Buscando material con ID: {}", id);
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new MaterialNotFoundException("Material no encontrado con ID: " + id));
        return materialMapper.toDTO(material);
    }
    
    public MaterialDTO create(MaterialCreateDTO createDTO) {
        log.debug("Creando nuevo material: {}", createDTO.getNombre());
        
        if (materialRepository.existsByCodigo(createDTO.getCodigo())) {
            throw new MaterialAlreadyExistsException("Ya existe un material con código: " + createDTO.getCodigo());
        }
        
        Material material = materialMapper.toEntity(createDTO);
        material.setFechaRegistro(LocalDate.now());
        
        Material savedMaterial = materialRepository.save(material);
        log.info("Material creado exitosamente con ID: {}", savedMaterial.getId());
        
        return materialMapper.toDTO(savedMaterial);
    }
    
    public MaterialDTO update(UUID id, MaterialUpdateDTO updateDTO) {
        log.debug("Actualizando material con ID: {}", id);
        
        Material existingMaterial = materialRepository.findById(id)
                .orElseThrow(() -> new MaterialNotFoundException("Material no encontrado con ID: " + id));
        
        materialMapper.updateEntityFromDTO(updateDTO, existingMaterial);
        Material updatedMaterial = materialRepository.save(existingMaterial);
        
        log.info("Material actualizado exitosamente: {}", id);
        return materialMapper.toDTO(updatedMaterial);
    }
    
    public void delete(UUID id) {
        log.debug("Eliminando material con ID: {}", id);
        
        if (!materialRepository.existsById(id)) {
            throw new MaterialNotFoundException("Material no encontrado con ID: " + id);
        }
        
        materialRepository.deleteById(id);
        log.info("Material eliminado exitosamente: {}", id);
    }
    
    public List<MaterialDTO> findByCategoria(Categoria categoria) {
        return materialRepository.findByCategoria(categoria)
                .stream()
                .map(materialMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<MaterialDTO> search(String searchTerm) {
        return materialRepository.findBySearchTerm(searchTerm)
                .stream()
                .map(materialMapper::toDTO)
                .collect(Collectors.toList());
    }
}
```

7. **Controlador:**
```java
// src/main/java/com/empresa/materiales/controllers/MaterialController.java
@RestController
@RequestMapping("/api/materiales")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
@Slf4j
public class MaterialController {
    
    private final MaterialService materialService;
    
    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }
    
    @GetMapping
    public ResponseEntity<List<MaterialDTO>> getAllMateriales(
            @RequestParam(required = false) Categoria categoria,
            @RequestParam(required = false) String search) {
        
        List<MaterialDTO> materiales;
        
        if (search != null && !search.trim().isEmpty()) {
            materiales = materialService.search(search);
        } else if (categoria != null) {
            materiales = materialService.findByCategoria(categoria);
        } else {
            materiales = materialService.findAll();
        }
        
        return ResponseEntity.ok(materiales);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MaterialDTO> getMaterialById(@PathVariable UUID id) {
        MaterialDTO material = materialService.findById(id);
        return ResponseEntity.ok(material);
    }
    
    @PostMapping
    public ResponseEntity<MaterialDTO> createMaterial(@Valid @RequestBody MaterialCreateDTO createDTO) {
        MaterialDTO createdMaterial = materialService.create(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMaterial);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MaterialDTO> updateMaterial(
            @PathVariable UUID id,
            @Valid @RequestBody MaterialUpdateDTO updateDTO) {
        MaterialDTO updatedMaterial = materialService.update(id, updateDTO);
        return ResponseEntity.ok(updatedMaterial);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable UUID id) {
        materialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

8. **DTOs:**
```java
// src/main/java/com/empresa/materiales/dto/MaterialDTO.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialDTO {
    private UUID id;
    
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
    
    @NotBlank(message = "El código es obligatorio")
    private String codigo;
    
    @NotNull(message = "La categoría es obligatoria")
    private Categoria categoria;
    
    private String descripcion;
    
    @NotBlank(message = "El proveedor es obligatorio")
    private String proveedor;
    
    @NotBlank(message = "El país de origen es obligatorio")
    private String paisOrigen;
    
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    private BigDecimal precio;
    
    @NotNull(message = "La unidad es obligatoria")
    private Unidad unidad;
    
    @NotNull(message = "La cantidad mínima es obligatoria")
    @Min(value = 1, message = "La cantidad mínima debe ser mayor a 0")
    private Integer cantidadMinima;
    
    @NotNull(message = "El tiempo de entrega es obligatorio")
    @Min(value = 1, message = "El tiempo de entrega debe ser mayor a 0")
    private Integer tiempoEntrega;
    
    private LocalDate fechaRegistro;
    
    @NotNull(message = "El estado es obligatorio")
    private Estado estado;
    
    @NotNull(message = "Los aranceles son obligatorios")
    @DecimalMin(value = "0.0", message = "Los aranceles no pueden ser negativos")
    @DecimalMax(value = "100.0", message = "Los aranceles no pueden ser mayores a 100%")
    private BigDecimal aranceles;
    
    private List<String> documentosRequeridos;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

9. **Migración de Base de Datos:**
```sql
-- src/main/resources/db/migration/V1__Create_materiales_tables.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE materiales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descripcion TEXT,
    proveedor VARCHAR(255) NOT NULL,
    pais_origen VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(10) NOT NULL,
    cantidad_minima INTEGER NOT NULL,
    tiempo_entrega INTEGER NOT NULL,
    fecha_registro DATE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    aranceles DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documentos_requeridos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES materiales(id) ON DELETE CASCADE,
    nombre_documento VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_materiales_categoria ON materiales(categoria);
CREATE INDEX idx_materiales_estado ON materiales(estado);
CREATE INDEX idx_materiales_proveedor ON materiales(proveedor);
CREATE INDEX idx_materiales_codigo ON materiales(codigo);

-- Datos de prueba
INSERT INTO materiales (nombre, codigo, categoria, descripcion, proveedor, pais_origen, precio, unidad, cantidad_minima, tiempo_entrega, fecha_registro, estado, aranceles) VALUES
('Acero Inoxidable 316L', 'SS316L-001', 'METALES', 'Acero inoxidable austenítico de alta calidad', 'Shanghai Steel Corp', 'China', 3200.00, 'TON', 5, 45, CURRENT_DATE, 'ACTIVO', 8.5),
('Polietileno de Alta Densidad', 'HDPE-002', 'QUIMICOS', 'Resina termoplástica para envases', 'Petrochem Industries', 'Estados Unidos', 1850.00, 'TON', 20, 30, CURRENT_DATE, 'ACTIVO', 5.2);
```

### 2.3 Ejecutar y Probar el Microservicio

1. **Ejecutar la Aplicación:**
   - En IntelliJ: Run → MaterialesServiceApplication
   - O desde terminal: `mvn spring-boot:run`

2. **Probar con Postman:**
```bash
# Obtener todos los materiales
GET http://localhost:8081/api/materiales

# Crear un material
POST http://localhost:8081/api/materiales
Content-Type: application/json

{
    "nombre": "Aluminio 6061",
    "codigo": "AL6061-003",
    "categoria": "METALES",
    "descripcion": "Aleación de aluminio para estructuras",
    "proveedor": "Aluminum Corp",
    "paisOrigen": "Canadá",
    "precio": 2500.00,
    "unidad": "TON",
    "cantidadMinima": 10,
    "tiempoEntrega": 35,
    "estado": "ACTIVO",
    "aranceles": 6.0,
    "documentosRequeridos": ["Certificado de origen", "Análisis químico"]
}
```

## FASE 3: INTEGRACIÓN CON FRONTEND

### 3.1 Modificar Frontend para Usar APIs

1. **Crear Servicio de API:**
```typescript
// src/services/api.ts
const API_BASE_URL = 'http://localhost:8081/api';

export class ApiService {
    private static async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Materiales
    static async getMateriales(): Promise<Material[]> {
        return this.request<Material[]>('/materiales');
    }

    static async getMaterial(id: string): Promise<Material> {
        return this.request<Material>(`/materiales/${id}`);
    }

    static async createMaterial(material: Omit<Material, 'id' | 'fechaRegistro'>): Promise<Material> {
        return this.request<Material>('/materiales', {
            method: 'POST',
            body: JSON.stringify(material),
        });
    }

    static async updateMaterial(id: string, material: Partial<Material>): Promise<Material> {
        return this.request<Material>(`/materiales/${id}`, {
            method: 'PUT',
            body: JSON.stringify(material),
        });
    }

    static async deleteMaterial(id: string): Promise<void> {
        return this.request<void>(`/materiales/${id}`, {
            method: 'DELETE',
        });
    }
}
```

2. **Crear Hook para Materiales:**
```typescript
// src/hooks/useMateriales.ts
import { useState, useEffect } from 'react';
import { Material } from '../types/material';
import { ApiService } from '../services/api';

export function useMateriales() {
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMateriales = async () => {
        try {
            setLoading(true);
            const data = await ApiService.getMateriales();
            setMateriales(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar materiales');
            console.error('Error fetching materiales:', err);
        } finally {
            setLoading(false);
        }
    };

    const createMaterial = async (materialData: Omit<Material, 'id' | 'fechaRegistro'>) => {
        try {
            const newMaterial = await ApiService.createMaterial(materialData);
            setMateriales(prev => [...prev, newMaterial]);
            return newMaterial;
        } catch (err) {
            setError('Error al crear material');
            throw err;
        }
    };

    const updateMaterial = async (id: string, materialData: Partial<Material>) => {
        try {
            const updatedMaterial = await ApiService.updateMaterial(id, materialData);
            setMateriales(prev => 
                prev.map(m => m.id === id ? updatedMaterial : m)
            );
            return updatedMaterial;
        } catch (err) {
            setError('Error al actualizar material');
            throw err;
        }
    };

    const deleteMaterial = async (id: string) => {
        try {
            await ApiService.deleteMaterial(id);
            setMateriales(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            setError('Error al eliminar material');
            throw err;
        }
    };

    useEffect(() => {
        fetchMateriales();
    }, []);

    return {
        materiales,
        loading,
        error,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        refetch: fetchMateriales
    };
}
```

3. **Actualizar App.tsx:**
```typescript
// src/App.tsx - Modificar para usar el hook
import { useMateriales } from './hooks/useMateriales';

function App() {
    const { materiales, loading, error, createMaterial, updateMaterial, deleteMaterial } = useMateriales();
    
    // ... resto del código
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Cargando materiales...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }
    
    // ... resto del componente
}
```

## FASE 4: TESTING Y VALIDACIÓN

### 4.1 Testing del Backend

1. **Dependencias de Testing:**
```xml
<!-- pom.xml - agregar en dependencies -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

2. **Test de Integración:**
```java
// src/test/java/com/empresa/materiales/MaterialControllerIntegrationTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class MaterialControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("test_materiales_db")
            .withUsername("test_user")
            .withPassword("test_pass");

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private MaterialRepository materialRepository;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Test
    void shouldCreateMaterial() {
        MaterialCreateDTO createDTO = MaterialCreateDTO.builder()
                .nombre("Test Material")
                .codigo("TEST-001")
                .categoria(Categoria.METALES)
                .proveedor("Test Provider")
                .paisOrigen("Test Country")
                .precio(new BigDecimal("100.00"))
                .unidad(Unidad.KG)
                .cantidadMinima(10)
                .tiempoEntrega(30)
                .estado(Estado.ACTIVO)
                .aranceles(new BigDecimal("5.0"))
                .build();

        ResponseEntity<MaterialDTO> response = restTemplate.postForEntity(
                "/api/materiales", createDTO, MaterialDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getNombre()).isEqualTo("Test Material");
    }
}
```

### 4.2 Comandos de Ejecución

1. **Ejecutar Tests:**
```bash
# Ejecutar todos los tests
mvn test

# Ejecutar tests específicos
mvn test -Dtest=MaterialControllerIntegrationTest

# Ejecutar con perfil de test
mvn test -Dspring.profiles.active=test
```

2. **Ejecutar Aplicación:**
```bash
# Desarrollo
mvn spring-boot:run

# Con perfil específico
mvn spring-boot:run -Dspring.profiles.active=dev

# Generar JAR y ejecutar
mvn clean package

```

## FASE 5: DESPLIEGUE

### 5.1 Dockerización

1. **Dockerfile:**
```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
```

2. **Docker Compose Completo:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres-materiales:
    image: postgres:15
    environment:
      POSTGRES_DB: materiales_db
      POSTGRES_USER: materiales_user
      POSTGRES_PASSWORD: materiales_pass
    volumes:
      - materiales_data:/var/lib/postgresql/data
    networks:
      - importaciones-network

  materiales-service:
    build: ./materiales-service
    ports:
      - "8081:8081"
    depends_on:
      - postgres-materiales
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-materiales:5432/materiales_db
      - SPRING_DATASOURCE_USERNAME=materiales_user
      - SPRING_DATASOURCE_PASSWORD=materiales_pass
    networks:
      - importaciones-network

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - materiales-service
    networks:
      - importaciones-network

volumes:
  materiales_data:

networks:
  importaciones-network:
    driver: bridge
```

3. **Comandos de Despliegue:**
```bash
# Construir y ejecutar
docker-compose up --build

# Ejecutar en background
docker-compose up -d

# Ver logs
docker-compose logs -f materiales-service

# Parar servicios
docker-compose down

# Limpiar volúmenes
docker-compose down -v
```

## PRÓXIMOS PASOS

1. **Implementar Microservicio de Importaciones** siguiendo el mismo patrón
2. **Configurar API Gateway** con Spring Cloud Gateway
3. **Implementar Microservicio de Notificaciones**
4. **Agregar Seguridad** con Spring Security y JWT
5. **Implementar Monitoreo** con Micrometer y Prometheus
6. **Configurar CI/CD** con GitHub Actions o Jenkins

Esta guía proporciona una base sólida para implementar el sistema completo paso a paso.