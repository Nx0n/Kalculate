import { supabase } from '../lib/supabase';

export const MAX_FOOD_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getMimeType(asset) {
  const mimeType = String(asset?.mimeType || '').toLowerCase();
  if (ACCEPTED_IMAGE_TYPES.has(mimeType)) return mimeType;

  const extension = String(asset?.fileName || asset?.uri || '').split('.').pop()?.toLowerCase();
  return ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' })[extension] || mimeType;
}

export function validateFoodImage(asset) {
  const mimeType = getMimeType(asset);
  if (!ACCEPTED_IMAGE_TYPES.has(mimeType)) {
    throw new Error('รองรับเฉพาะรูป JPG, PNG หรือ WebP');
  }
  // fileSize is optional in ImagePickerAsset; the Edge Function enforces the limit again.
  if (Number.isFinite(asset?.fileSize) && asset.fileSize > MAX_FOOD_IMAGE_BYTES) {
    throw new Error('รูปต้องมีขนาดไม่เกิน 5 MB');
  }
  return mimeType;
}

export async function analyzeFoodImage(asset) {
  const mimeType = validateFoodImage(asset);
  const formData = new FormData();
  const filename = asset.fileName || `food-image.${mimeType.split('/')[1]}`;

  // expo-image-picker exposes a browser File on web. Native FormData accepts this URI object.
  if (asset.file) {
    formData.append('image', asset.file, filename);
  } else {
    formData.append('image', { uri: asset.uri, name: filename, type: mimeType });
  }

  const { data, error } = await supabase.functions.invoke('analyze-food-image', {
    body: formData,
  });

  if (error) {
    const status = error.context?.status;
    if (status === 401) throw new Error('กรุณาเข้าสู่ระบบใหม่ก่อนวิเคราะห์รูป');
    if (status === 413) throw new Error('รูปมีขนาดใหญ่เกิน 5 MB');
    if (status === 415) throw new Error('รองรับเฉพาะรูป JPG, PNG หรือ WebP');
    if (status === 503 || error.name === 'FunctionsFetchError' || /network|fetch/i.test(error.message || '')) {
      throw new Error('ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ กรุณาลองใหม่เมื่อออนไลน์');
    }
    throw new Error('วิเคราะห์รูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
  }

  if (!Array.isArray(data?.items)) {
    throw new Error('ได้รับผลวิเคราะห์รูปแบบไม่ถูกต้อง');
  }
  return data.items;
}
