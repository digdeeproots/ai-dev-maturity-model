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

## Interpretations and Findings

### The Second Axis

The existing model has one primary axis: agency (who acts / who decides what happens next). Arlo is proposing a second primary axis whose domain is **how correctness is assured** — specifically, who or what bears the burden of catching and preventing mistakes. Working name needed. Candidates: "correctness assurance," "verification delegation," "safety delegation." The axis runs from "human vigilance bears all correctness burden" to "deterministic systems bear all correctness burden (within bounded scopes)."

The second axis is not the same as the first:
- Agency axis: who performs the work
- Second axis: who/what catches mistakes in that work

You can transfer work without transferring correctness assurance. That's the vigilance trap: agency transferred, vigilance not.

### The 2D Grid and the Safe Path

The safe path is a narrow diagonal through the grid. The dangerous region is large. Falling off the safe path means you've transferred more agency than your correctness assurance can cover — the result is vigilance toil you cannot actually sustain, leading to compounding defects and maintenance cost.

Key constraint: human executive function cannot scale vigilance. Even a small sustained vigilance requirement will eventually fail. The only stable states are those where correctness assurance has been transferred to a system that doesn't fatigue.

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

### Narrow Deterministic Tools as the Primary Safety Mechanism

The refactoring tool example is precise: a refactoring tool can make extract-method incorrect in design terms (wrong choice) but never incorrect in behavior terms (the code still works, reversibly). This separates two correctness domains:
- **Execution correctness** (does it do what it attempts safely): can be made zero-risk via deterministic tools
- **Design correctness** (is this the right thing to attempt): requires human judgment or different mechanism

This distinction is important: you cannot make all correctness zero-risk at once. You stack zero-risk zones by domain. The goal is to bound the remaining non-zero-risk area to where human judgment actually applies.

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

The matrix needs to be audited with this lens and missing items added. The "correctness-assurance" side of each pair is what needs to be transferred from human vigilance to a system — and identifying where it transfers to (deterministic code, non-deterministic AI with a checker, automated evaluation, etc.) is the core of the second axis.

### Delegating Vigilance to Non-Deterministic Code

Possible but limited. Delegating vigilance to a non-deterministic system (an AI evaluator) reduces vigilance load but does not eliminate it — you still need to check the checker. This is only viable when:
1. The domain being supervised is small (so human spot-checks are tractable)
2. There is a way to guard the guardian (some form of meta-evaluation)

The fully stable state is deterministic correctness assurance, not AI-evaluated correctness assurance.
