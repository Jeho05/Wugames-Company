import { addMissionPhoto } from "@/app/lib/api/missions";

/**
 * Service d'upload centralisé pour WUGAMS ERP.
 * 
 * Architecture (Option A - Officielle) :
 * 1. Le Frontend téléverse le fichier directement dans Supabase Storage (API REST S3).
 * 2. Supabase Storage retourne l'URL publique CDN.
 * 3. L'URL est transmise à l'API NestJS pour association en base de données.
 */

export type StorageBucket = "missions" | "chantiers" | "vitrine" | "documents" | "avatars";

export type UploadOptions = {
  bucket?: StorageBucket;
  pathPrefix?: string;
  maxDimension?: number;
  quality?: number;
  upsert?: boolean;
};

export type UploadResult = {
  publicUrl: string;
  path: string;
  bucket: StorageBucket;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  isFallback?: boolean;
};

const DEFAULT_SUPABASE_URL = "https://jnlpwznuihcsisqnyxmj.supabase.co";

function getSupabaseConfig() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return { url, key, isConfigured: Boolean(key && key !== "your_supabase_anon_key_here") };
}

/**
 * Nettoie le nom de fichier pour éviter les caractères problématiques en URL S3.
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Compresse une image côté client via HTML Canvas si la taille dépasse les seuils recommandés.
 */
async function optimizeImageIfNeeded(
  file: File,
  maxDimension: number = 1920,
  quality: number = 0.82
): Promise<{ blob: Blob; mimeType: string }> {
  // Les SVG ou fichiers non-images ne doivent pas être traités par Canvas
  if (!file.type.startsWith("image/") || file.type.includes("svg")) {
    return { blob: file, mimeType: file.type || "application/octet-stream" };
  }

  // Si l'image fait moins de 400 Ko, pas besoin de la recompresser
  if (file.size < 400 * 1024) {
    return { blob: file, mimeType: file.type };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve({ blob: file, mimeType: file.type });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Préférence pour WebP si supporté, sinon JPEG
      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve({ blob, mimeType: outputType });
          } else {
            resolve({ blob: file, mimeType: file.type });
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ blob: file, mimeType: file.type });
    };

    img.src = url;
  });
}

/**
 * Téléversement universel de fichier vers Supabase Storage.
 */
export async function uploadFileToStorage(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const bucket: StorageBucket = options.bucket || "vitrine";
  const { url: supabaseUrl, key: supabaseKey, isConfigured } = getSupabaseConfig();

  // Optimisation de l'image (si applicable)
  const { blob, mimeType } = await optimizeImageIfNeeded(
    file,
    options.maxDimension ?? 1920,
    options.quality ?? 0.82
  );

  const cleanName = sanitizeFileName(file.name);
  const timeStamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const pathPrefix = options.pathPrefix ? `${options.pathPrefix.replace(/\/$/, "")}/` : "";
  const objectPath = `${pathPrefix}${timeStamp}-${randomSuffix}-${cleanName}`;

  // Mode Fallback si la clé Supabase n'est pas encore configurée
  if (!isConfigured) {
    if (typeof console !== "undefined") {
      console.warn(
        `[UploadService] Supabase anon key non configurée (NEXT_PUBLIC_SUPABASE_ANON_KEY). Fallback DataURL activé pour '${file.name}'.`
      );
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          publicUrl: String(reader.result),
          path: objectPath,
          bucket,
          fileName: file.name,
          sizeBytes: blob.size,
          mimeType,
          isFallback: true,
        });
      };
      reader.onerror = () => {
        const localUrl = URL.createObjectURL(blob);
        resolve({
          publicUrl: localUrl,
          path: objectPath,
          bucket,
          fileName: file.name,
          sizeBytes: blob.size,
          mimeType,
          isFallback: true,
        });
      };
      reader.readAsDataURL(blob);
    });
  }

  // Upload direct vers l'API REST Supabase Storage
  const endpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${encodeURIComponent(objectPath)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": mimeType,
      "x-upsert": options.upsert !== false ? "true" : "false",
    },
    body: blob,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Erreur upload Supabase Storage (${response.status} ${response.statusText}): ${errorText || "Échec du téléversement"}`
    );
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;

  return {
    publicUrl,
    path: objectPath,
    bucket,
    fileName: file.name,
    sizeBytes: blob.size,
    mimeType,
    isFallback: false,
  };
}

/* -------------------------------------------------------------------------- */
/* Fonctions Métier Dédiées                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Téléverse une photo d'intervention de mission et l'associe directement dans l'API NestJS.
 */
export async function uploadMissionPhoto(
  missionId: string,
  file: File
): Promise<{ storageUrl: string; response?: unknown }> {
  const result = await uploadFileToStorage(file, {
    bucket: "missions",
    pathPrefix: missionId,
    maxDimension: 1600,
    quality: 0.8,
  });

  // Si c'est un fallback local, on ne bloque pas l'UI
  let apiResult: unknown = null;
  try {
    apiResult = await addMissionPhoto(missionId, result.publicUrl);
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn(`[UploadService] addMissionPhoto API warning pour mission ${missionId}:`, err);
    }
  }

  return { storageUrl: result.publicUrl, response: apiResult };
}

/**
 * Téléverse une photo de chantier (avancement, plan, réception).
 */
export async function uploadChantierPhoto(
  chantierId: string,
  file: File
): Promise<{ storageUrl: string }> {
  const result = await uploadFileToStorage(file, {
    bucket: "chantiers",
    pathPrefix: chantierId,
    maxDimension: 1920,
    quality: 0.85,
  });

  return { storageUrl: result.publicUrl };
}

/**
 * Téléverse une image pour le site vitrine (réalisations, blog, témoignages, services).
 */
export async function uploadVitrineImage(
  section: "realisations" | "blog" | "temoignages" | "services" | "general",
  file: File
): Promise<{ publicUrl: string }> {
  const result = await uploadFileToStorage(file, {
    bucket: "vitrine",
    pathPrefix: section,
    maxDimension: 2048,
    quality: 0.88,
  });

  return { publicUrl: result.publicUrl };
}

/**
 * Téléverse un avatar utilisateur ou collaborateur.
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ publicUrl: string }> {
  const result = await uploadFileToStorage(file, {
    bucket: "avatars",
    pathPrefix: userId,
    maxDimension: 512,
    quality: 0.85,
  });

  return { publicUrl: result.publicUrl };
}

/**
 * Téléverse un document (PDF de devis, facture, attestation).
 */
export async function uploadDocument(
  file: File,
  folder: string = "general"
): Promise<{ publicUrl: string }> {
  const result = await uploadFileToStorage(file, {
    bucket: "documents",
    pathPrefix: folder,
  });

  return { publicUrl: result.publicUrl };
}
