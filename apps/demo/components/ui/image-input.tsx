'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useScrollPosition, useSwiping } from 'react-pre-hooks';

export default function ImageInput() {
  const [imageFile, setImageFile] = useState<File>();
  const [croppedImage, setCroppedImage] = useState<string>();

  const aspectRatio = '1/1';

  return (
    <div style={{ width: '100%', maxWidth: '320px' }}>
      <div style={{ width: '100%', border: '1px solid gray', aspectRatio }}>
        {croppedImage && <img src={croppedImage} width="100%" alt="Cropped image" />}
      </div>
      <button style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}>
        <label style={{ display: 'block' }}>
          Upload
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(e) => setImageFile(e.target.files?.[0])}
            value=""
            hidden
          />
        </label>
      </button>
      <ImageCropper image={imageFile} aspectRatio={aspectRatio} onCrop={setCroppedImage} />
    </div>
  );
}

type ImageCropperProps = {
  image: File | undefined;
  aspectRatio: string;
  onCrop: (image: string) => any;
};

function ImageCropper({ image, aspectRatio, onCrop }: ImageCropperProps) {
  const { containerRef, maskRef, ...rect } = useImageCropper();

  const imageSrc = useMemo(() => image && URL.createObjectURL(image), [image]);
  const imageSize = 100 * rect.zoom + '%';

  const handleCrop = () => {
    const croppedImage = rect.crop();
    if (croppedImage) onCrop(croppedImage);
  };

  return (
    <dialog style={{ padding: '1rem', margin: 'auto', width: '100%', maxWidth: '420px' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '50dvh',
          overflow: 'hidden',
          userSelect: 'none',
          marginBottom: '1rem',
          cursor: 'move',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            margin: 'auto',
            width: '60%',
            aspectRatio,
          }}
        >
          {image && (
            <img
              src={imageSrc}
              style={{
                position: 'absolute',
                width: imageSize,
                height: imageSize,
                objectFit: 'cover',
                overflow: 'visible',
                objectPosition: '0 0',
                top: `${-rect.scroll.y}px`,
                left: `${-rect.scroll.x}px`,
              }}
              onLoad={({ currentTarget }) => {
                currentTarget.closest('dialog')?.showModal();
                rect.setImageSize({
                  width: currentTarget.naturalWidth,
                  height: currentTarget.naturalHeight,
                });
              }}
            />
          )}
          <div
            ref={maskRef}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'white',
              boxShadow: '0 0 0 999px rgba(0,0,0,0.5)',
              mixBlendMode: 'darken',
              width: '100%',
              height: '100%',
            }}
          >
            <div
              style={{
                [rect.isPortrait ? 'width' : 'height']: imageSize,
                aspectRatio: `${rect.width}/${rect.height}`,
              }}
            ></div>
          </div>
        </div>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={rect.zoom}
        onChange={(e) => rect.setZoom(+e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <button style={{ display: 'block', width: '100%' }} onClick={handleCrop}>
        Crop
      </button>
    </dialog>
  );
}

// all the cropper functionalities
function useImageCropper() {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);

  const isPortrait = imageSize.height > imageSize.width;

  const { ref: maskRef, ...scrollPosition } = useScrollPosition();

  const startPosition = useRef({ top: 0, left: 0 });
  const containerRef = useSwiping<HTMLDivElement>((action) => {
    const container = maskRef.current!;

    if (action.type === 'start') {
      startPosition.current.top = container.scrollTop;
      startPosition.current.left = container.scrollLeft;
    }

    container.scrollTo({
      top: startPosition.current.top + action.deltaY,
      left: startPosition.current.left + action.deltaX,
    });
  });

  const crop = useCallback(() => {
    const image = containerRef.current?.querySelector('img');
    const mask = maskRef.current;
    if (!image || !mask) return;

    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;

    const maskWidth = (mask.clientWidth * imageWidth) / mask.scrollWidth;
    const maskHeight = (mask.clientHeight * imageHeight) / mask.scrollHeight;

    const sx = (mask.scrollLeft / mask.scrollWidth) * imageWidth;
    const sy = (mask.scrollTop / mask.scrollHeight) * imageHeight;

    const canvas = document.createElement('canvas');
    canvas.width = maskWidth;
    canvas.height = maskHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, sx, sy, maskWidth, maskHeight, 0, 0, canvas.width, canvas.height);

    image.closest('dialog')?.close();

    return canvas.toDataURL();
  }, []);

  return {
    containerRef,
    maskRef,
    width: imageSize.width,
    height: imageSize.height,
    scroll: scrollPosition,
    isPortrait,
    setImageSize,
    setZoom,
    zoom,
    crop,
  };
}
