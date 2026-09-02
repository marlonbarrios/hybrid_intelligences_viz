---
pageTitle: Hybrid Intelligences: Ontology, Knowledge Graph, and Cognitive Assemblage
eyebrow: Essay 3
title: Hybrid Intelligences: Ontology, Knowledge Graph, and Cognitive Assemblage
author: Marlon Barrios Solano
date: September 2, 2026
footer: Hybrid Intelligences · University of Florida · Essay 3
output: essay-3.html
pdf: essay-3-ontology-knowledge-graph.pdf
otherEssay: essay.html
otherEssayLabel: Essay 1
---
<!-- Edit this file, then run: node build-essays.js -->
<!-- Concept links: [coupling](concept:coupling) → network.html#coupling -->
<!-- Rebuild HTML + PDF: node build-essays.js --pdf -->

::: figure
![The Hybrid Intelligences radial network: concentric rings of concepts around a central hub. One visual interface into the knowledge architecture, not the ontology itself.](screenshots/network.jpg)

The radial network is one visual and navigational interface · not the ontology itself
:::

In [Hybrid Intelligences](concept:hybrid), I am developing an evolving knowledge architecture that combines a computational [ontology](concept:ontology_kb), a knowledge graph, artistic research, [network visualization](concept:network_viz), and [generative AI](concept:gen_ai) interfaces. Together, these components form an experimental [cognitive assemblage](concept:assemblage) through which I investigate intelligence as [coupling](concept:coupling) across bodies, technologies, institutions, environments, and worlds.

I use the term ontology deliberately. In knowledge representation and artificial intelligence, an ontology is not simply a collection of keywords, concepts, or visualizations. It provides a formal and machine-readable way of specifying entities and concepts within a domain, their categories, properties, and relationships.

The [Hybrid Intelligences Hub](concept:hi_hub) currently contains 236 concepts and 2,361 relationships. These concepts and relationships are not only displayed through a network visualization; I also represent them through Semantic Web and knowledge-representation standards, including SKOS, JSON-LD, RDF/Turtle, and OWL.

The project publishes several machine-readable representations of this knowledge architecture:

::: cluster
- ontology.jsonld
- ontology.ttl
- ontology.owl.ttl
:::

Within the OWL representation, I define hi:Concept as a superclass and organize concepts through classes such as:

::: cluster
- hi:ProgramConcept
- hi:OrganizationConcept
- hi:PremiseConcept
- hi:PracticeConcept
- hi:TensionConcept
- hi:QualityConcept
- hi:PhenomenonConcept
- hi:DomainConcept
- hi:FrameworkConcept
- hi:AuthorConcept
:::

I also define object properties, datatype properties, domains, ranges, subclasses, and relationships between entities. In this sense, the project goes beyond producing a visualization of interconnected ideas. I am engaging directly with practices of ontology engineering and computational knowledge representation.

## Three interconnected layers

I understand the current architecture of Hybrid Intelligences as operating across three interconnected layers: a concept scheme or knowledge organization system, a knowledge graph, and a formal ontology.

At the level of knowledge organization, I use SKOS structures such as skos:ConceptScheme, skos:prefLabel, skos:definition, skos:broader, skos:inScheme, and skos:topConceptOf. These allow me to define concepts, descriptions, categories, and conceptual hierarchies in a structured and machine-readable form.

At the level of the knowledge graph, I instantiate hundreds of concepts and connect them through thousands of relationships. The interactive radial network is therefore not the ontology itself. It is one visual and navigational interface into the underlying knowledge architecture.

The OWL layer extends this further by formally defining classes, subclasses, object properties, datatype properties, domains, ranges, and individuals. This is where Hybrid Intelligences becomes an ontology in the stronger sense associated with Semantic Web technologies and computational knowledge representation.

I therefore understand the architecture approximately as:

::: cluster
- Ontology → Knowledge Graph → Interfaces
:::

But the actual research process is recursive rather than linear:

::: cluster
- Essays + artistic research → Ontology → Knowledge Graph → Network / Voice / Image / Mini-pod / Enact → New research → Ontology
:::

The system continually feeds back into itself.

## From associations to semantic relationships

One of the next stages of my research is to make the relational structure of the ontology more expressive.

Many of the current relationships operate through a relatively general formulation of relatedness plus relational weight. This has been useful for constructing and navigating the network, but I am increasingly interested in asking not only whether two concepts are connected, but *how* they are connected.

Instead of representing a relationship primarily as:

::: term-list
- Embodiment → relatedTo → Cognition
:::

I want to investigate semantically differentiated relationships such as:

::: term-list
- embodiment → enables → cognition
- tool → mediates → cognition
- practice → cultivates → capacity
- institution → constrains → practice
- technology → participatesIn → assemblage
- concept → critiques → concept
- author → proposes → framework
- artwork → instantiates → concept
- essay → develops → concept
- practice → enacts → concept
- AI system → mediates → relation
:::

This shifts the research question from:

What concepts are connected?

toward:

What kinds of relationships produce the assemblage?

I see this as an important next step in developing Hybrid Intelligences from a network of weighted conceptual associations toward a richer relational ontology of cognitive assemblages.

## Questioning fixed categories

This development also raises a productive problem within the ontology itself.

Some of the current top-level categories are represented as mutually disjoint classes. I am interested in reconsidering this structure because the theoretical proposition of Hybrid Intelligences challenges precisely this kind of rigid separation.

A practice might simultaneously function as a framework. An artwork might be a practice, an experiment, a conceptual model, and part of a program. A person might simultaneously operate as an author, participant, facilitator, artist, and researcher.

Rather than seeing this ambiguity as something that needs to be eliminated from the ontology, I am interested in treating it as a research problem.

This leads to a central question:

What would an ontology of cognitive assemblages look like if entities were allowed to occupy multiple functional positions simultaneously?

For me, this question connects the technical construction of the ontology directly with the philosophical and artistic research of Hybrid Intelligences.

## Ontology and generative AI

The ontology also performs a specific function in relation to generative AI.

I do not understand it as training or fine-tuning a [large language model](concept:llm) unless model weights are actually being modified. Instead, the ontology provides a structured knowledge and epistemic context for the language model.

The conversational AI within the Hub is therefore grounded in the Hybrid Intelligences ontology and research framework.

This distinction is important because an ontology and a large language model organize knowledge differently.

An LLM operates through distributed statistical representations learned from very large quantities of language. The ontology allows me to make particular conceptual and epistemic commitments explicit:

::: term-list
- These are the entities I consider relevant.
- These are their definitions.
- These are the categories I am proposing.
- These are the relationships I consider meaningful.
:::

The language model contributes something different: linguistic flexibility, interpretation, conversation, recombination, and generativity.

The resulting assemblage can be understood as:

::: cluster
- formal and semi-formal knowledge structures + probabilistic language models + human interaction + embodied practices + artistic research
:::

This is where the technical architecture of the project intersects with its larger conceptual proposition.

I am not proposing that the [AI](concept:ai) itself is the intelligence.

The ontology is not the intelligence.

The human is not the intelligence.

The network is not the intelligence.

Intelligence emerges through their coupling.

This is the central proposition I am testing through Hybrid Intelligences.

## The Hub as an experimental cognitive assemblage

I therefore describe Hybrid Intelligences as an evolving knowledge architecture combining a computational ontology, knowledge graph, artistic research, network visualization, and generative AI interfaces. Together, these components form an experimental cognitive assemblage for investigating intelligence as coupling across bodies, tools, technologies, institutions, environments, and worlds.

The different components of the Hub—[Ontology](concept:ontology_kb), [Network](concept:network_viz), [Voice](concept:conversational_ai), [Image](concept:concept_image), [Mini-pod](concept:mini_pod), [Enact](concept:enact), [essays](concept:hi_essays), and artistic works—are not separate tools. They are different modes for entering and activating the same evolving knowledge ecology.

Writing feeds the ontology.

The ontology reorganizes the network.

The network and ontology ground conversations.

Concepts become images, voices, audio, and embodied prompts.

Artistic practice enters the assemblage and generates new questions.

Those questions return to the research and potentially transform the ontology.

For this reason, I see the next stage of Hybrid Intelligences not simply as expanding the number of concepts or adding new AI features. I am interested in developing a richer relational ontology of cognitive assemblages, in which relations such as mediates, constrains, enables, embodies, transforms, participates in, emerges from, and critiques become first-class components of the knowledge architecture.

This makes the ontology itself part of my artistic and epistemological research.

Hybrid Intelligences is therefore not simply a project about hybrid intelligence. The architecture, the AI systems, the ontology, my artistic practice, its users, and the institutions within which it develops participate in producing the cognitive assemblage that the project is attempting to understand.

::: closing
Perhaps the Hub is not simply about Hybrid Intelligences.

It is an experiment in becoming one.
:::

## References

1. Bender, Emily M., Timnit Gebru, Angelina McMillan-Major, and Margaret Mitchell. "On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?" In *Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency*, 610–623. 2021.
2. Berners-Lee, Tim, James Hendler, and Ora Lassila. "The Semantic Web." *Scientific American* 284, no. 5 (2001): 34–43.
3. Clark, Andy. *Supersizing the Mind: Embodiment, Action, and Cognitive Extension*. Oxford: Oxford University Press, 2008.
4. Clark, Andy, and David J. Chalmers. "The Extended Mind." *Analysis* 58, no. 1 (1998): 7–19.
5. Deleuze, Gilles, and Félix Guattari. *A Thousand Plateaus: Capitalism and Schizophrenia*. Translated by Brian Massumi. Minneapolis: University of Minnesota Press, 1987.
6. Gruber, Thomas R. "A Translation Approach to Portable Ontology Specifications." *Knowledge Acquisition* 5, no. 2 (1993): 199–220.
7. Guarino, Nicola, Daniel Oberle, and Steffen Staab. "What Is an Ontology?" In *Handbook on Ontologies*, edited by Steffen Staab and Rudi Studer, 1–17. Berlin: Springer, 2009.
8. Hayles, N. Katherine. *Bacteria to AI: Human Futures with Our Nonhuman Symbionts*. Chicago: University of Chicago Press, 2025.
9. Hayles, N. Katherine. *How We Became Posthuman: Virtual Bodies in Cybernetics, Literature, and Informatics*. Chicago: University of Chicago Press, 1999.
10. Hayles, N. Katherine. *Unthought: The Power of the Cognitive Nonconscious*. Chicago: University of Chicago Press, 2017.
11. Hogan, Aidan, et al. "Knowledge Graphs." *ACM Computing Surveys* 54, no. 4 (2021): Article 71.
12. Hutchins, Edwin. *Cognition in the Wild*. Cambridge, MA: MIT Press, 1995.
13. Lewis, Patrick, et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." *Advances in Neural Information Processing Systems* 33 (2020): 9459–9474.
14. Noy, Natalya F., and Deborah L. McGuinness. *Ontology Development 101: A Guide to Creating Your First Ontology*. Stanford Knowledge Systems Laboratory Technical Report KSL-01-05, 2001.
15. Simondon, Gilbert. *On the Mode of Existence of Technical Objects*. Translated by Cecile Malaspina and John Rogove. Minneapolis: Univocal Publishing, 2017.
16. World Wide Web Consortium (W3C). *OWL 2 Web Ontology Language Document Overview*. W3C Recommendation, December 11, 2012.
17. World Wide Web Consortium (W3C). *SKOS Simple Knowledge Organization System Reference*. W3C Recommendation, August 18, 2009.
