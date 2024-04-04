import React from 'react';
import { useScrollPosition, useSwiping } from 'react-pre-hooks';

// input component
export default function ImageInput() {
  const [imageFile, setImageFile] = React.useState<File>();
  const [croppedImage, setCroppedImage] = React.useState<string>();

  // aspect ratio of the cropped image
  const aspectRatio = '1/1';

  return (
    <div style={{ width: '100%', maxWidth: '320px' }}>
      <div
        style={{
          width: '100%',
          border: '1px solid gray',
          aspectRatio,
        }}
      >
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

// cropper component
function ImageCropper({ image, aspectRatio, onCrop }: ImageCropperProps) {
  const { containerRef, maskRef, ...cropper } = useImageCropper();

  const imageSrc = React.useMemo(() => image && URL.createObjectURL(image), [image]);

  return (
    <dialog
      style={{
        padding: '1rem',
        margin: 'auto',
        width: '100%',
        maxWidth: '420px',
      }}
    >
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
              style={cropper.styles.image}
              onLoad={(e) => {
                e.currentTarget.closest('dialog')?.showModal();
                cropper.setImageSize({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
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
            <div style={cropper.styles.maskContent}></div>
          </div>
        </div>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={cropper.zoom}
        onChange={(e) => cropper.setZoom(+e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <button
        style={{ display: 'block', width: '100%' }}
        onClick={(e) => {
          const croppedImage = cropper.crop();
          if (croppedImage) onCrop(croppedImage);
          e.currentTarget.closest('dialog')?.close();
        }}
      >
        Crop
      </button>
    </dialog>
  );
}

// all the cropper functionalities and content styles
function useImageCropper() {
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  const [zoom, setZoom] = React.useState(1);

  const { ref: maskRef, ...scrollPosition } = useScrollPosition();

  const startPosition = React.useRef({ top: 0, left: 0 });
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

  const crop = React.useCallback(() => {
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

    return canvas.toDataURL();
  }, []);

  const styles = React.useMemo(() => {
    const size = 100 * zoom + '%';
    const isPortrait = imageSize.height > imageSize.width;
    return {
      image: {
        position: 'absolute',
        width: size,
        height: size,
        objectFit: 'cover',
        overflow: 'visible',
        objectPosition: '0 0',
        top: `${-scrollPosition.y}px`,
        left: `${-scrollPosition.x}px`,
      } satisfies React.CSSProperties,
      maskContent: {
        [isPortrait ? 'width' : 'height']: size,
        aspectRatio: `${imageSize.width}/${imageSize.height}`,
      },
    };
  }, [imageSize, scrollPosition, zoom]);

  return {
    containerRef,
    maskRef,
    styles,
    zoom,
    setImageSize,
    setZoom,
    crop,
  };
}
