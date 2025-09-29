# e-Invoicing Platform – Starter Assets

## Structure
- `docs/RFP-eInvoicing-ar.md`: RFP عربي شامل.
- `specs/openapi.yaml`: مواصفات OpenAPI 3.1 للنواة.
- `schemas/invoice.schema.json`: مخطط JSON للفاتورة.
- `docs/POC-blueprint.md`: مخطط PoC لمدة 90 يوماً.

## Quick Start
1. استعرض مواصفات API في `specs/openapi.yaml` عبر أي عارض OpenAPI.
2. تحقق من الفاتورة مقابل السكيمة باستخدام أداة JSON Schema مثل ajv. مثال أمر: jq . sample-invoice.json | ajv validate -s schemas/invoice.schema.json -d -
3. ابدأ من مخطط PoC في `docs/POC-blueprint.md` لتجهيز بيئة تجريبية.

## Next
- إضافة عينات SDK ولغات متعددة.
- إضافة قوالب Terraform وHelm للنشر.