# Vigilance Axis Brainstorm
*Word vomit from Arlo, 2026-05-20. Cleaned for readability; order and words preserved.*

---

## Transcript (Near-Verbatim)

There may be a second primary axis. I believe the model becomes two-dimensional. In that two-dimensional grid, there are a small number of safe spaces and a large number of dangerous combinations that fail for various reasons. The goal is to remain on the path of safe spaces. If you fall off the path, you end up paying exorbitant amounts of vigilance toil — which you can't actually pay. You can't remain that vigilant; executive function is too limited. The result is increasing maintenance costs and defects. If you do stay on that path, you're able to manage those maintenance costs smoothly and cleanly.

The key to being able to stay on the path is to ensure that you always have a known risk-free class of checks. This is where the concept of "low risk is not the same as zero risk within a bounded scope" comes from. You need to create bounded scopes which you can guarantee are entirely safe — and then once you have that, you can apply vigilance in the remaining areas, where you can actually afford to do so. You do the lower-risk things in those other areas, but it's key to segment off large chunks that have zero risk.

I explored a few ideas in the talk about some of the ways to create things that have zero risk. The key elements there are intentionally engineering the universe in which your agent lives — its very brief lifespan. This includes controlling its memory, its context, its perspective, what it can see, the goals it is given. But it also includes controlling its tooling, when it is invoked, and then after it's done, what you do with the results — how you verify them, etc.

Since we're looking for zero risk, verification is generally insufficient. The focus is on how do you get it to do the right thing, and to be doing only one thing, so you can identify when it did the right thing. Optimally that's by controlling its tooling and perspectives such that it is using narrow tools that are deterministic and only allow doing the right thing — at least within certain contexts.

For example, the refactoring tool. You could choose to extract a method when you shouldn't, or when some other approach might be better. But as long as you're using a refactoring tool, the extract method will be done safely and reversibly — you won't introduce any change in behavior. That ensures correctness in the domain of execution of the refactorings, but not necessarily correctness in the domain of picking a good design.

Another element that's important: humans and AIs are optimal in different domains, and these mutually support each other — but you need to leverage that. Humans are really good at abstraction, and once they create a new set of abstractions they can reason using those. AIs are poor at that. AIs are really good at pattern discovery among a vast number of details — at looking at a whole lot of things and seeing what matters or what's related to a particular target. The needle-in-the-haystack sort of problem. Humans are really bad at that.

The result is that if we attempt to apply human vigilance in an area where the problem is fundamentally about discovering relevant facts in a sea of unimportant detail, we will fail — because the AI is able to do that problem better than us, which means it's also able to lie to us, or even malevolently, when it fails we have no hope. So what we have to do is apply determinism in the areas in which AI works very well, and give it those kinds of problems so that it can do them very well, and then translate that all back into the world of abstraction where humans can verify and ground what is correct.

There's often a translation layer: going from human intuition and abstraction zone, down to the sea of details, executing, translating back into abstractions, identifying leaky abstractions, and then verifying result.

Another big element: AI is perfectly willing to do something a million times. Humans try to extract, isolate, and reuse. Extract, isolate, and reuse is the right answer in software pretty much always — but AI won't reach for it. So we need to control its universe so that it sees those opportunities. That means we have to be really pedantic about those and very clear — we have to identify a very narrow goal for it to work with, and then bring in the right thing to reuse into its context.

For example, if we're asking AI to write tests, it will simply write 50 or 100 tests based on its knowledge of how one writes tests. It will use mocks for various object dependencies. It will write literal tests that start from some starting point, take one action, and make a bunch of expect assertions on primitives. It's never going to identify a business concept and verify that. It's never going to create a new assertion method in a more fluent assertion style that can make a business-level assertion. It's rarely going to reach for snapshot-style testing, and when it does, it's not going to format the output — it might filter it, but it won't format. It will just leave it as a big JSON blob. And it's fine with that, because for the AI, seeing every detail is perfect — but for a human, that's impossible to verify.

Similarly, it's always going to use mocks for dependencies. It's never going to think to alter the design to be mock-free, to be verifiable in the absence of those mocks. It won't think to modify the design to eliminate dependencies, won't switch from multiple outbound method calls on an interface to events. So you'll end up having to create various helper objects rather than simply binding to an event. It won't reach for things like the Nullables pattern, Simulators, Hexagonal Architecture ports and adapter stuff. To get all of those, you have to be explicit in providing them in the context.

That's where it's very useful to have deterministic code that is able to provide each of those things — that is able to demand that the AI generate one of those at the right time, and then once it's generated, put it into the standard place where the deterministic code is always going to find it and always include a reference to it in the next command to the AI. Once the AI is told about those, it's really good at reusing them, at identifying how they work, and at designing tests around them. It's also very creative at finding ways to make things testable without mocks, to ensure few and good dependencies — but you have to encourage it to do so. That's not the default.

So these are a bunch of examples. And the thing I believe is that in our overall model, we need to look not just at agency transfer away from the human, but it's important to see what they're transferring to. It's important to distinguish work items that are being transferred, and vigilance/management/verification items — whatever we want to call those — that are also being transferred. I don't think we call them vigilance; they're vigilance when they're handled by a human. So they're maybe verification. They're the second-order items. We need to create a good name for those. And you transfer them from human vigilance to other systems, and we need to identify what those other systems are.

From that I want to create a new version of the model. It still has the zoomed-out big blocks, but then it highlights within each big block the little sparkline grids of all the various attributes that are moving. We want to see all those attributes moving across the entire 2D grid. There are more attributes. Once we think of all the management and correctness ones and split those out, there are going to be more. I'm guessing that the majority of the items we've already identified as attributes are either a work item that's missing at least one corresponding vigilance item, or a vigilance item that's missing at least one corresponding work item. Some of them will be paired up — many-to-many or whatever — and might have both sides, but a lot are going to be missing one side. So we need to look through those and get the right set.

And then we need to start exploring what does the delegation of vigilance look like. Where does it get delegated to, and how? What works at what levels and what doesn't? It is possible to delegate vigilance to non-deterministic code — but in order to do so, you reduce your vigilance, you don't eliminate it. That only works in cases where the thing you're being vigilant over is small, and there's a way to check the checker, to guard the guardian.

---

## Transcript — Corrections and Additions (2026-05-20, second pass)

On non-determinism doing vigilance: non-determinism can do vigilance when combined with abstraction extraction. For example, AI is very good at being given a pattern and then being asked what matches the pattern and what exceptions there are. Especially if you run it twice with slightly different prompts, you can get a good union set of exceptions. And then deterministic code can operate on those. And humans can also watch them.

It can also be very effective to have non-deterministic guardians do verifications that are probabilistic anyway. For example, session-based exploratory testing is a great human technique, best done asynchronously from feature delivery. And when it finds something, then we engineer a deterministic way to prevent errors of that category again. This is a perfect use for non-determinism: it can continually scan for such things, then collaborate with us to abstract the error into a category of error, then collaborate with us to create the deterministic guard to detect it — plus an environment change to make it safer for the implementing AI to be careless and still get it right.

We should definitely bring in the concept of Careless Engineering. We need to be all about creating systems where careless implementors can thrive.

We need a good name for the new second-order thing. It isn't just correctness. Assurance is closer. It is all about sustainability, maintainability. Where the work axis is about doing the one thing we want to do, the other axis is about making it as easy as possible to not do any of the myriad of other unintended things we might do at the same time. The key measure is the degree of ease with which you get extremely high safety — not the degree of safety alone.

Narrow deterministic tools won't always split correctness into those specific domains — execution vs. design. That's just the domain split that refactoring tools provide. As another example, a deterministic planning tool (done well) can ensure consistency in what questions get thought through and how. For example, that you explicitly define points of variation for downstream discovery, or that you explicitly ground it with interview data, or with metrics, or with verification by the right stakeholder. It doesn't verify that the content is fully thought through or that the thinking and grounding for any content item is sufficient — just that you gave an intentional think on each of the elements. Common to both of these examples: the tool gives you a guarantee within a scope, but not a universal guarantee. And this is exactly what we were saying: you decrease vigilance by layering these guarantees to create large vigilance-free zones. Unit tests, linters, compilers with good type systems, and many other tools are also described similarly.

We also want to mention strong ways to use the other elements of the agent's universe to create safety zones. For example, we can command the agent to make specific tests, verify they are failing for the right reason, and then mark each of them as `.skip.until(feature_x_is_done)`. With that command, it won't go off and try to implement. And then we can also give it tools that only allow writes in test files.

Another example is careful memory control. We can have an agent read all the info about a story we're implementing, and then fork it. Now we can have one fork do the work, another fork assess the design, another fork define the correctness criteria, etc. — and we can pit these against each other. We selectively ensure they all share some common memory and past, but are also blind to later individual thinking.

---

## Transcript — Systemic Insights (2026-05-20, third pass)

Several things are true regardless of which model structure we choose. They belong in the general case.

**The immune system metaphor.** Software developers are the company's immune system. Product people are the brain. The brain wants to move forward and try new things — survive the tiger attack, avoid starvation. The immune system wants to ensure health is sufficient to handle whatever tigers may or may not arise. The brain is worried about surviving starvation right now; the immune system is worried about ensuring we don't die of disease. So "it's only a little bit of salmonella; that's why we hired the immune system and continue to feed it" makes sense to the brain. But the immune system sees a big difference between "only a little salmonella; you can probably fight it off" and "actually clean food." Vigilance toil is the immune system spending all its energy fighting preventable infections — which means it has less capacity for novel threats.

**The "no human to blame" dynamic.** At low agency, failures get attributed to individual human error. That fiction is available — you can tell yourself Bob will improve, and fool yourself into believing it. As AI agency increases, the fiction disappears. You can't ask AI to be more careful. External stakeholders raise expectations because the human excuse is gone. Systemic sustainability gaps that were always present become undeniable. The vigilance cost required to meet rising expectations increases.

**The brakes metaphor.** Your speed is not limited by your engine. It's limited by your brakes — how easily you can get to safety. AI capability is the engine. Sustainability is the brakes. You can only go as fast as your brakes allow. Teams obsess over engine (more capable AI, better prompts) while neglecting brakes (sustainability investments). The bottleneck is never where they're looking.

**Vigilance toil without AI — the maintenance trap.** Teams in "100% maintenance mode" or "keeping the lights on" are already in the vigilance trap, with no AI involved. Chronic maintenance is mostly responding to foot-guns — defects, regressions, debt fires — not to a genuinely changing world. The investment in human-universe sustainability (testing recipes, type systems, deterministic builds, planning discipline) is the same solution as AI-universe sustainability. The principle is identical: design for carelessness. There are fewer available levers in a human universe, but the same categories apply: prevention, recovery, detection, abstraction. A team that escapes the maintenance trap via human-universe investment is already partially equipped for AI agency delegation — they've built the brakes.

---

## Interpretations and Findings

### The Second Dimension: Assurance (Sustainability)

The existing model tracks one thing per responsibility: agency (who performs the work). The model is being extended to also track **assurance** for each responsibility: what mechanism ensures the work was done correctly, on a 0–5 spectrum. Working name for this dimension: **Sustainability**.

Assurance is not about degree of safety. It is about **ease of achieving safety**: how hard must an implementor try in order to avoid doing unintended things while doing the intended thing? At one end: every mistake is easy to make and hard to detect. At the other: careless implementors thrive because the environment makes unintended actions structurally difficult or impossible.

The two dimensions are independent:
- Agency: who performs the work
- Assurance: how easily does the environment prevent unintended side-effects of that work

You can transfer work without transferring assurance. That is the vigilance trap: work moved, assurance didn't. The human still has to watch because the environment doesn't prevent mistakes. The model's job is to make this gap visible and actionable for every responsibility.

### The 2D Grid and the Safe Path

The safe path is a narrow diagonal through the grid. The dangerous region is large. Falling off the safe path means you've transferred more agency than your correctness assurance can cover — the result is vigilance toil you cannot actually sustain, leading to compounding defects and maintenance cost.

Key constraint: human executive function cannot scale vigilance. Even a small sustained vigilance requirement will eventually fail. The only stable states are those where correctness assurance has been transferred to a system that doesn't fatigue.

### Vigilance Toil Is Multiplicative, Not Additive

Vigilance toil is not proportional to the rate of new work alone. It is proportional to **new work × existing body of work**. Assurance must protect the existing body from corruption by each new change. The more that already exists, the more expensive each unit of new work becomes to assure.

Consequences:
- **Greenfield:** existing body ≈ 0, so vigilance toil ≈ 0 regardless of throughput. Weak assurance is survivable.
- **Brownfield:** existing body is large, so vigilance toil is large regardless of how fast you're moving. Weak assurance is catastrophic.
- **AI increases the rate of new work; it does not change the existing body.** This is the only mechanism by which AI increases vigilance toil. It explains why AI hits brownfield products disproportionately: the existing body amplifies everything. A team with a large codebase that doubles their throughput via AI has doubled their vigilance toil cost. If their assurance was already marginal, it breaks immediately.

This also explains the "maintenance trap" precisely: teams with large codebases and weak assurance end up in a steady state where most capacity is consumed by vigilance toil (maintenance, defect response) rather than new work. AI doesn't solve this — it makes it worse unless assurance is addressed first.

### Level 5: Guided Correctness (Above Prevention)

There is a level above prevention: the environment guides the originator toward the correct action, making the incorrect action harder to attempt in the first place. Level 4 catches a mistake after it is attempted; level 5 makes the mistake unlikely to be attempted because the correct path is easier.

Examples:
- A refactoring tool that trivializes extract-method while ensuring behavioral safety as you go. You don't try to do an unsafe refactoring and get caught — you use the tool and the correct action is the easy action.
- A language server that finds all references using the compiler. You don't search and miss some — you ask and get all of them, every time.

Level 5 reaches zero vigilance within scope AND improves the quality and ease of work simultaneously. It is the "careless engineering" ideal: the right thing is the easiest thing.

### Scope Precision Scales with Assurance Level

Every assurance level has a scope, but the precision with which you can describe that scope increases at higher levels.

- Level 5/4: scope is fully definable — "100% guaranteed for this class; no false positives for anything else"
- Level 3: gaps are predictable — you know which categories are entirely missed; coverage is consistent within covered categories
- Level 2: coverage is statistical — you can estimate it but not specify it; gaps are unpredictable
- Level 1: scope is "whatever the reviewer happened to notice today"
- Level 0: no scope

The goal of moving up the spectrum is not just fewer errors — it is increasing the precision with which you can describe what is and is not covered. Precise scope description is what makes assurance trustworthy rather than merely hopeful.

**Level 2 can be broader than level 3:** A non-deterministic system finds different things on different runs; multiple runs accumulate catch rate, potentially exceeding any fixed deterministic check. The trade-off: level 3 has predictable gaps (you know which categories it misses entirely), while level 2 has unpredictable gaps (misses things everywhere, no pattern). Use level 2 to discover new categories, then encode those discoveries as level 3 or 4 mechanisms.

### The Error Visibility Criterion for Prevention (Level 4)

The key criterion for whether a mechanism is level 4 (prevention) is: **does the error propagate past the originator?** Not: does it happen before or after code is written.

A type system or theorem prover runs after code is written — but if it runs immediately, before any other agent or human sees the output, and is enforced by deterministic workflow code, then the error cannot propagate. The originator cannot produce visible output with that class of error. That is prevention, not detection.

The escape hatch matters: if the worker can bypass the mechanism (casting to `any`, disabling the check, skipping the workflow step), the level drops. Prevention requires that bypassing is itself prevented or detectable.

This means: type systems, theorem provers, AST-only refactoring tools, and constraint-enforcing workflow gates are all level 4 — even though they operate "after" code generation. Tests and linters are level 3 — they detect known classes deterministically but cannot prevent novel problems and do not prevent propagation to others who might see the code before checks run.

Level 3 and level 2 are more similar than they appear: both are probabilistic in coverage (only known classes or probabilistic detection). Level 3's advantage is precision and reliability for what it covers, not breadth.

### The Zero-Risk Threshold

"Low risk" requires vigilance (some fraction of the time, something goes wrong and you need to catch it). "Zero risk within a bounded scope" does not — once you've engineered a class of mistakes out of existence, you spend nothing on them. The goal is to accumulate zero-risk zones so the vigilance budget is spent only where it must be.

This is why the engineering move is **bounding** rather than **improving**: don't make the agent less likely to do the wrong thing — define a scope within which doing the wrong thing is impossible.

### The Agent's Universe as the Design Surface

The things you can control to create zero-risk zones:
- **Memory**: what the agent can recall, for how long, from where
- **Context**: what information is surfaced to the agent at invocation
- **Perspective / what it can see**: what it perceives as the relevant world
- **Goals**: how narrowly or broadly the task is scoped
- **Tooling**: what operations are available (and what isn't available)
- **Invocation timing**: when in a workflow the agent is called
- **Result handling**: what happens downstream (verification, deterministic expansion, etc.)

Verification after the fact is insufficient for zero risk. The focus is on upstream universe design.

### Layered Scoped Guarantees (Not Universal Correctness)

The refactoring tool example shows one pattern: the tool guarantees execution correctness (behavioral safety, reversibility) within its scope, but says nothing about design correctness (whether this was the right move). Two named domains.

But the general pattern is broader: **each deterministic tool gives a guarantee within its scope, not a universal guarantee.** The scope and domain of the guarantee varies by tool type:

- **Refactoring tools**: guarantee behavioral safety of the transformation; don't guarantee design quality
- **Deterministic planning tools** (done well): guarantee that each required element of thought was addressed (variation points named, grounding source identified, stakeholder named); don't guarantee the content is sufficient or correct
- **Type systems / compilers**: guarantee type-level consistency; don't guarantee behavioral correctness
- **Linters**: guarantee style or structural rules; don't guarantee logic correctness
- **Unit tests**: guarantee the tested behavior at the tested inputs; don't guarantee coverage or design

The move is to stack these scoped guarantees so they cover large areas of the mistake space. Each tool eliminates a class of mistakes. Stacked, they create large vigilance-free zones. The remaining gap — where no tool gives a guarantee — is where human attention is required and can actually be afforded.

This is the mechanism for moving along the assurance axis: not one magic tool, but progressive accumulation of scoped guarantees that shrink the vigilance-required zone.

### Human/AI Complementarity as a Structural Property

| Domain | Human | AI |
|--------|-------|----|
| Abstraction creation and reasoning | Strong | Weak |
| Pattern discovery in vast detail | Weak | Strong |
| Verification in abstraction space | Strong | Cannot reliably |

This is not just a capability observation — it determines where vigilance fails. Applying human vigilance to a detail-discovery problem doesn't just fail slowly; it fails invisibly, because the AI can generate plausible-sounding detail that the human cannot independently verify. The human has no ground truth to check against.

The architectural implication: AI should not be in a position where its output must be verified in detail space by a human. The output must be translated back to abstraction space before humans verify it.

### The Translation Layer

A recurring structural pattern: human abstraction zone → (translate down) → AI working in detail space → (translate up) → abstraction output → human verifies → identifies leaky abstractions. Deterministic code often handles both translation steps. The AI works in the middle.

This is a concrete architectural pattern worth naming and modeling explicitly.

### AI's Structural Tendency to Repeat Rather Than Abstract

AI will perform an operation a million times rather than extract-isolate-reuse. This is not a capability gap; it's a structural default. AI doesn't experience the fatigue or the cognitive load that makes repetition costly to humans — so it doesn't feel the pressure to abstract.

The engineering response: the deterministic orchestration layer must surface reuse opportunities and bring them into context explicitly. Once AI is given the abstraction (the pattern, the helper, the assertion method, the architecture), it uses it well. It won't reach for it on its own.

Concrete examples from the word vomit:
- Tests: writes primitive assertion tests; won't invent fluent assertion DSLs, business-concept verifiers, well-formatted snapshots
- Dependencies: always uses mocks; won't redesign for mock-free testability, won't switch to events, won't reach for Nullables/Simulators/Hexagonal Architecture ports
- What works: once the deterministic layer deposits a Nullables implementation into a standard location and references it in every invocation, AI will use and build on it reliably

### The "Work" / "Second-Order" Distinction in the Responsibility Matrix

The existing responsibility matrix has ~21 items. Arlo's hypothesis: most of them are either:
- A **work item** missing a corresponding **correctness-assurance item**
- A **correctness-assurance item** missing a corresponding **work item**

The matrix needs to be audited with this lens and missing items added. The "correctness-assurance" side of each pair is what needs to be transferred from human vigilance to a system — and identifying where it transfers to (deterministic code, non-deterministic AI with a checker, automated evaluation, etc.) is the core of the second axis.Expe

### Non-Deterministic Vigilance: When It Works and How

Non-determinism can carry vigilance load, but not in all cases. It works in two patterns:

**Pattern 1: Pattern-matching + exception enumeration.** Give the AI a pattern, ask what matches and what doesn't. Run it twice with different prompts; take the union of exceptions found. Deterministic code acts on the exception set. Humans review the abstracted exceptions, not the raw detail. This works because: (a) pattern-matching in detail space is where AI is strong, (b) the output is translated to abstraction space before humans see it, (c) false positives are manageable at the abstract level.

**Pattern 2: Probabilistic verification + escalation cycle.** Some verification is inherently probabilistic anyway (exploratory testing, anomaly detection). A non-deterministic agent continually scans. When it finds something, the cycle is: detect → abstract the error into a category → collaborate to design a deterministic guard → create an environment change that prevents the category of mistake. The non-deterministic agent's output bootstraps a deterministic improvement. Over time, the vigilance-free zone expands.

**When non-deterministic vigilance doesn't work:** when the domain requires precise, universal guarantees. A non-deterministic checker can miss things; it reduces vigilance load but doesn't eliminate it. This is only stable when the supervised domain is small enough that residual risk is acceptable.

The general principle: non-deterministic vigilance is a **bootstrap mechanism** for creating deterministic guards, not a permanent substitute for them.

### Observability: You Don't Know Where You Are

The dangerous property of low assurance with high agency is that you feel safe until you're not. Vigilance toil builds slowly; defects appear later; the relationship between choices and outcomes is delayed and indirect. Teams consistently misplace themselves on the assurance spectrum — usually too optimistically.

This means the model needs to surface **leading indicators**, not just describe stable states. What signals tell you a gap is widening before the defects arrive? What does early-stage maintenance burden look like vs. late-stage? The model is incomplete without an answer to "how do I know where I actually am?" Arlo confirmed this needs to be much more visible in the model.

Candidates for leading indicators: rate of unplanned maintenance work, time to diagnose a defect, frequency of "it worked last time" surprises, how often team members reference tribal knowledge rather than written assurance mechanisms.

### Temporal Dynamics: Portfolios Grow and Decay

The rate at which you expand your zero-risk portfolio matters as much as your current position. A team adding one new scoped guarantee per week compounds to massive coverage. A team that makes a large investment once then coasts will find their guarantees decaying — tools become stale as the codebase evolves, contexts drift, patterns are abandoned when the person who built them leaves.

Two forces drive this:
- **Growth**: discrete investments each eliminate a class of mistakes; compounding over time is substantial
- **Decay**: discipline-based mechanisms (human review recipes, testing habits) decay fast; tooling-enforced mechanisms decay slowly; structurally enforced mechanisms don't decay at all

This is another reason to prefer higher-level assurance mechanisms: levels 4–5 are structurally enforced and decay-resistant. Level 1 (human review) decays as soon as attention lapses or a team member changes. The decay profile is an underrated property of any assurance investment.

Arlo's framing: focus on the specific vigilance toil people face today, incrementally segment pieces out into zero-risk zones, and when a zone is made safe enough it *unlocks* the next level of work delegation. Progress is real and visible, zone by zone.

### Careless Engineering

"Careless Engineering" names the discipline: designing systems — tools, environments, workflows, agent worlds — so that careless implementors (human or AI) can thrive. Not making implementors more careful. Making carelessness safe.

This applies identically to:
- Human developers (safeguarding, zero-bugs practices)
- AI agents (orchestration design, tool narrowness, universe control)
- AI agents supervising AI agents (non-deterministic vigilance + abstraction extraction)

The measure of success is not "how safe is this?" but "how careless can the implementor be and still succeed?"

### Universe Design Mechanisms — Detailed

For each element of the agent's universe, at least two mechanisms for creating safety zones (both correct-action and guardian patterns):

**Tooling**
1. *Restrict write access by file type* (only test files, only plan files, not production code). Makes it structurally impossible to corrupt production code while doing test work. Correct-action pattern.
2. *AST-based refactoring tools only* (no edit-file). Every code change is behaviorally safe by construction. Correct-action pattern.
3. *Planning tool that enforces thought structure*. Guarantees variation points named, grounding identified — without judging content quality. Correct-action pattern for thought discipline.

**Context (what information is surfaced)**
1. *Inject the canonical reuse target explicitly*. If a Nullables implementation exists, include a reference to it and its interface in every test-writing invocation. AI will use it; it won't discover it on its own.
2. *Scope to only relevant files*. Reduces the space of things the agent can accidentally affect or be distracted by.
3. *Include prior forks' outputs as read-only context*. A design-critique fork's findings can be surfaced to the implementation fork without merging their thinking processes.

**Memory (what the agent can recall)**
1. *Fork at a known stable point*. Have the agent read the full story brief, then fork. Each fork specializes: one implements, one assesses design, one defines correctness criteria. They share the pre-fork memory but are blind to each other's subsequent thinking.
2. *Inject reference implementations into memory before invocation*. The deterministic layer deposits a generated artifact (e.g., a Nullables stub) into a standard location; subsequent invocations reference it in context so AI "knows" it exists.
3. *Selective amnesia*. Two forks see the same starting memory; after forking, each is blind to the other's discoveries. Pit their independent outputs against each other for disagreement detection.

**Goals / Invocation Timing**
1. *Narrow goal + skip markers*. Command the agent to write specific tests, verify each is failing for the right reason, and mark each `.skip.until(feature_x_is_done)`. The skip prevents premature implementation attempts; the failing-for-right-reason check guards against accidentally-passing tests.
2. *Invoke after deterministic pre-processing*. Don't invoke the AI until deterministic code has prepared the scaffold, selected the reuse target, and scoped the context. The AI's task is smaller and better-defined.
3. *Sequence forks by role*. Invoke the criteria-fork before the implementation-fork; pass criteria as read-only context to implementation. Implementation is constrained by what criteria-fork decided.

**Result Handling**
1. *Deterministic expansion*. AI produces a seed (a migration definition, a test skeleton, a plan node). Deterministic code expands it into the full artifact following known patterns. AI's surface area is small; the expansion is guaranteed correct.
2. *Union from multiple runs*. Run the same analysis twice with slightly different prompts; take the union of outputs. Guards against single-run blind spots. Still non-deterministic, but higher coverage with bounded effort.
3. *Normalize into standard location before next invocation*. Whatever the AI produces goes through a deterministic normalization step before it becomes part of the context for the next invocation. This prevents garbage-in propagation across turns.
