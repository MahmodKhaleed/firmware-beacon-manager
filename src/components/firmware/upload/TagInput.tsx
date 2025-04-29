
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  currentTag: string;
  setCurrentTag: (tag: string) => void;
  addTag: () => void;
  tags: string[];
  removeTag: (tag: string) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ 
  currentTag, 
  setCurrentTag, 
  addTag, 
  tags, 
  removeTag 
}) => {
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
