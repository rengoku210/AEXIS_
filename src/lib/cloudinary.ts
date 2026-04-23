/**
 * Cloudinary unsigned upload helper.
 *
 * Uploads run from the browser straight to Cloudinary using an unsigned
 * upload preset — no API secret is ever exposed in client code.
 *
 * Required env vars (Vite build-time, safe to expose):
 *   VITE_CLOUDINARY_CLOUD_NAME   — your Cloudinary cloud name
 *   VITE_CLOUDINARY_UPLOAD_PRESET — the unsigned upload preset name
 *
 * One-time setup in Cloudinary dashboard (Settings → Upload → Upload presets):
 *   1. Click "Add upload preset".
 *   2. Set Signing Mode = "Unsigned".
 *   3. (Recommended) Set "Folder" to e.g. `aexis` and enable
 *      "Use filename" = false, "Unique filename" = true.
 *   4. Save and copy the preset name into VITE_CLOUDINARY_UPLOAD_PRESET.
 */

/**
 * Defaults for this deployment. Override at build time by setting
 * VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.
 * Both values are PUBLIC — safe to ship in the client bundle. The API secret
 * MUST NOT be added here; uploads go through an unsigned preset only.
 */
const DEFAULT_CLOUD_NAME = "dddxat36h";
const DEFAULT_UPLOAD_PRESET = "aexis_unsigned";

const CLOUD_NAME =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) ||
  DEFAULT_CLOUD_NAME;
const UPLOAD_PRESET =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined) ||
  DEFAULT_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: "image" | "video" | "raw";
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME) && Boolean(UPLOAD_PRESET);
}

function detectResourceType(file: File): "image" | "video" | "raw" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "raw";
}

/**
 * Upload a single file to Cloudinary via unsigned preset.
 * Throws on misconfiguration or network failure.
 */
export async function uploadToCloudinary(
  file: File,
  options?: { folder?: string; resourceType?: "image" | "video" | "raw" }
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const resourceType = options?.resourceType ?? detectResourceType(file);
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  if (options?.folder) form.append("folder", options.folder);

  const res = await fetch(endpoint, { method: "POST", body: form });
  if (!res.ok) {
    let detail = "";
    try {
      const err = (await res.json()) as { error?: { message?: string } };
      detail = err.error?.message ?? "";
    } catch {
      /* ignore */
    }
    throw new Error(`Cloudinary upload failed (${res.status})${detail ? `: ${detail}` : ""}`);
  }

  return (await res.json()) as CloudinaryUploadResult;
}

/**
 * Build an optimised delivery URL for an existing Cloudinary public_id.
 * Returns the original secure_url if no transformations are requested.
 */
export function cloudinaryUrl(
  publicId: string,
  opts?: { width?: number; height?: number; quality?: "auto" | number }
): string {
  if (!CLOUD_NAME) return publicId;
  const transforms: string[] = ["f_auto", `q_${opts?.quality ?? "auto"}`];
  if (opts?.width) transforms.push(`w_${opts.width}`);
  if (opts?.height) transforms.push(`h_${opts.height}`);
  if (opts?.width || opts?.height) transforms.push("c_fill");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}