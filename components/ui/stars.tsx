import { Star } from "lucide-react";
import { clsx } from "clsx";

export default function Stars(props: any) {
  return (
    <div className="flex gap-2 mb-4 cursor-pointer">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          color={index < props.stars ? "#FFA500" : "#D5D5D5"}
          //   fill={index < props.stars ? "#FFA500" : "none"}
          fill={index < props.stars ? "#FFA500" : "none"}
          size={20}
        />
      ))}
    </div>
  );
}
