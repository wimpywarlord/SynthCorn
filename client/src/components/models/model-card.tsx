import { ModelImage } from "@/app/page";
import { Card, CardContent } from "@/components/ui/card"; // Adjust import based on your setup
import { useEffect, useRef, useState } from "react";
// import Image from "next/image";

// Add this interface at the top
interface ModelCardProps {
  aspectRatio?:
    | "portrait"
    | "small-portrait"
    | "large-portrait"
    | "biggest-portrait"
    | "smallest-portrait"
    | "mid-size-portrait";
  imageUrl: string;
  miniGallery: Array<ModelImage>;
}

function ModelCard({
  aspectRatio = "portrait",
  imageUrl,
  miniGallery,
}: ModelCardProps) {
  const aspectRatioClasses = {
    portrait: "aspect-[3/4.2]",
    "small-portrait": "aspect-[3/4]",
    "large-portrait": "aspect-[3.2/4.5]",
    "biggest-portrait": "aspect-[3.4/4.8]",
    "smallest-portrait": "aspect-[3/3.8]",
    "mid-size-portrait": "aspect-[3.5/5]",
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const allImages = [imageUrl, ...miniGallery.map((item) => item.image_url)];

  const handleMouseEnter = () => {
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 500);
  };

  const handleMouseLeave = () => {
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
      className="max-w-xs rounded-xl hover:scale-102 transition-all duration-300 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="relative p-0 rounded-xl overflow-hidden">
        <img
          className={`w-full h-full object-cover rounded-xl transition-transform duration-300 ${aspectRatioClasses[aspectRatio]}`}
          src={allImages[currentImageIndex]}
          alt="Model"
        />
        <div className="absolute inset-0 bg-black opacity-0 hover:opacity-30 transition-opacity duration-300" />
      </CardContent>
    </Card>
  );
}

export default ModelCard;
