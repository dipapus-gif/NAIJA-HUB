/**
 * Same footage, lighter files. Pexels serves each clip in several sizes; we try
 * 1280x720 then 1920x1080 and fall back to the original 4K file, so the video
 * is never swapped, only decoded more cheaply.
 */
export function videoSources(url: string, { small = false }: { small?: boolean } = {}): string[] {
  const m = url.match(/^(.*\/)(\d+)_3840_2160_(\d+fps\.mp4)$/);
  if (!m) return [url];
  const [, base, id, tail] = m;
  const hd = `${base}${id}_1920_1080_${tail}`;
  const sd = `${base}${id}_1280_720_${tail}`;
  return small ? [sd, hd, url] : [hd, url];
}
