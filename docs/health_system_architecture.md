# Arquitetura do Sistema de Saúde PetBook (Health-First)

Este documento descreve a nova arquitetura para transformar o PetBook em uma plataforma focada em saúde animal, utilizando dados estruturados e processos auditáveis.

## 1. Modelo de Dados Padronizado

Para evitar "texto livre" e garantir a qualidade dos dados, introduziremos tabelas de referência (catálogos).

### Novas Tabelas de Referência
- `health_standards_vaccines`: Lista oficial de vacinas (ex: V10, Raiva, Giárdia).
- `health_standards_exams`: Catálogo de exames laboratoriais e de imagem.
- `health_standards_clinical_codes`: Versão simplificada do CID Vet para diagnósticos.

### Modificações em `health_records`
- Adição de chaves estrangeiras para as tabelas de referência.
- Campo `is_standardized` (boolean) para diferenciar registros antigos de novos.

## 2. Linha do Tempo Imutável e Versionamento

Implementaremos um padrão de **Event Sourcing** simplificado para garantir a integridade dos dados médicos.

### Estrutura de Auditoria
- `health_records_history`: Tabela que armazena todas as versões de um registro.
- **Trigger de Banco de Dados**: Sempre que um `health_record` for inserido ou atualizado, uma cópia é enviada para a tabela de histórico.
- **Imutabilidade**: A tabela de histórico terá permissões de RLS que impedem `UPDATE` ou `DELETE`.

## 3. Permissões Granulares (RLS)

Refinamento das políticas de Row Level Security para controle de acesso.

- **Tutor**: Acesso total (CRUD).
- **Veterinário (Acesso Temporário)**: Introdução da tabela `health_temporary_access` com `expires_at`.
- **Público**: Acesso bloqueado a dados sensíveis de saúde.

## 4. Exportação e Interoperabilidade

- **Edge Function (`export-health-report`)**: Função em Deno/TypeScript que gera um PDF ou JSON (padrão FHIR simplificado).
- **QR Code**: URL assinada que aponta para a função de exportação ou para um dashboard de visualização rápida para o veterinário.

---

*Próximo passo: Gerar o script SQL de migração.*
