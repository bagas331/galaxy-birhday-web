import { NextRequest, NextResponse } from "next/server";
import {
  createUniverseRequestSchema,
  formatZodErrors,
} from "@/lib/universe-validation";
import { universeRepository } from "@/lib/universe-repository";

export async function GET() {
  try {
    const list = universeRepository.listPublicSummaries();
    return NextResponse.json(
      {
        success: true,
        message: "Daftar universe berhasil dimuat",
        data: { universes: list },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[GET /api/universes] Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memuat daftar universe",
        errors: ["Internal server error"],
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format JSON request tidak valid",
          errors: ["Request body harus berupa JSON yang valid"],
        },
        { status: 400 },
      );
    }

    const parsed = createUniverseRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data gagal",
          errors: formatZodErrors(parsed.error),
        },
        { status: 422 },
      );
    }

    try {
      const created = universeRepository.create(parsed.data);
      const { accessPin: _pin, ...safeRecord } = created;
      return NextResponse.json(
        {
          success: true,
          message: "Universe berhasil dibuat dan dipublikasikan",
          data: {
            ...safeRecord,
            hasAccessPin: Boolean(created.accessPin),
          },
        },
        { status: 201 },
      );
    } catch (repoError) {
      if (repoError instanceof Error && repoError.message === "SLUG_CONFLICT") {
        return NextResponse.json(
          {
            success: false,
            message: "Nama link (slug) tersebut sudah digunakan. Silakan pilih slug lain atau gunakan mode Edit.",
            errors: ["Slug sudah terdaftar"],
          },
          { status: 409 },
        );
      }
      throw repoError;
    }
  } catch (err) {
    console.error("[POST /api/universes] Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyimpan universe",
        errors: ["Internal server error"],
      },
      { status: 500 },
    );
  }
}
