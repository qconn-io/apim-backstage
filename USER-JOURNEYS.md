Of course. As an expert Product Manager, I have updated the user journeys to align with the refined v3.0 Architecture and v2.0 Roadmap.

This new version hardens the acceptance criteria and integrates key enterprise features like AsyncAPI support, decoupled OPA-based authorization, and persona-based observability directly into the testable user flows. These journeys now serve as a more rigorous contract for what "done" means, ensuring the platform is not just functional but also secure, observable, and aligned with modern development practices.

---

# **Product User Journeys & Acceptance Criteria (v2.0)**

*   **Version:** 2.0 (Aligned with Enterprise-Ready Architecture)
*   **Status:** Approved for UAT
*   **Author:** Gemini, Product Manager

## **Foreword for Testing Teams**

This document outlines the critical user journeys that define the core functionality and user experience of the API Management Platform. Each journey has been updated to test the integrated capabilities of our enterprise-ready architecture. A journey is considered "passed" only when all of its acceptance criteria are met without qualification, verifying not just the UI but the underlying security, observability, and automation frameworks.

---

## **Journey 1: The External Partner - Zero-Friction Sandbox Evaluation**

**User Story:** As a prospective Partner Developer (Chloé), I want to evaluate the NexusFlow Payments API by making a live sandbox call in under five minutes, without needing to sign up, so that I can quickly determine if the product meets my technical needs.

### **Preconditions:**

*   The `payments-api` is part of an `APIProduct` with a public `sandbox` plan.
*   The gateway is configured with a public key and a rate limit of 5 requests per minute for this plan.
*   The Strapi CMS has a "Getting Started with Payments" tutorial page published and linked to the Payments API.

### **Test Steps & Expected Outcomes:**

1.  **Navigate and Discover:**
    *   **Action:** Open a browser in incognito mode to the Partner Portal. Click "Explore APIs" and find the "Payments API."
    *   **Expected Outcome:** The Payments API is easily discoverable.

2.  **Explore Integrated Documentation:**
    *   **Action:** Click on the "Payments API" card.
    *   **Expected Outcome:** The API reference page loads in a three-column layout:
        *   **Left:** Rich content, including the "Getting Started" tutorial, is rendered directly **from the Strapi CMS**.
        *   **Center:** An interactive Swagger/Redoc UI is rendered from the OpenAPI spec.
        *   **Right:** An API Console with request samples is visible.

3.  **Execute a Sandbox Call:**
    *   **Action:** Copy the `cURL` command for `POST /v1/payments/intents` from the API Console. The command must include a pre-populated public sandbox API key. Run it in a terminal.
    *   **Expected Outcome:** The command returns an HTTP `201 Created` with a valid JSON response.

4.  **Verify Rate Limiting:**
    *   **Action:** Re-run the same `cURL` command six more times in quick succession.
    *   **Expected Outcome:** The first four subsequent requests succeed. The sixth request within the same minute **must** fail with an HTTP `429 Too Many Requests`.

### **Acceptance Criteria:**

*   [ ] The entire journey from landing on the portal to receiving a `201` response can be completed without any login or registration.
*   [ ] The API documentation page correctly integrates and displays both the technical spec (OpenAPI) and rich content (Strapi).
*   [ ] The sandbox API key is publicly visible and functional.
*   [ ] The gateway correctly enforces the defined rate limit for the sandbox key.
*   [ ] All pages are visually polished and responsive.

---

## **Journey 2: The External Partner - Self-Service Onboarding & Production Readiness**

**User Story:** As a Partner Developer (Chloé), I want to create a secure account, register my application, and obtain my own set of test and production API keys through a self-service workflow, so that I can begin building my integration without human intervention.

### **Preconditions:**

*   Chloé has successfully completed Journey 1.
*   The `partners` realm in Keycloak is configured for self-service registration.

### **Test Steps & Expected Outcomes:**

1.  **Account Registration:**
    *   **Action:** Click "Sign Up," complete the registration form, and verify the email address.
    *   **Expected Outcome:** The account is created in the Keycloak `partners` realm. The user is logged in and redirected to their personal dashboard.

2.  **Application Creation:**
    *   **Action:** On the dashboard, click "Create Application" and enter the name "FashioTech Staging."
    *   **Expected Outcome:** The application "FashioTech Staging" appears on the dashboard. **(Backend Verification):** A corresponding `Component` entity for this application is created in the Backstage catalog, owned by Chloé's user ID.

3.  **API Subscription:**
    *   **Action:** Navigate to the application's detail page and subscribe to the "Payments Product" on the "Free Tier" plan.
    *   **Expected Outcome:** The subscription is processed successfully. **(Backend Verification):** A `consumer` is created in the API Gateway, and an ACL is applied linking the consumer to the "Free Tier" plan.

4.  **Credential Retrieval:**
    *   **Action:** Navigate to the "Credentials" section for the "FashioTech Staging" application.
    *   **Expected Outcome:** Two distinct keys ("Test Key" and "Live Key") are displayed. A warning about the one-time visibility of the Live key is shown. After dismissal, the Live Key is masked.

5.  **Verify New Key Functionality:**
    *   **Action:** Use the newly generated "Test Key" to make an API call to the `POST /v1/payments/intents` endpoint.
    *   **Expected Outcome:** The request succeeds with a `201 Created` response.

### **Acceptance Criteria:**

*   [ ] The user can complete the entire journey from registration to key generation without any human intervention.
*   [ ] The user account and application are correctly created in Keycloak and the Backstage catalog, respectively.
*   [ ] The generated API keys are unique, functional, and correctly provisioned in the gateway with the right permissions.
*   [ ] The "one-time secret reveal" security best practice is correctly implemented.
*   [ ] The UI clearly distinguishes between Test and Live keys.

---

## **Journey 3: The Internal API Product Team - Governed, Multi-Modal API Creation**

**User Story:** As an Internal Developer (David), I want to use a standardized template to scaffold a new microservice that exposes both a synchronous (REST) and an asynchronous (event) API, and have the platform handle governed deployment, security policy enforcement, and observability, so that I can focus on business logic.

### **Preconditions:**

*   David is an authenticated user in Backstage with access to the Scaffolder.
*   A "Node.js Event-Driven Microservice" template exists in the Scaffolder.
*   CI/CD pipelines and a Grafana dashboard template are configured.

### **Test Steps & Expected Outcomes:**

1.  **Scaffolding the Service:**
    *   **Action:** In Backstage, use the "Node.js Event-Driven Microservice" template to generate a new service named `user-profile-service`.
    *   **Expected Outcome:** A new GitHub repository is created. It contains a Node.js project, a `Dockerfile`, and two catalog files: `user-profile-api.yaml` (kind: API, spec: openapi) and `user-events-api.yaml` (kind: API, spec: asyncapi). Both APIs immediately appear in the Backstage catalog.

2.  **API Contract Validation:**
    *   **Action:** Open a Pull Request with an intentional syntax error in the `user-events.asyncapi.yaml` file.
    *   **Expected Outcome:** The CI pipeline **must fail** at the "Lint & Validate" step, reporting an error in the AsyncAPI file. After fixing the error, the pipeline must pass.

3.  **Internal API Deployment:**
    *   **Action:** Merge the valid Pull Request into the `main` branch.
    *   **Expected Outcome:** The CD pipeline deploys the service. The `gateway-controller` detects the `user-profile-api` entity and configures an internal-only route on the gateway.

4.  **External API Release via Governed Approval:**
    *   **Action:** In the Backstage UI for `user-events-api`, "Request Promotion to Production." As a Product Manager, navigate to the "Governance" dashboard and "Approve" the request.
    *   **Expected Outcome:** Only after approval, the `gateway-controller` configures the public-facing route. **(Backend Verification):** The controller also ensures the corresponding OPA policy for this endpoint is active, enforcing security rules. The API now appears in the external Partner Portal.

5.  **Verifying Multi-Modal Visibility & Observability:**
    *   **Action:** As David, navigate to the `user-profile-service` page in Backstage.
    *   **Expected Outcome:**
        *   The page shows that this service **Provides** two APIs: "user-profile-api" and "user-events-api."
        *   The documentation tab for the event API correctly renders the **AsyncAPI specification**.
        *   A new "Observability" tab is present. Clicking it displays an **embedded Grafana dashboard** showing initial performance metrics (latency, request count) for the `user-profile-api`.

### **Acceptance Criteria:**

*   [ ] The Scaffolder correctly generates artifacts for both OpenAPI and AsyncAPI specifications.
*   [ ] The CI/CD pipeline correctly validates both types of API specs as a quality gate.
*   [ ] The external API is **not** publicly exposed until it passes a formal, role-based approval step.
*   [ ] The approval workflow correctly triggers both gateway routing configuration and **OPA policy enforcement**.
*   [ ] The Backstage UI provides a unified view of the service, its multi-modal APIs, and its real-time operational metrics via an embedded Grafana dashboard.