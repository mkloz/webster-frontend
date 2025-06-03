import { FC, useEffect, useRef, useState } from 'react';

import { ConstrainProporions } from '@/shared/components/common/constrain-proportions';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

type Size = {
  width: number;
  height: number;
};

interface SizeInputProps {
  value: Size;
  onChange: (size: Size) => void;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  setVal: (s: string) => void;
  onBlur: () => void;
}

const clamp = (val: number, min = 10, max = 10000) => Math.max(min, Math.min(max, val));

const InputField: FC<InputFieldProps> = ({ id, label, value, setVal, onBlur }) => (
  <div className="grow">
    <Label htmlFor={id} className="text-xs text-muted-foreground mb-1">
      {label}
    </Label>
    <div className="flex items-center gap-2 relative w-full">
      <Input
        wrapperClassName="w-full"
        type="number"
        id={id}
        className="min-w-21 w-full"
        value={value}
        min={10}
        max={10000}
        iconPosition="right"
        icon={<span className="text-xs text-muted-foreground right-0 p-2">px</span>}
        onChange={(e) => setVal(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  </div>
);

export const SizeInput: FC<SizeInputProps> = ({ value, onChange }) => {
  const [widthInput, setWidthInput] = useState(value.width.toString());
  const [heightInput, setHeightInput] = useState(value.height.toString());
  const [lockRatio, setLockRatio] = useState(false);
  const aspectRatio = useRef(value.width / value.height);

  useEffect(() => {
    setWidthInput(value.width.toString());
    setHeightInput(value.height.toString());
    aspectRatio.current = value.width / value.height;
  }, [value.width, value.height]);

  const handleBlur = (type: 'width' | 'height') => {
    let newValue = type === 'width' ? Number(widthInput) : Number(heightInput);
    if (isNaN(newValue)) {
      type === 'width' ? setWidthInput(value.width.toString()) : setHeightInput(value.height.toString());
      return;
    }

    newValue = clamp(newValue);
    let newSize: Size;

    if (lockRatio) {
      if (type === 'width') {
        const h = Math.round(newValue / aspectRatio.current);
        newSize = { width: newValue, height: h };
      } else {
        const w = Math.round(newValue * aspectRatio.current);
        newSize = { width: w, height: newValue };
      }
    } else {
      newSize = {
        width: type === 'width' ? newValue : value.width,
        height: type === 'height' ? newValue : value.height
      };
      aspectRatio.current = newSize.width / newSize.height;
    }

    onChange(newSize);
  };

  return (
    <div className="flex items-center gap-4">
      <InputField
        id="width-input"
        label="Width"
        value={widthInput}
        setVal={setWidthInput}
        onBlur={() => handleBlur('width')}
      />
      <ConstrainProporions checked={lockRatio} onCheckedChange={setLockRatio} />
      <InputField
        id="height-input"
        label="Height"
        value={heightInput}
        setVal={setHeightInput}
        onBlur={() => handleBlur('height')}
      />
    </div>
  );
};
