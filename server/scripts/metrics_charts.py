#!/usr/bin/env python3
"""
Generate metrics charts (matplotlib + seaborn) from plan2ship stage analysis JSON.
Usage: python metrics_charts.py --stage <1|2|3|5> --data <path-to-json> --output-dir <dir>
Reads project JSON and generates stage-relevant charts into --output-dir.
"""

import argparse
import json
import sys
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

# Style for consistent, readable charts
sns.set_theme(style="whitegrid", palette="husl", font_scale=1.1)
plt.rcParams['figure.figsize'] = (7, 4.5)
plt.rcParams['figure.dpi'] = 120


def load_data(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def stage1_charts(project: dict, output_dir: Path) -> list[str]:
    """Stage 1: Strategy & Ideation — market sizing, customer segments, scenarios."""
    generated = []
    s1 = project.get("stage1Analysis") or {}

    # Market sizing: bar chart from marketSizing object (keys = labels, values = text; use length or fixed scale)
    market_sizing = s1.get("marketSizing") or {}
    if isinstance(market_sizing, dict) and market_sizing:
        labels = [k.replace("_", " ").title() for k in market_sizing.keys()]
        # Use word-count or fixed value as proxy for "size" when values are text
        values = [len(str(v).split()) for v in market_sizing.values()]
        if values:
            fig, ax = plt.subplots(figsize=(8, 4))
            sns.barplot(x=values, y=labels, palette="Blues_d", ax=ax)
            ax.set_xlabel("Relative scope (word count)")
            ax.set_title("Market Sizing Framework")
            plt.tight_layout()
            p = output_dir / "stage1-market-sizing.png"
            plt.savefig(p, bbox_inches="tight", dpi=120)
            plt.close()
            generated.append("stage1-market-sizing.png")
    # Customer segments: pie chart by count of segments
    segments = s1.get("customerSegments") or []
    if segments:
        fig, ax = plt.subplots(figsize=(6, 6))
        ax.pie([1] * len(segments), labels=[s[:40] + ("…" if len(s) > 40 else "") for s in segments],
               autopct="%1.0f%%", startangle=90, colors=sns.color_palette("husl", len(segments)))
        ax.set_title("Customer Segments")
        plt.tight_layout()
        p = output_dir / "stage1-customer-segments.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage1-customer-segments.png")
    # Scenarios: horizontal bar count
    scenarios = s1.get("scenarios") or []
    if scenarios:
        fig, ax = plt.subplots(figsize=(7, max(3, len(scenarios) * 0.4)))
        y_pos = range(len(scenarios))
        ax.barh(y_pos, [1] * len(scenarios), color=sns.color_palette("viridis", len(scenarios)))
        ax.set_yticks(y_pos)
        ax.set_yticklabels([s[:50] + ("…" if len(s) > 50 else "") for s in scenarios], fontsize=9)
        ax.set_xlabel("Count")
        ax.set_title("Scenario Planning")
        plt.tight_layout()
        p = output_dir / "stage1-scenarios.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage1-scenarios.png")
    return generated


def stage2_charts(project: dict, output_dir: Path) -> list[str]:
    """Stage 2: Requirements & Development — backlog priority, effort, MVP vs Later."""
    generated = []
    s2 = project.get("stage2Analysis") or {}
    stories = s2.get("userStories") or []

    if not stories:
        return generated

    # Priority distribution (P0/P1/P2) — pie
    priorities = [s.get("priority") or "P2" for s in stories]
    from collections import Counter
    pc = Counter(priorities)
    if pc:
        fig, ax = plt.subplots(figsize=(6, 5))
        ax.pie(pc.values(), labels=pc.keys(), autopct="%1.0f%%", startangle=90,
               colors=sns.color_palette("Set3", len(pc)))
        ax.set_title("Backlog Priority Distribution")
        plt.tight_layout()
        p = output_dir / "stage2-priority.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage2-priority.png")

    # Effort distribution (S/M/L) — pie
    efforts = [s.get("effort") or "M" for s in stories]
    ec = Counter(efforts)
    if ec:
        fig, ax = plt.subplots(figsize=(6, 5))
        ax.pie(ec.values(), labels=ec.keys(), autopct="%1.0f%%", startangle=90,
               colors=sns.color_palette("pastel", len(ec)))
        ax.set_title("Effort Distribution (S/M/L)")
        plt.tight_layout()
        p = output_dir / "stage2-effort.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage2-effort.png")

    # MVP vs Later — bar
    mvp_later = s2.get("mvpVsLater") or {}
    mvp = mvp_later.get("mvp") or []
    later = mvp_later.get("later") or []
    if mvp or later:
        fig, ax = plt.subplots(figsize=(5, 4))
        sns.barplot(x=["MVP", "Later"], y=[len(mvp), len(later)], palette="muted", ax=ax)
        ax.set_ylabel("Number of items")
        ax.set_title("MVP vs Later Backlog")
        plt.tight_layout()
        p = output_dir / "stage2-mvp-later.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage2-mvp-later.png")
    return generated


def stage3_charts(project: dict, output_dir: Path) -> list[str]:
    """Stage 3: Customer & Market Research — feedback themes, competitors, trends."""
    generated = []
    s3 = project.get("stage3Analysis") or {}

    # Feedback themes — pie (by theme count)
    themes = s3.get("feedbackThemes") or []
    if themes:
        fig, ax = plt.subplots(figsize=(7, 6))
        labels = [t.get("theme") or f"Theme {i+1}" for i, t in enumerate(themes)]
        labels = [l[:30] + ("…" if len(l) > 30 else "") for l in labels]
        ax.pie([1] * len(themes), labels=labels, autopct="%1.0f%%", startangle=90,
               colors=sns.color_palette("husl", len(themes)))
        ax.set_title("Feedback Themes")
        plt.tight_layout()
        p = output_dir / "stage3-feedback-themes.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage3-feedback-themes.png")

    # Competitor comparison — bar (number of competitors; optional: strength/weakness length as score)
    comps = s3.get("competitorComparison") or []
    if comps:
        names = [c.get("competitor") or f"Competitor {i+1}" for i, c in enumerate(comps)]
        names = [n[:20] + ("…" if len(n) > 20 else "") for n in names]
        # Use length of strength as proxy for "capability score" for visualization
        scores = [len(str(c.get("strength") or "")) + len(str(c.get("gapWeExploit") or "")) for c in comps]
        fig, ax = plt.subplots(figsize=(8, max(4, len(comps) * 0.35)))
        sns.barplot(x=scores, y=names, palette="rocket", ax=ax)
        ax.set_xlabel("Relevance score (text length proxy)")
        ax.set_title("Competitor Comparison")
        plt.tight_layout()
        p = output_dir / "stage3-competitors.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage3-competitors.png")

    # Industry trends — horizontal bar
    trends = s3.get("trends") or []
    if trends:
        fig, ax = plt.subplots(figsize=(8, max(3, len(trends) * 0.45)))
        trend_names = [t.get("trend") or f"Trend {i+1}" for i, t in enumerate(trends)]
        trend_names = [n[:45] + ("…" if len(n) > 45 else "") for n in trend_names]
        ax.barh(range(len(trend_names)), [1] * len(trend_names), color=sns.color_palette("crest", len(trends)))
        ax.set_yticks(range(len(trend_names)))
        ax.set_yticklabels(trend_names, fontsize=9)
        ax.set_xlabel("Count")
        ax.set_title("Industry Trends")
        plt.tight_layout()
        p = output_dir / "stage3-trends.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage3-trends.png")
    return generated


def stage5_charts(project: dict, output_dir: Path) -> list[str]:
    """Stage 5: Go-to-Market — personas, week1/month1 metrics."""
    generated = []
    s5 = project.get("stage5Analysis") or {}

    # Personas — pie (primary vs secondary)
    personas = s5.get("personas") or []
    if personas:
        types = [p.get("type") or "other" for p in personas]
        from collections import Counter
        tc = Counter(types)
        fig, ax = plt.subplots(figsize=(6, 5))
        ax.pie(tc.values(), labels=[t.title() for t in tc.keys()], autopct="%1.0f%%", startangle=90,
               colors=sns.color_palette("Set2", len(tc)))
        ax.set_title("Persona Mix")
        plt.tight_layout()
        p = output_dir / "stage5-personas.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage5-personas.png")

    # GTM metrics: Week 1 vs Month 1 — bar
    metrics = s5.get("metrics") or {}
    week1 = metrics.get("week1") or []
    month1 = metrics.get("month1") or []
    if week1 or month1:
        fig, ax = plt.subplots(figsize=(5, 4))
        sns.barplot(x=["Week 1", "Month 1"], y=[len(week1), len(month1)], palette="flare", ax=ax)
        ax.set_ylabel("Number of metrics")
        ax.set_title("GTM Success Metrics")
        plt.tight_layout()
        p = output_dir / "stage5-metrics.png"
        plt.savefig(p, bbox_inches="tight", dpi=120)
        plt.close()
        generated.append("stage5-metrics.png")
    return generated


def main():
    parser = argparse.ArgumentParser(description="Generate stage metrics charts from project JSON")
    parser.add_argument("--stage", type=int, required=True, choices=[1, 2, 3, 5], help="Stage number")
    parser.add_argument("--data", type=str, required=True, help="Path to project JSON file")
    parser.add_argument("--output-dir", type=str, required=True, help="Directory to write PNG files")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        project = load_data(args.data)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

    generated = []
    if args.stage == 1:
        generated = stage1_charts(project, output_dir)
    elif args.stage == 2:
        generated = stage2_charts(project, output_dir)
    elif args.stage == 3:
        generated = stage3_charts(project, output_dir)
    elif args.stage == 5:
        generated = stage5_charts(project, output_dir)

    print(json.dumps({"generated": generated}))


if __name__ == "__main__":
    main()
