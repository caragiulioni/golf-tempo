# Golf Tempo Trainer 

## Technical Project Specification 

Project status: Initial specificationDeployment target: NetlifyApplication type: Client-side web applicationPrimary objective: Create a personalized four-beat golf tempo trainer. 

# 1. Project Overview 

Build a modern, browser-based golf tempo training application inspired by existing products: 

- Golf Tempo 

- Tour Tempo Golf 

- GOLF BPM Swing 

The application will reproduce the core functionality of a traditional three-beat golf tempo trainer, with one important customization: an additional fourth beat representing a smaller movement within the golf swing. 

The additional beat is based on the user's brother's observations while developing his swing mechanics. It is believed to correspond to a small hip movement. 

The application will initially include a temporary configuration interface allowing him to experiment with the placement of this additional beat. 

Once the ideal position has been established, the configuration functionality will be removed and the finalized timing values incorporated into the permanent application. 

## Primary Objectives 

- 1 Reproduce the basic functionality of existing golf tempo applications. 

- 2 Introduce an adjustable fourth beat without changing the timing of the original three beats. 

- 3 Support independent fourth-beat configurations for Long Game and Short Game. 

- 4 Export configuration values for eventual incorporation into the permanent application. 

5 Deliver a polished, responsive, easy-to-use application. 

# 2. Technology Stack 

## Proposed Technologies 

|Technology|Purpose|
|---|---|
|React|Application framework|
|JavaScript|Application and timing logic|
|Material UI (MUI)|UI components and controls|
|Custom CSS<br>Web Audio API|Visual design and branding<br>Accurate audio playback and<br>scheduling|
|Netlify|Static hosting and deployment|
|Architecture||



The application should be entirely client-side. 

No backend, database, authentication, user accounts, or server-side processing are required. 

The application should be organized into distinct functional areas: 

- A. User Interface (React/MUI) 

Responsible for: 

- Tempo selection. 

- Long Game / Short Game selection. 

- Playback controls. 

- Visual timing feedback. 

- Temporary configuration controls. 

- Configuration export. 

- B. Timing Engine (Independent JavaScript Module) 

Responsible for: 

- Calculating beat positions. 

- Managing tempo presets. 

- Maintaining original three-beat timing. 

- Calculating the additional fourth-beat position. 

- Producing the final playback sequence. 

- Supporting independent Long Game and Short Game configurations. 

The timing engine must remain independent of the React interface. 

The interface supplies the selected tempo and configuration values. The timing engine calculates the sequence and provides the timing information required by the audio and visual components. 

This separation allows the interface to be redesigned or modified without affecting the underlying timing functionality. 

# 3. Core Application Functionality 

## 3.1 Tempo Selection 

The application will support two categories. 

Long Game 

- 18/6 

- 21/7 

- 24/8 

- 27/9 

- 30/10 

Short Game 

- 14/7 

- 16/8 

- 18/9 

- 20/10 

- 22/11 

- 24/12 

These presets are based on the reference application and should be verified during implementation. 

The application should make switching between Long Game and Short Game straightforward. 

## 3.2 Original Three-Beat Playback 

The initial playback sequence must reproduce the original three-beat rhythm. 

Requirements: 

- Accurate and consistent timing. 

- Three distinct audio events. 

- Clear visual feedback synchronized with playback. 

- Ability to start, stop, and repeat playback. 

- Tempo selection updates playback accordingly. 

The original three beats are the baseline and must remain unchanged when introducing the additional beat. 

## 3.3 Audio 

Initial implementation should prioritize simple, distinct audio tones. 

Additional playback styles observed in the reference applications include: 

- Voice. 

- String. 

- Bossa Nova. 

These are optional enhancements and are not required for the initial release. 

# 4. Four-Beat Customization 

## 4.1 Concept 

The original three beats are considered correct. 

The objective is NOT to redistribute or modify the timing of those beats. 

Instead, we are introducing an additional sound representing a smaller movement within the swing, believed to be related to hip movement. 

Working hypothesis: The additional beat occurs between the original beats 1 and 2. 

This placement has not yet been confirmed and must remain configurable. 

Conceptually: 

Original: 

- Beat 1 

- Beat 2 

- Beat 3 

Customized: 

- Beat 1 

- Additional Beat 

- Beat 2 

- Beat 3 

The original beats retain their exact positions and timing. 

Only the additional beat is adjustable. 

## 4.2 Temporary CONFIG Mode 

Introduce a temporary CONFIG toggle. 

When enabled, additional configuration controls become available. 

Requirements: 

- Display a slider for positioning the additional beat. 

- Restrict the slider to the interval between beats 1 and 2, subject to confirmation of the working hypothesis. 

- Allow repeated adjustments. 

- Allow playback testing immediately after adjustments. 

- Provide visual feedback showing the additional beat's relative position. 

- Keep the original three beats fixed. 

The configuration interface should be easy to understand and use without technical knowledge. 

## 4.3 Independent Game Configurations 

Long Game and Short Game must have independent fourth-beat settings. 

Adjusting the Long Game configuration must not affect Short Game, and vice versa. 

The configuration system should retain the selected position for each category during the session. 

## 4.4 Timing Representation 

The fourth beat should be stored as a normalized relative position within the interval between beats 1 and 2. 

For example, a normalized value could represent a position along that interval: 

- 0% = immediately at beat 1. 

- 50% = halfway between beats 1 and 2. 

- 100% = immediately at beat 2. 

The actual usable slider range should be restricted to avoid placing the additional beat directly on top of either original beat. 

This allows the position to adapt to different tempo presets without relying on fixed millisecond values. 

The timing engine should calculate the actual playback time from the selected tempo and normalized position. 

# 5. Configuration Export 

The temporary CONFIG interface must include an EXPORT button. 

The purpose is to allow the brother to experiment with the fourth-beat position and send the resulting configuration to the developer. 

## Export Format 

JSON is the preferred format. 

The exported file should contain: 

- Configuration version. 

- Long Game fourth-beat position. 

- Short Game fourth-beat position. 

- Any additional timing metadata required to interpret those values. 

Illustrative structure: 

{"configVersion": 1,"longGame": {"fourthBeatPosition": 0.65},"shortGame": { "fourthBeatPosition": 0.55}} 

Values above are illustrative only. 

The exported configuration will be sent to the developer, who will incorporate the finalized values directly into the application's timing engine. 

No database or remote storage is required. 

# 6. Visual Design and User Experience 

## Design Direction 

Use existing golf tempo applications as functional inspiration, not visual templates. 

The goal is a modern, polished, visually interesting application that feels like a dedicated golf training product. 

Material UI will provide the foundational components, with custom CSS used to establish a distinctive visual identity. 

Potential design elements: 

- Modern typography. 

- Attractive tempo selection controls. 

- Distinct Long Game and Short Game presentation. 

- Custom beat/timeline visualization. 

- Animated playback feedback. 

- Smooth transitions. 

- Clear playback controls. 

- Responsive layout for desktop and mobile. 

The application should prioritize usability and clarity over unnecessary features. 

The temporary CONFIG interface should feel like a natural extension of the application rather than a separate development tool. 

# 7. Timing Engine Requirements 

The timing engine is a central architectural component. 

It should be developed as an independent JavaScript module with no dependency on React or MUI. 

Its responsibilities include: 

- 1 Accept selected game category. 

- 2 Accept selected tempo preset. 

- 3 Accept fourth-beat configuration. 

- 4 Calculate original three-beat timing. 

- 5 Calculate the additional beat's position. 

- 6 Generate the complete playback sequence. 

- 7 Provide timing information to audio and visual components. 

## Important Timing Requirement 

The original three beats must never be recalculated or redistributed as a consequence of adding the fourth beat. 

The additional event is inserted into the existing sequence. 

The engine should also support a three-beat baseline for testing and comparison. 

For accurate audio playback, use an audio-clock-based scheduling approach rather than relying exclusively on JavaScript timers. 

The visual playback should synchronize with the same timing sequence. 

# 8. Development Phases 

## Phase 1 — Foundation 

Establish the basic application. 

- Create React project. 

- Install and configure MUI. 

- Establish custom visual design. 

- Implement Long Game / Short Game selection. 

- Implement tempo presets. 

- Build independent timing engine. 

- Implement original three-beat playback. 

- Implement synchronized visual feedback. 

## Phase 2 — Configuration Mode 

Introduce temporary fourth-beat functionality. 

- Add CONFIG toggle. 

- Add fourth-beat slider. 

- Restrict adjustment to the interval between beats 1 and 2 (pending confirmation). 

- Preserve original beat timing. 

- Support independent Long Game and Short Game configurations. 

- Implement immediate playback testing. 

- Implement JSON export. 

## Phase 3 — Calibration 

Have the brother use the temporary configuration interface. 

- Experiment with fourth-beat placement. 

- Test across different tempo presets. 

- Test Long Game and Short Game independently. 

- Export preferred configurations. 

- Review and refine the resulting values. 

## Phase 4 — Final Application 

Once calibration is complete: 

- Incorporate finalized values into the timing engine. 

- Implement permanent four-beat playback. 

- Remove temporary CONFIG controls. 

- Retain original tempo selection and playback functionality. 

- Complete testing. 

- Deploy final application to Netlify. 

# 9. Testing Requirements 

Before final deployment, verify: 

- All original tempo presets play correctly. 

- Original three-beat timing remains unchanged. 

- Additional beat plays at the configured position. 

- Slider adjustments affect only the additional beat. 

- Long Game and Short Game configurations remain independent. 

- Switching tempo presets preserves the intended relative fourth-beat position. 

- Audio and visual playback remain synchronized. 

- Exported JSON contains the correct configuration values. 

- Application works across desktop and mobile browsers. 

# 10. Open Questions / Decisions Required 

These items remain unresolved and should be clarified during development. 

Q1. Confirm additional beat placement 

Working hypothesis: the additional beat occurs between original beats 1 and 2. 

The brother needs to confirm this. 

Q2. Confirm the physical movement 

What exactly does the additional beat represent in the swing? 

Current understanding: a small movement involving the hips. 

Q3. Confirm placement behavior across tempo presets 

Should the same relative fourth-beat position work across all Long Game presets and all Short Game presets? 

Initial assumption: yes, with independent Long Game and Short Game settings. 

- Q4. Confirm slider range 

How close should the additional beat be allowed to move toward the original beats? This can be determined through experimentation. 

Q5. Confirm final playback preferences 

Are simple audio tones sufficient for the permanent application, or would additional sound options be useful? 

# 11. Project Philosophy 

Keep the application lightweight, self-contained, and maintainable. 

Avoid unnecessary infrastructure and features. 

Prioritize: 

- Accurate timing. 

- Simple configuration. 

- Reliable playback. 

- A polished user experience. 

- Separation between interface and timing logic. 

The ultimate goal is a personalized golf tempo training application that preserves the original three-beat rhythm while introducing a fourth beat to accommodate an additional movement in the user's brother's swing. 

