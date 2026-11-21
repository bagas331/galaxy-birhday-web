#!/usr/bin/env python3
"""Generates a dreamy ambient pad loop (placeholder background music).

100% self-generated audio (no copyright issues). The user can replace
public/assets/audio/our-song.mp3 with their own song.
Output: public/assets/audio/our-song.mp3 (via ffmpeg from WAV)
"""
import numpy as np
import wave
import subprocess
import os

SR = 44100
DUR = 48.0  # seconds, seamless-ish loop
N = int(SR * DUR)
t = np.arange(N) / SR

# Dreamy progression: Cmaj9 -> Am9 -> Fmaj9 -> Gadd9 -> back to C (loop tail)
CHORDS = [
    [130.81, 164.81, 196.00, 246.94, 293.66],  # Cmaj9
    [110.00, 130.81, 164.81, 196.00, 246.94],  # Am9
    [87.31, 110.00, 130.81, 164.81, 196.00],   # Fmaj9
    [98.00, 123.47, 146.83, 196.00, 220.00],   # Gadd9
    [130.81, 164.81, 196.00, 246.94, 293.66],  # Cmaj9 (loop tail)
]
SEG = 12.0  # seconds per chord


def pad_note(freq, t, detune=0.0015):
    """Soft detuned sine pair with slow tremolo."""
    lfo = 1.0 + 0.08 * np.sin(2 * np.pi * 0.11 * t + freq)
    a = np.sin(2 * np.pi * freq * (1 - detune) * t + 0.7)
    b = np.sin(2 * np.pi * freq * (1 + detune) * t + 2.1)
    return (a + b) * 0.5 * lfo


def lowpass(x, alpha=0.12):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha * (x[i] - acc)
        y[i] = acc
    return y


def build_chord_env(start, dur, attack=3.0, release=5.0):
    """Attack/sustain/release envelope for a chord segment."""
    env = np.zeros(N)
    i0, i1 = int(start * SR), min(int((start + dur) * SR), N)
    seg_t = np.arange(i1 - i0) / SR
    seg = np.ones(len(seg_t))
    a = np.clip(seg_t / attack, 0, 1)
    r = np.clip((dur - seg_t) / release, 0, 1)
    seg = np.minimum(a, r) ** 1.5
    env[i0:i1] = seg
    return env


left = np.zeros(N)
right = np.zeros(N)

for idx, chord in enumerate(CHORDS):
    start = idx * SEG
    env = build_chord_env(start, SEG + 2.0)  # slight overlap
    for ni, f in enumerate(chord):
        amp = 0.16 / (1 + ni * 0.35)
        wave_l = pad_note(f, t, 0.0012)
        wave_r = pad_note(f, t + 0.05, 0.0018)  # phase offset for width
        left += amp * env * wave_l
        right += amp * env * wave_r
        # gentle octave shimmer on the top note
        if ni >= 3:
            shimmer_env = env * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t + ni))
            left += 0.35 * amp * shimmer_env * pad_note(f * 2, t, 0.001)
            right += 0.35 * amp * shimmer_env * pad_note(f * 2, t + 0.03, 0.0013)

# Sparse star chimes (pentatonic, quiet, exponential decay)
rng = np.random.default_rng(7)
PENTA = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66]
for _ in range(22):
    f = rng.choice(PENTA)
    start = rng.uniform(0.5, DUR - 4.0)
    dur = rng.uniform(2.5, 4.5)
    amp = rng.uniform(0.02, 0.045)
    i0 = int(start * SR)
    i1 = min(int((start + dur) * SR), N)
    seg_t = np.arange(i1 - i0) / SR
    env = np.exp(-seg_t * 2.2) * np.minimum(seg_t / 0.02, 1.0)
    tone = np.sin(2 * np.pi * f * seg_t) + 0.35 * np.sin(2 * np.pi * f * 2.01 * seg_t)
    pan = rng.uniform(0.2, 0.8)
    left[i0:i1] += amp * env * tone * (1 - pan)
    right[i0:i1] += amp * env * tone * pan

# Master: soften + gentle fade at loop seam
master_env = np.ones(N)
fade = int(1.2 * SR)
master_env[:fade] = np.linspace(0.0, 1.0, fade) ** 0.5
master_env[-fade:] = np.linspace(1.0, 0.15, fade) ** 0.5  # tail dips, loop restarts swelling
left *= master_env
right *= master_env

# Lowpass via FFT-based simple smoothing (fast, avoids slow python loop)
def fft_lowpass(x, cutoff_hz=2400):
    Xf = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    Xf[freqs > cutoff_hz] *= 0.15
    Xf[freqs > cutoff_hz * 2] *= 0.02
    return np.fft.irfft(Xf, len(x))

left = fft_lowpass(left)
right = fft_lowpass(right)

# Normalize
peak = max(np.abs(left).max(), np.abs(right).max())
left = left / peak * 0.72
right = right / peak * 0.72

stereo = np.empty(N * 2, dtype=np.int16)
stereo[0::2] = (left * 32767).astype(np.int16)
stereo[1::2] = (right * 32767).astype(np.int16)

out_dir = "/home/z/my-project/public/assets/audio"
os.makedirs(out_dir, exist_ok=True)
wav_path = os.path.join(out_dir, "our-song.wav")
with wave.open(wav_path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(stereo.tobytes())

mp3_path = os.path.join(out_dir, "our-song.mp3")
subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path,
     "-codec:a", "libmp3lame", "-b:a", "160k", mp3_path],
    check=True,
)
os.remove(wav_path)
print("Generated", mp3_path, os.path.getsize(mp3_path), "bytes")
