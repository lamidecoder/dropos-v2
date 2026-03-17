"use client";

import { useState, useRef, useCallback } from "react";
import { uploadAPI } from "../../lib/api";
import { Upload, X, ImageIcon, Loader2, GripVertical, Star } from "lucide-react";
import { useTheme } from "next-themes";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 8 }: Props) {
  const { theme }       = useTheme();
  const dark            = theme === "dark";
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]); // track uploading file names
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const remaining = maxImages - images.length;
    if (remaining <= 0) { setError(`Maximum ${maxImages} images allowed`); return; }

    const toUpload = fileArr.slice(0, remaining);
    setError("");

    for (const file of toUpload) {
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
        setError("Only JPEG, PNG, WebP or GIF images allowed");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Max file size is 10MB");
        continue;
      }

      setUploading((prev) => [...prev, file.name]);
      try {
        const res = await uploadAPI.single(file);
        const url = res.data.data.url;
        onChange([...images, url]);
      } catch {
        setError("Upload failed — please try again");
      } finally {
        setUploading((prev) => prev.filter((n) => n !== file.name));
      }
    }
  }, [images, maxImages, onChange]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveFirst = (index: number) => {
    if (index === 0) return;
    const reordered = [...images];
    const [item] = reordered.splice(index, 1);
    reordered.unshift(item);
    onChange(reordered);
  };

  const isUploading = uploading.length > 0;
  const canUpload   = images.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative group aspect-square">
              <img src={url} alt={`Product image ${i + 1}`}
                className="w-full h-full object-cover rounded-xl border-2 border-slate-200" />

              {/* Main badge */}
              {i === 0 && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[var(--text-primary)] text-xs font-bold bg-violet-600 shadow">
                  Main
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                {i !== 0 && (
                  <button type="button" onClick={() => moveFirst(i)}
                    title="Set as main image"
                    className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border)] flex items-center justify-center text-[var(--text-primary)] transition-all">
                    <Star size={13} />
                  </button>
                )}
                <button type="button" onClick={() => removeImage(i)}
                  className="w-8 h-8 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-[var(--text-primary)] transition-all">
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Upload more slot */}
          {canUpload && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all
                ${dark ? "border-slate-600 hover:border-violet-500 text-slate-500 hover:text-violet-400 hover:bg-violet-500/5"
                       : "border-slate-300 hover:border-violet-400 text-slate-400 hover:text-violet-500 hover:bg-violet-50"}`}>
              {isUploading ? (
                <Loader2 size={18} className="animate-spin text-violet-500" />
              ) : (
                <>
                  <Upload size={18} />
                  <span className="text-xs font-semibold">Add</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when no images or as additional upload area) */}
      {images.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
            ${dragging
              ? "border-violet-500 bg-violet-500/5"
              : dark
                ? "border-slate-600 hover:border-violet-500 hover:bg-violet-500/5"
                : "border-slate-300 hover:border-violet-400 hover:bg-violet-50"}`}>

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="text-violet-500 animate-spin" />
              <p className={`text-sm font-semibold text-slate-300`}>
                Uploading {uploading.length} image{uploading.length > 1 ? "s" : ""}…
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${"bg-[var(--bg-elevated)]"}`}>
                <ImageIcon size={24} className={dark ? "text-slate-400" : "text-slate-400"} />
              </div>
              <div>
                <p className={`text-sm font-bold text-slate-300`}>
                  Drop images here or{" "}
                  <span className="text-violet-500 hover:text-violet-400">browse</span>
                </p>
                <p className={`text-xs mt-1 text-slate-500`}>
                  JPEG, PNG, WebP up to 10MB · Max {maxImages} images
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress bar when uploading */}
      {isUploading && images.length > 0 && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800`}>
          <Loader2 size={14} className="text-violet-500 animate-spin flex-shrink-0" />
          <span className={`text-xs font-semibold text-slate-300`}>
            Uploading {uploading.length} image{uploading.length > 1 ? "s" : ""}…
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <X size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-500">{error}</p>
          <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Count */}
      <p className={`text-xs text-slate-500`}>
        {images.length} / {maxImages} images uploaded
        {images.length > 0 && " · First image is the main display image"}
      </p>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
