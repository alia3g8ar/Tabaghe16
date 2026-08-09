import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { del, put } from '@vercel/blob';
import { randomUUID } from 'crypto';

export const AVATAR_MIME_EXTENSIONS: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

const BLOB_PUBLIC_HOST = 'public.blob.vercel-storage.com';
const BLOB_PUBLIC_HOST_SUFFIX = `.${BLOB_PUBLIC_HOST}`;

@Injectable()
export class AvatarStorageService {
    constructor(private readonly configService: ConfigService) {}

    /**
     * Uploads an avatar image to the project's public Vercel Blob store and
     * returns the persistent public URL. The object key is scoped to the user
     * and includes a random suffix so it never collides.
     */
    async uploadAvatar(
        userId: number | string,
        buffer: Buffer,
        contentType: string,
    ): Promise<string> {
        const token = this.configService.get<string>('BLOB_READ_WRITE_TOKEN');

        if (!token) {
            throw new Error(
                'BLOB_READ_WRITE_TOKEN is not configured on the backend',
            );
        }

        const extension = AVATAR_MIME_EXTENSIONS[contentType] ?? '.jpg';
        const pathname = `avatars/${userId}/${Date.now()}-${randomUUID()}${extension}`;

        const blob = await put(pathname, buffer, {
            access: 'public',
            contentType,
            addRandomSuffix: false,
            token,
        });

        return blob.url;
    }

    /**
     * Deletes a previous avatar Blob object, but only when the URL can be
     * confidently identified as belonging to our Vercel Blob store. Never
     * touches arbitrary external URLs and never fails the caller when the
     * deletion itself errors out.
     */
    async deleteIfOwned(url: string | null | undefined): Promise<void> {
        if (!url || !this.isOwnedBlobUrl(url)) {
            return;
        }

        const token = this.configService.get<string>('BLOB_READ_WRITE_TOKEN');

        if (!token) {
            return;
        }

        try {
            await del(url, { token });
        } catch {
            // Best-effort cleanup: an old avatar must never break the request
            // that just uploaded a new one.
        }
    }

    private isOwnedBlobUrl(url: string): boolean {
        try {
            const hostname = new URL(url).hostname;
            return (
                hostname === BLOB_PUBLIC_HOST ||
                hostname.endsWith(BLOB_PUBLIC_HOST_SUFFIX)
            );
        } catch {
            return false;
        }
    }
}
