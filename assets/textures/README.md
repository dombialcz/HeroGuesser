# Guild materials

Generated on 29 October 2026 with the built-in image_gen tool for Guild of Wits.
The exact final prompts and source paths are in GENERATED_TEXTURES.json.

- warm-stone-v1.jpg: fine warm-grey stone, repeated across the entire game background.
- charcoal-cloth-v1.jpg: earlier warm-charcoal linen, retained as an unused source material.
- aged-paper-v1.jpg: warm cotton-rag paper, used on the daily commission and Home's Daily invitation.

Original 1254×1254 PNGs are preserved in ../../art-source/textures/.
The shipped assets are 512×512 JPEGs at quality 78.
Stone repeats at 512 CSS pixels; paper repeats at 384 CSS pixels.
Colour overlays and luminosity blending keep the stone subdued and the paper warm.
The current walnut/parchment theme tints the materials in CSS; the
source files and generation prompts remain unchanged. Existing background
colours remain the fallback; no image controls layout or captures pointer input.

Recreate the optimized copies with macOS sips:

    sips -Z 512 -s format jpeg -s formatOptions 78 art-source/textures/charcoal-cloth-v1.png --out assets/textures/charcoal-cloth-v1.jpg
    sips -Z 512 -s format jpeg -s formatOptions 78 art-source/textures/aged-paper-v1.png --out assets/textures/aged-paper-v1.jpg
    sips -Z 512 -s format jpeg -s formatOptions 78 art-source/textures/warm-stone-v1.png --out assets/textures/warm-stone-v1.jpg
