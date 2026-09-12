# JASLYN NET Brand System

## Canonical identity

- Master brand: JASLYN
- Product brand: JASLYN NET
- Legal/parent company: YURIAN TECH LTD
- Product category: Connectivity & ISP Operating System
- Tagline: Connect. Control. Grow.
- Intelligence layer: JASLYN AI

## Naming rules

Use `JASLYN NET` in customer-facing product surfaces, documentation, dashboards, emails and marketing material.

Use `@jaslyn-net/*` for workspace package names.

Use `jaslyn-net` for the technical root package identifier where a package identifier is required.

Do not introduce a second product name for the same platform without an explicit brand decision.

## Product architecture

```text
YURIAN TECH LTD
└── JASLYN ECOSYSTEM
    ├── JASLYN NET   Connectivity & ISP
    ├── JASLYN AI    AI intelligence
    ├── JASLYN OS    AI-native operating system
    ├── JASLYN ERP   Business operations
    ├── JASLYN EDU   Education
    ├── JASLYN PAY   Payments
    └── JASLYN CLOUD Infrastructure
```

## UI terminology

Preferred:
- JASLYN NET Dashboard
- JASLYN NET Control Center
- JASLYN NET Network
- JASLYN NET Billing
- JASLYN NET RADIUS
- JASLYN NET Hotspot
- JASLYN NET Payments
- JASLYN NET Analytics

Avoid:
- NEXORA
- Nexora
- generic `WiFi Billing` as the product name

## Engineering rule

Brand migration must not break runtime contracts. Package names, imports, environment variables, deployment identifiers and external integration identifiers should be changed only when their dependency graph has been inspected and the required references are updated together.
