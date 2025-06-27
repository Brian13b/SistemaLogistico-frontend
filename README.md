# Sistema de Gestión de Flotas - Frontend

Este repositorio contiene el código fuente del frontend del Sistema de Gestión de Flotas. Este frontend es una aplicación web que interactúa con un API Gateway, el cual a su vez se comunica con los diferentes módulos del backend (Gestión, Seguimeinto y Facturación).

## Arquitectura

La arquitectura del sistema sigue un patrón de microservicios, donde el frontend actúa como la capa de presentación que consume los servicios expuestos por el API Gateway.

- **Frontend:** Aplicación web construida con React que proporciona la interfaz de usuario para interactuar con el sistema.
