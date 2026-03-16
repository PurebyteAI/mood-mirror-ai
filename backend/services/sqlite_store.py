import json
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiosqlite


class SQLiteStore:
    def __init__(self) -> None:
        default_path = Path(__file__).resolve().parent.parent / "mood_mirror.db"
        self.db_path = os.environ.get("SQLITE_DB_PATH", str(default_path))

    def _ensure_db_directory(self) -> None:
        db_parent = Path(self.db_path).expanduser().resolve().parent
        db_parent.mkdir(parents=True, exist_ok=True)

    async def init(self) -> None:
        self._ensure_db_directory()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS mood_analyses (
                    id TEXT PRIMARY KEY,
                    input_type TEXT NOT NULL,
                    input_preview TEXT NOT NULL,
                    emotions TEXT NOT NULL,
                    dominant_mood TEXT NOT NULL,
                    response_text TEXT NOT NULL,
                    response_type TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    saved_to_journal INTEGER NOT NULL DEFAULT 0
                )
                """
            )
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS mood_journal (
                    id TEXT PRIMARY KEY,
                    input_type TEXT NOT NULL,
                    input_preview TEXT NOT NULL,
                    emotions TEXT NOT NULL,
                    dominant_mood TEXT NOT NULL,
                    response_text TEXT NOT NULL,
                    response_type TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    journal_note TEXT NOT NULL DEFAULT '',
                    saved_at TEXT NOT NULL
                )
                """
            )
            await db.commit()

    async def save_analysis(self, analysis: Dict[str, Any]) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO mood_analyses (
                    id, input_type, input_preview, emotions, dominant_mood,
                    response_text, response_type, timestamp, saved_to_journal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    analysis["id"],
                    analysis["input_type"],
                    analysis["input_preview"],
                    json.dumps(analysis["emotions"]),
                    analysis["dominant_mood"],
                    analysis["response_text"],
                    analysis["response_type"],
                    analysis["timestamp"],
                    1 if analysis.get("saved_to_journal") else 0,
                ),
            )
            await db.commit()

    async def get_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                """
                SELECT * FROM mood_analyses
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (limit,),
            )
            rows = await cursor.fetchall()
            return [self._row_to_analysis(row) for row in rows]

    async def clear_history(self) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM mood_analyses")
            await db.commit()

    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM mood_analyses WHERE id = ?",
                (analysis_id,),
            )
            row = await cursor.fetchone()
            if not row:
                return None
            return self._row_to_analysis(row)

    async def save_to_journal(self, analysis: Dict[str, Any], note: str) -> None:
        now = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                INSERT INTO mood_journal (
                    id, input_type, input_preview, emotions, dominant_mood,
                    response_text, response_type, timestamp, journal_note, saved_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    journal_note=excluded.journal_note
                """,
                (
                    analysis["id"],
                    analysis["input_type"],
                    analysis["input_preview"],
                    json.dumps(analysis["emotions"]),
                    analysis["dominant_mood"],
                    analysis["response_text"],
                    analysis["response_type"],
                    analysis["timestamp"],
                    note,
                    now,
                ),
            )
            await db.execute(
                "UPDATE mood_analyses SET saved_to_journal = 1 WHERE id = ?",
                (analysis["id"],),
            )
            await db.commit()

    async def get_journal(self, days: int = 30, limit: int = 100) -> List[Dict[str, Any]]:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                """
                SELECT * FROM mood_journal
                WHERE timestamp >= ?
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (cutoff, limit),
            )
            rows = await cursor.fetchall()
            return [self._row_to_journal(row) for row in rows]

    async def get_journal_trends(self, days: int = 30, limit: int = 200) -> List[Dict[str, Any]]:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                """
                SELECT timestamp, dominant_mood, emotions
                FROM mood_journal
                WHERE timestamp >= ?
                ORDER BY timestamp ASC
                LIMIT ?
                """,
                (cutoff, limit),
            )
            rows = await cursor.fetchall()

        trends: List[Dict[str, Any]] = []
        for row in rows:
            emotions = json.loads(row["emotions"])
            emotion_map = {item["emotion"]: item["score"] for item in emotions}
            trends.append(
                {
                    "timestamp": row["timestamp"],
                    "dominant_mood": row["dominant_mood"],
                    "happiness": emotion_map.get("happiness", 0),
                    "sadness": emotion_map.get("sadness", 0),
                    "stress": emotion_map.get("stress", 0),
                    "calmness": emotion_map.get("calmness", 0),
                    "anger": emotion_map.get("anger", 0),
                    "curiosity": emotion_map.get("curiosity", 0),
                }
            )
        return trends

    async def delete_journal_entry(self, entry_id: str) -> bool:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("DELETE FROM mood_journal WHERE id = ?", (entry_id,))
            await db.execute("UPDATE mood_analyses SET saved_to_journal = 0 WHERE id = ?", (entry_id,))
            await db.commit()
            return cursor.rowcount > 0

    def _row_to_analysis(self, row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "input_type": row["input_type"],
            "input_preview": row["input_preview"],
            "emotions": json.loads(row["emotions"]),
            "dominant_mood": row["dominant_mood"],
            "response_text": row["response_text"],
            "response_type": row["response_type"],
            "timestamp": row["timestamp"],
            "saved_to_journal": bool(row["saved_to_journal"]),
        }

    def _row_to_journal(self, row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "input_type": row["input_type"],
            "input_preview": row["input_preview"],
            "emotions": json.loads(row["emotions"]),
            "dominant_mood": row["dominant_mood"],
            "response_text": row["response_text"],
            "response_type": row["response_type"],
            "timestamp": row["timestamp"],
            "journal_note": row["journal_note"],
        }
