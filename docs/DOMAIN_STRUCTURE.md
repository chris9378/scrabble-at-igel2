# 🏗️ Domain Structure & Organization

> **Complete domain architecture for the Scrabble at Igel project**

**Last Updated**: 2026-04-15

---

## Table of Contents

- [Overview](#overview)
- [Domain Summary](#domain-summary)
- [Frontend Domain (Angular)](#frontend-domain-angular)
- [Backend Domain (Express)](#backend-domain-express)
- [Shared Domain (TypeScript)](#shared-domain-typescript)
- [Documentation Domain (Markdown)](#documentation-domain-markdown)
- [Tests Domain](#tests-domain)
- [Database Domain](#database-domain)
- [Infrastructure Domain](#infrastructure-domain)
- [Cross-Domain Concerns](#cross-domain-concerns)

---

## Overview

This document defines the architectural domains of the Scrabble project, their boundaries, glob patterns for file matching, and key concerns specific to each domain.

### Purpose

- **Clear Boundaries**: Define what belongs to each domain
- **Tool Configuration**: Provide glob patterns for linting, testing, and build tools
- **Standards Reference**: Link to domain-specific coding standards
- **Onboarding**: Help new developers understand project organization

---

## Domain Summary

| Domain | Status | Priority | Root Path | Primary Glob Pattern |
|--------|--------|----------|-----------|---------------------|
| **Frontend** | 🟡 Partial | High | `frontend/` | `frontend/**/*` |
| **Backend** | 🟡 Partial | High | `backend/` | `backend/**/*` |
| **Shared** | 🟢 Basic | Medium | `shared/` | `shared/**/*` |
| **Documentation** | 🟢 Complete | Low | `docs/`, `*.md` | `{docs/**/*.md,*.md}` |
| **Tests** | 🔴 Missing | High | Multiple | `{backend/tests/**/*,frontend/**/*.spec.ts}` |
| **Database** | 🔴 Missing | High | `backend/src/db/` | `backend/src/db/**/*` |
| **Infrastructure** | 🔴 Missing | Medium | `.github/workflows/` | `.github/workflows/**/*` |

**Legend**: 🟢 Complete | 🟡 Partial | 🔴 Missing

---

## Frontend Domain (Angular)

### Description
Angular 18+ SPA with NgRx state management, Socket.io real-time communication, and Angular CDK for drag & drop.

### Glob Patterns

```glob
# All frontend files
frontend/**/*

# TypeScript (production)
frontend/src/**/*.ts
!frontend/src/**/*.spec.ts

# Components
frontend/src/app/**/*.component.{ts,html,scss}

# Services
frontend/src/app/**/*.service.ts

# NgRx Store
frontend/src/app/**/store/**/*.{actions,reducer,effects,selectors}.ts

# Tests
frontend/src/**/*.spec.ts

# Linting
frontend/src/**/*.ts
!frontend/src/**/*.spec.ts
!frontend/dist/**
!frontend/.angular/**
