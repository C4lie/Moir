from datetime import timedelta
from django.utils import timezone
from .models import Entry
from collections import Counter
import re

STOP_WORDS = set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
    'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
    'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our',
    'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was',
    'am', 'are', 'were', 'been', 'being', 'had', 'has', 'did', 'does', 'doing',
])

def generate_weekly_insight(user):
    """
    Generates a privacy-focused weekly summary for the user.
    Only analyzes entries from notebooks with `include_in_weekly_summary=True`.
    """
    # 1. Date Range: Last 7 days
    today = timezone.now().date()
    seven_days_ago = today - timedelta(days=7)

    # 2. Filter Entries
    entries = Entry.objects.filter(
        notebook__user=user,
        notebook__include_in_weekly_summary=True,
        entry_date__gte=seven_days_ago,
        entry_date__lte=today
    )

    if not entries.exists():
        return {
            "has_enough_data": False,
            "message": "Not enough data to generate insights. Check your notebook privacy settings or write more entries."
        }

    # 3. Analyze Content (Frequency Analysis)
    all_text = " ".join([entry.content for entry in entries]).lower()
    # Remove punctuation and split
    words = re.findall(r'\b\w+\b', all_text)
    filtered_words = [w for w in words if w not in STOP_WORDS and len(w) > 2]
    
    word_counts = Counter(filtered_words)
    top_keywords = [word for word, count in word_counts.most_common(5)]

    # 4. Analyze Time (Morning vs Night)
    # Note: We rely on created_at for timestamp analysis as entry_date is just specific date without time
    # However, entry model usually has created_at
    morning_count = 0
    night_count = 0
    
    for entry in entries:
        # Assuming created_at is in UTC, convert to approximate local time or just use hour 
        # For simplicity, we'll use naive hour from created_at (which is typically database time, often UTC)
        # Ideally, we should store user timezone or browser timezone.
        # Fallback: Just use simple logic 5AM-5PM = day, 5PM-5AM = night
        hour = entry.created_at.hour
        if 5 <= hour < 17:
            morning_count += 1
        else:
            night_count += 1
            
    dominant_time = "during the day" if morning_count > night_count else "late at night"

    # 5. Construct Summary
    if top_keywords:
        topics_str = ", ".join(top_keywords[:3])
        summary = f"This week, your writing focused mainly on {topics_str}."
    else:
        summary = "You wrote several entries this week."

    if dominant_time:
         summary += f" You tended to write {dominant_time}."

    return {
        "has_enough_data": True,
        "summary_text": summary,
        "top_keywords": top_keywords,
        "dominant_time": dominant_time,
        "entry_count": entries.count()
    }
