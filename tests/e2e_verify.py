#!/usr/bin/env python3
"""
Playwright multi-viewport E2E verification + 8-beat comparison_grid.png builder
for Maizen: Roblox INSIDE Roblox iPad Simulator (reproducing YouTube Do9uo62h_d8).
"""
import os
import threading
import http.server
import socketserver
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF_DIR = os.path.join(ROOT, ".qa", "reference")
TMP_DIR = os.path.join(ROOT, ".qa", "tmp")
os.makedirs(TMP_DIR, exist_ok=True)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, format, *args):
        pass


class ReusableThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def start_server():
    httpd = ReusableThreadingServer(("127.0.0.1", 0), QuietHandler)
    port = httpd.server_address[1]
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, port


def crop_sb_tile(sheet_name, row, col):
    im = Image.open(os.path.join(REF_DIR, sheet_name)).convert("RGB")
    tw = im.width // 5
    th = im.height // 5
    return im.crop((col * tw, row * th, (col + 1) * tw, (row + 1) * th))


def build_comparison_grid(shots):
    cell_w, cell_h = 480, 270
    header_h = 44
    label_h = 28
    pad = 12
    cols_w = cell_w * 2 + pad * 3
    total_h = header_h + len(shots) * (cell_h + label_h + pad) + pad

    grid = Image.new("RGB", (cols_w, total_h), (15, 23, 42))
    draw = ImageDraw.Draw(grid)
    try:
        font_hdr = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
        font_lbl = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except Exception:
        font_hdr = ImageFont.load_default()
        font_lbl = ImageFont.load_default()

    draw.text((pad + 10, 10), "ORIGINAL VIDEO (youtu.be/Do9uo62h_d8)", fill=(252, 165, 165), font=font_hdr)
    draw.text((pad * 2 + cell_w + 10, 10), "OUR INTERACTIVE IPAD BUILD", fill=(134, 239, 172), font=font_hdr)

    for idx, (label, ref_img, build_path) in enumerate(shots):
        y = header_h + idx * (cell_h + label_h + pad)
        draw.rectangle([pad, y, cols_w - pad, y + label_h - 2], fill=(30, 41, 59))
        draw.text((pad + 10, y + 6), f"{idx + 1}. {label}", fill=(248, 250, 252), font=font_lbl)

        img_y = y + label_h
        left = ref_img.resize((cell_w, cell_h), Image.Resampling.LANCZOS)
        right = Image.open(build_path).convert("RGB").resize((cell_w, cell_h), Image.Resampling.LANCZOS)
        grid.paste(left, (pad, img_y))
        grid.paste(right, (pad * 2 + cell_w, img_y))

    out_path = os.path.join(ROOT, ".qa", "comparison_grid.png")
    grid.save(out_path, optimize=True)
    print(f"Saved comparison grid -> {out_path} ({grid.size})")


def main():
    httpd, port = start_server()
    url = f"http://127.0.0.1:{port}/index.html"
    errors = []
    viewports = [
        ("desktop", 1280, 800),
        ("ipad_land", 1024, 768),
        ("ipad_port", 768, 1024),
        ("mobile", 390, 844),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 800})
        page = ctx.new_page()
        page.on("pageerror", lambda err: errors.append(f"pageerror: {err}"))
        page.on("console", lambda msg: errors.append(f"console.error: {msg.text}") if msg.type == "error" else None)

        page.goto(url, wait_until="networkidle")
        page.wait_for_function("() => window.__GAME__ && window.__GAME__.isReady()", timeout=15000)

        for name, vw, vh in viewports:
            page.set_viewport_size({"width": vw, "height": vh})
            page.wait_for_timeout(160)
            m = page.evaluate("""() => ({
                scrollW: document.documentElement.scrollWidth,
                topRect: document.getElementById('top-pill').getBoundingClientRect(),
                toolRect: document.getElementById('tool-pill').getBoundingClientRect(),
            })""")
            assert m["scrollW"] <= vw + 1, f"{name}: horizontal overflow {m['scrollW']} > {vw}"
            assert m["topRect"]["right"] <= vw + 1, f"{name}: top-pill clipped"
            assert m["toolRect"]["right"] <= vw + 1, f"{name}: tool-pill clipped"
            print(f"[PASS] Viewport {name} ({vw}x{vh}): 0 overflow")

        page.set_viewport_size({"width": 1280, "height": 720})
        page.wait_for_timeout(200)

        # Shot 1: Roblox INSIDE Roblox Obby (App 0)
        s1 = os.path.join(TMP_DIR, "a1_roblox.png")
        page.screenshot(path=s1)
        Image.open(s1).convert("RGB").save(os.path.join(ROOT, "screenshot.jpg"), quality=90, optimize=True)

        # Test centered reset confirmation modal safety
        page.click("#btn-reset")
        assert page.locator("#reset-modal:not(.hidden)").count() == 1
        page.click("#btn-reset-no")
        assert page.locator("#reset-modal.hidden").count() == 1

        # Shot 2: Calculator 67 Meme (App 1)
        page.evaluate("() => { window.__GAME__.goApp(1); window.__GAME__.pressCalc('67'); window.__GAME__.pressCalc('67'); window.__GAME__.pressCalc('67'); }")
        page.wait_for_timeout(150)
        s2 = os.path.join(TMP_DIR, "a2_calc.png")
        page.screenshot(path=s2)

        # Shot 3: Block Blast 8x8 Grid (App 2)
        page.evaluate("() => { window.__GAME__.goApp(2); window.__GAME__.placeBlock(0, 5, 1); window.__GAME__.placeBlock(1, 3, 2); window.__GAME__.placeBlock(2, 5, 4); }")
        page.wait_for_timeout(150)
        s3 = os.path.join(TMP_DIR, "a3_blockblast.png")
        page.screenshot(path=s3)

        # Shot 4: FaceTime & Mikey Camera Wallpaper (App 3)
        page.evaluate("() => { window.__GAME__.goApp(3); window.__GAME__.snapCamera(); }")
        page.wait_for_timeout(150)
        s4 = os.path.join(TMP_DIR, "a4_camera.png")
        page.screenshot(path=s4)

        # Shot 5: Snake Arena (App 5)
        page.evaluate("window.__GAME__.goApp(5)")
        page.wait_for_timeout(220)
        s5 = os.path.join(TMP_DIR, "a5_snake.png")
        page.screenshot(path=s5)

        # Shot 6: Draw Pad ("MIKEY NOOB") (App 7)
        page.evaluate("() => { window.__GAME__.goApp(7); window.__GAME__.stampDraw(); }")
        page.wait_for_timeout(150)
        s6 = os.path.join(TMP_DIR, "a6_draw.png")
        page.screenshot(path=s6)

        # Shot 7: Space Defense with Saturn & UFOs (App 8)
        page.evaluate("window.__GAME__.goApp(8)")
        page.wait_for_timeout(220)
        s7 = os.path.join(TMP_DIR, "a7_space.png")
        page.screenshot(path=s7)

        # Shot 8: Couch Tic-Tac-Toe Finale (App 9)
        page.evaluate("() => { window.__GAME__.goApp(9); window.__GAME__.playTtt(0); window.__GAME__.playTtt(2); }")
        page.wait_for_timeout(150)
        s8 = os.path.join(TMP_DIR, "a8_ttt.png")
        page.screenshot(path=s8)

        ctx.close()
        browser.close()

    httpd.shutdown()
    assert not errors, f"Runtime errors detected: {errors}"

    shots = [
        ("Roblox INSIDE Roblox Obby Held in Hands", Image.open(os.path.join(REF_DIR, "thumb_maxres.jpg")).convert("RGB"), s1),
        ("iPad Calculator 676767 Meme (00:15)", crop_sb_tile("sb0_00.jpg", 0, 3), s2),
        ("Block Blast 8x8 Puzzle Grid (00:35)", crop_sb_tile("sb0_00.jpg", 1, 3), s3),
        ("FaceTime & Mikey Camera Wallpaper (01:10)", crop_sb_tile("sb0_00.jpg", 2, 4), s4),
        ("Neon Cyan Snake Arena (04:20)", crop_sb_tile("sb0_02.jpg", 1, 2), s5),
        ("Creative Draw Pad: MIKEY NOOB (06:15)", crop_sb_tile("sb0_03.jpg", 2, 4), s6),
        ("Space Defense & Ringed Saturn (08:40)", crop_sb_tile("sb0_04.jpg", 1, 2), s7),
        ("JJ & Mikey Couch Tic-Tac-Toe Finale (09:50)", crop_sb_tile("sb0_04.jpg", 4, 3), s8),
    ]
    build_comparison_grid(shots)
    print("[PASS] All Maizen Roblox INSIDE Roblox E2E checks & comparison_grid.png succeeded with 0 errors!")


if __name__ == "__main__":
    main()
