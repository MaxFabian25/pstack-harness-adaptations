---
name: unslop
description: Cut AI tells and unclear wording from any writing, in any language. Use when asked to remove AI slop, AI tells, em dashes, stock phrasing or "not X but Y" lines, when text sounds AI-generated or a reader has to decode it, and for the words in pages, slides, charts and images, also when a design skill covers their visual side.
disable-model-invocation: true
---

# Unslop

Edit text to remove AI patterns. For a pass over a whole repository, and before a public draft such as a post, thread, reply or email goes to the user for approval, have a fresh reviewer check the text against the current [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) and the [tropes.fyi directory](https://tropes.fyi/directory), because their lists change. When the text promotes or rewrites the author's own published writing, start from their approved sentences rather than writing new ones. Scan for the patterns below, then rewrite. Preserve meaning and match the intended tone. Fix meaning and clarity first, with rules 27 to 34, and the other tells after that. Keep a pattern when removing it would make the sentence less clear or would only swap in a synonym. After the pass, check each rewritten sentence that says "only" or "every", or that sums up another section, against that section.

Rule numbers are stable ids that other skills cite. A removed rule leaves a gap.

3. No trailing "-ing" phrases that add no fact ("highlighting...", "ensuring...").
5. No vague attributions ("experts believe"). Name the source or delete.
36. No inflated stakes or selling. Describe the subject at its real size, and cut a claim that it matters more than the text shows, such as "a pivotal moment for the field". Say what the thing does and for whom: "an all-in-one solution that unlocks unprecedented productivity" becomes "one app for the team's tasks, calendar and notes". Cut "a classic", "famously", "notoriously" and "as we all know", or name the source that shows it is well known.
7. No AI vocabulary: additionally, crucial, delve, enhance, foster, gated (restricted), landscape, load-bearing (important), pivotal, quietly, showcase, testament, underscore, vibrant.
8. Say "is" or "has", not "serves as", "stands as", "boasts", "features".
9. No bare contrast: "not just X, but Y", "X, not Y", or stock limit phrases such as "does not establish". State the point, and restate any limit in plain words so that it stays. After a large pass, compare these counts with human prose of the same genre, because a pass can create a new pattern.
10. Don't force ideas into threes.
11. One name per thing. Repeat it.
12. No "from X to Y" unless X and Y sit on a real scale.
13. No em dashes, en dashes, or hyphens used as dashes, and no parentheses in their place. Use a period or a comma.
14. A colon goes before a list or an example, never mid-sentence as a connector.
15. Don't bold every proper noun or acronym.
16. No bold label and colon that restates its line ("**Performance:** Performance improved..."). A bold lead-in that ends in a period and adds new detail is fine.
17. Sentence case headings. A heading names its subject and doesn't open with Where, What, Why or How: "Where the market is stuck today" becomes "Obstacles in the market".
18. No decorative emojis.
19. Straight quotes.
20. No chatbot phrases ("I hope this helps!", "Let me know if...").
22. No praise or agreement openers. Respond directly.
35. Make the point without announcing or re-arguing it. Cut a sentence that says what the text is about to do, decide or cover, such as "Two constraints shape the design", and keep the constraints. Don't give the count before a list or defend a point nobody questioned. Put a question before its evidence, give the evidence once, and stop when the answer is given. Use a list, or prose that needs no counting, in place of paragraphs that open "The first...", "The second...". Sum up once, for the whole text.
23. Cut filler. "In order to" becomes "to". Delete "it is important to note that".
24. One hedge at most: "may".
25. No generic conclusions. State specific plans or facts.
26. No abstract metaphor nouns: substrate, wedge, vector, nexus, primitive, harness, surface, scaffolding, paradigm, ratchet, north star, flywheel. Use the concrete word.
27. Say what it does, not how it feels. Name the mechanism or the number. Cut a sentence that could appear unchanged in another project's docs. Say what each number measures: "same numbers within 2%" becomes "run times within 2% of each other".
28. One idea per sentence. Split a sentence the reader has to reread. When you split, keep the connectives that carry cause, contrast and sequence, so the sentences still read as one argument rather than a list of claims.
29. Active voice. Name the actor unless it is unknown or doesn't matter.
30. Cut adverbs or use a stronger verb. Give the number.
31. Use the plain word: "use", not "utilize" or "leverage".
32. No metaphor, aphorism, personified code, or figurative verb where a literal phrase exists. "Where the complexity actually lives" becomes the place itself: "most of the branches are in the retry code".
33. Write whole sentences with their articles and verbs. Spell out arrows and abbreviations. Keep "that" at the start of a clause: "Check the token the server sent is valid" becomes "Check that the token that the server sent is valid". Don't turn a noun into a verb for the occasion, such as "calendar it". Replace a phrase you made up for this text, such as "the warm-cache gap", with what it describes.
34. Put the point of a sentence in its main clause, with whoever acts as the subject and what they did as the verb. "Nothing else is waiting on anything but the build, so I'll report once it finishes" becomes "I'll report when the build finishes." A passive-voice scan misses a sentence with no action in it: "the retry logic is now in the client" becomes "I moved the retry logic into the client".
