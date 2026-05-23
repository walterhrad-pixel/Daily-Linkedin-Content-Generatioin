import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".txt",
  ".rst",
  ".json",
  ".yaml",
  ".yml",
  ".html",
  ".htm",
  ".csv",
]);

function resolveBackendDir(): string {
  return path.resolve(process.cwd(), "..", "backend");
}

function runPipeline(
  backendDir: string,
  args: string[],
): Promise<{ ok: boolean; content?: string; error?: string }> {
  return new Promise((resolve) => {
    const pythonCmd = process.env.PYTHON_PATH || "python";
    const child = spawn(pythonCmd, ["main.py", ...args], {
      cwd: backendDir,
      env: {
        ...process.env,
        PYTHONUTF8: "1",
      },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      const trimmed = stdout.trim();
      const jsonLine = trimmed.split("\n").find((line) => line.startsWith("{"));
      if (jsonLine) {
        try {
          const parsed = JSON.parse(jsonLine) as {
            ok: boolean;
            content?: string;
            error?: string;
          };
          resolve(parsed);
          return;
        } catch {
          /* fall through */
        }
      }

      if (code === 0 && trimmed) {
        resolve({ ok: true, content: trimmed });
        return;
      }

      resolve({
        ok: false,
        error: stderr.trim() || stdout.trim() || `Pipeline exited with code ${code}`,
      });
    });

    child.on("error", (err) => {
      resolve({ ok: false, error: err.message });
    });
  });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const upload = formData.get("file");
  const productName = String(formData.get("productName") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();

  if (!(upload instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "A source file is required." },
      { status: 400 },
    );
  }

  if (!productName || !audience) {
    return NextResponse.json(
      { ok: false, error: "productName and audience are required." },
      { status: 400 },
    );
  }

  if (upload.size === 0) {
    return NextResponse.json(
      { ok: false, error: "The uploaded file is empty." },
      { status: 400 },
    );
  }

  if (upload.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File is too large (max 2 MB)." },
      { status: 400 },
    );
  }

  const ext = path.extname(upload.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Unsupported file type. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}`,
      },
      { status: 400 },
    );
  }

  const tempPath = path.join(tmpdir(), `daily-content-${randomUUID()}${ext}`);
  const buffer = Buffer.from(await upload.arrayBuffer());

  try {
    await writeFile(tempPath, buffer);

    const backendDir = resolveBackendDir();
    const args = [
      "--file",
      tempPath,
      "--product-name",
      productName,
      "--audience",
      audience,
      "--json",
    ];

    if (format === "linkedin" || format === "twitter" || format === "blog") {
      args.push("--format", format);
    }

    const result = await runPipeline(backendDir, args);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error ?? "Generation failed." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, content: result.content ?? "" });
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}
