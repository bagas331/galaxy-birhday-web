#!/bin/bash
# Generates placeholder cosmic artwork for the galaxy birthday website.
# These are DECORATIVE placeholders - the user will replace them with real photos.
set -u
IMG_DIR=/home/z/my-project/public/assets/images/memories
OG_DIR=/home/z/my-project/public/assets/images
mkdir -p "$IMG_DIR"

gen() {
  local prompt="$1"; local out="$2"; local size="${3:-1152x864}"
  if [ -s "$out" ]; then echo "skip $(basename "$out")"; return; fi
  z-ai image -p "$prompt" -o "$out" -s "$size" > /dev/null 2>&1 \
    && echo "ok $(basename "$out")" || echo "FAIL $(basename "$out")"
}

# Gallery placeholder artwork (dreamy cosmic scenes, consistent art direction)
gen "Dreamy pastel nebula clouds in deep space, soft pink and violet cosmic dust, glowing stars scattered everywhere, ethereal romantic atmosphere, cinematic digital painting, high quality, detailed" "$IMG_DIR/memory-1.jpg" &
gen "Two glowing stars orbiting each other leaving light trails, magenta and cyan glow, deep space romance, dreamy cosmic art, cinematic digital painting, high quality" "$IMG_DIR/memory-2.jpg" &
gen "Small ringed planet floating in a pastel purple nebula, soft golden light, scattered stars, dreamy romantic cosmic scene, cinematic digital painting, high quality" "$IMG_DIR/memory-3.jpg" &
gen "A bright shooting star flying across a violet night sky filled with stardust, soft glow, dreamy magical atmosphere, cinematic digital painting, high quality" "$IMG_DIR/memory-4.jpg" &
wait
gen "Crescent moon over a sea of colorful glowing clouds, pink and blue tones, glittering stars, dreamy romantic cosmic scene, cinematic digital painting, high quality" "$IMG_DIR/memory-5.jpg" &
gen "Heart shaped constellation of glowing golden stars in deep space, soft purple and pink nebula background, romantic magical mood, cinematic digital painting, high quality" "$IMG_DIR/memory-6.jpg" &
gen "Aurora borealis dancing over a mirror calm cosmic sea, teal and magenta lights, starry sky reflection, dreamy dreamscape, cinematic digital painting, high quality" "$IMG_DIR/memory-7.jpg" &
gen "Golden meteor shower raining over a colorful spiral galaxy, purple and blue cosmos, magical romantic atmosphere, cinematic digital painting, high quality" "$IMG_DIR/memory-8.jpg" &
wait
# Site icons / social
gen "Minimalist single glowing golden four-pointed star on soft deep purple and pink nebula gradient background, centered app icon, clean edges, premium, high quality" "$OG_DIR/favicon-source.png" 1024x1024
gen "Dreamy colorful little galaxy with glowing ringed planet, heart shaped star constellation, purple pink cyan nebula, romantic cinematic universe, elegant, high quality" "$OG_DIR/og-universe.jpg" 1440x720
echo "DONE"
