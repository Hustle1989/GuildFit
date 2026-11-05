import "server-only";
import ImageKit from "@imagekit/nodejs";
import { getUploadAuthParams } from "@imagekit/next/server";
import { env } from "@/lib/env";

let client: ImageKit | undefined;
function imagekit() {
  client ??= new ImageKit({ privateKey: env("IMAGEKIT_PRIVATE_KEY") });
  return client;
}

/** Short-lived params that let the browser upload straight to ImageKit. */
export function uploadAuthParams() {
  return {
    ...getUploadAuthParams({
      privateKey: env("IMAGEKIT_PRIVATE_KEY"),
      publicKey: env("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY"),
    }),
    publicKey: env("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY"),
  };
}

/** Lesson videos are private files, so they need a signed URL that expires. */
export function signedVideoUrl(path: string, expiresInSeconds = 60 * 60) {
  return imagekit().helper.buildSrc({
    urlEndpoint: env("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT"),
    src: path,
    signed: true,
    expiresIn: expiresInSeconds,
  });
}
