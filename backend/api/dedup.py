
_seen_place_ids = set()

def is_duplicate(place_id: str) -> bool:
    """Check and register a place_id. Returns True if already seen."""
    if not place_id or place_id in _seen_place_ids:
        return True
    _seen_place_ids.add(place_id)
    return False

def reset_seen_ids():
    """Reset the seen IDs — useful for testing or refresh logic."""
    _seen_place_ids.clear()
