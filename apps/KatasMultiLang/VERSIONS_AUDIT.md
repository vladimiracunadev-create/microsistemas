# Auditoria de versiones y compatibilidad

- Repo version: 3.1.0
- Casos: 657
- Lenguajes: 33

## Versiones objetivo por lenguaje

- logic: Pseudocodigo
- javascript: ES2024 (Browser)
- nodejs: 24 LTS
- jquery: 4.0.0
- typescript: 5.9
- python: 3.14.3
- java: 25 LTS
- kotlin: 2.3.10
- csharp: C# 14 / .NET 10 LTS
- go: 1.26
- rust: 1.93
- c: C17
- cpp: C++20
- swift: 6.2
- dart: 3.11
- scala: 3.8.2
- lua: 5.5.0
- perl: 5.42.0
- julia: 1.12.5
- r: 4.5.2
- php: 8.4
- ruby: 4.0.1
- sqlserver_sql: SQL Server 2025 (T-SQL)
- mysql_sql: MySQL 8.4 LTS
- postgresql_sql: PostgreSQL 18.3
- sqlserver: SQL Server 2025 (T-SQL)
- mysql: MySQL 8.4 LTS
- postgresql: PostgreSQL 18.3
- sybase: SAP ASE 16.1 (Transact-SQL)
- oracle: Oracle Database 26ai (PL/SQL)
- bash: 5.3
- powershell: 7.5
- prompt: IA / Prompt

## Checks ejecutados

- JSON: parse OK (meta + lang/*.json)
- Cobertura: cada lenguaje tiene snippet para cada caso

- Fix aplicado: Math.PI en formulas -> PHP: 21 casos, PowerShell: 21 casos

## Lenguajes legacy agregados

- cobol: GnuCOBOL 3.2 (COBOL 2014)
- powerscript: PowerBuilder 2025 (PowerScript)
- vbscript: VBScript 5.8 (deprecated; Windows optional feature)
- cfml: Adobe ColdFusion 2025 (CFML)
- delphi: Delphi 13 (RAD Studio 13 Florence)
- fortran: Fortran 2018 (ISO/IEC 1539-1:2018)

## Nota

- Verificacion: consistencia JSON y sintaxis esperada (no se ejecutan compiladores).
