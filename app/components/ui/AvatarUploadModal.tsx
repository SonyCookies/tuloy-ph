'use client';

import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { RotateCw, ZoomIn, X } from "lucide-react";

export default function AvatarUploadModal({
  file,
  onClose,
  onSave
}:{
  file: File
  onClose: () => void
  onSave: (file: File, preview: string) => void
}) {

  const editorRef = useRef<AvatarEditor | null>(null);

  const [scale,setScale] = useState(1.2);
  const [rotate,setRotate] = useState(0);

  const handleSave = () => {

    if(!editorRef.current) return;

    const canvas = editorRef.current.getImageScaledToCanvas();

    canvas.toBlob((blob)=>{

      if(!blob) return;

      const newFile = new File([blob],"avatar.png",{type:"image/png"});
      const preview = URL.createObjectURL(blob);

      onSave(newFile,preview);

    },"image/png");

  };

  return(

    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        <div className="p-5 border-b flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-secondary font-black text-[9px] uppercase tracking-[0.2em]">Profile Picture</span>
            <h3 className="text-lg font-black text-neutral-dark">Edit Photo</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">

          <div className="relative rounded-2xl overflow-hidden shadow-inner bg-gray-50 border border-gray-100">
            <AvatarEditor
              ref={editorRef}
              image={file}
              width={250}
              height={250}
              border={10}
              borderRadius={125}
              color={[255, 255, 255, 0.6]}
              scale={scale}
              rotate={rotate}
              className="max-w-full"
            />
          </div>

          <div className="w-full space-y-5">

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5"/> Zoom Level</span>
                <span>{(scale * 100).toFixed(0)}%</span>
              </div>

              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={scale}
                onChange={(e)=>setScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={()=>setRotate((rotate+90)%360)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all font-bold text-xs"
              >
                <RotateCw className="w-3.5 h-3.5"/>
                Rotate 90°
              </button>
            </div>

          </div>

        </div>

        <div className="p-5 bg-gray-50/50 flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex-[2] bg-primary text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Apply Changes
          </button>

        </div>

      </div>

    </div>

  );

}
