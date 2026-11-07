import { analyzeLease } from "@/lib/veto/leaseRules";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse is CommonJS; dynamic import keeps edge bundlers happier
    const pdfParse = (await import("pdf-parse")).default as (
      data: Buffer
    ) => Promise<{ text: string }>;
    const parsed = await pdfParse(buffer);
    return parsed.text || "";
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let text = "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const pasted = String(form.get("text") || "");
      const file = form.get("file");
      text = pasted;
      if (file && typeof file !== "string") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const name = file.name?.toLowerCase() || "";
        if (name.endsWith(".pdf") || file.type === "application/pdf") {
          text = (await extractPdfText(buffer)) || pasted;
        } else {
          text = buffer.toString("utf8") || pasted;
        }
      }
    } else {
      const body = await req.json();
      text = String(body.text || "");
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Paste lease text or upload a PDF/TXT file" },
        { status: 400 }
      );
    }

    const analysis = await analyzeLease(text);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Lease analysis failed" }, { status: 500 });
  }
}
