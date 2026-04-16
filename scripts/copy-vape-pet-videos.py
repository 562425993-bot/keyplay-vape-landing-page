# -*- coding: utf-8 -*-
"""Copy 04烟宠 MP4s to public/videos/vape-pet with ASCII names."""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREFERRED = os.path.join(
    ROOT,
    "replacement-images",
    "详情切图 - 副本",
    "04烟宠",
)


def find_vape_pet_dir() -> str | None:
    if os.path.isdir(PREFERRED):
        return PREFERRED
    rep = os.path.join(ROOT, "replacement-images")
    for dirpath, _, files in os.walk(rep):
        mp4s = [f for f in files if f.lower().endswith(".mp4")]
        if "MIX.mp4" in files and len(mp4s) == 5:
            return dirpath
    return None


def main() -> None:
    src = find_vape_pet_dir()
    if not src:
        raise SystemExit("Could not find 04烟宠 folder with 5 mp4 files")
    dest = os.path.join(ROOT, "public", "videos", "vape-pet")
    os.makedirs(dest, exist_ok=True)

    mp4s = [f for f in os.listdir(src) if f.lower().endswith(".mp4")]
    if len(mp4s) != 5:
        raise SystemExit(f"Expected 5 mp4 in {src}, got {len(mp4s)}: {mp4s}")

    def map_stem(stem: str) -> str:
        if stem.upper() == "MIX":
            return "mix.mp4"
        if "五角星" in stem:
            return "star.mp4"
        if "月亮" in stem:
            return "moon.mp4"
        if "砖石" in stem or "钻石" in stem:
            return "diamond.mp4"
        if "方块" in stem or "冰块" in stem:
            return "square.mp4"
        raise SystemExit(f"Unmapped mp4 stem {stem!r}; files={mp4s}")

    for f in mp4s:
        stem = os.path.splitext(f)[0]
        out_name = map_stem(stem)
        shutil.copy2(os.path.join(src, f), os.path.join(dest, out_name))
        print("copied", f, "->", out_name)


if __name__ == "__main__":
    main()
