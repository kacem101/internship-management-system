# PHASE1.md — Implementation Tasks for Coding Agent

**Read `PHASE1_PLAN.md` first for rationale.** This file is the executable checklist — follow it in order, each task should compile before moving to the next. Repo root for backend: `enscs-backend-complete/enscs-internship-backend-fixed/enscs-internship-project`. Base package: `com.enscs.internship`.

Ground rules:
- Do not modify `resumePath`, `reportFilePath`, `dailyLogFilePath` handling — they work today, leave them alone.
- Do not rename `Supervisor` or touch `SupervisorEvaluation`/`EvaluationController`/`EvaluationService`.
- `ddl-auto: update` is already configured — no Flyway/migration scripts needed this phase.
- Every new entity follows the existing conventions in the codebase: Lombok `@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder`, `@EntityListeners(AuditingEntityListener.class)`, `@CreatedDate`/`@LastModifiedDate` where the existing entities use them.
- After each task, run `mvn compile` (or the project's build command) before starting the next.

---

## Task 1 — New enums

Create in `src/main/java/com/enscs/internship/enums/`:

- [ ] `OfferOrigin.java` — `PLATFORM_POSTED, STUDENT_SOURCED`
- [ ] `OfferVisibility.java` — `PUBLIC, PRIVATE`
- [ ] `RequirementStatus.java` — `NOT_STARTED, APPLIED, ACCEPTED_PENDING_CONFIRMATION, CONFIRMED, IN_PROGRESS, REPORT_SUBMITTED, REPORT_VERIFIED, EVALUATED, COMPLETED, OVERDUE_NO_APPLICATION, OVERDUE_NO_REPORT, FAILED`
- [ ] `VerificationStatus.java` — `PENDING, VERIFIED, REJECTED, CONFIRMED, DISPUTED`
- [ ] `AttachmentType.java` — `PROFILE_PHOTO, COMPANY_LOGO, OFFER_ATTACHMENT, ID_VERIFICATION`

Modify existing:
- [ ] `Role.java` — add `COMPANY_CONTACT` to the existing enum values.
- [ ] `ApplicationStatus.java` — add `CONFIRMED`, `WITHDRAWN_AUTO`.

---

## Task 2 — New entities

Create in `src/main/java/com/enscs/internship/entity/`. Match the field lists in `PHASE1_PLAN.md` §2.2 exactly.

- [ ] `Company.java` — table `companies`. Field `name` unique.
- [ ] `CompanyContact.java` — **extends `User`**, table `company_contacts`, `@ManyToOne` to `Company` (nullable=false).
- [ ] `InternshipRequirement.java` — table `internship_requirements`. Add:
  ```java
  @Table(name = "internship_requirements",
         uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "academic_year"}))
  ```
- [ ] `ReportVerification.java` — table `report_verifications`, `@OneToOne` to `InternshipReport` (nullable=false).
- [ ] `Attachment.java` — table `attachments`. No JPA relations — `ownerType` (String) + `ownerId` (Long) as plain columns, per the plan's explicit decision not to use a polymorphic relation.

**Check before writing `CompanyContact`:** open `UserController.java`, `UserServiceImpl.java`, and `UserRepository.java` to confirm how `Student`/`Supervisor`/`Admin` are currently distinguished/queried (single `UserRepository` vs per-role repos). Follow whatever pattern already exists — do not introduce a second pattern.

---

## Task 3 — Modify existing entities

- [ ] `InternshipOffer.java` — add fields:
  ```java
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "company_id")
  private Company company;   // nullable — see PHASE1_PLAN.md §3 for why companyName stays

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OfferOrigin origin = OfferOrigin.PLATFORM_POSTED;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OfferVisibility visibility = OfferVisibility.PUBLIC;

  @Column(nullable = false)
  private Integer capacity = 1;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sourced_by_student_id")
  private Student sourcedByStudent;   // set only when origin = STUDENT_SOURCED
  ```
  Do **not** remove or rename `companyName` / `companyLocation`.

- [ ] `InternshipApplication.java` — add fields:
  ```java
  private LocalDateTime confirmedAt;

  @Column(columnDefinition = "TEXT")
  private String autoWithdrawnReason;
  ```

---

## Task 4 — Repositories

Create in `src/main/java/com/enscs/internship/repository/`:

- [ ] `CompanyRepository extends JpaRepository<Company, Long>` — add `Optional<Company> findByName(String name)`
- [ ] `InternshipRequirementRepository extends JpaRepository<InternshipRequirement, Long>` — add:
  ```java
  Optional<InternshipRequirement> findByStudentIdAndAcademicYear(Long studentId, String academicYear);
  List<InternshipRequirement> findByStatus(RequirementStatus status);
  List<InternshipRequirement> findByStatusIn(List<RequirementStatus> statuses);
  ```
- [ ] `ReportVerificationRepository extends JpaRepository<ReportVerification, Long>` — add `Optional<ReportVerification> findByReportId(Long reportId)`
- [ ] `AttachmentRepository extends JpaRepository<Attachment, Long>` — add `List<Attachment> findByOwnerTypeAndOwnerId(String ownerType, Long ownerId)`
- [ ] If Task 2's check showed dedicated per-role repos exist, add `CompanyContactRepository` following that same pattern. If all roles go through `UserRepository`, add a query method there instead: `List<User> findByRoleAndCompanyContactCompanyId(...)` is not valid JPQL across the inheritance boundary — if this comes up, use a `@Query` on `CompanyContactRepository` directly rather than forcing it through `UserRepository`. Prefer a dedicated `CompanyContactRepository extends JpaRepository<CompanyContact, Long>`.

---

## Task 5 — DTOs

Create request/response DTOs in `dto/request/` and `dto/response/`, matching the existing naming convention (`XxxRequest.java` / `XxxResponse.java`, plain fields, no Lombok builder required unless existing DTOs use one — check `ApplicationResponse.java` for the pattern first):

- [ ] `CompanyRequest` / `CompanyResponse`
- [ ] `CompanyContactRequest` (used by admin to invite a contact — email, firstName, lastName, jobTitle, companyId) / `CompanyContactResponse`
- [ ] `InternshipRequirementResponse` (read-only from API in Phase 1 — no create/update DTO needed yet, creation logic is Phase 2)
- [ ] `ReportVerificationRequest` (status, comment) / `ReportVerificationResponse`
- [ ] `AttachmentResponse` (id, type, path, mimeType, sizeBytes, uploadedAt)

---

## Task 6 — Controllers (scaffolding only — thin, no business rules yet)

Create in `src/main/java/com/enscs/internship/controller/`, following the existing controller style (see `InternshipOfferController.java` as the reference pattern for structure/annotations):

- [ ] `CompanyController` — `@RequestMapping("/api/companies")`
  - `POST /` (ADMIN)
  - `GET /` (ADMIN, SUPERVISOR)
  - `GET /{id}` (ADMIN, SUPERVISOR, COMPANY_CONTACT)
  - `PATCH /{id}/verify` (ADMIN)
  - `POST /{id}/contacts` (ADMIN)

- [ ] `CompanyContactController` — `@RequestMapping("/api/company-contacts")`
  - `GET /me` (COMPANY_CONTACT)

- [ ] `InternshipRequirementController` — `@RequestMapping("/api/requirements")`
  - `GET /me` (STUDENT)
  - `GET /` with optional `status` and `academicYear` query params (ADMIN, SUPERVISOR)

- [ ] `ReportVerificationController` — extend `ReportController.java` rather than creating a new top-level controller if that fits the existing style better (check the file first); otherwise new controller `@RequestMapping("/api/reports")`
  - `POST /{id}/verification` (COMPANY_CONTACT)
  - `GET /{id}/verification` (STUDENT own, SUPERVISOR, ADMIN, COMPANY_CONTACT own company)

- [ ] `AttachmentController` — `@RequestMapping("/api/attachments")`
  - `POST /` multipart upload, `consumes = MediaType.MULTIPART_FORM_DATA_VALUE`, params: `ownerType`, `ownerId`, `type` (any authenticated user)
  - `GET /{id}` (owner or ADMIN)

**For each new service backing these controllers, create an interface in `service/` and an `Impl` in `service/impl/`, matching the existing pattern (e.g. `InternshipOfferService` / `InternshipOfferServiceImpl`). Phase 1 service methods should be simple CRUD — no state-machine logic. Do not implement soft-lock, auto-confirmation-deadline, or overdue-sweep logic in this phase; stub with straightforward save/find calls only.**

---

## Task 7 — Security config

- [ ] Open `SecurityConfig.java`. Add authorization rules for the new endpoints following the existing `.requestMatchers(...)` pattern already used for `/api/offers/**` etc. Use `hasRole("COMPANY_CONTACT")` / `hasAnyRole(...)` per the table in `PHASE1_PLAN.md` §4. Do not restructure the existing rules — only add new matchers.

---

## Task 8 — File-level upload validation for `Attachment`

- [ ] In the new attachment service, validate `AttachmentType` → allowed extensions/max size per `PHASE1_PLAN.md`:
  - `PROFILE_PHOTO`, `COMPANY_LOGO`: jpg/png/webp, 5MB
  - `OFFER_ATTACHMENT`: pdf, 10MB
  - `ID_VERIFICATION`: pdf/jpg/png, 10MB
  Reuse `DocumentStorageService`/`LocalDocumentStorageService` for actual file writing (it already exists and handles storage) — don't create a second storage mechanism. Only add the type-aware validation layer in front of it.

---

## Task 9 — Verify

- [ ] `mvn clean compile` succeeds.
- [ ] Application boots locally (`ddl-auto: update` will create the new tables — confirm in logs or via `\dt` in psql that `companies`, `company_contacts`, `internship_requirements`, `report_verifications`, `attachments` exist).
- [ ] Swagger UI (`/swagger-ui.html`) shows the new endpoints.
- [ ] Existing endpoints/tests still pass unmodified — this phase must be strictly additive.

---

## Explicitly not part of this task list
Soft-lock confirmation logic, `InternshipRequirement` auto-creation per academic year, overdue sweep scheduler changes, self-sourced offer approval flow, report verification business rules (dispute blocking evaluation), ownership-scoped `@PreAuthorize`, refresh token revocation, account lockout, frontend work. All Phase 2/3/4 — do not implement early even if it seems convenient while touching adjacent code.