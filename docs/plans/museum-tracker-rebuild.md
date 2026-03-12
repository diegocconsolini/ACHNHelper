# MuseumTracker Rebuild Plan — Issue #19

## Status: RESEARCH COMPLETE

---

## Verified Data Sources

### Source 1: Data files (verified)
- `ACNH-Helper-Suite/data/fossils.js` — 73 fossils (59 multi-part + 14 standalone)
- `ACNH-Helper-Suite/data/art.js` — 43 art pieces (30 paintings + 13 statues)

### Source 2: Asset manifest (datamined game files)
- `public/assets-web/manifest.json` → "fossils" category: 73 entries
- `public/assets-web/manifest.json` → "art" category: 43 entries

### Source 3: Existing data files (already verified clean)
- Fish (80), Bugs (80), Sea Creatures (40) — **no changes needed** in these sections

**Cross-reference result:** fossils.js and manifest match perfectly (73 fossils). art.js and manifest match perfectly (43 art pieces).

---

## Current Component Errors

### FOSSILS — 15 fabricated entries, 19 wrong names, many missing

#### Fabricated fossils (DO NOT EXIST in the game):
1. `Dinosaur Egg` — not a real fossil in ACNH
2. `Iguanodon Leg` — Iguanodon has Skull/Torso/Tail only
3. `Megalo Skull` — Megaloceros only has Left/Right sides
4. `Megalo Tail` — Megaloceros only has Left/Right sides
5. `Peking Man Skull` — doesn't exist in ACNH
6. `Peking Man Torso` — doesn't exist in ACNH
7. `Plesio Neck` — Plesiosaur has Skull/Body/Tail only
8. `Ptera Skull` — Pteranodon has Body/Left Wing/Right Wing only
9. `Seismo Chest` — Seismosaurus doesn't exist in ACNH
10. `Seismo Neck` — Seismosaurus doesn't exist in ACNH
11. `Seismo Tail` — Seismosaurus doesn't exist in ACNH
12. `Vestigial Tail` — doesn't exist in ACNH
13. `Vertebra Torso` — doesn't exist in ACNH
14. `Australopith Skull` — Australopith is standalone (1 piece), not multi-part
15. `Australopith Torso` — Australopith is standalone (1 piece), not multi-part

#### Wrong names (exist but named incorrectly):
1. `Deinony Chest` → should be `Deinony Torso`
2. `Parasaur Chest` → should be `Parasaur Torso`
3. `Spino Chest` → should be `Spino Torso`
4. `Stego Chest` → should be `Stego Torso`
5. `Saber Tooth Skull` → should be `Sabertooth Skull`
6. `Saber Tooth Torso` → should be `Sabertooth Tail` (wrong part AND wrong name)
7. `T-Rex Skull` → should be `T. rex Skull`
8. `T-Rex Chest` → should be `T. rex Torso`
9. `T-Rex Tail` → should be `T. rex Tail`
10. `Megalo Left Side` → should be `Left Megalo Side`
11. `Megalo Right Side` → should be `Right Megalo Side`
12. `Ptera Left Wing` → should be `Left Ptera Wing`
13. `Ptera Right Wing` → should be `Right Ptera Wing`

#### Missing fossils (real fossils not in component):
1. `Acanthostega` (standalone)
2. `Amber` (standalone)
3. `Ankylo Torso` — wait, this IS in component. Let me recheck...
4. `Diplo Tail Tip`
5. `Dunkleosteus` (standalone)
6. `Eusthenopteron` (standalone)
7. `Juramaia` (standalone)
8. `Plesio Tail` (component has "Plesio Neck" instead)
9. `Quetzal Torso`
10. `Left Quetzal Wing`
11. `Right Quetzal Wing`
12. `Pachy Skull`
13. `Pachy Tail`
14. `Dinosaur Track` (standalone)

### ART — 11 fabricated entries, 13 missing, many wrong alwaysReal values

#### Fabricated art (DO NOT EXIST in the game):
1. `Angry Gnome` — not a real art piece
2. `Armillary Sphere` — not a real art piece
3. `Eerie Painting` — not a real painting
4. `Exquisite Statue` — not a real statue
5. `Gave Painting` — not a real painting
6. `Hauntingly Beautiful Statue` — not a real statue
7. `Landmarks Painting` — not a real painting
8. `Nude Statue` — not a real statue
9. `Quiet Painting` — not a real painting
10. `Stately Painting` — not a real painting
11. `Unfinished Painting` — not a real painting

#### Missing art (real pieces not in component):
1. `Common Painting` (always real)
2. `Dynamic Painting` (always real)
3. `Famous Painting` (has fake)
4. `Moody Painting` (always real)
5. `Scary Painting` (has fake)
6. `Sinking Painting` (always real)
7. `Twinkling Painting` (always real)
8. `Wild Painting Left Half` (has fake)
9. `Wild Painting Right Half` (has fake)
10. `Familiar Statue` (always real)
11. `Informative Statue` (has fake)
12. `Mystic Statue` (has fake)
13. `Warrior Statue` (has fake)

#### Wrong alwaysReal values on existing entries:
- `Academic Painting` → listed as alwaysReal: true, should be FALSE (has fake: coffee stain)
- `Ancient Statue` → listed as alwaysReal: true, should be FALSE (has fake: antennae)
- `Basic Painting` → listed as alwaysReal: true, should be FALSE (has fake: bowl-cut bangs)
- `Calm Painting` → listed as alwaysReal: false, should be TRUE
- `Detailed Painting` → listed as alwaysReal: true, should be FALSE (has fake)
- `Gallant Statue` → listed as alwaysReal: true, should be FALSE (has fake: holding book)
- `Great Statue` → listed as alwaysReal: false, should be TRUE
- `Jolly Painting` → listed as alwaysReal: true, should be FALSE (has fake)
- `Motherly Statue` → listed as alwaysReal: true, should be FALSE (has fake: tongue out)
- `Perfect Painting` → listed as alwaysReal: false, should be TRUE
- `Quaint Painting` → listed as alwaysReal: true, should be FALSE (has fake)
- `Robust Statue` → listed as alwaysReal: true, should be FALSE (has fake: wristwatch)
- `Rock-head Statue` → listed as alwaysReal: true, should be FALSE (has fake: smiling)
- `Scenic Painting` → listed as alwaysReal: true, should be FALSE (has fake)
- `Serene Painting` → listed as alwaysReal: true, should be FALSE (has fake)
- `Solemn Painting` → listed as alwaysReal: true, should be FALSE (has fake)
- `Tremendous Statue` → listed as alwaysReal: true, should be FALSE (has fake: lid)
- `Valiant Statue` → listed as alwaysReal: true, should be FALSE (has fake)
- `Wistful Painting` → listed as alwaysReal: true, should be FALSE (has fake: star earring)

---

## Verified Complete Data

### FOSSILS — 73 pieces total (21 multi-part sets + 14 standalone)

#### Multi-part Sets (59 pieces across 21 species):
| Species | Parts | Manifest Names |
|---------|-------|---------------|
| Ankylosaurus (3) | Skull, Torso, Tail | ankylo skull, ankylo torso, ankylo tail |
| Archelon (2) | Skull, Tail | archelon skull, archelon tail |
| Brachiosaurus (4) | Skull, Chest, Pelvis, Tail | brachio skull, brachio chest, brachio pelvis, brachio tail |
| Deinonychus (2) | Torso, Tail | deinony torso, deinony tail |
| Dimetrodon (2) | Skull, Torso | dimetrodon skull, dimetrodon torso |
| Diplodocus (6) | Skull, Neck, Chest, Pelvis, Tail, Tail Tip | diplo skull, diplo neck, diplo chest, diplo pelvis, diplo tail, diplo tail tip |
| Iguanodon (3) | Skull, Torso, Tail | iguanodon skull, iguanodon torso, iguanodon tail |
| Mammoth (2) | Skull, Torso | mammoth skull, mammoth torso |
| Megaceros (3) | Skull, Torso, Tail | megacero skull, megacero torso, megacero tail |
| Megaloceros (2) | Left Side, Right Side | left megalo side, right megalo side |
| Ophthalmosaurus (2) | Skull, Torso | ophthalmo skull, ophthalmo torso |
| Pachycephalosaurus (2) | Skull, Tail | pachy skull, pachy tail |
| Parasaurolophus (3) | Skull, Torso, Tail | parasaur skull, parasaur torso, parasaur tail |
| Plesiosaur (3) | Skull, Body, Tail | plesio skull, plesio body, plesio tail |
| Pteranodon (3) | Body, Left Wing, Right Wing | ptera body, left ptera wing, right ptera wing |
| Quetzalcoatlus (3) | Torso, Left Wing, Right Wing | quetzal torso, left quetzal wing, right quetzal wing |
| Saber-tooth Tiger (2) | Skull, Tail | sabertooth skull, sabertooth tail |
| Spinosaurus (3) | Skull, Torso, Tail | spino skull, spino torso, spino tail |
| Stegosaurus (3) | Skull, Torso, Tail | stego skull, stego torso, stego tail |
| Tyrannosaurus Rex (3) | Skull, Torso, Tail | T. rex skull, T. rex torso, T. rex tail |
| Triceratops (3) | Skull, Torso, Tail | tricera skull, tricera torso, tricera tail |

#### Standalone Fossils (14 pieces):
| Name | Manifest Name | Sell Price |
|------|--------------|-----------|
| Acanthostega | acanthostega | 2,000 |
| Amber | amber | 1,200 |
| Ammonite | ammonite | 1,100 |
| Anomalocaris | anomalocaris | 2,000 |
| Archaeopteryx | archaeopteryx | 1,300 |
| Australopith | australopith | 1,100 |
| Coprolite | coprolite | 1,100 |
| Dinosaur Track | dinosaur track | 1,000 |
| Dunkleosteus | dunkleosteus | 3,500 |
| Eusthenopteron | eusthenopteron | 2,000 |
| Juramaia | juramaia | 1,500 |
| Myllokunmingia | myllokunmingia | 1,500 |
| Shark-tooth Pattern | shark-tooth pattern | 1,000 |
| Trilobite | trilobite | 1,300 |

### ART — 43 pieces total (30 paintings + 13 statues)

#### Paintings — Always Real (14):
| Name | Real-World Name | Artist |
|------|----------------|--------|
| Calm Painting | A Sunday on the Island of La Grande Jatte | Georges Seurat |
| Common Painting | The Gleaners | Jean-François Millet |
| Dynamic Painting | The Great Wave off Kanagawa | Katsushika Hokusai |
| Flowery Painting | Sunflowers | Vincent van Gogh |
| Glowing Painting | The Fighting Temeraire | J.M.W. Turner |
| Moody Painting | The Sower | Jean-François Millet |
| Mysterious Painting | Isle of the Dead | Arnold Böcklin |
| Nice Painting | The Fifer | Édouard Manet |
| Perfect Painting | Apples and Oranges | Paul Cézanne |
| Proper Painting | A Bar at the Folies-Bergère | Édouard Manet |
| Sinking Painting | Ophelia | John Everett Millais |
| Twinkling Painting | The Starry Night | Vincent van Gogh |
| Warm Painting | The Clothed Maja | Francisco Goya |
| Worthy Painting | Liberty Leading the People | Eugène Delacroix |

#### Paintings — With Fakes (16):
| Name | Real-World Name | Fake Tell |
|------|----------------|-----------|
| Academic Painting | Vitruvian Man | Coffee stain in upper right corner |
| Amazing Painting | The Night Watch | Man in center has his hat removed |
| Basic Painting | The Blue Boy | Boy has bowl-cut bangs |
| Detailed Painting | Ajisai Sōkeizu | Purple flowers and different details |
| Famous Painting | Mona Lisa | Eyebrows are raised or arched |
| Graceful Painting | Beauty Looking Back | Figure is larger and fills frame |
| Jolly Painting | Summer | Chest flower/artichoke is missing |
| Moving Painting | The Birth of Venus | Trees are missing on the right |
| Quaint Painting | The Milkmaid | Pouring too much milk |
| Scary Painting | Ōtani Oniji III | Sad expression with upward-slanting eyebrows |
| Scenic Painting | The Hunters in the Snow | Only one hunter in bottom left |
| Serene Painting | Lady with an Ermine | Ermine is black and white patterned |
| Solemn Painting | Las Meninas | Person in background has raised arm |
| Wild Painting Left Half | Fūjin and Raijin Screen | Green Raijin is white |
| Wild Painting Right Half | Fūjin and Raijin Screen | White Fūjin is green |
| Wistful Painting | Girl with a Pearl Earring | Star-shaped earring instead of pearl |

#### Statues — Always Real (2):
| Name | Real-World Name |
|------|----------------|
| Familiar Statue | The Thinker (Auguste Rodin) |
| Great Statue | King Kamehameha I (Thomas Ridgeway Gould) |

#### Statues — With Fakes (11):
| Name | Real-World Name | Fake Tell |
|------|----------------|-----------|
| Ancient Statue | Dogū figurine | Has antennae on head; eyes glow at night |
| Beautiful Statue | Venus de Milo | Wearing a necklace |
| Gallant Statue | David (Michelangelo) | Holding a book between arm and body |
| Informative Statue | Rosetta Stone | Glowing blue color |
| Motherly Statue | Capitoline Wolf | Tongue is sticking out |
| Mystic Statue | Bust of Nefertiti | Wearing an earring on right ear |
| Robust Statue | Discobolus | Wearing a wristwatch |
| Rock-head Statue | Olmec Colossal Head | Smiling expression |
| Tremendous Statue | Houmuwu Ding | Has a lid on top |
| Valiant Statue | Nike of Samothrace | Left leg forward instead of right |
| Warrior Statue | Terracotta Warrior | Holding a shovel |

---

## Changes Required

### Phase 1: Replace FOSSILS array
- Remove all 15 fabricated fossils
- Fix all 13 wrong names
- Add all ~14 missing fossils
- Use fossils.js as source of truth for names, species, parts, and sell prices
- Manifest names are lowercase versions of fossils.js names (for AssetImg lookups)
- **Total: 73 fossils in correct rebuild**

### Phase 2: Replace ART array
- Remove all 11 fabricated art pieces
- Add all 13 missing art pieces
- Fix all ~19 wrong alwaysReal values
- Add real-world name, artist, hasFake, and fakeTell from art.js
- **Total: 43 art pieces in correct rebuild**

### Phase 3: Verify Fish/Bugs/Sea Creatures
- These sections appear correct (80/80/40) — verify names match data files
- No changes expected

### Phase 4: UI updates
- Add `<AssetImg>` rendering for fossils (`category="fossils"`)
- Add `<AssetImg>` rendering for art (`category="art"`)
- Add sell price display for fossils
- Consider adding fake tell display for art (already in ArtDetector but useful for quick reference)
- Verify progress rings calculate correctly with new totals: 80 + 80 + 40 + 73 + 43 = 316 total

### Verification Checklist
- [ ] 73 fossils match fossils.js exactly
- [ ] 43 art pieces match art.js exactly
- [ ] Every fossil name exists in manifest (case-insensitive)
- [ ] Every art name exists in manifest (case-insensitive)
- [ ] No fabricated entries remain
- [ ] All alwaysReal values match art.js
- [ ] Fish/Bugs/Sea Creatures unchanged and correct
- [ ] Progress rings show correct totals (316)
- [ ] Build passes
- [ ] Visual inspection of all 5 tabs
