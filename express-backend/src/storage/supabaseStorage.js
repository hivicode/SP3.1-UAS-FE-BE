const path = require("path");
const { randomUUID } = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const {
  supabaseUrl,
  supabaseServiceRoleKey,
  supabaseStorageBucket,
} = require("../config");

const storageEnabled = Boolean(supabaseUrl && supabaseServiceRoleKey);

const supabase = storageEnabled
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

let bucketReady = false;

function requireStorage() {
  if (!supabase) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for image uploads.");
  }
}

async function ensureBucket() {
  requireStorage();
  if (bucketReady) return;

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const exists = buckets.some((bucket) => bucket.name === supabaseStorageBucket);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(supabaseStorageBucket, {
      public: true,
    });
    if (createError) throw createError;
  }

  bucketReady = true;
}

function publicUrlForPath(objectPath) {
  requireStorage();
  const { data } = supabase.storage.from(supabaseStorageBucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

function objectPathFromPublicUrl(publicUrl = "") {
  if (!publicUrl || !supabaseUrl) return "";

  const marker = `/storage/v1/object/public/${supabaseStorageBucket}/`;
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return "";

  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
}

async function uploadImageFile(file, folder = "properties") {
  requireStorage();
  await ensureBucket();

  const ext = path.extname(file.originalname || "").toLowerCase();
  const objectPath = `${folder}/${Date.now()}-${randomUUID().replace(/-/g, "")}${ext}`;
  const { error } = await supabase.storage
    .from(supabaseStorageBucket)
    .upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  return {
    objectPath,
    publicUrl: publicUrlForPath(objectPath),
  };
}

async function removeImagesFromStorage(publicUrls = []) {
  requireStorage();

  const objectPaths = publicUrls
    .map((publicUrl) => objectPathFromPublicUrl(publicUrl))
    .filter(Boolean);

  if (objectPaths.length === 0) return;

  const { error } = await supabase.storage.from(supabaseStorageBucket).remove(objectPaths);
  if (error) throw error;
}

module.exports = {
  publicUrlForPath,
  uploadImageFile,
  removeImagesFromStorage,
};
