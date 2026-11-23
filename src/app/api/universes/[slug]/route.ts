import { NextRequest, NextResponse } from "next/server";
import {
  formatZodErrors,
  slugSchema,
  updateUniverseRequestSchema,
} from "@/lib/universe-validation";
import { universeRepository } from "@/lib/universe-repository";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const slugCheck = slugSchema.safeParse(slug);
    if (!slugCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug URL tidak valid",
          errors: formatZodErrors(slugCheck.error),
        },
        { status: 400 },
      );
    }

    const found = universeRepository.findBySlug(slugCheck.data);
    if (!found) {
      return NextResponse.json(
        {
          success: false,
          message: "Universe tidak ditemukan",
          errors: ["Slug tidak terdaftar"],
        },
        { status: 404 },
      );
    }

    const suppliedPin =
      request.nextUrl.searchParams.get("pin") ??
      request.headers.get("x-universe-pin") ??
      "";

    if (found.accessPin && found.accessPin !== suppliedPin) {
      const wrongAttempt = suppliedPin.length > 0;
      return NextResponse.json(
        {
          success: !wrongAttempt,
          message: wrongAttempt
            ? "PIN kado tidak sesuai"
            : "Universe ini dilindungi PIN rahasia",
          data: {
            slug: found.slug,
            locked: true,
            recipientName: found.content.recipientName,
            senderName: found.content.senderName,
            accessPinHint: found.accessPinHint ?? null,
          },
          errors: wrongAttempt ? ["PIN yang dimasukkan salah"] : undefined,
        },
        { status: wrongAttempt ? 401 : 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Universe berhasil dimuat",
        data: {
          slug: found.slug,
          locked: false,
          planTier: found.planTier,
          accessPinHint: found.accessPinHint ?? null,
          hasAccessPin: Boolean(found.accessPin),
          content: found.content,
          updatedAt: found.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[GET /api/universes/[slug]] Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat universe",
        errors: ["Internal server error"],
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const slugCheck = slugSchema.safeParse(slug);
    if (!slugCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug URL tidak valid",
          errors: formatZodErrors(slugCheck.error),
        },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format JSON request tidak valid",
          errors: ["Request body harus berupa JSON"],
        },
        { status: 400 },
      );
    }

    const parsed = updateUniverseRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi perubahan gagal",
          errors: formatZodErrors(parsed.error),
        },
        { status: 422 },
      );
    }

    try {
      const updated = universeRepository.update(slugCheck.data, parsed.data);
      const { accessPin: _pin, ...safeRecord } = updated;
      return NextResponse.json(
        {
          success: true,
          message: "Universe berhasil diperbarui",
          data: {
            ...safeRecord,
            hasAccessPin: Boolean(updated.accessPin),
          },
        },
        { status: 200 },
      );
    } catch (repoError) {
      if (repoError instanceof Error) {
        if (repoError.message === "NOT_FOUND") {
          return NextResponse.json(
            {
              success: false,
              message: "Universe tidak ditemukan",
              errors: ["Slug tidak ditemukan"],
            },
            { status: 404 },
          );
        }
        if (repoError.message === "INVALID_EDIT_PIN") {
          return NextResponse.json(
            {
              success: false,
              message: "PIN Edit salah. Anda tidak memiliki akses untuk mengubah universe ini.",
              errors: ["PIN Edit tidak valid"],
            },
            { status: 403 },
          );
        }
      }
      throw repoError;
    }
  } catch (err) {
    console.error("[PATCH /api/universes/[slug]] Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui universe",
        errors: ["Internal server error"],
      },
      { status: 500 },
    );
  }
}
