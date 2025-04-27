
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FirmwareTagsProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
}

export const FirmwareTags = ({ tags, onTagsChange }: FirmwareTagsProps) => {
  const [currentTag, setCurrentTag] = useState("");

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      onTagsChange([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="tags">Tags</Label>
      <div className="flex gap-2">
        <Input 
          id="tags" 
          placeholder="Enter a tag" 
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" onClick={addTag} variant="secondary">
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button 
                type="button" 
                onClick={() => removeTag(tag)}
                className="text-xs font-bold ml-1 hover:bg-gray-200 rounded-full w-4 h-4 inline-flex items-center justify-center"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
