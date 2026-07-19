import ImageSequence from "./components/ImageSequence";

export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif" }}>
      <ImageSequence
        logo="/logo.svg"
        logoFadeOutProgress={0.06}
        clips={[
          {
            basePath: "/sequence/sequence-01/frame-",
            frameCount: 300,
            frameWidth: 1920,
            frameHeight: 1080,
            extension: "webp",
          },
          {
            basePath: "/sequence/sequence-02/frame-",
            frameCount: 450,
            frameWidth: 1920,
            frameHeight: 1080,
            extension: "webp",
          },
          {
            basePath: "/sequence/sequence-03/frame-",
            frameCount: 300,
            frameWidth: 1920,
            frameHeight: 1080,
            extension: "webp",
          },
          {
            basePath: "/sequence/sequence-04/frame-",
            frameCount: 300,
            frameWidth: 1920,
            frameHeight: 1080,
            extension: "webp",
          },
          {
            basePath: "/sequence/sequence-05/frame-",
            frameCount: 300,
            frameWidth: 1920,
            frameHeight: 1080,
            extension: "webp",
          },
          {
            basePath: "/sequence/sequence-06/frame-",
            frameCount: 300,
            frameWidth: 1920,
            frameHeight: 1080,
            extension: "webp",
          },
          {
            basePath: "/sequence/sequence-07/frame-",
            frameCount: 600,
            frameWidth: 1920,
            frameHeight: 1080,
            extension: "webp",
          },
          {
            basePath: "/sequence/sequence-08/frame-",
            frameCount: 300,
            frameWidth: 1920,
            frameHeight: 1080,
            extension: "webp",
          },
        ]}
      />
    </main>
  );
}
