# AI-Read Project Roadmap

Welcome to the **AI-Read** development roadmap. This document outlines our strategic phases to transition from a functional prototype to a premium, AI-powered reading assistant.

---

## 🏗️ Phase 1: Code Refactoring & Architecture Optimization
_Status: In Progress_

The primary goal of this phase is to establish a robust and maintainable foundation by modularizing complex components and entry points.

- [ ] **Modularize `page.tsx`**:
  - [ ] Move **Visitor & Plan Initialization** logic to dedicated hooks or context managers.
  - [ ] Extract **User Free Trial Sync** logic into a custom hook.
  - [ ] Refactor **`handleFileChange`** into a specialized file upload hook.
- [ ] **Refactor `Reader.tsx`**:
  - [ ] Decompose the 500+ line component into a modular directory structure (`src/components/Reader/`).
  - [ ] Extract **Zoom & Navigation Controls** into isolated components.
  - [ ] Move **Reading & Highlighting Glue Logic** into specialized sub-hooks.
  - [ ] Isolate **Card Rendering** (Translation, Explanation, Summary) into a cleaner layout component.
- [ ] **State Management Review**: Optimize data flow and reduce prop drilling.
- [ ] **Maintenance Hardening**: Improve internal documentation and standardize coding patterns.

---

## 🐛 Phase 2: Bug Resolution & Stability
_Status: Upcoming_

Addressing critical functional issues and ensuring a seamless user experience.

- [ ] **Premium Voice Issues**:
  - [ ] **Test Button Failure**: Fix the "Read" button in the Settings menu when the Premium text-to-speech type is selected.
  - [ ] **Random Cut-off**: Resolve the issue where the Premium voice stops reading after a few sentences, while the Basic voice continues normally.
- [ ] **General Stability**:
  - [ ] **Comprehensive Bug Audit**: Identify and document existing UI/UX inconsistencies and logic errors.
  - [ ] **System Hardening**: Ensure the application remains stable under various reading loads.
  - [ ] **Performance Tuning**: Optimize page loads and translation speeds.

---

## 🧪 Phase 3: Regression & Fix Verification
_Status: Future_

Ensuring the stability of the new architecture and the success of bug fixes.

- [ ] **Refactor Validation**: Verify that splitting components didn't introduce UI or state regressions.
- [ ] **Bug Fix Verification**: Intensive testing of the Premium voice engine across different books and languages.
- [ ] **UI/UX Audit**: Ensure navigation and controls remain intuitive after modularization.

---

## 🔄 Phase 4: Synchronized Reading Experience
_Status: Research_

Transitioning from heuristic-based animations to precise, event-driven synchronization between audio and visuals.

- [ ] **Event-Driven Progress**: Replace `setInterval` logic with real-time word boundary events from the TTS engines.
- [ ] **DOM Mapping**: Efficiently map TTS character offsets to PDF viewer text layer elements.
- [ ] **Smart Auto-Scrolling**: Implement "active element centering" to ensure the text being read is always visible.
- [ ] **Premium Timing Research**: Investigate API support for word-level timestamps to bring the same precision to premium voices.

---

## 🤖 Phase 5: AI-Integrated Reading Interface
_Status: Future_

Empowering users with contextual AI assistance directly within the reading flow.

- [ ] **AI Chat Interface**: Implement a dedicated sidebar or overlay for AI conversations.
- [ ] **Contextual Awareness**: Allow users to ask questions about specific chapters, characters, or concepts.
- [ ] **Smart Summaries**: AI-generated summaries for quick revision of previous sessions.

---

## 📚 Phase 6: Personalized Words Library
_Status: Future_

A central hub for vocabulary growth and knowledge retention.

- [ ] **Words Repository**: A dedicated dashboard to view all saved words and phrases.
- [ ] **Enhanced Translations**: Integration of multiple translation engines for accurate context.
- [ ] **Contextual Explanations**: Store original sentences for better learning.
- [ ] **Export & Review**: Tools to export saved data or use flashcard-style review modes.

---

## 🔬 Phase 7: Final Comprehensive Testing Suite
_Status: Future_

Ensuring long-term reliability of the full feature set.

- [ ] **Unit Testing**: Core utilities and text processing logic.
- [ ] **Component Testing**: UI components (Reader, Navbar, Modals).
- [ ] **Integration Testing**: Flow between Auth, Plan, and Book management.
- [ ] **E2E Testing**: Automated user journeys (uploading, reading, saving words).

---

> [!NOTE]
> This roadmap is a living document and will be updated as we prioritize features and complete development milestones.
