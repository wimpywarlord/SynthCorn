import { Model, ModelImage } from "@/app/page";
import { Card, CardContent } from "@/components/ui/card"; // Adjust import based on your setup
import { useEffect, useRef, useState } from "react";
import { Heart, Eye } from "lucide-react"; // Ensure this import is at the top

// Add this interface at the top
interface ModelCardProps {
  aspectRatio?:
    | "portrait"
    | "small-portrait"
    | "large-portrait"
    | "biggest-portrait"
    | "smallest-portrait"
    | "mid-size-portrait";
  id: number;
  modelData: Model;
  imageUrl: string;
  miniGallery: Array<ModelImage>;
  likes: number;
  stans: number;
  name: string;
  onClick: (selectedModel: Model) => void;
}

function ModelCard({
  aspectRatio = "portrait",
  modelData,
  imageUrl,
  miniGallery,
  likes,
  stans,
  name,
  onClick,
}: ModelCardProps) {
  const aspectRatioClasses = {
    "portrait": "aspect-[3/4.2]",
    "small-portrait": "aspect-[3/4]",
    "large-portrait": "aspect-[3.2/4.5]",
    "biggest-portrait": "aspect-[3.4/4.8]",
    "smallest-portrait": "aspect-[3/3.8]",
    "mid-size-portrait": "aspect-[3.5/5]",
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const allImages = [imageUrl, ...miniGallery.map((item) => item.image_url)];

  const handleMouseEnter = () => {
    // Start shuffling images on hover
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 1000); // Change image every second
  };

  const handleMouseLeave = () => {
    // Stop shuffling and reset to the first image
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentImageIndex(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Card
      onClick={() => onClick(modelData)}
      className="max-w-xs rounded-xl hover:scale-102 transition-all duration-300 cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="relative p-0 rounded-xl overflow-hidden">
        <img
          className={`w-full h-full object-cover rounded-xl transition-transform duration-300 ${aspectRatioClasses[aspectRatio]}`}
          src={allImages[currentImageIndex]}
          alt="Model"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" />

        {/* Stats Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span className="text-sm">{likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span className="text-sm">{stans}</span>
          </div>
        </div>

        {/* Name Overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {name}
        </div>
      </CardContent>
    </Card>
  );
}

export default ModelCard;
