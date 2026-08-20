import os
import io
from PIL import Image

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass


def compress_to_target(image, target_bytes=500*1024):
    img = image.convert("RGB")
    lo, hi = 1, 95
    best = None
    for _ in range(8):
        q = (lo + hi) // 2
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=q)
        size = buf.tell()
        if size <= target_bytes:
            best = buf.getvalue()
            lo = q + 1
        else:
            hi = q - 1
    if best is not None:
        return best
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=1)
    return buf.getvalue()


def rename_files(target_directory):
    try:
        os.chdir(target_directory)
    except FileNotFoundError:
        print("Error: The directory was not found.")
        return

    extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.heic')
    files = [f for f in os.listdir() if f.lower().endswith(extensions)]
    files.sort()

    for index, filename in enumerate(files, start=1):
        new_name = f"{index}.jpg"
        try:
            img = Image.open(filename)
            data = compress_to_target(img)
            with open(new_name, "wb") as f:
                f.write(data)
            if filename != new_name:
                os.remove(filename)
            size_kb = len(data) / 1024
            print(f"{filename} -> {new_name} ({size_kb:.0f} KB)")
        except Exception as e:
            print(f"Could not process {filename}: {e}")


rename_files("/Users/ravindra/workspace/GitHub/images/D110")
