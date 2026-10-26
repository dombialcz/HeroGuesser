r"""Extract the seven placement variants from the user-supplied Single Thud.wav.

Usage: python3 scripts/split-placement-thuds.py /path/to/Single\ Thud.wav
Only Python's standard library is needed. The original recording stays untouched.
"""
import array
from pathlib import Path
import sys
import wave

REGIONS = [(0.078, 0.54), (1.178, 1.66), (2.388, 2.82), (3.868, 4.31),
           (5.238, 5.66), (7.018, 7.46), (8.868, 9.12)]
output = Path(__file__).resolve().parent.parent / "assets" / "audio"
with wave.open(sys.argv[1]) as source:
    if (source.getnchannels(), source.getsampwidth(), source.getframerate(), source.getnframes()) != (2, 2, 48000, 480000):
        raise SystemExit("Expected the original 10-second stereo 48 kHz / 16-bit recording.")
    samples = array.array("h", source.readframes(source.getnframes()))
if sys.byteorder != "little":
    samples.byteswap()
output.mkdir(parents=True, exist_ok=True)
for index, (start, end) in enumerate(REGIONS, 1):
    clip = [(samples[2*i] + samples[2*i+1]) / 2 for i in range(round(start*48000), round(end*48000))]
    gain = (32767 * 0.8) / max(map(abs, clip))
    # Preserve the attack; gently remove edit clicks and fade the quiet room tail.
    pcm = array.array("h", (round(value * gain * min(1, i / 48, (len(clip)-1-i) / 960)) for i, value in enumerate(clip)))
    if sys.byteorder != "little":
        pcm.byteswap()
    target = output / f"thud-{index:02}.wav"
    with wave.open(str(target), "wb") as result:
        result.setparams((1, 2, 48000, 0, "NONE", "not compressed"))
        result.writeframes(pcm.tobytes())
    print(f"{target.name}: {len(clip)/48000:.3f}s")
