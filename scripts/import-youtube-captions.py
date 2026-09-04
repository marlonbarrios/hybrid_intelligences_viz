#!/usr/bin/env python3
"""Import YouTube captions into transcripts/{id}.json via youtube_transcript_api."""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "videos.json"


def youtube_id(url: str) -> str:
    m = re.search(r"(?:youtube\.com/watch\?v=|youtu\.be/)([\w-]+)", url or "")
    return m.group(1) if m else ""


def import_one(api: YouTubeTranscriptApi, video: dict) -> bool:
    vid = youtube_id(video.get("youtube", ""))
    if not vid:
        print(f"skip {video['id']}: no youtube id")
        return False
    rel = video.get("transcript") or f"transcripts/{video['id']}.json"
    out = ROOT / rel
    try:
        fetched = api.fetch(vid)
        segments = [
            {"start": float(s.start), "end": float(s.start) + float(s.duration), "text": s.text}
            for s in fetched
        ]
        text = " ".join(s["text"] for s in segments).replace("\n", " ")
        text = re.sub(r"\s+", " ", text).strip()
    except Exception as e:
        print(f"FAIL {video['id']}: {e}")
        return False

    payload = {
        "videoId": vid,
        "text": text,
        "segments": segments,
        "source": "youtube",
        "ingestedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "note": "Imported from YouTube captions (youtube_transcript_api)",
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"OK {video['id']} ({len(text)} chars)")
    return True


def main():
    ids = sys.argv[1:] if len(sys.argv) > 1 else None
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    videos = manifest["videos"]
    if ids:
        videos = [v for v in videos if v["id"] in ids]
    api = YouTubeTranscriptApi()
    ok = sum(import_one(api, v) for v in videos)
    print(f"Imported {ok}/{len(videos)} transcripts")


if __name__ == "__main__":
    main()
