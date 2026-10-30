# Guild ornaments

Original, hand-authored SVG/CSS artwork for Guild of Wits, 29 October 2026.

- guild-sigil.svg: a guiding star above three formation stones in a shield; used as the guild crest and recruitment engraving.
- guild-seal.svg: the same device pressed into an irregular chestnut wax seal; used on commissions and the Daily invitation. Its outline is a deterministic combination of small sinusoidal radius variations, with no raster filters or external dependencies.
- formation-sigil.svg: three engraved formation pieces; used beside the daily board heading.
- ribbon-trim.svg: an original repeating silver dot-and-lozenge braid for the blue heading ribbons.
- Roomy blue ribbons on page, section and chapter headings combine CSS shapes with the vector braid, keeping pale-grey localized text and external focus outlines intact. Only the decorative background is clipped; its layers ignore pointers.

The set is decorative. SVGs load through CSS backgrounds, pseudo-elements ignore pointers, and semantic labels remain independent of the ornamentation. No font, script, animation or third-party asset is embedded.

- slot-lock-v1.png: generated brass padlock for Daily slot locks; transparent 96px runtime PNG displayed at 24px. Built-in image_gen original and exact prompt: ../../art-source/icons/slot-lock-v1.png and slot-lock-v1.json.

- slot-lock-steel-v2.png and slot-unlock-steel-v2.png: matching generated steel closed/open padlocks, replacing the brass runtime control. Transparent 96px assets displayed at 20px over the portrait top edge, inside a 32px control. Originals and exact built-in image_gen prompts: ../../art-source/icons/steel-locks-v2.json.
