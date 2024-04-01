'use client';

import { useSwiping } from 'react-pre-hooks';
import { useRef } from 'react';

export default function Page() {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef({ top: 0, left: 0 });
  useSwiping(
    (action) => {
      const container = ref.current!;

      if (action.type === 'start') {
        start.current.top = container.scrollTop;
        start.current.left = container.scrollLeft;
      }

      ref.current?.scrollTo({
        top: start.current.top + action.deltaY,
        left: start.current.left + action.deltaX,
      });
    },
    { mouse: true, ref },
  );

  return (
    <main>
      {/* <ImageInput /> */}
      <div
        ref={ref}
        style={{
          userSelect: 'none',
          aspectRatio: '1',
          touchAction: 'none',
          overflow: 'auto',
          width: '500px',
          marginInline: 'auto',
        }}
      >
        <style jsx>
          {`
            ::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <div style={{ aspectRatio: '1', width: '200%', background: 'lime' }}>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consequatur modi sequi, eaque
          voluptatem ipsa facilis quis cumque! Quod facilis sunt, incidunt vitae cumque esse,
          deserunt nisi debitis inventore totam sequi.
        </div>
      </div>
    </main>
  );
}
