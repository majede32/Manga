## PoC Blueprint – e-Invoicing CTC (90 Days)

### Scope
- API Gateway + Invoice Service + PKI Adapter + CTC Clearance Stub + Registry Stub.
- Sandbox + SDK Samples + Minimal Reporting Dashboard.

### Milestones
- Weeks 1–2: Environments (Kubernetes/Kind or managed), CI/CD, Observability.
- Weeks 3–4: Invoice schema/validation, submit/status, signing (JWS via HSM mock).
- Weeks 5–6: Clearance rules, QR generation, rejection/acceptance flow, audit logs.
- Weeks 7–8: Registry CRUD, basic risk scoring, bank/customs ingestion stubs.
- Weeks 9–10: Performance (500 TPS burst), resilience, rate limiting, retries.
- Weeks 11–12: Security hardening, docs, SDKs, demo dataset and scripts.

### Components
- Gateway: NGINX/Envoy + OIDC.
- Services: Node.js/Java (Spring Boot) or .NET API.
- Data: Postgres, MongoDB (docs), Redis (cache), Kafka (optional for events).
- PKI: SoftHSM/HSM cloud mock, JWS detached.
- Observability: Prometheus, Grafana, Loki/ELK, OpenTelemetry.

### Acceptance
- Submit 10k invoices/day, P95 < 300ms, rejection rate < 3% على بيانات اختبار.
- End-to-end demo: sign → submit → clearance → QR → status/report.

