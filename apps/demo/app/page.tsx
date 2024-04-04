'use client';

import ImageInput from '~/components/image-input';

export default function Page() {
  return (
    <main
      style={{
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1rem',
      }}
    >
      <ImageInput />
    </main>
  );
}
