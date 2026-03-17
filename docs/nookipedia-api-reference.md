# Nookipedia API Reference

**Base URL:** `https://api.nookipedia.com`
**Version:** 1.7.0
**Docs:** https://api.nookipedia.com/doc

## Authentication

All requests require the `X-API-KEY` header:
```
X-API-KEY: <uuid-key>
```

Recommended: also send `Accept-Version: 1.7.0` header.

Key is stored in:
- macOS Keychain: `security find-generic-password -s "NOOKIPEDIA_API_KEY" -a "acnh-portal" -w`
- `.env.local`: `NOOKIPEDIA_API_KEY`
- Vercel env vars: `NOOKIPEDIA_API_KEY` (production + preview)

## Endpoints

### Villagers
| Method | Path | Description |
|--------|------|-------------|
| GET | `/villagers` | All villagers (entire series). Filter: `?name=`, `?species=`, `?personality=`, `?game=NH`, `?birthmonth=`, `?birthday=`, `?nhdetails=true` |
| GET | `/villagers?excludedetails=true` | Names only (array of strings) |

Response fields: `name`, `species`, `personality`, `gender`, `birthday_month`, `birthday_day`, `sign`, `quote`, `phrase`, `image_url`

### Fish (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/fish` | All fish. Filter: `?month=` (name, int, or `current`) |
| GET | `/nh/fish/{name}` | Single fish by name |

Response fields: `name`, `number`, `image_url`, `render_url`, `location`, `shadow_size`, `rarity`, `sell_nook`, `sell_cj`, `north`, `south` (availability arrays)

### Bugs (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/bugs` | All bugs. Filter: `?month=` |
| GET | `/nh/bugs/{name}` | Single bug by name |

Response fields: `name`, `number`, `image_url`, `render_url`, `location`, `weather`, `rarity`, `sell_nook`, `sell_flick`, `north`, `south`

### Sea Creatures (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/sea` | All sea creatures. Filter: `?month=` |
| GET | `/nh/sea/{name}` | Single sea creature by name |

Response fields: `name`, `number`, `image_url`, `render_url`, `shadow_size`, `shadow_movement`, `rarity`, `sell_nook`, `north`, `south`

### Art (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/art` | All artwork. Filter: `?hasfake=true/false` |
| GET | `/nh/art/{name}` | Single artwork by name |

Response fields: `name`, `has_fake`, `art_name`, `art_type`, `author`, `year`, `buy`, `sell`, `real_info` (image_url, description), `fake_info` (image_url, description)

### Recipes (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/recipes` | All recipes. Filter: `?material=` (up to 6x) |
| GET | `/nh/recipes/{name}` | Single recipe by item name |

Response fields: `name`, `image_url`, `serial_id`, `buy`, `sell`, `recipes_to_unlock`, `availability` (array of source objects), `materials` (array of material objects)

### Fossils (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/fossils/individuals` | All individual fossils |
| GET | `/nh/fossils/individuals/{name}` | Single fossil by name |
| GET | `/nh/fossils/groups` | All fossil groups (species) |
| GET | `/nh/fossils/groups/{name}` | Single fossil group |
| GET | `/nh/fossils/all` | Groups with their individual fossils |
| GET | `/nh/fossils/all/{name}` | Single group with fossils |

Response fields (individual): `name`, `image_url`, `fossil_group`, `sell`, `colors`
Response fields (group): `name`, `room`, `description`, `fossils` (array)

### Furniture (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/furniture` | All furniture. Filter: `?category=Housewares/Miscellaneous/Wall-mounted/Ceiling decor`, `?color=` |
| GET | `/nh/furniture/{name}` | Single furniture by name |

### Clothing (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/clothing` | All clothing. Filter: `?category=Tops/Bottoms/Dress-up/Headwear/Accessories/Socks/Shoes/Bags/Umbrellas`, `?color=`, `?style=`, `?labeltheme=` |
| GET | `/nh/clothing/{name}` | Single clothing item |

### Interior Items (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/interior` | All interior items. Filter: `?category=Rugs/Wallpaper/Floors`, `?color=` |
| GET | `/nh/interior/{name}` | Single interior item |

### Tools (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/tools` | All tools |
| GET | `/nh/tools/{name}` | Single tool |

### Photos & Posters (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/photos` | All photos and posters |
| GET | `/nh/photos/{name}` | Single photo/poster |

### Miscellaneous Items (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/items` | All misc items (materials, fragments, fruits, fences, plants) |
| GET | `/nh/items/{name}` | Single misc item |

### Events (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/events` | All events. Filter: `?date=today`, `?year=`, `?month=`, `?day=` |

### Gyroids (NH)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nh/gyroids` | All gyroids. Filter: `?sound=` |
| GET | `/nh/gyroids/{name}` | Single gyroid |

## Common Query Parameters

| Param | Available on | Description |
|-------|-------------|-------------|
| `excludedetails=true` | Most list endpoints | Returns array of name strings instead of full objects |
| `thumbsize=128` | Most endpoints | Resize returned image URLs to specified width |
| `month=current` | Fish, bugs, sea creatures | Returns `{north: [...], south: [...]}` for current month |

## Usage Examples

```bash
# Get all NH villagers with birthday in October
curl -H "X-API-KEY: $NOOKIPEDIA_API_KEY" -H "Accept-Version: 1.7.0" \
  "https://api.nookipedia.com/villagers?game=NH&birthmonth=october"

# Get all recipes that use iron nuggets
curl -H "X-API-KEY: $NOOKIPEDIA_API_KEY" -H "Accept-Version: 1.7.0" \
  "https://api.nookipedia.com/nh/recipes?material=Iron%20Nugget"

# Get cooking recipes (image URLs for downloading)
curl -H "X-API-KEY: $NOOKIPEDIA_API_KEY" -H "Accept-Version: 1.7.0" \
  "https://api.nookipedia.com/nh/recipes?thumbsize=128"

# Get all artwork with fake detection info
curl -H "X-API-KEY: $NOOKIPEDIA_API_KEY" -H "Accept-Version: 1.7.0" \
  "https://api.nookipedia.com/nh/art?hasfake=true"
```

## Image URLs

All image URLs use the `dodo.ac` CDN:
- Pattern: `https://dodo.ac/np/images/{hash}/{filename}`
- Use `?thumbsize=N` param to get resized versions
- Images are PNG format

## Rate Limits

Not explicitly documented. Use responsibly — cache responses, avoid rapid successive calls.
