import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  productId?: string;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 5,
  productId = "new",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate files
    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files (JPG, PNG, WEBP)",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);

      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Upload error:", error);
      }
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];
    
    // Extract path from URL for deletion
    try {
      const urlParts = imageUrl.split("/product-images/");
      if (urlParts.length > 1) {
        const path = urlParts[1];
        await supabase.storage.from("product-images").remove([path]);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }

    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = {
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>;
      await handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {images.length}/{maxImages} images uploaded
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg border-2 border-border overflow-hidden group"
          >
            <img
              src={image}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                PRIMARY
              </div>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <ImageIcon className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p>First image will be the primary product photo</p>
          <p>JPG, PNG, WEBP • Max 5MB each • Drag & drop or click to browse</p>
        </div>
      </div>
    </div>
  );
}
