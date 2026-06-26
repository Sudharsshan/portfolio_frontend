# Project ID Standards & Nomenclature

Each project in the laboratory database is indexed using a unique tracking code (e.g., `C2025EMB-01`). This structured codec serves as a cryptographic key for syncing metadata and project notes.

## Codec Schematic
```
 [Owner] [Year] [Domain] - [Sequence]
   │       │       │          │
   │       │       │          └─► 01, 02 (Two-digit index)
   │       │       └────────────► EMB, EV, SaaS (Domain identifier)
   │       └────────────────────► 2023, 2024, 2025 (4-digit Year)
   └────────────────────────────► C (College), P (Personal)
```

---

## Field Breakdown & Values

### 1. Owner Code (`[Owner]`)
Defines the institutional or private context of the engineering project:
- **`C`**: **College / Academic** — Initiated as coursework, capstone, or university research.
- **`P`**: **Personal / Independent** — Private research, hobbyist development, or open-source initiatives.

### 2. Chronological Marker (`[Year]`)
A four-digit integer representing the year of ideation, design-freeze, or execution:
- E.g., `2023`, `2024`, `2025`.

### 3. Domain Abbreviation (`[Domain]`)
A variable-length upper-case alphanumeric tag indicating the primary engineering discipline:
- **`EMB`**: **Embedded Systems** — Firmware, RTOS, bare-metal loops, low-level drivers.
- **`EV`**: **Electric Vehicles** — Battery management, motor control, wiring, telemetry.
- **`SaaS`**: **Software / Cloud Integration** — Multi-tenant platforms, IoT dashboards, APIs.
- **`PE`**: **Power Electronics** — Converter circuits, battery charging systems.

### 4. Sequence Number (`-[Sequence]`)
A hyphen-separated two-digit serial index ensuring collision-free indexing within the same year and domain:
- E.g., `-01`, `-02`.

---

## Examples
- **`C2025EMB-01`**: First College Embedded Systems project of 2025.
- **`C2024EV-02`**: Second College EV telemetry project of 2024.
- **`P2023SaaS-01`**: First Personal IoT Cloud SaaS project of 2023.
